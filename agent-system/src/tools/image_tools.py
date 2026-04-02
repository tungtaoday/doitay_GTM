"""Image Generation tools — Google Imagen API integration.

Tools: generate_image, generate_content_image
Used by: Content Agent (C5), Distribution Agent
"""
from __future__ import annotations

import base64
import logging
import os
from pathlib import Path
from typing import Any

from src.config import GOOGLE_AI_API_KEY

logger = logging.getLogger(__name__)

# Output directory for generated images
IMAGES_DIR = Path(__file__).parent.parent.parent / "data" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)


async def generate_image(
    prompt: str,
    style: str | None = None,
    aspect_ratio: str = "1:1",
    num_images: int = 1,
    output_filename: str | None = None,
) -> dict[str, Any]:
    """Generate image using Google Imagen API.

    Args:
        prompt: Text description of the image to generate
        style: Optional style hint (e.g., "watercolor", "photography", "illustration")
        aspect_ratio: Image aspect ratio ("1:1", "16:9", "9:16", "4:3", "3:4")
        num_images: Number of images to generate (1-4)
        output_filename: Optional filename (auto-generated if not provided)

    Returns:
        dict with image_paths, prompt, and metadata
    """
    if not GOOGLE_AI_API_KEY:
        return {"error": "GOOGLE_AI_API_KEY not configured", "status": "failed"}

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GOOGLE_AI_API_KEY)

        # Enhance prompt with style
        full_prompt = prompt
        if style:
            full_prompt = f"{prompt}, {style} style"

        logger.info(f"Generating image: {full_prompt[:100]}...")

        # Use Gemini native image generation (free tier)
        response = client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"],
            ),
        )

        saved_paths = []
        import time as _time

        for i, part in enumerate(response.candidates[0].content.parts):
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                if output_filename:
                    name = f"{output_filename}_{i}" if num_images > 1 else output_filename
                else:
                    name = f"img_{int(_time.time())}_{i}"

                ext = part.inline_data.mime_type.split("/")[-1]
                if ext == "jpeg":
                    ext = "jpg"
                filepath = IMAGES_DIR / f"{name}.{ext}"
                filepath.write_bytes(part.inline_data.data)
                saved_paths.append(str(filepath))
                logger.info(f"Saved image: {filepath}")

                if len(saved_paths) >= num_images:
                    break

        if not saved_paths:
            return {"error": "No image generated in response", "status": "failed"}

        return {
            "status": "success",
            "image_paths": saved_paths,
            "prompt": full_prompt,
            "aspect_ratio": aspect_ratio,
            "num_images": len(saved_paths),
        }

    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        return {"error": str(e), "status": "failed"}


async def generate_content_image(
    post_hook: str,
    post_body: str,
    marketplace_name: str,
    vertical: str,
    platform: str = "facebook",
    style: str = "modern flat illustration, vibrant colors, clean design",
) -> dict[str, Any]:
    """Generate an image tailored for a social media post.

    Builds an optimized prompt from post content and generates
    a platform-appropriate image.

    Args:
        post_hook: The hook/headline of the post
        post_body: The body text (used for context, not shown in image)
        marketplace_name: Name of the marketplace
        vertical: Business vertical (e.g., "handmade crafts")
        platform: Target platform ("facebook", "instagram", "twitter")
        style: Visual style for the image

    Returns:
        dict with image_path, prompt used, and metadata
    """
    # Platform-specific aspect ratios
    aspect_ratios = {
        "facebook": "16:9",
        "instagram": "1:1",
        "twitter": "16:9",
        "linkedin": "16:9",
        "story": "9:16",
    }
    aspect_ratio = aspect_ratios.get(platform, "1:1")

    # Build image prompt from post content
    # Extract key theme from hook
    image_prompt = (
        f"Social media marketing image for {vertical} marketplace. "
        f"Theme: {post_hook[:100]}. "
        f"Vietnamese market context, professional and inviting. "
        f"{style}. "
        f"No text overlays, no watermarks, clean composition."
    )

    import time
    filename = f"{marketplace_name.replace(' ', '_')}_{platform}_{int(time.time())}"

    result = await generate_image(
        prompt=image_prompt,
        aspect_ratio=aspect_ratio,
        num_images=1,
        output_filename=filename,
    )

    if result.get("status") == "success":
        result["platform"] = platform
        result["post_hook"] = post_hook[:100]

    return result


async def upload_image_to_facebook(image_path: str, caption: str = "") -> dict[str, Any]:
    """Upload a local image to Facebook page as a photo post.

    Args:
        image_path: Local path to the image file
        caption: Post caption/message

    Returns:
        dict with post_id and URL
    """
    from src.config import FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID

    if not FACEBOOK_PAGE_ACCESS_TOKEN:
        return {"error": "FACEBOOK_PAGE_ACCESS_TOKEN not configured", "status": "failed"}

    import httpx

    url = f"https://graph.facebook.com/v21.0/{FACEBOOK_PAGE_ID}/photos"

    try:
        with open(image_path, "rb") as f:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    url,
                    data={
                        "message": caption,
                        "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
                    },
                    files={"source": (Path(image_path).name, f, "image/png")},
                )

                if resp.status_code == 200:
                    data = resp.json()
                    logger.info(f"Facebook photo API raw response: {data}")
                    # Photos API returns: {"id": "PHOTO_ID", "post_id": "PAGE_ID_POST_ID"}
                    # We MUST use post_id for Insights API, not the photo id
                    page_post_id = data.get("post_id")
                    photo_id = data.get("id")

                    # If API didn't return post_id, resolve via page_story_id
                    if not page_post_id and photo_id:
                        try:
                            r2 = await client.get(
                                f"https://graph.facebook.com/v21.0/{photo_id}",
                                params={
                                    "fields": "page_story_id",
                                    "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
                                },
                            )
                            story_data = r2.json()
                            if "page_story_id" in story_data:
                                page_post_id = story_data["page_story_id"]
                                logger.info(f"Resolved photo {photo_id} → post {page_post_id}")
                            else:
                                logger.warning(f"No page_story_id for photo {photo_id}, response: {story_data}")
                        except Exception as e:
                            logger.warning(f"Failed to resolve page_story_id for {photo_id}: {e}")

                    post_id = page_post_id or photo_id
                    logger.info(f"Facebook photo posted: post_id={post_id}, photo_id={photo_id}")
                    return {
                        "platform": "facebook",
                        "post_id": post_id,
                        "url": f"https://facebook.com/{post_id}",
                        "status": "posted",
                        "image_path": image_path,
                    }
                return {
                    "platform": "facebook",
                    "status": "failed",
                    "error": resp.text,
                }
    except Exception as e:
        logger.error(f"Facebook upload failed: {e}")
        return {"platform": "facebook", "status": "failed", "error": str(e)}
