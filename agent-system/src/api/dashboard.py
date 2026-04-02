"""Dashboard API — CEO Cockpit endpoints.

Provides:
- GET /api/dashboard — Full CEO dashboard
- GET /api/dashboard/scorecard — Weekly scorecard
- POST /api/dashboard/approve — CEO approval/decision
- GET /api/dashboard/timeline — Experiment timeline
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select

from src.db.models import (
    CEOApproval,
    ContentItem,
    EventLog,
    Experiment,
    Hypothesis,
    Pattern,
    SystemState,
    WeeklyMetric,
)
from src.db.session import SessionLocal

router = APIRouter(prefix="/api/dashboard")


class ApprovalRequest(BaseModel):
    experiment_id: str
    checkpoint: str
    decision: str  # go, no_go, pivot, pause
    notes: str | None = None


@router.get("")
async def dashboard():
    """Full CEO dashboard — single view of entire system."""
    async with SessionLocal() as session:
        # System state
        state = await session.get(SystemState, "singleton")
        if not state:
            state = SystemState(id="singleton")

        # All experiments (ordered: active first, then by updated)
        exp_result = await session.execute(
            select(Experiment).order_by(
                Experiment.is_active.desc(),
                Experiment.updated_at.desc(),
            )
        )
        experiments = exp_result.scalars().all()

        # Recent metrics for each experiment
        exp_data = []
        for exp in experiments:
            metric_result = await session.execute(
                select(WeeklyMetric)
                .where(WeeklyMetric.experiment_id == exp.id)
                .order_by(WeeklyMetric.week_number.desc())
                .limit(2)
            )
            metrics = metric_result.scalars().all()
            latest = metrics[0] if metrics else None
            prev = metrics[1] if len(metrics) > 1 else None

            trend = "→"
            if latest and prev and latest.cmf_score and prev.cmf_score:
                if latest.cmf_score > prev.cmf_score:
                    trend = "↑"
                elif latest.cmf_score < prev.cmf_score:
                    trend = "↓"

            exp_data.append({
                "id": exp.id,
                "name": exp.name,
                "vertical": exp.vertical,
                "geography": exp.geography,
                "business_type": exp.business_type,
                "phase": exp.phase,
                "week": exp.week_number,
                "is_active": exp.is_active,
                "cmf_score": latest.cmf_score if latest else None,
                "traction_score": latest.traction_score if latest else None,
                "trend": trend,
            })

        # Hypothesis backlog counts
        for tier in (1, 2, 3):
            tier_result = await session.execute(
                select(func.count(Hypothesis.id))
                .where(Hypothesis.is_active == True, Hypothesis.tier == tier)
            )
            locals()[f"tier{tier}_count"] = tier_result.scalar() or 0

        # Pending approvals
        approval_result = await session.execute(
            select(CEOApproval)
            .where(CEOApproval.decision == None)
            .order_by(CEOApproval.created_at.desc())
        )
        pending_approvals = approval_result.scalars().all()

        # Recent patterns
        pattern_result = await session.execute(
            select(Pattern).order_by(Pattern.created_at.desc()).limit(5)
        )
        recent_patterns = pattern_result.scalars().all()

        # Unprocessed events
        event_result = await session.execute(
            select(func.count(EventLog.id)).where(EventLog.processed == False)
        )
        unprocessed_events = event_result.scalar() or 0

        # Content stats
        content_result = await session.execute(
            select(
                ContentItem.status,
                func.count(ContentItem.id),
            ).group_by(ContentItem.status)
        )
        content_stats = {row[0]: row[1] for row in content_result.all()}

    return {
        "system": {
            "current_phase": state.current_phase if state else 1,
            "automation_mode": state.automation_mode if state else "semi_auto",
            "total_experiments": state.total_experiments if state else 0,
            "total_patterns": state.total_patterns if state else 0,
            "last_daily_run": str(state.last_daily_run) if state and state.last_daily_run else None,
            "last_weekly_run": str(state.last_weekly_run) if state and state.last_weekly_run else None,
        },
        "experiments": exp_data,
        "hypothesis_backlog": {
            "tier1": locals().get("tier1_count", 0),
            "tier2": locals().get("tier2_count", 0),
            "tier3": locals().get("tier3_count", 0),
        },
        "pending_approvals": [
            {
                "id": a.id,
                "experiment_id": a.experiment_id,
                "checkpoint": a.checkpoint,
                "recommendation": a.agent_recommendation,
                "rationale": a.agent_rationale,
            }
            for a in pending_approvals
        ],
        "recent_patterns": [
            {"title": p.title, "category": p.category, "result": p.result}
            for p in recent_patterns
        ],
        "content_pipeline": content_stats,
        "unprocessed_events": unprocessed_events,
    }


@router.get("/scorecard")
async def weekly_scorecard():
    """Generate weekly scorecard for CEO."""
    async with SessionLocal() as session:
        # Active experiments with latest metrics
        exp_result = await session.execute(
            select(Experiment).where(Experiment.is_active == True)
        )
        experiments = exp_result.scalars().all()

        scorecard_experiments = []
        alerts = []

        for exp in experiments:
            metric_result = await session.execute(
                select(WeeklyMetric)
                .where(WeeklyMetric.experiment_id == exp.id)
                .order_by(WeeklyMetric.week_number.desc())
                .limit(3)
            )
            metrics = list(metric_result.scalars().all())

            latest_cmf = metrics[0].cmf_score if metrics and metrics[0].cmf_score else 0
            latest_traction = metrics[0].traction_score if metrics and metrics[0].traction_score else 0

            # Detect trend
            trend = "→"
            if len(metrics) >= 2 and metrics[0].cmf_score and metrics[1].cmf_score:
                trend = "↑" if metrics[0].cmf_score > metrics[1].cmf_score else "↓"

            # Kill signal check
            if exp.week_number >= 4 and latest_cmf < 0.1 and latest_traction < 0.1:
                alerts.append(
                    f"KILL SIGNAL: {exp.name} — CMF {latest_cmf:.2f}, "
                    f"Traction {latest_traction:.2f} at week {exp.week_number}"
                )

            # Declining trend alert
            if trend == "↓" and len(metrics) >= 3:
                all_declining = all(
                    (metrics[i].cmf_score or 0) < (metrics[i + 1].cmf_score or 0)
                    for i in range(len(metrics) - 1)
                    if metrics[i].cmf_score is not None and metrics[i + 1].cmf_score is not None
                )
                if all_declining:
                    alerts.append(f"DECLINING: {exp.name} — CMF declining 3+ weeks")

            scorecard_experiments.append({
                "name": exp.name,
                "phase": exp.phase,
                "week": exp.week_number,
                "cmf_score": latest_cmf,
                "traction_score": latest_traction,
                "trend": trend,
            })

        # Backlog counts
        backlog = {}
        for tier in (1, 2, 3):
            result = await session.execute(
                select(func.count(Hypothesis.id))
                .where(Hypothesis.is_active == True, Hypothesis.tier == tier)
            )
            backlog[f"tier{tier}"] = result.scalar() or 0

        # New patterns this week
        from datetime import timedelta
        week_ago = datetime.utcnow() - timedelta(days=7)
        pattern_result = await session.execute(
            select(Pattern).where(Pattern.created_at >= week_ago)
        )
        new_patterns = [
            {"title": p.title, "category": p.category}
            for p in pattern_result.scalars().all()
        ]

    return {
        "experiments": scorecard_experiments,
        "alerts": alerts,
        "backlog": backlog,
        "new_patterns": new_patterns,
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.post("/approve")
async def ceo_approve(req: ApprovalRequest):
    """CEO makes a GO/NO-GO decision."""
    from cuid2 import cuid_wrapper

    cuid = cuid_wrapper()

    async with SessionLocal() as session:
        # Find pending approval
        result = await session.execute(
            select(CEOApproval).where(
                CEOApproval.experiment_id == req.experiment_id,
                CEOApproval.checkpoint == req.checkpoint,
                CEOApproval.decision == None,
            )
        )
        approval = result.scalar_one_or_none()

        if not approval:
            # Create new approval record
            approval = CEOApproval(
                id=cuid(),
                experiment_id=req.experiment_id,
                checkpoint=req.checkpoint,
                phase="manual",
                agent_recommendation={},
            )
            session.add(approval)

        approval.decision = req.decision
        approval.ceo_notes = req.notes
        approval.decided_at = datetime.utcnow()

        # Update experiment based on decision
        exp = await session.get(Experiment, req.experiment_id)
        if exp:
            if req.decision == "no_go":
                exp.is_active = False
                exp.phase = "killed"
            elif req.decision == "go" and req.checkpoint == "define_complete":
                exp.phase = "build_test"
                exp.week_number = 1

        await session.commit()

    return {
        "status": "approved",
        "decision": req.decision,
        "experiment_id": req.experiment_id,
    }


@router.get("/timeline")
async def experiment_timeline(experiment_id: str):
    """Get full timeline of an experiment's events and outputs."""
    async with SessionLocal() as session:
        from src.db.models import AgentOutput

        # Agent outputs
        output_result = await session.execute(
            select(AgentOutput)
            .where(AgentOutput.experiment_id == experiment_id)
            .order_by(AgentOutput.created_at)
        )
        outputs = output_result.scalars().all()

        # Events
        event_result = await session.execute(
            select(EventLog)
            .where(EventLog.experiment_id == experiment_id)
            .order_by(EventLog.created_at)
        )
        events = event_result.scalars().all()

        # Metrics
        metric_result = await session.execute(
            select(WeeklyMetric)
            .where(WeeklyMetric.experiment_id == experiment_id)
            .order_by(WeeklyMetric.week_number)
        )
        metrics = metric_result.scalars().all()

    timeline = []
    for o in outputs:
        timeline.append({
            "type": "agent_output",
            "timestamp": o.created_at.isoformat(),
            "agent": o.agent_name,
            "skill": o.skill_code,
            "phase": o.phase,
        })
    for e in events:
        timeline.append({
            "type": "event",
            "timestamp": e.created_at.isoformat(),
            "event_type": e.event_type,
            "payload": e.payload,
        })
    for m in metrics:
        timeline.append({
            "type": "metric",
            "timestamp": m.created_at.isoformat(),
            "week": m.week_number,
            "cmf": m.cmf_score,
            "traction": m.traction_score,
        })

    timeline.sort(key=lambda x: x["timestamp"])
    return {"experiment_id": experiment_id, "timeline": timeline}
