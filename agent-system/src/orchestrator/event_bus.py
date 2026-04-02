from __future__ import annotations

import enum
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Awaitable, Callable

logger = logging.getLogger(__name__)


class EventType(str, enum.Enum):
    # Content
    CONTENT_CREATED = "content_created"
    CONTENT_APPROVED = "content_approved"
    CONTENT_POSTED = "content_posted"
    CONTENT_PERFORMANCE_SPIKE = "content_performance_spike"

    # Metrics
    CMF_BELOW_THRESHOLD = "cmf_below_threshold"
    CMF_ABOVE_THRESHOLD = "cmf_above_threshold"
    TRACTION_DROP = "traction_drop"
    KILL_SIGNAL = "kill_signal"

    # Pipeline
    EXPERIMENT_CREATED = "experiment_created"
    PHASE_COMPLETED = "phase_completed"
    DISCOVER_APPROVED = "discover_approved"
    STRATEGY_APPROVED = "strategy_approved"
    EXPERIMENT_WEEK_8 = "experiment_week_8"
    EXPERIMENT_DECIDED = "experiment_decided"

    # Signals
    SIGNAL_DETECTED_HIGH = "signal_detected_high"
    TREND_SPIKE = "trend_spike"
    COMPETITOR_MOVE = "competitor_move"

    # System
    AGENT_ERROR = "agent_error"
    CEO_APPROVAL_TIMEOUT = "ceo_approval_timeout"


@dataclass
class Event:
    type: EventType
    experiment_id: str | None = None
    payload: dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    source: str = ""


EVENT_PLAYBOOK_MAP: dict[EventType, str] = {
    EventType.EXPERIMENT_CREATED: "discover",
    EventType.DISCOVER_APPROVED: "define",
    EventType.STRATEGY_APPROVED: "build_test_daily",
    EventType.EXPERIMENT_WEEK_8: "decide",
    EventType.EXPERIMENT_DECIDED: "extract",
}


class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[EventType, list[Callable[[Event], Awaitable[None]]]] = {}

    def subscribe(
        self,
        event_type: EventType,
        handler: Callable[[Event], Awaitable[None]],
    ) -> None:
        self._handlers.setdefault(event_type, []).append(handler)

    async def publish(self, event: Event) -> None:
        await self._persist_event(event)

        for handler in self._handlers.get(event.type, []):
            try:
                await handler(event)
            except Exception:
                logger.exception("Event handler failed for %s", event.type)

    async def _persist_event(self, event: Event) -> None:
        from cuid2 import cuid

        from src.db.models import EventLog
        from src.db.session import SessionLocal

        async with SessionLocal() as session:
            log_entry = EventLog(
                id=cuid(),
                event_type=event.type.value,
                experiment_id=event.experiment_id,
                payload=event.payload,
                triggered_playbook=EVENT_PLAYBOOK_MAP.get(event.type),
            )
            session.add(log_entry)
            await session.commit()


event_bus = EventBus()
