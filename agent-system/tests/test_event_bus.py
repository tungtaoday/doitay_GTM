"""Tests for event bus."""
import pytest
from unittest.mock import AsyncMock, patch
from src.orchestrator.event_bus import EventBus, EventType, Event


def test_event_types_exist():
    assert EventType.KILL_SIGNAL is not None
    assert EventType.EXPERIMENT_WEEK_8 is not None


@patch("src.orchestrator.event_bus.EventBus._persist_event", new_callable=AsyncMock)
async def test_event_bus_subscribe_publish(mock_persist):
    bus = EventBus()
    received = []

    async def handler(event: Event):
        received.append(event)

    bus.subscribe(EventType.KILL_SIGNAL, handler)
    event = Event(type=EventType.KILL_SIGNAL, experiment_id="test-1", payload={"cmf": 0.05})
    await bus.publish(event)

    assert len(received) == 1
    assert received[0].type == EventType.KILL_SIGNAL
    assert received[0].experiment_id == "test-1"


@patch("src.orchestrator.event_bus.EventBus._persist_event", new_callable=AsyncMock)
async def test_event_bus_multiple_handlers(mock_persist):
    bus = EventBus()
    counts = {"a": 0, "b": 0}

    async def handler_a(event: Event):
        counts["a"] += 1

    async def handler_b(event: Event):
        counts["b"] += 1

    bus.subscribe(EventType.CONTENT_PERFORMANCE_SPIKE, handler_a)
    bus.subscribe(EventType.CONTENT_PERFORMANCE_SPIKE, handler_b)
    event = Event(type=EventType.CONTENT_PERFORMANCE_SPIKE, payload={})
    await bus.publish(event)

    assert counts["a"] == 1
    assert counts["b"] == 1
