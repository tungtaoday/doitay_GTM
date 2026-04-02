"""Reactive Event Handlers — wire events to automated responses.

Handlers:
1. KILL_SIGNAL → pause experiment + alert CEO
2. CONTENT_PERFORMANCE_SPIKE → auto-repurpose (C10)
3. SIGNAL_DETECTED_HIGH → auto-create Tier 1 hypothesis
4. TREND_SPIKE → trigger trend-riding content
5. CEO_APPROVAL_TIMEOUT → 48h reminder
6. TRACTION_DROP → alert + suggest pivot analysis
7. AGENT_ERROR → alert CEO via Telegram
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta

from src.orchestrator.event_bus import Event, EventBus, EventType

logger = logging.getLogger(__name__)


def register_all_handlers(bus: EventBus) -> None:
    """Register all reactive event handlers on the event bus."""

    bus.subscribe(EventType.KILL_SIGNAL, _handle_kill_signal)
    bus.subscribe(EventType.CONTENT_PERFORMANCE_SPIKE, _handle_viral_content)
    bus.subscribe(EventType.SIGNAL_DETECTED_HIGH, _handle_high_signal)
    bus.subscribe(EventType.TREND_SPIKE, _handle_trend_spike)
    bus.subscribe(EventType.CEO_APPROVAL_TIMEOUT, _handle_ceo_timeout)
    bus.subscribe(EventType.TRACTION_DROP, _handle_traction_drop)
    bus.subscribe(EventType.AGENT_ERROR, _handle_agent_error)

    logger.info("Registered 7 reactive event handlers")


async def _handle_kill_signal(event: Event) -> None:
    """KILL_SIGNAL → pause experiment + alert CEO."""
    from src.tools.notifications import send_kill_signal_alert
    from src.tools.db_tools import update_experiment, read_experiment

    logger.warning(f"KILL SIGNAL for experiment {event.experiment_id}")

    # Get experiment details
    exp = await read_experiment(event.experiment_id)
    if not exp:
        return

    # Alert CEO
    await send_kill_signal_alert(
        experiment_id=event.experiment_id or "unknown",
        cmf_score=event.payload.get("cmf_score", 0),
        traction_score=event.payload.get("traction_score", 0),
        week=exp.get("week_number", 0),
        reason=event.payload.get("reason", "CMF and Traction below threshold"),
    )

    logger.info(f"Kill signal alert sent for {event.experiment_id}")


async def _handle_viral_content(event: Event) -> None:
    """CONTENT_PERFORMANCE_SPIKE → auto-repurpose via C10."""
    from src.agents.runner import run_agent

    content_id = event.payload.get("content_id")
    if not content_id:
        return

    logger.info(f"Viral content detected: {content_id}, triggering repurpose")

    await run_agent(
        agent_name="content",
        task=f"Repurpose viral content {content_id} to all other platforms. "
             f"Performance data: {event.payload}",
        experiment_id=event.experiment_id or "",
        phase="build_test",
        skill_code="C10_repurposing",
        input_data={
            "content_id": content_id,
            "performance": event.payload,
            "platforms": ["twitter", "instagram", "facebook", "linkedin", "youtube", "email"],
        },
    )


async def _handle_high_signal(event: Event) -> None:
    """SIGNAL_DETECTED_HIGH → auto-create Tier 1 hypothesis."""
    from src.tools.db_tools import save_hypothesis

    signal = event.payload
    logger.info(f"High signal detected: {signal.get('title', 'unknown')}")

    await save_hypothesis(
        title=signal.get("title", "Auto-detected signal"),
        description=signal.get("description", ""),
        business_type=signal.get("business_type"),
        tier=1,
        signal_type=signal.get("signal_type"),
        signal_score=signal.get("signal_score"),
        source_agent="research",
    )


async def _handle_trend_spike(event: Event) -> None:
    """TREND_SPIKE → trigger trend-riding content creation."""
    from src.agents.runner import run_agent

    trend = event.payload
    logger.info(f"Trend spike: {trend.get('topic', 'unknown')}")

    await run_agent(
        agent_name="content",
        task=f"Create trend-riding content for trending topic. "
             f"Topic: {trend.get('topic')}. "
             f"Platform: {trend.get('platform')}. "
             f"Must be published within 2 hours.",
        experiment_id=event.experiment_id or "",
        phase="build_test",
        skill_code="C3_shortform_writing",
        input_data={
            "trend": trend,
            "urgency": "high",
            "platforms": [trend.get("platform", "twitter")],
        },
    )


async def _handle_ceo_timeout(event: Event) -> None:
    """CEO_APPROVAL_TIMEOUT → 48h reminder via Telegram."""
    from src.tools.notifications import notify_ceo

    await notify_ceo(
        alert_type="alert",
        title="CEO Approval Pending — 48h Reminder",
        body=(
            f"Checkpoint `{event.payload.get('checkpoint', 'unknown')}` "
            f"has been waiting for your decision for 48+ hours.\n\n"
            f"Please review and approve/reject via Dashboard."
        ),
        experiment_id=event.experiment_id,
    )


async def _handle_traction_drop(event: Event) -> None:
    """TRACTION_DROP → alert CEO + suggest pivot analysis."""
    from src.tools.notifications import notify_ceo

    await notify_ceo(
        alert_type="alert",
        title="Traction Dropping — 2 Consecutive Weeks",
        body=(
            f"Traction score has been declining for 2+ weeks.\n"
            f"Current: {event.payload.get('current_score', 'N/A')}\n"
            f"Previous: {event.payload.get('previous_score', 'N/A')}\n\n"
            f"Consider running pivot analysis (D5)."
        ),
        experiment_id=event.experiment_id,
    )


async def _handle_agent_error(event: Event) -> None:
    """AGENT_ERROR → alert CEO via Telegram."""
    from src.tools.notifications import notify_ceo

    await notify_ceo(
        alert_type="alert",
        title=f"Agent Error: {event.payload.get('agent', 'unknown')}",
        body=(
            f"Agent `{event.payload.get('agent')}` failed.\n"
            f"Error: {event.payload.get('error', 'unknown')}\n"
            f"Skill: {event.payload.get('skill', 'N/A')}"
        ),
        experiment_id=event.experiment_id,
    )
