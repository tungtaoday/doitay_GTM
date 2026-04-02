"""Search & Scrape tools — SerpAPI + Firecrawl integration.

Tools: web_search, web_scrape, crawl_website
Used by: Research Agent (R1, R4, R5, R7)
"""
from __future__ import annotations

import logging
from typing import Any

import httpx

from src.config import FIRECRAWL_API_KEY, FIRECRAWL_BASE_URL, SERPAPI_API_KEY

logger = logging.getLogger(__name__)


async def web_search(
    query: str,
    num_results: int = 10,
    location: str | None = None,
    lang: str = "vi",
) -> dict:
    """Search Google via SerpAPI."""
    if not SERPAPI_API_KEY:
        return {"error": "SERPAPI_API_KEY not configured"}

    params: dict[str, Any] = {
        "q": query,
        "api_key": SERPAPI_API_KEY,
        "engine": "google",
        "num": num_results,
        "hl": lang,
    }
    if location:
        params["location"] = location

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get("https://serpapi.com/search", params=params)
        if resp.status_code == 200:
            data = resp.json()
            results = []
            for r in data.get("organic_results", []):
                results.append({
                    "title": r.get("title"),
                    "link": r.get("link"),
                    "snippet": r.get("snippet"),
                    "position": r.get("position"),
                })
            return {
                "query": query,
                "results": results,
                "total": len(results),
                "related_searches": [
                    s.get("query") for s in data.get("related_searches", [])
                ],
            }
        return {"error": f"SerpAPI error: {resp.status_code}", "detail": resp.text}


async def web_scrape(
    url: str,
    formats: list[str] | None = None,
) -> dict:
    """Scrape a single URL via Firecrawl. Returns markdown content."""
    if not FIRECRAWL_API_KEY:
        return {"error": "FIRECRAWL_API_KEY not configured"}

    if formats is None:
        formats = ["markdown"]

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{FIRECRAWL_BASE_URL}/v1/scrape",
            headers={
                "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "url": url,
                "formats": formats,
            },
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "url": url,
                "success": data.get("success", False),
                "markdown": data.get("data", {}).get("markdown", ""),
                "metadata": data.get("data", {}).get("metadata", {}),
            }
        return {"error": f"Firecrawl error: {resp.status_code}", "detail": resp.text}


async def crawl_website(
    url: str,
    max_pages: int = 10,
    include_paths: list[str] | None = None,
) -> dict:
    """Crawl a website via Firecrawl. Returns multiple pages."""
    if not FIRECRAWL_API_KEY:
        return {"error": "FIRECRAWL_API_KEY not configured"}

    payload: dict[str, Any] = {
        "url": url,
        "limit": max_pages,
        "scrapeOptions": {"formats": ["markdown"]},
    }
    if include_paths:
        payload["includePaths"] = include_paths

    async with httpx.AsyncClient(timeout=120) as client:
        # Start crawl
        resp = await client.post(
            f"{FIRECRAWL_BASE_URL}/v1/crawl",
            headers={
                "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if resp.status_code != 200:
            return {"error": f"Crawl start failed: {resp.status_code}", "detail": resp.text}

        data = resp.json()
        crawl_id = data.get("id")
        if not crawl_id:
            return {"error": "No crawl ID returned", "data": data}

        # Poll for results (up to 60s)
        import asyncio
        for _ in range(12):
            await asyncio.sleep(5)
            status_resp = await client.get(
                f"{FIRECRAWL_BASE_URL}/v1/crawl/{crawl_id}",
                headers={"Authorization": f"Bearer {FIRECRAWL_API_KEY}"},
            )
            if status_resp.status_code == 200:
                status_data = status_resp.json()
                if status_data.get("status") == "completed":
                    pages = []
                    for page in status_data.get("data", []):
                        pages.append({
                            "url": page.get("metadata", {}).get("sourceURL", ""),
                            "title": page.get("metadata", {}).get("title", ""),
                            "markdown": page.get("markdown", "")[:2000],
                        })
                    return {
                        "crawl_id": crawl_id,
                        "status": "completed",
                        "pages_crawled": len(pages),
                        "pages": pages,
                    }

        return {"crawl_id": crawl_id, "status": "timeout", "note": "Crawl still running"}


async def google_trends(
    keyword: str,
    geo: str = "VN",
) -> dict:
    """Check Google Trends for a keyword via SerpAPI."""
    if not SERPAPI_API_KEY:
        return {"error": "SERPAPI_API_KEY not configured"}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            "https://serpapi.com/search",
            params={
                "engine": "google_trends",
                "q": keyword,
                "geo": geo,
                "api_key": SERPAPI_API_KEY,
            },
        )
        if resp.status_code == 200:
            return resp.json()
        return {"error": f"Google Trends error: {resp.status_code}"}
