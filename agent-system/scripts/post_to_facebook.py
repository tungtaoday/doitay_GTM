"""Post content from experiment to Facebook page Doitay.vn."""
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
    from src.tools.marketing_tools import post_facebook
    from sqlalchemy import select

    await init_db()

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

    print(f"Found {len(posts)} posts to publish")
    print()

    for i, p in enumerate(posts):
        hook = p.get("hook", "")
        body = p.get("body", "")
        cta = p.get("cta", "")
        hashtags = p.get("hashtags", [])

        # Build full post message
        full_message = f"{hook}\n\n{body}\n\n{cta}\n\n{' '.join(hashtags)}"

        print(f"--- Post {i+1}/{len(posts)} ---")
        print(f"Hook: {hook}")
        print(f"Length: {len(full_message)} chars")

        # Post to Facebook
        result = await post_facebook(message=full_message)

        if result.get("status") == "posted":
            print(f"[OK] Posted! ID: {result.get('post_id')}")
            print(f"     URL: {result.get('url')}")
        else:
            print(f"[FAIL] {result.get('error', 'Unknown error')[:200]}")

        print()

        # Wait 5s between posts to avoid rate limiting
        if i < len(posts) - 1:
            print("  Waiting 5s before next post...")
            await asyncio.sleep(5)

    print("=" * 50)
    print("Done! All posts published to Doitay.vn Facebook page.")


if __name__ == "__main__":
    asyncio.run(main())
