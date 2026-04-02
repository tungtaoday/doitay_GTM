from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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


async def get_experiment(session: AsyncSession, experiment_id: str) -> Experiment | None:
    return await session.get(Experiment, experiment_id)


async def get_active_experiment(session: AsyncSession) -> Experiment | None:
    result = await session.execute(
        select(Experiment).where(Experiment.is_active == True).limit(1)
    )
    return result.scalar_one_or_none()


async def get_system_state(session: AsyncSession) -> SystemState:
    state = await session.get(SystemState, "singleton")
    if state is None:
        state = SystemState(id="singleton")
        session.add(state)
        await session.commit()
    return state


async def get_agent_outputs(
    session: AsyncSession,
    experiment_id: str,
    agent_name: str | None = None,
    skill_code: str | None = None,
) -> list[AgentOutput]:
    q = select(AgentOutput).where(AgentOutput.experiment_id == experiment_id)
    if agent_name:
        q = q.where(AgentOutput.agent_name == agent_name)
    if skill_code:
        q = q.where(AgentOutput.skill_code == skill_code)
    q = q.order_by(AgentOutput.created_at.desc())
    result = await session.execute(q)
    return list(result.scalars().all())


async def get_winning_patterns(
    session: AsyncSession,
    business_type: str | None = None,
    category: str | None = None,
    min_confidence: float = 0.5,
    limit: int = 10,
) -> list[Pattern]:
    q = select(Pattern).where(
        Pattern.result == "win",
        Pattern.confidence >= min_confidence,
    )
    if business_type:
        q = q.where(Pattern.business_type == business_type)
    if category:
        q = q.where(Pattern.category == category)
    q = q.order_by(Pattern.confidence.desc()).limit(limit)
    result = await session.execute(q)
    return list(result.scalars().all())


async def get_audience_intel(
    session: AsyncSession,
    experiment_id: str,
    unused_only: bool = True,
    limit: int = 20,
) -> list[AudienceIntel]:
    q = select(AudienceIntel).where(AudienceIntel.experiment_id == experiment_id)
    if unused_only:
        q = q.where(AudienceIntel.used_in_content == False)
    q = q.order_by(AudienceIntel.frequency.desc()).limit(limit)
    result = await session.execute(q)
    return list(result.scalars().all())
