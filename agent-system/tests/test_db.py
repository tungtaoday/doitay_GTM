"""Tests for database models and queries."""
import pytest
from src.db.session import init_db, SessionLocal
from src.db.models import Base, Experiment, Hypothesis, SystemState
from src.db.queries import get_system_state, get_active_experiment


@pytest.fixture(autouse=True)
async def setup_db():
    """Initialize test database."""
    await init_db()
    yield


async def test_init_db():
    """DB should initialize without errors."""
    await init_db()  # idempotent


async def test_system_state_singleton():
    """SystemState should auto-create singleton."""
    async with SessionLocal() as session:
        state = await get_system_state(session)
        assert state.id == "singleton"
        assert state.current_phase == 1


async def test_create_experiment():
    """Should create and retrieve experiment."""
    from cuid2 import cuid_wrapper
    cuid = cuid_wrapper()

    async with SessionLocal() as session:
        exp = Experiment(
            id=cuid(),
            name="Test Marketplace",
            business_type="marketplace",
            vertical="test",
            geography="test",
        )
        session.add(exp)
        await session.commit()

        found = await get_active_experiment(session)
        assert found is not None
        assert found.name == "Test Marketplace"


async def test_create_hypothesis():
    """Should create hypothesis."""
    from cuid2 import cuid_wrapper
    cuid = cuid_wrapper()

    async with SessionLocal() as session:
        h = Hypothesis(
            id=cuid(),
            title="Test hypothesis",
            tier=1,
        )
        session.add(h)
        await session.commit()
        assert h.id is not None
