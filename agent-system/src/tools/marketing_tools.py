"""MCP Tool Server — Marketing platform APIs.

Provides tools: post_twitter, post_instagram, post_facebook, post_linkedin,
reply_post, search_posts, schedule_content, send_email, scan_trends,
fetch_metrics, fetch_web_analytics, generate_image.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any

import httpx

from src.config import (
    FACEBOOK_PAGE_ACCESS_TOKEN,
    FACEBOOK_PAGE_ID,
    INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_BUSINESS_ACCOUNT_ID,
    LINKEDIN_ACCESS_TOKEN,
    SERPAPI_API_KEY,
    TWITTER_ACCESS_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_BEARER_TOKEN,
)

logger = logging.getLogger(__name__)

# ─── Twitter/X ───


async def post_twitter(text: str, reply_to: str | None = None) -> dict:
    """Post a tweet. Optionally reply to an existing tweet."""
    from requests_oauthlib import OAuth1
    import requests as req_lib

    url = "https://api.twitter.com/2/tweets"
    payload: dict[str, Any] = {"text": text}
    if reply_to:
        payload["reply"] = {"in_reply_to_tweet_id": reply_to}

    auth = OAuth1(
        TWITTER_API_KEY,
        TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN,
        TWITTER_ACCESS_SECRET,
    )

    # Build OAuth headers via requests, then use httpx for async
    prepared = req_lib.Request("POST", url, json=payload, auth=auth).prepare()
    headers = {k: v for k, v in prepared.headers.items() if k.lower().startswith("authorization")}
    headers["Content-Type"] = "application/json"

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code in (200, 201):
            data = resp.json()
            tweet_id = data.get("data", {}).get("id")
            return {
                "platform": "twitter",
                "post_id": tweet_id,
                "url": f"https://twitter.com/i/web/status/{tweet_id}",
                "status": "posted",
            }
        return {"platform": "twitter", "status": "failed", "error": resp.text}


async def search_twitter(query: str, max_results: int = 20) -> dict:
    """Search recent tweets."""
    url = "https://api.twitter.com/2/tweets/search/recent"
    params = {
        "query": query,
        "max_results": min(max_results, 100),
        "tweet.fields": "author_id,created_at,public_metrics",
    }
    headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers)
        if resp.status_code == 200:
            return resp.json()
        return {"error": resp.text}


# ─── Instagram ───


async def post_instagram(
    image_url: str,
    caption: str,
    media_type: str = "IMAGE",
) -> dict:
    """Post to Instagram (IMAGE, VIDEO, CAROUSEL_ALBUM, REELS)."""
    base_url = f"https://graph.facebook.com/v18.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}"

    # Step 1: Create media container
    container_payload: dict[str, Any] = {
        "caption": caption,
        "access_token": INSTAGRAM_ACCESS_TOKEN,
    }

    if media_type == "REELS":
        container_payload["media_type"] = "REELS"
        container_payload["video_url"] = image_url
    elif media_type == "VIDEO":
        container_payload["media_type"] = "VIDEO"
        container_payload["video_url"] = image_url
    else:
        container_payload["image_url"] = image_url

    async with httpx.AsyncClient() as client:
        # Create container
        resp = await client.post(f"{base_url}/media", data=container_payload)
        if resp.status_code != 200:
            return {"platform": "instagram", "status": "failed", "error": resp.text}

        container_id = resp.json().get("id")

        # Step 2: Publish
        publish_resp = await client.post(
            f"{base_url}/media_publish",
            data={
                "creation_id": container_id,
                "access_token": INSTAGRAM_ACCESS_TOKEN,
            },
        )
        if publish_resp.status_code == 200:
            media_id = publish_resp.json().get("id")
            return {
                "platform": "instagram",
                "post_id": media_id,
                "status": "posted",
            }
        return {"platform": "instagram", "status": "failed", "error": publish_resp.text}


# ─── Facebook ───


async def post_facebook(
    message: str,
    link: str | None = None,
    image_url: str | None = None,
) -> dict:
    """Post to Facebook Page."""
    url = f"https://graph.facebook.com/v21.0/{FACEBOOK_PAGE_ID}/feed"
    payload: dict[str, Any] = {
        "message": message,
        "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
    }
    if link:
        payload["link"] = link
    # For photo posts, use /photos endpoint
    if image_url:
        url = f"https://graph.facebook.com/v21.0/{FACEBOOK_PAGE_ID}/photos"
        payload["url"] = image_url

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, data=payload)
        if resp.status_code == 200:
            data = resp.json()
            # /feed returns {"id": "PAGE_ID_POST_ID"}
            # /photos returns {"id": "PHOTO_ID", "post_id": "PAGE_ID_POST_ID"}
            post_id = data.get("post_id") or data.get("id")
            return {
                "platform": "facebook",
                "post_id": post_id,
                "url": f"https://facebook.com/{post_id}",
                "status": "posted",
            }
        return {"platform": "facebook", "status": "failed", "error": resp.text}


async def post_facebook_reel(video_url: str, description: str) -> dict:
    """Post a Reel to Facebook Page."""
    url = f"https://graph.facebook.com/v18.0/{FACEBOOK_PAGE_ID}/video_reels"
    payload = {
        "upload_phase": "start",
        "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
    }
    async with httpx.AsyncClient() as client:
        # Initialize upload
        resp = await client.post(url, data=payload)
        if resp.status_code != 200:
            return {"platform": "facebook", "status": "failed", "error": resp.text}
        video_id = resp.json().get("video_id")
        return {
            "platform": "facebook",
            "post_id": video_id,
            "type": "reel",
            "status": "upload_started",
            "note": "Upload binary separately, then finish with upload_phase=finish",
        }


# ─── LinkedIn ───


async def post_linkedin(text: str, article_url: str | None = None) -> dict:
    """Post to LinkedIn profile/page."""
    url = "https://api.linkedin.com/v2/ugcPosts"
    headers = {
        "Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
    }

    # Get author URN (would need to be configured)
    author = "urn:li:person:LINKEDIN_PERSON_ID"

    payload: dict[str, Any] = {
        "author": author,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }

    if article_url:
        payload["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "ARTICLE"
        payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
            {"status": "READY", "originalUrl": article_url}
        ]

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code in (200, 201):
            post_id = resp.headers.get("x-restli-id", "")
            return {
                "platform": "linkedin",
                "post_id": post_id,
                "status": "posted",
            }
        return {"platform": "linkedin", "status": "failed", "error": resp.text}


# ─── Cross-platform ───


async def reply_post(
    platform: str,
    post_id: str,
    text: str,
) -> dict:
    """Reply to a post on any platform."""
    if platform == "twitter":
        return await post_twitter(text=text, reply_to=post_id)
    elif platform == "facebook":
        url = f"https://graph.facebook.com/v18.0/{post_id}/comments"
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                data={"message": text, "access_token": FACEBOOK_PAGE_ACCESS_TOKEN},
            )
            if resp.status_code == 200:
                return {"platform": "facebook", "comment_id": resp.json().get("id"), "status": "replied"}
            return {"platform": "facebook", "status": "failed", "error": resp.text}
    elif platform == "instagram":
        url = f"https://graph.facebook.com/v18.0/{post_id}/comments"
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                data={"message": text, "access_token": INSTAGRAM_ACCESS_TOKEN},
            )
            if resp.status_code == 200:
                return {"platform": "instagram", "comment_id": resp.json().get("id"), "status": "replied"}
            return {"platform": "instagram", "status": "failed", "error": resp.text}
    elif platform == "linkedin":
        return {"platform": "linkedin", "status": "not_supported", "note": "LinkedIn comment API requires additional setup"}
    return {"error": f"Unknown platform: {platform}"}


async def search_posts(
    platform: str,
    query: str,
    max_results: int = 20,
) -> dict:
    """Search posts on a platform."""
    if platform == "twitter":
        return await search_twitter(query, max_results)
    elif platform in ("instagram", "facebook"):
        # Instagram/Facebook don't have public search APIs
        # Use hashtag search for Instagram
        if platform == "instagram":
            url = f"https://graph.facebook.com/v18.0/ig_hashtag_search"
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    url,
                    params={
                        "q": query,
                        "user_id": INSTAGRAM_BUSINESS_ACCOUNT_ID,
                        "access_token": INSTAGRAM_ACCESS_TOKEN,
                    },
                )
                if resp.status_code == 200:
                    return resp.json()
                return {"error": resp.text}
        return {"platform": platform, "note": "Use platform-specific search tools"}
    return {"error": f"Search not supported for {platform}"}


async def schedule_content(
    content_id: str,
    platform: str,
    scheduled_time: str,
) -> dict:
    """Schedule content for future posting."""
    from src.tools.db_tools import update_content_status

    # Update content status to scheduled
    # Actual scheduling handled by cron/scheduler
    result = await update_content_status(content_id, "scheduled")
    return {
        "content_id": content_id,
        "platform": platform,
        "scheduled_time": scheduled_time,
        "status": "scheduled",
    }


async def send_email(
    to: str | list[str],
    subject: str,
    body: str,
    from_name: str = "Newsletter",
) -> dict:
    """Send email (placeholder — integrate with SendGrid/Resend/etc.)."""
    # TODO: Integrate with actual email provider
    logger.info(f"Email queued: to={to}, subject={subject}")
    return {
        "status": "queued",
        "to": to,
        "subject": subject,
        "note": "Email provider not configured. Set up SendGrid/Resend integration.",
    }


async def scan_trends(
    platforms: list[str] | None = None,
    keywords: list[str] | None = None,
) -> dict:
    """Scan trending topics across platforms."""
    if platforms is None:
        platforms = ["twitter"]

    trends: dict[str, Any] = {}

    for platform in platforms:
        if platform == "twitter":
            # Twitter trends API
            url = "https://api.twitter.com/2/trends/by/woeid/1"
            headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    trends["twitter"] = resp.json()
                else:
                    trends["twitter"] = {"error": "Could not fetch trends"}
        else:
            trends[platform] = {"note": f"Trend scanning for {platform} uses SerpAPI or manual monitoring"}

    # SerpAPI Google Trends if keywords provided
    if keywords and SERPAPI_API_KEY:
        async with httpx.AsyncClient() as client:
            for kw in keywords[:5]:
                resp = await client.get(
                    "https://serpapi.com/search",
                    params={
                        "engine": "google_trends",
                        "q": kw,
                        "api_key": SERPAPI_API_KEY,
                    },
                )
                if resp.status_code == 200:
                    trends[f"google_trends_{kw}"] = resp.json()

    return trends


async def fetch_metrics(
    platform: str,
    post_ids: list[str] | None = None,
    period: str = "7d",
) -> dict:
    """Fetch engagement metrics from a platform."""
    if platform == "twitter" and post_ids:
        url = "https://api.twitter.com/2/tweets"
        params = {
            "ids": ",".join(post_ids[:100]),
            "tweet.fields": "public_metrics,created_at",
        }
        headers = {"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"}
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, headers=headers)
            if resp.status_code == 200:
                return {"platform": "twitter", "data": resp.json()}
            return {"platform": "twitter", "error": resp.text}

    elif platform == "instagram":
        url = f"https://graph.facebook.com/v18.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/insights"
        params = {
            "metric": "impressions,reach,profile_views",
            "period": "day",
            "access_token": INSTAGRAM_ACCESS_TOKEN,
        }
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                return {"platform": "instagram", "data": resp.json()}
            return {"platform": "instagram", "error": resp.text}

    elif platform == "facebook":
        url = f"https://graph.facebook.com/v18.0/{FACEBOOK_PAGE_ID}/insights"
        params = {
            "metric": "page_impressions,page_engaged_users,page_post_engagements",
            "period": "day",
            "access_token": FACEBOOK_PAGE_ACCESS_TOKEN,
        }
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                return {"platform": "facebook", "data": resp.json()}
            return {"platform": "facebook", "error": resp.text}

    elif platform == "linkedin":
        return {"platform": "linkedin", "note": "LinkedIn analytics requires organization admin access"}

    return {"error": f"Metrics not implemented for {platform}"}


async def fetch_web_analytics(
    url: str | None = None,
    period: str = "7d",
) -> dict:
    """Fetch web analytics (placeholder — integrate with GA4/Plausible/etc.)."""
    return {
        "status": "not_configured",
        "note": "Integrate with Google Analytics 4 or Plausible Analytics",
    }


async def generate_image(
    prompt: str,
    style: str = "minimal",
    size: str = "1024x1024",
) -> dict:
    """Generate image using AI (placeholder — integrate with DALL-E/Midjourney/etc.)."""
    return {
        "status": "not_configured",
        "prompt": prompt,
        "note": "Integrate with image generation API (OpenAI DALL-E, Stability AI, etc.)",
    }
