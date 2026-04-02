"""Generate image + post to Facebook with image.

Usage: python scripts/post_with_image.py
Requires: GOOGLE_AI_API_KEY in .env
"""
import asyncio
import io
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from dotenv import load_dotenv
load_dotenv()

EID = "r87exhmdbe3wnd9u7w6p4u6n"


async def main():
    from src.db.session import init_db, SessionLocal
    from src.db.models import AgentOutput
    from src.tools.image_tools import generate_content_image, upload_image_to_facebook
    from src.config import GOOGLE_AI_API_KEY
    from sqlalchemy import select

    await init_db()

    if not GOOGLE_AI_API_KEY:
        print("[!!] GOOGLE_AI_API_KEY not set in .env")
        print("     Get one free at: https://aistudio.google.com/apikey")
        print("     Add to .env: GOOGLE_AI_API_KEY=your_key_here")
        return

    # Load posts from DB
    async with SessionLocal() as session:
        rows = (await session.execute(
            select(AgentOutput).where(
                AgentOutput.experiment_id == EID,
                AgentOutput.phase == "build_test",
            )
        )).scalars().all()

    posts = []
    for r in rows:
        data = json.loads(r.output_data) if isinstance(r.output_data, str) else r.output_data
        posts.extend(data.get("posts", []))

    if not posts:
        print("No posts found in DB")
        return

    # Take first post
    post = posts[0]
    hook = post.get("hook", "")
    body = post.get("body", "")
    cta = post.get("cta", "")
    hashtags = post.get("hashtags", [])

    print(f"Post hook: {hook}")
    print()

    # Step 1: Generate image
    print("=" * 50)
    print("  Step 1: Generating image with Google Imagen...")
    print("=" * 50)

    start = time.monotonic()
    img_result = await generate_content_image(
        post_hook=hook,
        post_body=body,
        marketplace_name="doitay",
        vertical="handmade crafts",
        platform="facebook",
    )

    duration = int((time.monotonic() - start) * 1000)
    print(f"  Status: {img_result.get('status')}")
    print(f"  Duration: {duration}ms")

    if img_result.get("status") != "success":
        print(f"  Error: {img_result.get('error')}")
        return

    image_path = img_result["image_paths"][0]
    print(f"  Image saved: {image_path}")
    print(f"  Prompt used: {img_result.get('prompt', '')[:150]}")
    print()

    # Step 2: Post to Facebook with image
    print("=" * 50)
    print("  Step 2: Posting to Facebook with image...")
    print("=" * 50)

    full_message = f"{hook}\n\n{body}\n\n{cta}\n\n{' '.join(hashtags)}"

    fb_result = await upload_image_to_facebook(
        image_path=image_path,
        caption=full_message,
    )

    print(f"  Status: {fb_result.get('status')}")
    if fb_result.get("status") == "posted":
        print(f"  Post ID: {fb_result.get('post_id')}")
        print(f"  URL: {fb_result.get('url')}")
        print()
        print("  [OK] Posted to Facebook with AI-generated image!")
    else:
        print(f"  Error: {fb_result.get('error', '')[:200]}")


if __name__ == "__main__":
    asyncio.run(main())
