"""Open Playwright Chrome to login Facebook manually.

Usage: python scripts/open_browser.py
Chrome will open -> login Facebook -> press Enter in terminal to save session.
"""
import asyncio
import sys

async def main():
    sys.path.insert(0, ".")
    from src.tools.browser_poster import _get_browser_context

    pw, context = await _get_browser_context()
    page = await context.new_page()
    await page.goto("https://www.facebook.com/")

    # Keep browser open until user presses Enter
    print("\n=== Chrome da mo. Dang nhap Facebook xong thi quay lai day an Enter ===\n")
    await asyncio.get_event_loop().run_in_executor(None, sys.stdin.readline)

    await context.close()
    await pw.stop()
    print("Session saved. Done.")

if __name__ == "__main__":
    asyncio.run(main())
