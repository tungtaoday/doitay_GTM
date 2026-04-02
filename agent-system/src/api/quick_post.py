"""Quick Post API — Content generation & Facebook posting for Doitay.vn.

POST /api/quick-post/generate  — Generate content from angle/topic
POST /api/quick-post/image     — Generate image with custom prompt
POST /api/quick-post/publish   — Post to Facebook with image
GET  /api/quick-post/context   — Get project context for frontend
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/quick-post")


class GenerateRequest(BaseModel):
    angle: str = ""          # Cái Uy / Sĩ Diện / Cơ Hội
    topic: str = ""          # Chủ đề cụ thể (optional)
    num_posts: int = 3
    extra_context: str = ""  # CEO thêm context nếu muốn


class ImageRequest(BaseModel):
    prompt: str
    style: str = "modern flat illustration, vibrant colors, clean design"


class PublishRequest(BaseModel):
    hook: str
    body: str
    cta: str
    hashtags: list[str]
    image_path: str | None = None


@router.get("/context")
async def get_context() -> dict[str, Any]:
    """Return project context for frontend display."""
    from src.project import load_project
    p = load_project()
    return {
        "name": p["name"],
        "tagline": p["tagline"],
        "description": p["description"],
        "angles": [
            {"name": a["name"], "description": a["description"]}
            for a in p.get("content_angles", [])
        ],
        "pillars": p.get("content_pillars", []),
        "tone": p.get("tone", ""),
        "default_cta": p.get("default_cta", ""),
        "stats": p.get("current_stats", {}),
    }


@router.post("/generate")
async def generate_content(req: GenerateRequest) -> dict[str, Any]:
    """Generate Facebook posts using project context + selected angle."""
    import os

    from anthropic import Anthropic
    from src.project import get_content_prompt_context

    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"error": "API key not configured", "status": "failed"}

    client = Anthropic(api_key=api_key)
    project_context = get_content_prompt_context()

    angle_instruction = ""
    if req.angle:
        angle_instruction = f"\n**Angle bắt buộc:** {req.angle}"
    if req.topic:
        angle_instruction += f"\n**Chủ đề cụ thể:** {req.topic}"
    if req.extra_context:
        angle_instruction += f"\n**Ghi chú thêm từ CEO:** {req.extra_context}"

    prompt = f"""Bạn là content marketer cho Doitay.vn. Viết bằng ngôn ngữ thợ, không phải ngôn ngữ công ty.

{project_context}
{angle_instruction}

Tạo {req.num_posts} bài Facebook. Mỗi bài cần:
- hook: Câu mở đầu gây chú ý, nói ngôn ngữ thợ (1-2 câu)
- body: Nội dung chính, chân thực, có số liệu nếu phù hợp (3-5 câu)
- cta: Call to action tự nhiên (1 câu)
- hashtags: 5-7 hashtags
- image_prompt: Mô tả ảnh minh họa bằng tiếng Anh (1-2 câu, cho AI image generator)

Trả về JSON array:
[{{"hook": "...", "body": "...", "cta": "...", "hashtags": ["#tag1"], "image_prompt": "..."}}]

CRITICAL: Trả về ONLY pure JSON array. Không text trước hoặc sau."""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response.content[0].text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        posts = json.loads(raw)

        return {"status": "success", "posts": posts}
    except Exception as e:
        logger.error(f"Content generation failed: {e}")
        return {"status": "failed", "error": str(e)}


@router.post("/image")
async def generate_image_endpoint(req: ImageRequest) -> dict[str, Any]:
    """Generate image with custom prompt using Google Gemini."""
    from src.tools.image_tools import generate_image

    import time
    filename = f"doitay_{int(time.time())}"

    result = await generate_image(
        prompt=req.prompt,
        style=req.style,
        aspect_ratio="16:9",
        num_images=1,
        output_filename=filename,
    )

    if result.get("status") == "success" and result.get("image_paths"):
        abs_path = result["image_paths"][0]
        filename = Path(abs_path).name
        result["image_url"] = f"/images/{filename}"

    return result


@router.post("/publish")
async def publish_to_facebook(req: PublishRequest) -> dict[str, Any]:
    """Post to Facebook — with or without image."""
    full_message = f"{req.hook}\n\n{req.body}\n\n{req.cta}\n\n{' '.join(req.hashtags)}"

    if req.image_path:
        from src.tools.image_tools import upload_image_to_facebook
        result = await upload_image_to_facebook(
            image_path=req.image_path,
            caption=full_message,
        )
    else:
        from src.tools.marketing_tools import post_facebook
        result = await post_facebook(message=full_message)

    return result
