"""Browser Poster — Đăng bài & comment lên Facebook Groups via Playwright.

Dùng persistent browser context (giữ session login) để:
1. Navigate đến group
2. Tạo post mới / Comment vào post có sẵn
3. Paste content + attach image
4. Submit

Requires: playwright, chromium installed
Usage:
  await post_to_fb_group(group_url, content, image_path=None)
  await comment_on_group_posts(group_url, comments, max_comments=3)
"""
from __future__ import annotations

import asyncio
import logging
import random
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Persistent browser profile — keeps Facebook login session
BROWSER_DATA_DIR = Path(__file__).parent.parent.parent / "data" / "browser_profile"


async def _get_browser_context():
    """Get or create a persistent browser context with saved cookies/login."""
    from playwright.async_api import async_playwright

    pw = await async_playwright().start()
    context = await pw.chromium.launch_persistent_context(
        user_data_dir=str(BROWSER_DATA_DIR),
        headless=False,  # Need visible browser for FB login on first run
        viewport={"width": 1280, "height": 900},
        locale="vi-VN",
        timezone_id="Asia/Ho_Chi_Minh",
        args=["--disable-blink-features=AutomationControlled"],
    )
    return pw, context


async def check_fb_login() -> dict[str, Any]:
    """Check if Facebook is logged in by visiting facebook.com."""
    pw, context = await _get_browser_context()
    try:
        page = await context.new_page()
        await page.goto("https://www.facebook.com/", wait_until="networkidle", timeout=15000)
        await asyncio.sleep(2)

        # Check if we see login form or the main feed
        url = page.url
        is_logged_in = "login" not in url and "/login" not in url

        # Try to find the user avatar or compose box
        if is_logged_in:
            try:
                await page.wait_for_selector('[aria-label="Tạo bài viết"], [aria-label="Create a post"], [role="button"][aria-label*="profile"]', timeout=5000)
                return {"logged_in": True, "url": url}
            except Exception:
                return {"logged_in": False, "url": url, "note": "Page loaded but compose box not found — may need manual login"}

        return {"logged_in": False, "url": url, "note": "Mở browser tại localhost để login Facebook thủ công"}
    except Exception as e:
        return {"logged_in": False, "error": str(e)}
    finally:
        await context.close()
        await pw.stop()


async def _post_to_single_group(
    page,
    group_url: str,
    group_name: str,
    content: str,
    image_path: str | None = None,
    hashtags: list[str] | None = None,
) -> dict[str, Any]:
    """Post content to a single Facebook group using an existing browser page.

    This is the internal worker — it does NOT manage the browser lifecycle.
    Use post_to_fb_group() for standalone calls or post_to_multiple_groups()
    for batching.
    """
    from datetime import datetime as _dt

    result: dict[str, Any] = {
        "group_name": group_name,
        "group_url": group_url,
        "status": "failed",
    }

    try:
        # 1. Navigate to group
        logger.info(f"[BrowserPoster] Navigating to group: {group_name}")
        await page.goto(group_url, wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(random.uniform(2, 4))

        # 2. Find and click the "Write something" / compose box
        compose_selectors = [
            '[aria-label="Viết gì đó..."]',
            '[aria-label="Write something..."]',
            '[aria-label="Tạo bài viết"]',
            '[aria-label="Create a post"]',
            'div[role="button"]:has-text("Viết gì đó")',
            'div[role="button"]:has-text("Write something")',
            'span:has-text("Bạn đang nghĩ gì?")',
            'span:has-text("What\'s on your mind")',
        ]

        compose_clicked = False
        for selector in compose_selectors:
            try:
                el = await page.wait_for_selector(selector, timeout=3000)
                if el:
                    # Scroll element into view first to avoid triggering page scroll
                    await el.scroll_into_view_if_needed()
                    await asyncio.sleep(0.5)
                    await el.click()
                    compose_clicked = True
                    logger.info(f"[BrowserPoster] Clicked compose box with: {selector}")
                    break
            except Exception:
                continue

        if not compose_clicked:
            result["error"] = "Could not find compose box — group may require different UI or not allow posting"
            return result

        # Wait for the post creation dialog/popup to actually appear
        dialog_appeared = False
        dialog_selectors = [
            'div[role="dialog"]',
            'div[aria-label="Tạo bài viết"]',
            'div[aria-label="Create post"]',
            'div[aria-label="Create a post"]',
        ]
        for ds in dialog_selectors:
            try:
                await page.wait_for_selector(ds, timeout=5000)
                dialog_appeared = True
                logger.info(f"[BrowserPoster] Post dialog appeared: {ds}")
                break
            except Exception:
                continue

        if not dialog_appeared:
            # Fallback: try clicking compose box again with JavaScript click
            logger.warning("[BrowserPoster] Dialog not found after first click, retrying with JS click...")
            for selector in compose_selectors:
                try:
                    el = await page.wait_for_selector(selector, timeout=2000)
                    if el:
                        await el.scroll_into_view_if_needed()
                        await asyncio.sleep(0.3)
                        # Use JS click to bypass potential overlay/scroll interception
                        await el.evaluate("el => el.click()")
                        await asyncio.sleep(2)
                        # Check again for dialog
                        for ds in dialog_selectors:
                            try:
                                await page.wait_for_selector(ds, timeout=3000)
                                dialog_appeared = True
                                break
                            except Exception:
                                continue
                        if dialog_appeared:
                            break
                except Exception:
                    continue

            if not dialog_appeared:
                result["error"] = "Compose box clicked but post dialog did not appear — may need manual intervention"
                return result

        await asyncio.sleep(random.uniform(1, 2))

        # 3. Type content (with hashtags)
        full_text = content
        if hashtags:
            full_text += "\n\n" + " ".join(hashtags)

        # Find the text editor inside the dialog
        editor_selectors = [
            'div[role="dialog"] div[contenteditable="true"][role="textbox"]',
            'div[role="dialog"] div[contenteditable="true"][data-lexical-editor="true"]',
            'div[role="dialog"] div[contenteditable="true"]',
            'div[contenteditable="true"][role="textbox"]',
            'div[contenteditable="true"][aria-label*="viết"]',
            'div[contenteditable="true"][aria-label*="Write"]',
            'div[contenteditable="true"][data-lexical-editor="true"]',
            'div[contenteditable="true"]',
        ]

        typed = False
        for selector in editor_selectors:
            try:
                editor = await page.wait_for_selector(selector, timeout=3000)
                if editor:
                    await editor.scroll_into_view_if_needed()
                    await asyncio.sleep(0.3)
                    await editor.click()
                    await asyncio.sleep(0.5)
                    # Type slowly to look natural
                    await page.keyboard.type(full_text, delay=random.randint(10, 30))
                    typed = True
                    logger.info(f"[BrowserPoster] Typed {len(full_text)} chars into editor")
                    break
            except Exception:
                continue

        if not typed:
            result["error"] = "Could not type into editor"
            return result

        await asyncio.sleep(random.uniform(1, 2))

        # 4. Attach image if available
        #
        # IMPORTANT: Only search for input[type="file"] INSIDE the dialog.
        # There are other file inputs on the page (comment areas) that will
        # cause the image to go into a comment instead of the post.
        if image_path and Path(image_path).exists():
            abs_image_path = str(Path(image_path).resolve())
            logger.info(f"[BrowserPoster] Attempting to attach image: {abs_image_path}")
            image_attached = False

            # Get a handle to the dialog element for scoped queries
            dialog = await page.query_selector('div[role="dialog"]')

            # ── Strategy A: Click photo button inside dialog, then use file_chooser ──
            # This is the most reliable: click "Ảnh/Video" and intercept the file chooser.
            photo_selectors = [
                '[aria-label="Ảnh/Video"]',
                '[aria-label="Photo/video"]',
                '[aria-label="Photo/Video"]',
                '[aria-label="Ảnh/video"]',
            ]

            if dialog:
                for ps in photo_selectors:
                    try:
                        photo_btn = await dialog.query_selector(ps)
                        if not photo_btn:
                            continue
                        await photo_btn.scroll_into_view_if_needed()
                        await asyncio.sleep(0.3)

                        # Intercept file chooser that FB opens when clicking photo button
                        async with page.expect_file_chooser(timeout=5000) as fc_info:
                            await photo_btn.click()
                        file_chooser = await fc_info.value
                        await file_chooser.set_files(abs_image_path)
                        image_attached = True
                        logger.info(f"[BrowserPoster] Strategy A: Attached image via file_chooser ({ps})")
                        await asyncio.sleep(random.uniform(3, 5))
                        break
                    except Exception as e:
                        logger.debug(f"[BrowserPoster] Strategy A with '{ps}' failed: {e}")
                        # Close any sub-dialog/overlay that may have opened
                        try:
                            await page.keyboard.press("Escape")
                            await asyncio.sleep(0.5)
                        except Exception:
                            pass

            # ── Strategy B: Find input[type="file"] scoped INSIDE dialog only ──
            if not image_attached and dialog:
                try:
                    file_inputs = await dialog.query_selector_all('input[type="file"]')
                    for fi in file_inputs:
                        try:
                            await fi.set_input_files(abs_image_path)
                            image_attached = True
                            logger.info("[BrowserPoster] Strategy B: Attached image via dialog file input")
                            await asyncio.sleep(random.uniform(3, 5))
                            break
                        except Exception:
                            continue
                except Exception as e:
                    logger.debug(f"[BrowserPoster] Strategy B failed: {e}")

            # ── Strategy C: Click photo button then find input[type="file"] in dialog ──
            if not image_attached and dialog:
                for ps in photo_selectors:
                    try:
                        photo_btn = await dialog.query_selector(ps)
                        if not photo_btn:
                            continue
                        await photo_btn.scroll_into_view_if_needed()
                        await asyncio.sleep(0.3)
                        await photo_btn.click()
                        await asyncio.sleep(2)

                        # Now look for file input INSIDE dialog
                        file_inputs = await dialog.query_selector_all('input[type="file"]')
                        for fi in file_inputs:
                            try:
                                await fi.set_input_files(abs_image_path)
                                image_attached = True
                                logger.info("[BrowserPoster] Strategy C: Attached image via post-click dialog input")
                                await asyncio.sleep(random.uniform(3, 5))
                                break
                            except Exception:
                                continue
                        if image_attached:
                            break
                        # Clean up if sub-dialog opened
                        await page.keyboard.press("Escape")
                        await asyncio.sleep(0.5)
                    except Exception as e:
                        logger.debug(f"[BrowserPoster] Strategy C failed: {e}")

            if image_attached:
                # Wait for image preview/thumbnail to appear in the dialog
                try:
                    await page.wait_for_selector(
                        'div[role="dialog"] img[src*="blob:"], '
                        'div[role="dialog"] div[role="img"]',
                        timeout=10000,
                    )
                    logger.info("[BrowserPoster] Image preview appeared in dialog")
                except Exception:
                    logger.warning("[BrowserPoster] Image preview not detected, proceeding anyway")
            else:
                logger.warning(f"[BrowserPoster] All image strategies failed for: {abs_image_path}")
                # Make sure no blocking sub-dialog remains open
                try:
                    await page.keyboard.press("Escape")
                    await asyncio.sleep(0.5)
                except Exception:
                    pass

        # 5. Click Post button (prioritize buttons inside dialog)
        post_selectors = [
            'div[role="dialog"] div[aria-label="Đăng"][role="button"]',
            'div[role="dialog"] div[aria-label="Post"][role="button"]',
            'div[role="dialog"] [aria-label="Đăng"]',
            'div[role="dialog"] [aria-label="Post"]',
            'div[role="dialog"] div[role="button"]:has-text("Đăng")',
            'div[role="dialog"] div[role="button"]:has-text("Post")',
            'div[aria-label="Đăng"][role="button"]',
            'div[aria-label="Post"][role="button"]',
            '[aria-label="Đăng"]',
            '[aria-label="Post"]',
            'button:has-text("Đăng")',
            'button:has-text("Post")',
            'form div[role="button"]:has-text("Đăng")',
            'form div[role="button"]:has-text("Post")',
        ]

        posted = False
        for ps in post_selectors:
            try:
                elements = await page.query_selector_all(ps)
                for post_btn in elements:
                    if not await post_btn.is_visible():
                        continue
                    is_disabled = await post_btn.get_attribute("aria-disabled")
                    if is_disabled == "true":
                        await asyncio.sleep(3)
                        is_disabled = await post_btn.get_attribute("aria-disabled")
                        if is_disabled == "true":
                            continue
                    await post_btn.click()
                    posted = True
                    logger.info(f"[BrowserPoster] Clicked Post button with: {ps}")
                    break
                if posted:
                    break
            except Exception:
                continue

        # Fallback: try Ctrl+Enter to submit
        if not posted:
            try:
                await page.keyboard.press("Control+Enter")
                posted = True
                logger.info("[BrowserPoster] Used Ctrl+Enter fallback to submit")
            except Exception:
                pass

        if not posted:
            result["error"] = "Could not find/click Post button"
            return result

        # 6. Wait for post to submit
        await asyncio.sleep(random.uniform(3, 5))

        # 7. Try to get post URL (optional)
        result["status"] = "posted"
        result["posted_at"] = _dt.now().isoformat()

        # Try to grab the URL from the page after posting
        current_url = page.url
        result["post_url"] = current_url

        logger.info(f"[BrowserPoster] Successfully posted to {group_name}")
        return result

    except Exception as e:
        result["error"] = str(e)
        logger.error(f"[BrowserPoster] Error posting to {group_name}: {e}")
        return result


async def post_to_fb_group(
    group_url: str,
    group_name: str,
    content: str,
    image_path: str | None = None,
    hashtags: list[str] | None = None,
) -> dict[str, Any]:
    """Post content to a Facebook group using browser automation.

    Opens its own browser session. For posting to multiple groups,
    use post_to_multiple_groups() instead (shares one browser session).
    """
    pw, context = await _get_browser_context()
    try:
        page = await context.new_page()
        return await _post_to_single_group(page, group_url, group_name, content, image_path, hashtags)
    except Exception as e:
        return {"group_name": group_name, "group_url": group_url, "status": "failed", "error": str(e)}
    finally:
        await context.close()
        await pw.stop()


async def post_to_multiple_groups(
    groups: list[dict],
    content: str,
    image_path: str | None = None,
    hashtags: list[str] | None = None,
    delay_minutes: int = 2,
) -> list[dict]:
    """Post to multiple Facebook groups with delay between each.

    Uses a SINGLE shared browser session for all groups (faster & more stable
    than opening/closing the browser for each group).
    """
    pw, context = await _get_browser_context()
    results = []
    try:
        page = await context.new_page()

        for i, group in enumerate(groups):
            logger.info(f"[BrowserPoster] Posting to group {i+1}/{len(groups)}: {group['name']}")

            result = await _post_to_single_group(
                page=page,
                group_url=group["url"],
                group_name=group["name"],
                content=content,
                image_path=image_path,
                hashtags=hashtags,
            )
            results.append(result)

            # Short delay between posts (1-3 min random)
            if i < len(groups) - 1 and result["status"] == "posted":
                delay_secs = random.randint(60, 180)
                logger.info(f"[BrowserPoster] Waiting {delay_secs}s before next group...")
                await asyncio.sleep(delay_secs)
            elif result["status"] == "failed" and "captcha" in str(result.get("error", "")).lower():
                logger.error("[BrowserPoster] CAPTCHA detected — stopping session")
                break
    except Exception as e:
        logger.error(f"[BrowserPoster] Browser session error: {e}")
    finally:
        await context.close()
        await pw.stop()

    return results


# ── Comment Functions ──


async def _comment_on_single_group(
    page,
    group_url: str,
    group_name: str,
    comments: list[str],
    max_comments: int = 3,
    keyword_filter: list[str] | None = None,
) -> dict[str, Any]:
    """Scroll a Facebook group feed and comment on recent posts.

    Internal worker — uses an existing browser page.
    """
    from datetime import datetime

    result: dict[str, Any] = {
        "group_name": group_name,
        "group_url": group_url,
        "status": "failed",
        "comments_posted": 0,
        "details": [],
    }

    try:
        # 1. Navigate to group
        logger.info(f"[BrowserComment] Navigating to group: {group_name}")
        await page.goto(group_url, wait_until="domcontentloaded", timeout=20000)
        await asyncio.sleep(random.uniform(3, 5))

        # 2. Scroll down to load posts
        for _ in range(3):
            await page.mouse.wheel(0, random.randint(800, 1200))
            await asyncio.sleep(random.uniform(1, 2))

        # 3. Find posts in the feed
        post_selectors = [
            'div[role="article"]',
            'div[data-ad-preview="message"]',
        ]

        posts = []
        for sel in post_selectors:
            posts = await page.query_selector_all(sel)
            if posts:
                logger.info(f"[BrowserComment] Found {len(posts)} posts with: {sel}")
                break

        if not posts:
            result["error"] = "Could not find any posts in group feed"
            return result

        # 4. Iterate through posts and comment
        comment_idx = 0
        for i, post_el in enumerate(posts):
            if result["comments_posted"] >= max_comments:
                break

            try:
                # Get post text to check keyword filter
                post_text = await post_el.inner_text()
                post_text_lower = post_text.lower() if post_text else ""

                # Apply keyword filter if provided
                if keyword_filter:
                    matched = any(kw.lower() in post_text_lower for kw in keyword_filter)
                    if not matched:
                        continue

                # Skip very short posts (likely ads or system posts)
                if len(post_text_lower) < 20:
                    continue

                post_preview = post_text[:80].replace("\n", " ") if post_text else "?"
                logger.info(f"[BrowserComment] Post {i}: {post_preview}...")

                # 5. Scroll the post into view first
                await post_el.scroll_into_view_if_needed()
                await asyncio.sleep(0.5)

                # 6. Find and click the Comment button/link WITHIN this post
                #
                # On Facebook, the comment action is a clickable area below the post
                # that says "Bình luận" / "Comment". It might be:
                #   - A span inside a div[role="button"]
                #   - A div with aria-label
                #   - A clickable area that opens the comment input
                comment_btn_clicked = False

                # First: try clicking the comment input placeholder directly (fastest path)
                comment_input_selectors = [
                    'div[aria-label="Viết bình luận"]',
                    'div[aria-label="Viết bình luận…"]',
                    'div[aria-label="Write a comment"]',
                    'div[aria-label="Write a comment…"]',
                    'div[contenteditable="true"][aria-label*="bình luận"]',
                    'div[contenteditable="true"][aria-label*="comment"]',
                ]
                for ci_sel in comment_input_selectors:
                    try:
                        inputs = await post_el.query_selector_all(ci_sel)
                        for inp in inputs:
                            if await inp.is_visible():
                                await inp.scroll_into_view_if_needed()
                                await asyncio.sleep(0.3)
                                await inp.click()
                                comment_btn_clicked = True
                                logger.info(f"[BrowserComment] Clicked comment input directly: {ci_sel}")
                                break
                        if comment_btn_clicked:
                            break
                    except Exception:
                        continue

                # Second: try the "Bình luận" / "Comment" action button
                if not comment_btn_clicked:
                    comment_btn_selectors = [
                        '[aria-label="Bình luận"]',
                        '[aria-label="Comment"]',
                        '[aria-label="Để lại bình luận"]',
                        '[aria-label="Leave a comment"]',
                        'span:has-text("Bình luận")',
                        'span:has-text("Comment")',
                    ]
                    for cb_sel in comment_btn_selectors:
                        try:
                            btns = await post_el.query_selector_all(cb_sel)
                            for btn in btns:
                                if await btn.is_visible():
                                    await btn.scroll_into_view_if_needed()
                                    await asyncio.sleep(0.3)
                                    await btn.click()
                                    comment_btn_clicked = True
                                    logger.info(f"[BrowserComment] Clicked comment button: {cb_sel}")
                                    break
                            if comment_btn_clicked:
                                break
                        except Exception:
                            continue

                if not comment_btn_clicked:
                    logger.info(f"[BrowserComment] Could not find comment button for post {i}, skipping")
                    continue

                await asyncio.sleep(random.uniform(1.5, 2.5))

                # 7. Find the comment editor and type
                typed = False
                comment_text = comments[comment_idx % len(comments)]
                comment_idx += 1

                # After clicking, the comment editor should be focused or visible.
                # Try multiple approaches:

                # Approach 1: Type directly — if clicking the input already focused it
                try:
                    # Check if there's an active/focused contenteditable
                    focused = await page.evaluate("""
                        () => {
                            const el = document.activeElement;
                            return el && el.contentEditable === 'true' ? true : false;
                        }
                    """)
                    if focused:
                        await page.keyboard.type(comment_text, delay=random.randint(15, 40))
                        typed = True
                        logger.info(f"[BrowserComment] Typed via focused element")
                except Exception:
                    pass

                # Approach 2: Find editor within the post element
                if not typed:
                    editor_selectors = [
                        'div[contenteditable="true"][aria-label*="bình luận"]',
                        'div[contenteditable="true"][aria-label*="comment"]',
                        'div[contenteditable="true"][role="textbox"]',
                    ]
                    for ce_sel in editor_selectors:
                        try:
                            editors = await post_el.query_selector_all(ce_sel)
                            for editor in editors:
                                if await editor.is_visible():
                                    await editor.scroll_into_view_if_needed()
                                    await asyncio.sleep(0.3)
                                    await editor.click()
                                    await asyncio.sleep(0.5)
                                    await page.keyboard.type(comment_text, delay=random.randint(15, 40))
                                    typed = True
                                    break
                            if typed:
                                break
                        except Exception:
                            continue

                # Approach 3: Find the most recently visible textbox on the page
                if not typed:
                    try:
                        editors = await page.query_selector_all('div[contenteditable="true"][role="textbox"]')
                        for editor in reversed(editors):
                            if await editor.is_visible():
                                await editor.scroll_into_view_if_needed()
                                await asyncio.sleep(0.3)
                                await editor.click()
                                await asyncio.sleep(0.5)
                                await page.keyboard.type(comment_text, delay=random.randint(15, 40))
                                typed = True
                                break
                    except Exception:
                        pass

                if not typed:
                    logger.info(f"[BrowserComment] Could not type into comment editor for post {i}")
                    continue

                await asyncio.sleep(random.uniform(0.5, 1))

                # 8. Submit comment (Enter key)
                await page.keyboard.press("Enter")
                await asyncio.sleep(random.uniform(2, 3))

                result["comments_posted"] += 1
                result["details"].append({
                    "post_index": i,
                    "post_preview": post_preview,
                    "comment": comment_text,
                    "commented_at": datetime.now().isoformat(),
                    "status": "commented",
                })

                logger.info(
                    f"[BrowserComment] Commented on post {i} in {group_name}: "
                    f"{comment_text[:50]}..."
                )

                # Random delay between comments (anti-spam)
                if result["comments_posted"] < max_comments:
                    delay = random.uniform(30, 90)
                    logger.info(f"[BrowserComment] Waiting {delay:.0f}s before next comment...")
                    await asyncio.sleep(delay)

            except Exception as e:
                logger.debug(f"[BrowserComment] Skipping post {i}: {e}")
                continue

        result["status"] = "success" if result["comments_posted"] > 0 else "no_comments"
        return result

    except Exception as e:
        result["error"] = str(e)
        logger.error(f"[BrowserComment] Error in group {group_name}: {e}")
        return result


async def comment_on_group_posts(
    group_url: str,
    group_name: str,
    comments: list[str],
    max_comments: int = 3,
    keyword_filter: list[str] | None = None,
) -> dict[str, Any]:
    """Comment on group posts. Opens its own browser session."""
    pw, context = await _get_browser_context()
    try:
        page = await context.new_page()
        return await _comment_on_single_group(page, group_url, group_name, comments, max_comments, keyword_filter)
    except Exception as e:
        return {"group_name": group_name, "group_url": group_url, "status": "failed", "comments_posted": 0, "error": str(e), "details": []}
    finally:
        await context.close()
        await pw.stop()


async def comment_on_multiple_groups(
    groups: list[dict],
    comments: list[str],
    max_comments_per_group: int = 3,
    keyword_filter: list[str] | None = None,
    delay_minutes: int = 3,
) -> list[dict]:
    """Comment on posts across multiple Facebook groups.

    Uses a SINGLE shared browser session for all groups.
    """
    pw, context = await _get_browser_context()
    results = []
    try:
        page = await context.new_page()

        for i, group in enumerate(groups):
            logger.info(f"[BrowserComment] Group {i+1}/{len(groups)}: {group['name']}")

            result = await _comment_on_single_group(
                page=page,
                group_url=group["url"],
                group_name=group["name"],
                comments=comments,
                max_comments=max_comments_per_group,
                keyword_filter=keyword_filter,
            )
            results.append(result)

            # Delay between groups
            if i < len(groups) - 1:
                delay_secs = delay_minutes * 60 + random.randint(-20, 20)
                logger.info(f"[BrowserComment] Waiting {delay_secs}s before next group...")
                await asyncio.sleep(delay_secs)

                # Stop if captcha detected
                if result.get("error") and "captcha" in str(result["error"]).lower():
                    logger.error("[BrowserComment] CAPTCHA detected — stopping")
                    break
    except Exception as e:
        logger.error(f"[BrowserComment] Browser session error: {e}")
    finally:
        await context.close()
        await pw.stop()

    return results
