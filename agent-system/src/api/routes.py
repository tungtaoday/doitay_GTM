"""API Routes — FastAPI endpoints for the agent system.

Endpoints:
- POST /api/run-agent — Run a single agent
- POST /api/run-playbook — Run a playbook
- GET /api/experiment — Get active experiment
- POST /api/experiment — Create experiment
- PUT /api/experiment/{id} — Update experiment
- GET /api/hypotheses — List hypotheses
- POST /api/hypotheses — Create hypothesis
- GET /api/content — List content queue
- GET /api/metrics/{experiment_id} — Get weekly metrics
- GET /api/patterns — List patterns
- POST /api/event — Emit an event
- GET /api/scheduler — Get scheduler status
- POST /api/scheduler/trigger — Trigger a scheduled job
"""
from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.agents.runner import run_agent, run_agent_with_retry
from src.orchestrator.executor import execute_playbook
from src.orchestrator.event_bus import EventBus, EventType
from src.tools import db_tools

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")

# Shared event bus instance
event_bus = EventBus()


# ── Request/Response Models ──


class RunAgentRequest(BaseModel):
    agent_name: str
    task: str
    experiment_id: str
    phase: str
    input_data: dict[str, Any] | None = None
    skill_code: str | None = None


class RunPlaybookRequest(BaseModel):
    playbook_name: str
    experiment_id: str
    context: dict[str, Any] = {}


class CreateExperimentRequest(BaseModel):
    name: str
    business_type: str
    vertical: str
    geography: str


class UpdateExperimentRequest(BaseModel):
    phase: str | None = None
    week_number: int | None = None
    cmf_score: float | None = None
    traction_score: float | None = None
    is_active: bool | None = None


class CreateHypothesisRequest(BaseModel):
    title: str
    description: str | None = None
    business_type: str | None = None
    tier: int = 1
    signal_type: str | None = None
    signal_score: int | None = None


class EmitEventRequest(BaseModel):
    event_type: str
    experiment_id: str | None = None
    payload: dict[str, Any] = {}


# ── Agent Endpoints ──


@router.post("/run-agent")
async def api_run_agent(req: RunAgentRequest):
    result = await run_agent_with_retry(
        agent_name=req.agent_name,
        task=req.task,
        experiment_id=req.experiment_id,
        phase=req.phase,
        input_data=req.input_data,
        skill_code=req.skill_code,
    )
    return result


@router.post("/run-playbook")
async def api_run_playbook(req: RunPlaybookRequest):
    async def _runner(agent_name, skill_code, input_data):
        result = await run_agent(
            agent_name=agent_name,
            task=input_data.get("task", "Execute"),
            experiment_id=req.experiment_id,
            phase="playbook",
            input_data=input_data,
            skill_code=skill_code,
        )
        return result.get("output", {})

    run = await execute_playbook(
        playbook_name=req.playbook_name,
        experiment_id=req.experiment_id,
        initial_context=req.context,
        agent_runner=_runner,
    )
    return {
        "playbook": run.playbook_name,
        "status": run.status,
        "completed_steps": run.completed_steps,
        "current_step": run.current_step,
        "outputs": {k: str(v)[:500] for k, v in run.step_outputs.items()},
    }


# ── Experiment Endpoints ──


@router.get("/experiment")
async def api_get_experiment(experiment_id: str | None = None):
    result = await db_tools.read_experiment(experiment_id)
    if not result:
        raise HTTPException(404, "No experiment found")
    return result


@router.post("/experiment")
async def api_create_experiment(req: CreateExperimentRequest):
    return await db_tools.create_experiment(
        name=req.name,
        business_type=req.business_type,
        vertical=req.vertical,
        geography=req.geography,
    )


@router.put("/experiment/{experiment_id}")
async def api_update_experiment(experiment_id: str, req: UpdateExperimentRequest):
    return await db_tools.update_experiment(
        experiment_id=experiment_id,
        phase=req.phase,
        week_number=req.week_number,
        cmf_score=req.cmf_score,
        traction_score=req.traction_score,
        is_active=req.is_active,
    )


# ── Hypothesis Endpoints ──


@router.get("/hypotheses")
async def api_list_hypotheses(tier: int | None = None, limit: int = 20):
    return await db_tools.read_hypotheses(tier=tier, limit=limit)


@router.post("/hypotheses")
async def api_create_hypothesis(req: CreateHypothesisRequest):
    return await db_tools.save_hypothesis(
        title=req.title,
        description=req.description,
        business_type=req.business_type,
        tier=req.tier,
        signal_type=req.signal_type,
        signal_score=req.signal_score,
    )


# ── Content Endpoints ──


@router.get("/content")
async def api_list_content(
    experiment_id: str,
    status: str | None = None,
    platform: str | None = None,
    limit: int = 20,
):
    return await db_tools.read_content_queue(
        experiment_id=experiment_id,
        status=status,
        platform=platform,
        limit=limit,
    )


# ── Metrics Endpoints ──


@router.get("/metrics/{experiment_id}")
async def api_get_metrics(experiment_id: str):
    from sqlalchemy import select
    from src.db.models import WeeklyMetric
    from src.db.session import SessionLocal

    async with SessionLocal() as session:
        result = await session.execute(
            select(WeeklyMetric)
            .where(WeeklyMetric.experiment_id == experiment_id)
            .order_by(WeeklyMetric.week_number)
        )
        rows = result.scalars().all()
        return [
            {
                "week": r.week_number,
                "cmf_score": r.cmf_score,
                "traction_score": r.traction_score,
                "engagement_quality": r.engagement_quality,
                "audience_relevance": r.audience_relevance,
                "conversion_signal": r.conversion_signal,
                "notes": r.notes,
            }
            for r in rows
        ]


# ── Pattern Endpoints ──


@router.get("/patterns")
async def api_list_patterns(
    category: str | None = None,
    business_type: str | None = None,
    limit: int = 20,
):
    from sqlalchemy import select
    from src.db.models import Pattern
    from src.db.session import SessionLocal

    async with SessionLocal() as session:
        q = select(Pattern)
        if category:
            q = q.where(Pattern.category == category)
        if business_type:
            q = q.where(Pattern.business_type == business_type)
        q = q.order_by(Pattern.confidence.desc().nulls_last()).limit(limit)
        result = await session.execute(q)
        rows = result.scalars().all()
        return [
            {
                "id": r.id,
                "category": r.category,
                "title": r.title,
                "description": r.description,
                "result": r.result,
                "confidence": r.confidence,
            }
            for r in rows
        ]


# ── Event Endpoints ──


@router.post("/event")
async def api_emit_event(req: EmitEventRequest):
    try:
        event_type = EventType(req.event_type)
    except ValueError:
        raise HTTPException(400, f"Unknown event type: {req.event_type}")

    await event_bus.publish(
        event_type=event_type,
        experiment_id=req.experiment_id,
        payload=req.payload,
    )
    return {"status": "emitted", "event_type": req.event_type}


# ── Scheduler Endpoints ──


@router.get("/scheduler")
async def api_scheduler_status():
    from src.orchestrator.scheduler import scheduler

    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else None,
        })
    return {"running": scheduler.running, "jobs": jobs}


@router.post("/scheduler/trigger")
async def api_trigger_job(job_id: str):
    from src.orchestrator.scheduler import run_daily, run_weekly, run_discover

    job_map = {
        "daily_build_test": run_daily,
        "weekly_review": run_weekly,
        "weekly_discover": run_discover,
    }
    fn = job_map.get(job_id)
    if not fn:
        raise HTTPException(404, f"Unknown job: {job_id}")

    # Run in background
    import asyncio
    asyncio.create_task(fn())
    return {"status": "triggered", "job_id": job_id}
