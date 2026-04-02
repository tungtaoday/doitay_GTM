"""Reel Video Generator — creates short vertical videos from reel scripts.

Uses moviepy for video composition, edge-tts for Vietnamese voiceover,
and Google Imagen (via Gemini) for AI-generated background images per frame.
Generates 9:16 vertical videos (1080x1920) suitable for Facebook Reels,
Instagram Reels, TikTok, and YouTube Shorts.
"""
from __future__ import annotations

import asyncio
import logging
import os
import tempfile
import textwrap
import uuid
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Output directories
VIDEOS_DIR = Path(__file__).parent.parent.parent / "data" / "videos"
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# Video specs
WIDTH = 1080
HEIGHT = 1920
FPS = 30

# Color presets
COLORS = {
    "dark": "#1a1a2e",
    "dark_blue": "#16213e",
    "dark_purple": "#2d1b69",
    "dark_green": "#0f3d3e",
    "dark_red": "#3d0000",
    "orange": "#e8a020",
    "teal": "#22c4a0",
    "blue": "#3b82f6",
    "white": "#ffffff",
    "black": "#0c0c0d",
}


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


async def generate_voiceover(text: str, output_path: str, voice: str = "vi-VN-NamMinhNeural") -> str:
    """Generate Vietnamese voiceover using edge-tts.

    Available Vietnamese voices:
    - vi-VN-NamMinhNeural (male, natural)
    - vi-VN-HoaiMyNeural (female, natural)
    """
    import edge_tts

    communicate = edge_tts.Communicate(text, voice, rate="+15%")
    await communicate.save(output_path)
    return output_path


async def generate_frame_background(
    visual_direction: str,
    text_overlay: str,
    frame_index: int,
    project_context: str = "",
) -> str | None:
    """Generate an AI background image for a reel frame using Google Imagen.

    Args:
        visual_direction: Description of what the frame should show visually
        text_overlay: The text shown on this frame (used to auto-build prompt if visual_direction missing)
        frame_index: Frame number (for unique filename)
        project_context: Business context for better image relevance

    Returns:
        Path to generated image file, or None if generation fails
    """
    from src.tools.image_tools import generate_image

    # Auto-build visual direction from text_overlay if missing
    direction = (visual_direction or "").strip()
    if not direction and text_overlay:
        direction = (
            f"Background image for social media reel about: {text_overlay[:120]}. "
            f"{project_context}"
        )
    if not direction:
        return None

    # Build cinematic prompt for vertical video frame
    prompt = (
        f"{direction}. "
        f"Vertical 9:16 aspect ratio, social media reel frame. "
        f"Shot on a Canon EOS R5 with a 35mm lens, natural film grain, "
        f"filmic look, dramatic lighting, 8k, detailed textures. "
        f"Vietnamese context, no text overlays, no watermarks."
    )

    filename = f"_reel_bg_{uuid.uuid4().hex[:8]}"
    try:
        result = await generate_image(
            prompt=prompt,
            aspect_ratio="9:16",
            num_images=1,
            output_filename=filename,
        )
        if result.get("status") == "success" and result.get("image_paths"):
            img_path = result["image_paths"][0]
            logger.info(f"Generated AI background for frame {frame_index}: {img_path}")
            return img_path
        else:
            logger.warning(f"AI background failed for frame {frame_index}: {result.get('error')}")
            return None
    except Exception as e:
        logger.warning(f"AI background generation error for frame {frame_index}: {e}")
        return None


def _create_frame_image(
    text: str,
    bg_color: str = "#1a1a2e",
    text_color: str = "#ffffff",
    text_position: str = "center",
    text_size: str = "large",
    accent_color: str | None = None,
    bg_image_path: str | None = None,
) -> Any:
    """Create a single frame image with text overlay using Pillow.

    If bg_image_path is provided, uses the AI-generated image as background
    with a dark overlay for text readability. Otherwise falls back to solid color.
    """
    from PIL import Image, ImageDraw, ImageFont, ImageFilter

    if bg_image_path and os.path.exists(bg_image_path):
        # Use AI-generated image as background
        img = Image.open(bg_image_path).convert("RGB")
        img = img.resize((WIDTH, HEIGHT), Image.LANCZOS)
        # Add dark overlay for text readability
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 100))
        img = img.convert("RGBA")
        img = Image.alpha_composite(img, overlay)
        img = img.convert("RGB")
    else:
        # Fallback: rich gradient background (not flat black)
        img = Image.new("RGB", (WIDTH, HEIGHT))
        draw_grad = ImageDraw.Draw(img)
        # Gradient from top color to bottom color
        gradients = [
            ((26, 26, 46), (22, 33, 62)),     # dark blue → navy
            ((45, 27, 105), (15, 10, 50)),     # purple → deep
            ((15, 61, 62), (10, 30, 35)),      # teal → dark teal
            ((61, 20, 10), (30, 10, 5)),       # warm brown → dark
            ((20, 40, 80), (10, 15, 35)),      # blue → deep blue
        ]
        import hashlib
        seed = int(hashlib.md5(text.encode()).hexdigest()[:8], 16)
        top_rgb, bot_rgb = gradients[seed % len(gradients)]
        for y in range(HEIGHT):
            ratio = y / HEIGHT
            r = int(top_rgb[0] + (bot_rgb[0] - top_rgb[0]) * ratio)
            g = int(top_rgb[1] + (bot_rgb[1] - top_rgb[1]) * ratio)
            b = int(top_rgb[2] + (bot_rgb[2] - top_rgb[2]) * ratio)
            draw_grad.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    draw = ImageDraw.Draw(img)

    # Font sizes
    font_sizes = {"large": 72, "medium": 52, "small": 38}
    font_size = font_sizes.get(text_size, 52)

    # Try to load a good font, fallback to default
    font = None
    font_paths = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                continue
    if font is None:
        font = ImageFont.load_default()

    # Wrap text
    max_chars = 18 if text_size == "large" else 25 if text_size == "medium" else 35
    lines = []
    for raw_line in text.split("\n"):
        lines.extend(textwrap.wrap(raw_line, width=max_chars) or [""])

    # Calculate text block height
    line_height = font_size + 12
    total_text_height = len(lines) * line_height

    # Position
    if text_position == "top":
        y_start = HEIGHT // 5
    elif text_position == "bottom":
        y_start = HEIGHT - HEIGHT // 4 - total_text_height
    else:  # center
        y_start = (HEIGHT - total_text_height) // 2

    # Draw accent bar behind text (optional)
    if accent_color:
        accent_rgb = _hex_to_rgb(accent_color)
        padding = 30
        draw.rounded_rectangle(
            [
                WIDTH // 2 - 450,
                y_start - padding,
                WIDTH // 2 + 450,
                y_start + total_text_height + padding,
            ],
            radius=20,
            fill=(*accent_rgb, 180),
        )

    # Draw text with shadow
    txt_rgb = _hex_to_rgb(text_color)
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (WIDTH - text_width) // 2
        y = y_start + i * line_height

        # Shadow
        draw.text((x + 3, y + 3), line, fill=(0, 0, 0), font=font)
        # Main text
        draw.text((x, y), line, fill=txt_rgb, font=font)

    return img


async def generate_reel_video(
    reel_script: dict[str, Any],
    output_filename: str | None = None,
    add_voiceover: bool = True,
    voice: str = "vi-VN-NamMinhNeural",
    fallback_bg_image: str | None = None,
) -> dict[str, Any]:
    """Generate a reel video from a structured reel script.

    Args:
        reel_script: Dict with title, duration_seconds, frames[], music_mood, etc.
        output_filename: Optional output filename
        add_voiceover: Whether to generate TTS voiceover
        voice: edge-tts voice name
        fallback_bg_image: Path to an existing image (e.g. post's generated image)
            to use as background when AI frame generation fails

    Returns:
        dict with video_path, duration, metadata
    """
    from moviepy import (
        AudioFileClip,
        CompositeVideoClip,
        ImageClip,
        concatenate_audioclips,
        concatenate_videoclips,
    )

    MAX_REEL_DURATION = 20  # seconds — 15-20s is the sweet spot for 2025-2026

    frames = reel_script.get("frames", [])
    if not frames:
        return {"error": "No frames in reel script", "status": "failed"}

    title = reel_script.get("title", "reel")
    total_duration = min(reel_script.get("duration_seconds", 18), MAX_REEL_DURATION)

    if not output_filename:
        safe_title = "".join(c if c.isalnum() else "_" for c in title[:30])
        output_filename = f"reel_{safe_title}_{uuid.uuid4().hex[:8]}.mp4"

    output_path = str(VIDEOS_DIR / output_filename)

    temp_files = []
    try:
        # Step 1: Generate voiceover audio for each frame
        frame_audios = []
        if add_voiceover:
            for i, frame in enumerate(frames):
                vo_text = frame.get("voiceover_text", "")
                if not vo_text:
                    frame_audios.append(None)
                    continue

                vo_path = str(VIDEOS_DIR / f"_vo_{uuid.uuid4().hex[:8]}.mp3")
                temp_files.append(vo_path)
                try:
                    await generate_voiceover(vo_text, vo_path, voice=voice)
                    frame_audios.append(vo_path)
                except Exception as e:
                    logger.warning(f"Voiceover failed for frame {i}: {e}")
                    frame_audios.append(None)
        else:
            frame_audios = [None] * len(frames)

        # Step 2: Generate AI background images for each frame
        # Get project context for better image prompts
        try:
            from src.project import get_project_context
            ctx = get_project_context()
            project_ctx = f"{ctx.get('name', '')} - {ctx.get('vertical', '')}"
        except Exception:
            project_ctx = ""

        bg_images = []
        # Check if fallback image exists
        fallback_exists = fallback_bg_image and os.path.exists(fallback_bg_image)
        if fallback_exists:
            logger.info(f"Fallback background available: {fallback_bg_image}")

        for i, frame in enumerate(frames):
            visual_direction = frame.get("visual_direction", "")
            text_overlay = frame.get("text_overlay", "")
            bg_path = await generate_frame_background(visual_direction, text_overlay, i, project_ctx)
            if bg_path:
                temp_files.append(bg_path)
            elif fallback_exists:
                # Use post's existing image as background when AI gen fails
                bg_path = fallback_bg_image
                logger.info(f"Using fallback image for frame {i}")
            bg_images.append(bg_path)

        # Step 3: Create video clips for each frame
        # Use per-frame start_time/end_time if available, otherwise distribute evenly
        per_frame_duration = total_duration / len(frames)

        video_clips = []
        audio_clips = []

        for i, frame in enumerate(frames):
            # Respect explicit timing from reel script if provided
            start_t = frame.get("start_time")
            end_t = frame.get("end_time")
            if start_t is not None and end_t is not None:
                frame_duration = max(end_t - start_t, 1.5)
            else:
                frame_duration = per_frame_duration

            # Trim audio to fit frame duration
            if frame_audios[i]:
                try:
                    audio_clip = AudioFileClip(frame_audios[i])
                    # Hard trim: audio must fit within frame_duration
                    audio_clip = audio_clip.subclipped(0, min(audio_clip.duration, frame_duration))
                    audio_clips.append(audio_clip)
                except Exception as e:
                    logger.warning(f"Audio clip error for frame {i}: {e}")
                    audio_clips.append(None)
            else:
                audio_clips.append(None)

            # Create frame image (with AI background if available)
            bg_color = frame.get("background_color", COLORS.get("dark", "#1a1a2e"))
            text_overlay = frame.get("text_overlay", "")
            text_position = frame.get("text_position", "center")
            text_size = frame.get("text_size", "large" if i == 0 else "medium")

            pil_image = _create_frame_image(
                text=text_overlay,
                bg_color=bg_color,
                text_position=text_position,
                text_size=text_size,
                accent_color=COLORS.get("orange") if i == len(frames) - 1 else None,
                bg_image_path=bg_images[i],
            )

            # Save to temp file and create ImageClip
            img_path = str(VIDEOS_DIR / f"_frame_{uuid.uuid4().hex[:8]}.png")
            temp_files.append(img_path)
            pil_image.save(img_path)

            clip = ImageClip(img_path).with_duration(frame_duration)

            # Add audio to clip if available
            if audio_clips[i]:
                clip = clip.with_audio(audio_clips[i])

            video_clips.append(clip)

        if not video_clips:
            return {"error": "No video clips generated", "status": "failed"}

        # Step 4: Concatenate all clips
        final_video = concatenate_videoclips(video_clips, method="compose")

        # Step 5: Write output
        logger.info(f"Rendering reel video: {output_path} ({final_video.duration:.1f}s)")
        final_video.write_videofile(
            output_path,
            fps=FPS,
            codec="libx264",
            audio_codec="aac",
            preset="medium",
            threads=4,
            logger=None,  # suppress moviepy progress bar
        )

        # Cleanup moviepy clips
        final_video.close()
        for clip in video_clips:
            clip.close()
        for ac in audio_clips:
            if ac:
                ac.close()

        actual_duration = final_video.duration

        return {
            "status": "success",
            "video_path": output_path,
            "video_filename": output_filename,
            "duration_seconds": round(actual_duration, 1),
            "frames_count": len(frames),
            "has_voiceover": add_voiceover,
            "title": title,
        }

    except Exception as e:
        logger.error(f"Reel generation failed: {e}")
        return {"error": str(e), "status": "failed"}

    finally:
        # Cleanup temp files
        for tf in temp_files:
            try:
                if os.path.exists(tf):
                    os.remove(tf)
            except Exception:
                pass
