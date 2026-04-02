"""Feedback Loop Engine — closed-loop learning system.

Three feedback loops:
1. Pattern Injection: Winning patterns → agent prompts (via loader.py inject_patterns)
2. Audience Language: Pain phrases from research → content agent prompts
3. Content Performance: Top/bottom performing content → strategy adjustments

These run automatically as part of weekly playbook.
"""
from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import select, func

from src.db.models import AudienceIntel, ContentItem, Pattern, WeeklyMetric
from src.db.session import SessionLocal

logger = logging.getLogger(__name__)


async def get_pattern_injection_context(
    business_type: str | None = None,
    limit: int = 10,
) -> list[dict]:
    """Get winning patterns for injection into agent prompts.

    Called by runner.py before each agent execution.
    Returns patterns sorted by confidence, formatted for prompt injection.
    """
    async with SessionLocal() as session:
        q = select(Pattern).where(Pattern.confidence >= 0.5)
        if business_type:
            q = q.where(Pattern.business_type == business_type)
        q = q.order_by(Pattern.confidence.desc()).limit(limit)
        result = await session.execute(q)
        patterns = result.scalars().all()

    return [
        {
            "title": p.title,
            "description": p.description,
            "result": p.result,
            "evidence": p.evidence,
            "category": p.category,
            "confidence": p.confidence,
        }
        for p in patterns
    ]


async def get_audience_language_context(
    experiment_id: str,
    limit: int = 30,
) -> dict[str, Any]:
    """Get audience language data for content agent.

    Returns pain phrases grouped by frequency and sentiment,
    plus which phrases have been used in content and their performance.
    """
    async with SessionLocal() as session:
        # Unused pain phrases (highest priority)
        unused_result = await session.execute(
            select(AudienceIntel)
            .where(
                AudienceIntel.experiment_id == experiment_id,
                AudienceIntel.used_in_content == False,
            )
            .order_by(AudienceIntel.frequency.desc())
            .limit(limit)
        )
        unused = unused_result.scalars().all()

        # Used phrases with performance data
        used_result = await session.execute(
            select(AudienceIntel)
            .where(
                AudienceIntel.experiment_id == experiment_id,
                AudienceIntel.used_in_content == True,
            )
            .order_by(AudienceIntel.performance_score.desc().nulls_last())
            .limit(20)
        )
        used = used_result.scalars().all()

    return {
        "unused_phrases": [
            {
                "phrase": p.pain_phrase,
                "source": p.source_platform,
                "frequency": p.frequency,
                "sentiment": p.sentiment,
                "segment": p.segment,
            }
            for p in unused
        ],
        "top_performing_phrases": [
            {
                "phrase": p.pain_phrase,
                "performance_score": p.performance_score,
                "segment": p.segment,
            }
            for p in used
            if p.performance_score and p.performance_score > 0.5
        ],
        "low_performing_phrases": [
            {
                "phrase": p.pain_phrase,
                "performance_score": p.performance_score,
            }
            for p in used
            if p.performance_score is not None and p.performance_score < 0.3
        ],
        "total_unused": len(unused),
        "total_tracked": len(used),
    }


async def get_content_performance_feedback(
    experiment_id: str,
    limit: int = 20,
) -> dict[str, Any]:
    """Get content performance feedback for strategy adjustments.

    Returns top/bottom performing content with analysis.
    """
    async with SessionLocal() as session:
        # Top performing (by engagement rate)
        top_result = await session.execute(
            select(ContentItem)
            .where(
                ContentItem.experiment_id == experiment_id,
                ContentItem.status == "posted",
                ContentItem.impressions > 0,
            )
            .order_by(
                (ContentItem.engagements * 1.0 / ContentItem.impressions).desc()
            )
            .limit(limit)
        )
        top_content = top_result.scalars().all()

        # Bottom performing
        bottom_result = await session.execute(
            select(ContentItem)
            .where(
                ContentItem.experiment_id == experiment_id,
                ContentItem.status == "posted",
                ContentItem.impressions > 0,
            )
            .order_by(
                (ContentItem.engagements * 1.0 / ContentItem.impressions).asc()
            )
            .limit(10)
        )
        bottom_content = bottom_result.scalars().all()

        # Platform breakdown
        platform_result = await session.execute(
            select(
                ContentItem.platform,
                func.count(ContentItem.id),
                func.avg(ContentItem.engagements),
                func.avg(ContentItem.impressions),
            )
            .where(
                ContentItem.experiment_id == experiment_id,
                ContentItem.status == "posted",
            )
            .group_by(ContentItem.platform)
        )
        platform_stats = platform_result.all()

        # Pillar breakdown
        pillar_result = await session.execute(
            select(
                ContentItem.pillar,
                func.count(ContentItem.id),
                func.avg(ContentItem.engagements),
            )
            .where(
                ContentItem.experiment_id == experiment_id,
                ContentItem.status == "posted",
                ContentItem.pillar != None,
            )
            .group_by(ContentItem.pillar)
        )
        pillar_stats = pillar_result.all()

    def _content_summary(item: ContentItem) -> dict:
        eng_rate = (
            (item.engagements / item.impressions * 100)
            if item.impressions and item.engagements
            else 0
        )
        return {
            "id": item.id,
            "platform": item.platform,
            "content_type": item.content_type,
            "pillar": item.pillar,
            "hook": item.hook[:100] if item.hook else None,
            "engagement_rate": round(eng_rate, 2),
            "impressions": item.impressions,
            "engagements": item.engagements,
            "saves": item.saves,
            "shares": item.shares,
            "bookmarks": item.bookmarks,
        }

    return {
        "top_content": [_content_summary(c) for c in top_content],
        "bottom_content": [_content_summary(c) for c in bottom_content],
        "platform_performance": [
            {
                "platform": row[0],
                "total_posts": row[1],
                "avg_engagements": round(row[2] or 0, 1),
                "avg_impressions": round(row[3] or 0, 1),
            }
            for row in platform_stats
        ],
        "pillar_performance": [
            {
                "pillar": row[0],
                "total_posts": row[1],
                "avg_engagements": round(row[2] or 0, 1),
            }
            for row in pillar_stats
        ],
    }


async def update_audience_phrase_performance(
    experiment_id: str,
) -> int:
    """Update performance scores for audience phrases used in content.

    Links AudienceIntel records to ContentItem performance.
    Returns count of phrases updated.
    """
    async with SessionLocal() as session:
        # Get used phrases
        used_result = await session.execute(
            select(AudienceIntel).where(
                AudienceIntel.experiment_id == experiment_id,
                AudienceIntel.used_in_content == True,
                AudienceIntel.content_id != None,
            )
        )
        phrases = used_result.scalars().all()

        updated = 0
        for phrase in phrases:
            # Get linked content performance
            content = await session.get(ContentItem, phrase.content_id)
            if content and content.impressions and content.impressions > 0:
                # Calculate engagement rate as performance score
                eng_rate = (content.engagements or 0) / content.impressions
                phrase.performance_score = round(eng_rate, 4)
                updated += 1

        await session.commit()

    logger.info(f"Updated performance for {updated} audience phrases")
    return updated
