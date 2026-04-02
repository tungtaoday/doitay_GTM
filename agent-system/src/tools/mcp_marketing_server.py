"""MCP Server for marketing tools — exposes platform APIs as MCP tools.

Usage: Register with Claude Agent SDK as an MCP tool server.
"""
from __future__ import annotations

from claude_agent_sdk import create_sdk_mcp_server, tool

from src.tools import marketing_tools


@tool(description="Post a tweet to Twitter/X. Optionally reply to existing tweet.")
async def post_twitter(text: str, reply_to: str = "") -> dict:
    return await marketing_tools.post_twitter(text=text, reply_to=reply_to or None)


@tool(description="Post to Instagram (IMAGE, VIDEO, REELS)")
async def post_instagram(
    image_url: str,
    caption: str,
    media_type: str = "IMAGE",
) -> dict:
    return await marketing_tools.post_instagram(
        image_url=image_url, caption=caption, media_type=media_type
    )


@tool(description="Post to Facebook Page (text, link, or photo)")
async def post_facebook(
    message: str,
    link: str = "",
    image_url: str = "",
) -> dict:
    return await marketing_tools.post_facebook(
        message=message,
        link=link or None,
        image_url=image_url or None,
    )


@tool(description="Post to LinkedIn (text or article share)")
async def post_linkedin(text: str, article_url: str = "") -> dict:
    return await marketing_tools.post_linkedin(
        text=text, article_url=article_url or None
    )


@tool(description="Reply to a post on any platform")
async def reply_post(platform: str, post_id: str, text: str) -> dict:
    return await marketing_tools.reply_post(
        platform=platform, post_id=post_id, text=text
    )


@tool(description="Search posts on a platform")
async def search_posts(
    platform: str,
    query: str,
    max_results: int = 20,
) -> dict:
    return await marketing_tools.search_posts(
        platform=platform, query=query, max_results=max_results
    )


@tool(description="Schedule content for future posting")
async def schedule_content(
    content_id: str,
    platform: str,
    scheduled_time: str,
) -> dict:
    return await marketing_tools.schedule_content(
        content_id=content_id, platform=platform, scheduled_time=scheduled_time
    )


@tool(description="Send email newsletter or broadcast")
async def send_email(
    to: str,
    subject: str,
    body: str,
    from_name: str = "Newsletter",
) -> dict:
    return await marketing_tools.send_email(
        to=to, subject=subject, body=body, from_name=from_name
    )


@tool(description="Scan trending topics across platforms")
async def scan_trends(
    platforms: list[str] | None = None,
    keywords: list[str] | None = None,
) -> dict:
    return await marketing_tools.scan_trends(platforms=platforms, keywords=keywords)


@tool(description="Fetch engagement metrics from a platform")
async def fetch_metrics(
    platform: str,
    post_ids: list[str] | None = None,
    period: str = "7d",
) -> dict:
    return await marketing_tools.fetch_metrics(
        platform=platform, post_ids=post_ids, period=period
    )


@tool(description="Fetch web analytics data")
async def fetch_web_analytics(url: str = "", period: str = "7d") -> dict:
    return await marketing_tools.fetch_web_analytics(url=url or None, period=period)


@tool(description="Generate image using AI for content visuals")
async def generate_image(
    prompt: str,
    style: str = "minimal",
    size: str = "1024x1024",
) -> dict:
    return await marketing_tools.generate_image(prompt=prompt, style=style, size=size)


# Create the MCP server
server = create_sdk_mcp_server(
    name="marketing-tools",
    tools=[
        post_twitter, post_instagram, post_facebook, post_linkedin,
        reply_post, search_posts, schedule_content, send_email,
        scan_trends, fetch_metrics, fetch_web_analytics, generate_image,
    ],
)
