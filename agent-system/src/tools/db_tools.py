"""MCP Tool Server — Database operations for agents.

Provides tools: save_agent_output, read_agent_output, save_content,
read_content_queue, update_content_status, save_weekly_metric, save_pattern,
read_audience_intel, save_audience_intel, read_hypotheses, save_hypothesis,
update_hypothesis, read_experiment, update_experiment.
"""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from cuid2 import cuid_wrapper

from src.db.models import (
    AgentOutput,
    AudienceIntel,
    ContentItem,
    EventLog,
    Experiment,
    Hypothesis,
    Pattern,
    SystemState,
    WeeklyMetric,
)
from src.db.session import SessionLocal

cuid = cuid_wrapper()


async def _get_session():
    return SessionLocal()


# ─── Agent Output ───


async def _ensure_experiment(session, experiment_id: str):
    """Auto-create experiment row if it doesn't exist (prevents FK errors)."""
    from sqlalchemy import select
    result = await session.execute(select(Experiment).where(Experiment.id == experiment_id))
    if not result.scalar_one_or_none():
        session.add(Experiment(
            id=experiment_id,
            name=experiment_id,
            business_type="marketplace",
            vertical="handmade_services",
            geography="vietnam",
        ))
        await session.flush()


async def save_agent_output(
    experiment_id: str,
    agent_name: str,
    phase: str,
    output_data: dict,
    skill_code: str | None = None,
    input_data: dict | None = None,
    raw_text: str | None = None,
    session_id: str | None = None,
    cost_usd: float | None = None,
    duration_ms: int | None = None,
) -> dict:
    """Save an agent's output to the database."""
    async with await _get_session() as session:
        await _ensure_experiment(session, experiment_id)
        record = AgentOutput(
            id=cuid(),
            experiment_id=experiment_id,
            agent_name=agent_name,
            skill_code=skill_code,
            phase=phase,
            input_data=input_data,
            output_data=output_data,
            raw_text=raw_text,
            session_id=session_id,
            cost_usd=cost_usd,
            duration_ms=duration_ms,
        )
        session.add(record)
        await session.commit()
        return {"id": record.id, "status": "saved"}


async def read_agent_output(
    experiment_id: str,
    agent_name: str | None = None,
    skill_code: str | None = None,
    limit: int = 5,
) -> list[dict]:
    """Read agent outputs, optionally filtered by agent/skill."""
    from sqlalchemy import select

    async with await _get_session() as session:
        q = select(AgentOutput).where(AgentOutput.experiment_id == experiment_id)
        if agent_name:
            q = q.where(AgentOutput.agent_name == agent_name)
        if skill_code:
            q = q.where(AgentOutput.skill_code == skill_code)
        q = q.order_by(AgentOutput.created_at.desc()).limit(limit)
        result = await session.execute(q)
        rows = result.scalars().all()
        return [
            {
                "id": r.id,
                "agent_name": r.agent_name,
                "skill_code": r.skill_code,
                "phase": r.phase,
                "output_data": r.output_data,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ]


# ─── Content Pipeline ───


async def save_content(
    experiment_id: str,
    platform: str,
    content_type: str,
    body: str,
    hook: str | None = None,
    cta: str | None = None,
    pillar: str | None = None,
    media_urls: list[str] | None = None,
    status: str = "draft",
) -> dict:
    """Save a content item to the queue."""
    async with await _get_session() as session:
        item = ContentItem(
            id=cuid(),
            experiment_id=experiment_id,
            platform=platform,
            content_type=content_type,
            pillar=pillar,
            hook=hook,
            body=body,
            cta=cta,
            media_urls=media_urls,
            status=status,
        )
        session.add(item)
        await session.commit()
        return {"id": item.id, "status": "saved"}


async def read_content_queue(
    experiment_id: str,
    status: str | None = None,
    platform: str | None = None,
    limit: int = 20,
) -> list[dict]:
    """Read content queue, optionally filtered."""
    from sqlalchemy import select

    async with await _get_session() as session:
        q = select(ContentItem).where(ContentItem.experiment_id == experiment_id)
        if status:
            q = q.where(ContentItem.status == status)
        if platform:
            q = q.where(ContentItem.platform == platform)
        q = q.order_by(ContentItem.created_at.desc()).limit(limit)
        result = await session.execute(q)
        rows = result.scalars().all()
        return [
            {
                "id": r.id,
                "platform": r.platform,
                "content_type": r.content_type,
                "hook": r.hook,
                "body": r.body[:200],
                "cta": r.cta,
                "status": r.status,
                "pillar": r.pillar,
                "scheduled_at": r.scheduled_at.isoformat() if r.scheduled_at else None,
            }
            for r in rows
        ]


async def update_content_status(
    content_id: str,
    status: str,
    post_url: str | None = None,
    impressions: int | None = None,
    engagements: int | None = None,
    clicks: int | None = None,
    replies: int | None = None,
    reposts: int | None = None,
    bookmarks: int | None = None,
    saves: int | None = None,
    shares: int | None = None,
    reactions: int | None = None,
) -> dict:
    """Update content status and optionally metrics."""
    async with await _get_session() as session:
        item = await session.get(ContentItem, content_id)
        if not item:
            return {"error": f"Content {content_id} not found"}
        item.status = status
        if status == "posted":
            item.posted_at = datetime.utcnow()
        if post_url:
            item.post_url = post_url
        for field, val in [
            ("impressions", impressions), ("engagements", engagements),
            ("clicks", clicks), ("replies", replies), ("reposts", reposts),
            ("bookmarks", bookmarks), ("saves", saves), ("shares", shares),
            ("reactions", reactions),
        ]:
            if val is not None:
                setattr(item, field, val)
        await session.commit()
        return {"id": content_id, "status": status}


# ─── Weekly Metrics ───


async def save_weekly_metric(
    experiment_id: str,
    week_number: int,
    cmf_score: float | None = None,
    engagement_quality: float | None = None,
    audience_relevance: float | None = None,
    conversion_signal: float | None = None,
    traction_score: float | None = None,
    acquisition_signal: float | None = None,
    activation_signal: float | None = None,
    retention_signal: float | None = None,
    raw_metrics: dict | None = None,
    notes: str | None = None,
) -> dict:
    """Save weekly metrics."""
    async with await _get_session() as session:
        metric = WeeklyMetric(
            id=cuid(),
            experiment_id=experiment_id,
            week_number=week_number,
            cmf_score=cmf_score,
            engagement_quality=engagement_quality,
            audience_relevance=audience_relevance,
            conversion_signal=conversion_signal,
            traction_score=traction_score,
            acquisition_signal=acquisition_signal,
            activation_signal=activation_signal,
            retention_signal=retention_signal,
            raw_metrics=raw_metrics,
            notes=notes,
        )
        session.add(metric)
        await session.commit()
        return {"id": metric.id, "status": "saved"}


# ─── Patterns ───


async def save_pattern(
    category: str,
    business_type: str,
    result: str,
    title: str,
    description: str,
    experiment_id: str | None = None,
    evidence: list | None = None,
    applies_to: list | None = None,
    confidence: float | None = None,
) -> dict:
    """Save a pattern to the Pattern Library."""
    async with await _get_session() as session:
        pattern = Pattern(
            id=cuid(),
            experiment_id=experiment_id,
            category=category,
            business_type=business_type,
            result=result,
            title=title,
            description=description,
            evidence=evidence,
            applies_to=applies_to,
            confidence=confidence,
        )
        session.add(pattern)
        await session.commit()
        return {"id": pattern.id, "status": "saved"}


# ─── Audience Intel ───


async def read_audience_intel(
    experiment_id: str,
    unused_only: bool = True,
    limit: int = 20,
) -> list[dict]:
    """Read audience intelligence (pain phrases, language)."""
    from sqlalchemy import select

    async with await _get_session() as session:
        q = select(AudienceIntel).where(AudienceIntel.experiment_id == experiment_id)
        if unused_only:
            q = q.where(AudienceIntel.used_in_content == False)
        q = q.order_by(AudienceIntel.frequency.desc()).limit(limit)
        result = await session.execute(q)
        rows = result.scalars().all()
        return [
            {
                "id": r.id,
                "pain_phrase": r.pain_phrase,
                "source_platform": r.source_platform,
                "frequency": r.frequency,
                "sentiment": r.sentiment,
                "segment": r.segment,
            }
            for r in rows
        ]


async def save_audience_intel(
    experiment_id: str,
    pain_phrase: str,
    source_platform: str,
    source_url: str | None = None,
    frequency: int = 1,
    sentiment: str | None = None,
    segment: str | None = None,
) -> dict:
    """Save audience intelligence data."""
    async with await _get_session() as session:
        intel = AudienceIntel(
            id=cuid(),
            experiment_id=experiment_id,
            pain_phrase=pain_phrase,
            source_platform=source_platform,
            source_url=source_url,
            frequency=frequency,
            sentiment=sentiment,
            segment=segment,
        )
        session.add(intel)
        await session.commit()
        return {"id": intel.id, "status": "saved"}


# ─── Hypotheses ───


async def read_hypotheses(
    tier: int | None = None,
    is_active: bool = True,
    limit: int = 20,
) -> list[dict]:
    """Read hypothesis backlog."""
    from sqlalchemy import select

    async with await _get_session() as session:
        q = select(Hypothesis).where(Hypothesis.is_active == is_active)
        if tier:
            q = q.where(Hypothesis.tier == tier)
        q = q.order_by(Hypothesis.signal_score.desc().nulls_last()).limit(limit)
        result = await session.execute(q)
        rows = result.scalars().all()
        return [
            {
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "tier": r.tier,
                "signal_type": r.signal_type,
                "signal_score": r.signal_score,
            }
            for r in rows
        ]


async def save_hypothesis(
    title: str,
    description: str | None = None,
    business_type: str | None = None,
    tier: int = 1,
    signal_type: str | None = None,
    signal_score: int | None = None,
    source_agent: str | None = None,
) -> dict:
    """Save a new hypothesis."""
    async with await _get_session() as session:
        h = Hypothesis(
            id=cuid(),
            title=title,
            description=description,
            business_type=business_type,
            tier=tier,
            signal_type=signal_type,
            signal_score=signal_score,
            source_agent=source_agent,
        )
        session.add(h)
        await session.commit()
        return {"id": h.id, "status": "saved"}


async def update_hypothesis(
    hypothesis_id: str,
    tier: int | None = None,
    is_active: bool | None = None,
    stress_test: dict | None = None,
    promoted_to_experiment_id: str | None = None,
) -> dict:
    """Update a hypothesis (promote tier, deactivate, etc.)."""
    async with await _get_session() as session:
        h = await session.get(Hypothesis, hypothesis_id)
        if not h:
            return {"error": f"Hypothesis {hypothesis_id} not found"}
        if tier is not None:
            h.tier = tier
        if is_active is not None:
            h.is_active = is_active
        if stress_test is not None:
            h.stress_test = stress_test
        if promoted_to_experiment_id is not None:
            h.promoted_to_experiment_id = promoted_to_experiment_id
        h.updated_at = datetime.utcnow()
        await session.commit()
        return {"id": hypothesis_id, "status": "updated"}


# ─── Experiment ───


async def read_experiment(experiment_id: str | None = None) -> dict | None:
    """Read experiment by ID, or active experiment if no ID given."""
    from sqlalchemy import select

    async with await _get_session() as session:
        if experiment_id:
            exp = await session.get(Experiment, experiment_id)
        else:
            result = await session.execute(
                select(Experiment).where(Experiment.is_active == True).limit(1)
            )
            exp = result.scalar_one_or_none()
        if not exp:
            return None
        return {
            "id": exp.id,
            "name": exp.name,
            "business_type": exp.business_type,
            "vertical": exp.vertical,
            "geography": exp.geography,
            "phase": exp.phase,
            "week_number": exp.week_number,
            "cmf_score": exp.cmf_score,
            "traction_score": exp.traction_score,
            "is_active": exp.is_active,
        }


async def update_experiment(
    experiment_id: str,
    phase: str | None = None,
    week_number: int | None = None,
    cmf_score: float | None = None,
    traction_score: float | None = None,
    is_active: bool | None = None,
) -> dict:
    """Update experiment state."""
    async with await _get_session() as session:
        exp = await session.get(Experiment, experiment_id)
        if not exp:
            return {"error": f"Experiment {experiment_id} not found"}
        if phase is not None:
            exp.phase = phase
        if week_number is not None:
            exp.week_number = week_number
        if cmf_score is not None:
            exp.cmf_score = cmf_score
        if traction_score is not None:
            exp.traction_score = traction_score
        if is_active is not None:
            exp.is_active = is_active
        exp.updated_at = datetime.utcnow()
        await session.commit()
        return {"id": experiment_id, "status": "updated"}


async def create_experiment(
    name: str,
    business_type: str,
    vertical: str,
    geography: str,
) -> dict:
    """Create a new experiment."""
    async with await _get_session() as session:
        exp = Experiment(
            id=cuid(),
            name=name,
            business_type=business_type,
            vertical=vertical,
            geography=geography,
        )
        session.add(exp)
        await session.commit()
        return {"id": exp.id, "status": "created"}
