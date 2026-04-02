"""Social Poster API — Đăng bài & comment lên Facebook Groups & Zalo via browser automation.

POST /api/social-poster/post          — Chọn groups & đăng bài từ content queue
POST /api/social-poster/post-custom   — Đăng bài custom (không từ queue)
POST /api/social-poster/comment       — Comment vào posts trong groups
GET  /api/social-poster/groups        — Xem danh sách groups hiện tại
PUT  /api/social-poster/groups        — Cập nhật danh sách groups
GET  /api/social-poster/history       — Xem lịch sử đăng bài & comment
GET  /api/social-poster/config        — Xem posting config
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import yaml
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/social-poster")

# ── Config ──
GROUPS_CONFIG_PATH = Path(__file__).parent.parent.parent / "data" / "social_groups.yaml"
HISTORY_PATH = Path(__file__).parent.parent.parent / "data" / "social_poster_history.json"


def _load_groups_config() -> dict[str, Any]:
    """Load social groups config from YAML."""
    if not GROUPS_CONFIG_PATH.exists():
        return {
            "browser_tool": "computer_use",
            "posting_config": {},
            "facebook_groups": [],
            "zalo_personal": {"enabled": False},
            "zalo_groups": [],
        }
    with open(GROUPS_CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def _save_groups_config(config: dict[str, Any]) -> None:
    """Save social groups config to YAML."""
    GROUPS_CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(GROUPS_CONFIG_PATH, "w", encoding="utf-8") as f:
        yaml.dump(config, f, allow_unicode=True, default_flow_style=False, sort_keys=False)


def _load_history() -> list[dict]:
    """Load posting history."""
    if not HISTORY_PATH.exists():
        return []
    with open(HISTORY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_history(history: list[dict]) -> None:
    """Save posting history."""
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(HISTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


def _get_eligible_groups(
    config: dict,
    content_type: str | None = None,
    history: list[dict] | None = None,
) -> dict[str, list]:
    """Filter groups that are eligible for posting (enabled + not posted recently)."""
    if history is None:
        history = _load_history()

    import random as _rand

    now = datetime.now()
    min_gap_hours = 48  # 2-day cooldown per group

    # Build set of recently SUCCESSFULLY posted groups (failed posts don't count)
    recent_posts: set[str] = set()
    for entry in history:
        if entry.get("status") not in ("posted", "success", "commented"):
            continue
        posted_at = datetime.fromisoformat(entry.get("posted_at", "2000-01-01"))
        if now - posted_at < timedelta(hours=min_gap_hours):
            recent_posts.add(entry.get("group_name", ""))

    # Filter Facebook groups
    fb_eligible = []
    for g in config.get("facebook_groups", []):
        if not g.get("enabled", True):
            continue
        if g.get("name", "") in recent_posts:
            continue
        fb_eligible.append(g)

    # Randomize order (instead of priority sorting)
    _rand.shuffle(fb_eligible)

    # Filter Zalo groups
    zalo_eligible = []
    for g in config.get("zalo_groups", []):
        if not g.get("enabled", True):
            continue
        if g.get("name", "") in recent_posts:
            continue
        zalo_eligible.append(g)
    zalo_eligible.sort(key=lambda g: priority_order.get(g.get("priority", "low"), 2))

    # Zalo personal
    zalo_personal = config.get("zalo_personal", {})
    zalo_personal_eligible = (
        zalo_personal.get("enabled", False)
        and "Zalo Personal" not in recent_posts
    )

    return {
        "facebook_groups": fb_eligible,
        "zalo_groups": zalo_eligible,
        "zalo_personal": zalo_personal_eligible,
    }


# ── Request Models ──


class PostToGroupsRequest(BaseModel):
    content_id: str
    max_groups: int = 8
    platforms: list[str] = ["facebook", "zalo"]  # facebook, zalo, or both


class PostCustomRequest(BaseModel):
    body: str
    images: list[str] = []
    hashtags: list[str] = []
    cta: str = ""
    target_groups: list[str] = []  # group names; empty = auto-select
    platforms: list[str] = ["facebook", "zalo"]
    max_groups: int = 8


class CommentOnGroupsRequest(BaseModel):
    comments: list[str]  # List of comment texts to rotate
    target_groups: list[str] = []  # group names; empty = auto-select
    max_comments_per_group: int = 3
    max_groups: int = 5
    keyword_filter: list[str] = []  # Only comment on posts with these keywords


class SubmitLinkRequest(BaseModel):
    """User manually posted to FB, now submitting the link for tracking."""
    post_id: str  # ScheduledPost.id
    post_url: str  # Facebook post URL
    group_name: str = ""  # optional: which group was posted to


class UpdateGroupsRequest(BaseModel):
    facebook_groups: list[dict] | None = None
    zalo_personal: dict | None = None
    zalo_groups: list[dict] | None = None


# ── Endpoints ──


@router.get("/config")
async def get_posting_config() -> dict[str, Any]:
    """Get current posting config and group counts."""
    config = _load_groups_config()
    history = _load_history()
    eligible = _get_eligible_groups(config, history=history)

    return {
        "browser_tool": config.get("browser_tool", "computer_use"),
        "posting_config": config.get("posting_config", {}),
        "group_counts": {
            "facebook_total": len(config.get("facebook_groups", [])),
            "facebook_enabled": len([g for g in config.get("facebook_groups", []) if g.get("enabled", True)]),
            "facebook_eligible_now": len(eligible["facebook_groups"]),
            "zalo_groups_total": len(config.get("zalo_groups", [])),
            "zalo_groups_enabled": len([g for g in config.get("zalo_groups", []) if g.get("enabled", True)]),
            "zalo_groups_eligible_now": len(eligible["zalo_groups"]),
            "zalo_personal": config.get("zalo_personal", {}).get("enabled", False),
        },
        "last_session": history[-1] if history else None,
    }


@router.get("/groups")
async def list_groups() -> dict[str, Any]:
    """List all configured groups with eligibility status."""
    config = _load_groups_config()
    eligible = _get_eligible_groups(config)

    eligible_fb_names = {g["name"] for g in eligible["facebook_groups"]}
    eligible_zalo_names = {g["name"] for g in eligible["zalo_groups"]}

    fb_groups = []
    for g in config.get("facebook_groups", []):
        fb_groups.append({
            **g,
            "eligible_now": g.get("name", "") in eligible_fb_names,
        })

    zalo_groups = []
    for g in config.get("zalo_groups", []):
        zalo_groups.append({
            **g,
            "eligible_now": g.get("name", "") in eligible_zalo_names,
        })

    return {
        "facebook_groups": fb_groups,
        "zalo_personal": {
            **config.get("zalo_personal", {}),
            "eligible_now": eligible["zalo_personal"],
        },
        "zalo_groups": zalo_groups,
    }


@router.put("/groups")
async def update_groups(req: UpdateGroupsRequest) -> dict[str, Any]:
    """Update group list (partial update — only provided fields are changed)."""
    config = _load_groups_config()

    if req.facebook_groups is not None:
        config["facebook_groups"] = req.facebook_groups
    if req.zalo_personal is not None:
        config["zalo_personal"] = req.zalo_personal
    if req.zalo_groups is not None:
        config["zalo_groups"] = req.zalo_groups

    _save_groups_config(config)
    return {"status": "updated", "message": "Groups config saved"}


@router.get("/history")
async def get_history(limit: int = 50) -> list[dict]:
    """Get posting history (most recent first)."""
    history = _load_history()
    return list(reversed(history[-limit:]))


@router.get("/check-login")
async def check_fb_login_status() -> dict[str, Any]:
    """Check if browser is logged into Facebook. Opens browser if needed."""
    from src.tools.browser_poster import check_fb_login
    return await check_fb_login()


@router.post("/submit-link")
async def submit_post_link(req: SubmitLinkRequest) -> dict[str, Any]:
    """User manually posted content, now submitting the FB link for tracking.

    Updates ScheduledPost status to 'posted' and saves the URL.
    Also records in posting history.
    """
    from src.db.models import ScheduledPost
    from src.db.session import SessionLocal

    async with SessionLocal() as session:
        result = await session.execute(
            select(ScheduledPost).where(ScheduledPost.id == req.post_id)
        )
        post = result.scalar_one_or_none()

        if not post:
            raise HTTPException(404, f"Post {req.post_id} not found")

        # Update post record
        post.status = "posted"
        post.post_url = req.post_url
        post.posted_at = datetime.now()

        # Try to extract fb_post_id from URL
        # e.g. https://www.facebook.com/groups/123/posts/456 → 456
        import re
        fb_id_match = re.search(r"/posts/(\d+)", req.post_url)
        if fb_id_match:
            post.fb_post_id = fb_id_match.group(1)

        await session.commit()

    # Save to posting history
    history = _load_history()
    history.append({
        "platform": "facebook_group",
        "group_name": req.group_name or "manual",
        "content_id": req.post_id,
        "post_url": req.post_url,
        "status": "posted",
        "posted_at": datetime.now().isoformat(),
        "method": "manual",
    })
    _save_history(history)

    return {
        "status": "success",
        "message": "Link saved. Post marked as posted.",
        "post_id": req.post_id,
        "post_url": req.post_url,
    }


@router.post("/post")
async def post_to_groups(req: PostToGroupsRequest) -> dict[str, Any]:
    """Post approved content from queue to selected groups.

    This endpoint prepares the posting plan. Actual browser automation
    is executed by the social_poster agent via Computer Use / Chrome Extension.
    """
    from src.db.models import ScheduledPost
    from src.db.session import SessionLocal

    # 1. Get content from ScheduledPost
    async with SessionLocal() as session:
        result = await session.execute(select(ScheduledPost).where(ScheduledPost.id == req.content_id))
        post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, f"Content {req.content_id} not found")
    content_item = {
        "id": post.id,
        "body": f"{post.hook or ''}\n\n{post.body or ''}\n\n{post.cta or ''}".strip(),
        "images": [post.image_url] if post.image_url else [],
        "image_path": post.image_path,
        "content_type": "community",
        "hashtags": post.hashtags or [],
        "cta": post.cta or "",
        "angle": post.angle or "",
        "experiment_id": "doitay",
    }

    # 2. Load config & eligible groups
    config = _load_groups_config()
    eligible = _get_eligible_groups(config)

    # 3. Build posting plan
    targets = []

    if "facebook" in req.platforms:
        for g in eligible["facebook_groups"][:req.max_groups]:
            targets.append({
                "platform": "facebook_group",
                "group_name": g["name"],
                "group_url": g.get("url", ""),
                "category": g.get("category", ""),
                "rules_summary": g.get("rules_summary", ""),
            })

    if "zalo" in req.platforms:
        if eligible["zalo_personal"]:
            targets.append({
                "platform": "zalo_personal",
                "group_name": "Zalo Personal",
            })
        for g in eligible["zalo_groups"][:req.max_groups]:
            targets.append({
                "platform": "zalo_group",
                "group_name": g["name"],
                "member_count": g.get("member_count", 0),
            })

    if not targets:
        return {
            "status": "no_eligible_targets",
            "message": "Khong co group nao eligible de dang bai luc nay. "
                       "Co the do da dang < 24h truoc hoac tat ca groups disabled.",
        }

    # 4. Post via Playwright browser automation
    from src.tools.browser_poster import post_to_multiple_groups

    fb_targets = [t for t in targets if t["platform"] == "facebook_group"]
    delay_min = config.get("posting_config", {}).get("delay_between_posts_minutes", 2)

    body_text = content_item["body"]
    image_path = content_item.get("image_path")
    hashtags = content_item.get("hashtags", [])

    fb_results = []
    if fb_targets:
        fb_results = await post_to_multiple_groups(
            groups=[{"name": t["group_name"], "url": t["group_url"]} for t in fb_targets],
            content=body_text,
            image_path=image_path,
            hashtags=hashtags,
            delay_minutes=delay_min,
        )

    # 5. Save to history
    history = _load_history()
    for r in fb_results:
        history.append({
            "platform": "facebook_group",
            "group_name": r.get("group_name", ""),
            "content_id": req.content_id,
            "post_url": r.get("post_url", ""),
            "status": r.get("status", "failed"),
            "posted_at": r.get("posted_at", datetime.now().isoformat()),
            "error": r.get("error"),
        })
    _save_history(history)

    success_count = sum(1 for r in fb_results if r["status"] == "posted")
    return {
        "status": "success" if success_count > 0 else "failed",
        "total_targets": len(fb_targets),
        "successful": success_count,
        "failed": len(fb_results) - success_count,
        "results": fb_results,
    }


@router.post("/post-custom")
async def post_custom_content(req: PostCustomRequest) -> dict[str, Any]:
    """Post custom content (not from queue) to groups.

    Use this when CEO wants to manually write and post content.
    """
    config = _load_groups_config()
    eligible = _get_eligible_groups(config)

    # Build targets
    targets = []

    if req.target_groups:
        # User specified specific groups
        all_fb = {g["name"]: g for g in config.get("facebook_groups", []) if g.get("enabled", True)}
        all_zalo = {g["name"]: g for g in config.get("zalo_groups", []) if g.get("enabled", True)}

        for name in req.target_groups:
            if name in all_fb:
                g = all_fb[name]
                targets.append({
                    "platform": "facebook_group",
                    "group_name": g["name"],
                    "group_url": g.get("url", ""),
                    "category": g.get("category", ""),
                    "rules_summary": g.get("rules_summary", ""),
                })
            elif name in all_zalo:
                g = all_zalo[name]
                targets.append({
                    "platform": "zalo_group",
                    "group_name": g["name"],
                    "member_count": g.get("member_count", 0),
                })
            elif name.lower() == "zalo personal":
                targets.append({
                    "platform": "zalo_personal",
                    "group_name": "Zalo Personal",
                })
    else:
        # Auto-select eligible groups
        if "facebook" in req.platforms:
            for g in eligible["facebook_groups"][:req.max_groups]:
                targets.append({
                    "platform": "facebook_group",
                    "group_name": g["name"],
                    "group_url": g.get("url", ""),
                    "category": g.get("category", ""),
                    "rules_summary": g.get("rules_summary", ""),
                })
        if "zalo" in req.platforms:
            if eligible["zalo_personal"]:
                targets.append({
                    "platform": "zalo_personal",
                    "group_name": "Zalo Personal",
                })
            for g in eligible["zalo_groups"][:req.max_groups]:
                targets.append({
                    "platform": "zalo_group",
                    "group_name": g["name"],
                    "member_count": g.get("member_count", 0),
                })

    if not targets:
        return {
            "status": "no_eligible_targets",
            "message": "Không có group nào eligible.",
        }

    # Post via Playwright browser automation (direct, no agent)
    from src.tools.browser_poster import post_to_multiple_groups

    fb_targets = [t for t in targets if t["platform"] == "facebook_group"]
    delay_min = config.get("posting_config", {}).get("delay_between_posts_minutes", 2)

    # Build full body with hashtags
    body_text = req.body
    if req.cta:
        body_text += "\n\n" + req.cta

    # Use first image if provided
    image_path = req.images[0] if req.images else None

    content_id = f"custom_{int(datetime.now().timestamp())}"

    fb_results = []
    if fb_targets:
        fb_results = await post_to_multiple_groups(
            groups=[{"name": t["group_name"], "url": t["group_url"]} for t in fb_targets],
            content=body_text,
            image_path=image_path,
            hashtags=req.hashtags,
            delay_minutes=delay_min,
        )

    # Save to history
    history = _load_history()
    for r in fb_results:
        history.append({
            "platform": "facebook_group",
            "group_name": r.get("group_name", ""),
            "content_id": content_id,
            "post_url": r.get("post_url", ""),
            "status": r.get("status", "failed"),
            "posted_at": r.get("posted_at", datetime.now().isoformat()),
            "error": r.get("error"),
        })
    _save_history(history)

    success_count = sum(1 for r in fb_results if r["status"] == "posted")
    return {
        "status": "success" if success_count > 0 else "failed",
        "total_targets": len(fb_targets),
        "successful": success_count,
        "failed": len(fb_results) - success_count,
        "results": fb_results,
    }


@router.post("/comment")
async def comment_on_groups(req: CommentOnGroupsRequest) -> dict[str, Any]:
    """Comment on posts in Facebook groups.

    Scrolls group feed, finds relevant posts, and leaves comments.
    Great for engagement & visibility without creating new posts.
    """
    if not req.comments:
        raise HTTPException(400, "comments list cannot be empty")

    config = _load_groups_config()
    comment_config = config.get("comment_config", {})

    # Build target groups
    fb_targets = []
    if req.target_groups:
        all_fb = {g["name"]: g for g in config.get("facebook_groups", []) if g.get("enabled", True)}
        for name in req.target_groups:
            if name in all_fb:
                fb_targets.append(all_fb[name])
    else:
        # Auto-select enabled groups
        eligible = _get_eligible_groups(config)
        fb_targets = eligible["facebook_groups"][:req.max_groups]

    if not fb_targets:
        return {
            "status": "no_eligible_targets",
            "message": "Không có group nào eligible để comment.",
        }

    # Run comment automation
    from src.tools.browser_poster import comment_on_multiple_groups

    delay_min = comment_config.get("delay_between_groups_minutes", 3)
    keyword_filter = req.keyword_filter if req.keyword_filter else comment_config.get("keyword_filter", None)

    results = await comment_on_multiple_groups(
        groups=[{"name": g["name"], "url": g.get("url", "")} for g in fb_targets],
        comments=req.comments,
        max_comments_per_group=req.max_comments_per_group,
        keyword_filter=keyword_filter,
        delay_minutes=delay_min,
    )

    # Save to history
    history = _load_history()
    for r in results:
        for detail in r.get("details", []):
            history.append({
                "platform": "facebook_group",
                "action": "comment",
                "group_name": r.get("group_name", ""),
                "post_preview": detail.get("post_preview", ""),
                "comment": detail.get("comment", ""),
                "status": detail.get("status", "failed"),
                "posted_at": detail.get("commented_at", datetime.now().isoformat()),
            })
    _save_history(history)

    total_comments = sum(r.get("comments_posted", 0) for r in results)
    return {
        "status": "success" if total_comments > 0 else "no_comments",
        "total_groups": len(fb_targets),
        "total_comments": total_comments,
        "results": results,
    }
