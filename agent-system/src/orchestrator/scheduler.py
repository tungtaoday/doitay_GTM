"""Scheduler — cron-based triggers for daily/weekly playbooks.

Uses APScheduler to run:
- build_test_daily at 09:00 daily
- build_test_weekly at 10:00 Monday
- discover weekly on Sunday
"""
from __future__ import annotations

import asyncio
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from src.orchestrator.executor import execute_playbook
from src.agents.runner import run_agent
from src.db.queries import get_active_experiment, get_system_state
from src.db.session import SessionLocal

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def _agent_runner_adapter(agent_name: str, skill_code: str | None, input_data: dict):
    """Adapter between executor's agent_runner signature and our run_agent."""
    async with SessionLocal() as session:
        exp = await get_active_experiment(session)
        if not exp:
            logger.warning("No active experiment, skipping agent run")
            return {"error": "no_active_experiment"}

    result = await run_agent(
        agent_name=agent_name,
        task=input_data.get("task", "Execute skill"),
        experiment_id=exp.id,
        phase=exp.phase,
        input_data=input_data,
        skill_code=skill_code,
    )
    return result.get("output", {})


async def run_daily():
    """Run daily build_test playbook."""
    async with SessionLocal() as session:
        exp = await get_active_experiment(session)
        if not exp or exp.phase != "build_test":
            logger.info("No active experiment in build_test phase, skipping daily run")
            return

    logger.info(f"Running daily playbook for experiment {exp.id}")
    result = await execute_playbook(
        playbook_name="build_test_daily",
        experiment_id=exp.id,
        initial_context={"experiment": {"id": exp.id, "week": exp.week_number}},
        agent_runner=_agent_runner_adapter,
    )
    logger.info(f"Daily playbook completed: {result.status}")


async def run_weekly():
    """Run weekly build_test playbook."""
    async with SessionLocal() as session:
        exp = await get_active_experiment(session)
        if not exp or exp.phase != "build_test":
            logger.info("No active experiment in build_test phase, skipping weekly run")
            return

    logger.info(f"Running weekly playbook for experiment {exp.id}")
    result = await execute_playbook(
        playbook_name="build_test_weekly",
        experiment_id=exp.id,
        initial_context={"experiment": {"id": exp.id, "week": exp.week_number}},
        agent_runner=_agent_runner_adapter,
    )
    logger.info(f"Weekly playbook completed: {result.status}")


async def run_discover():
    """Run weekly discover playbook."""
    async with SessionLocal() as session:
        state = await get_system_state(session)

    logger.info("Running discover playbook")
    result = await execute_playbook(
        playbook_name="discover",
        experiment_id="system",
        initial_context={"system_phase": state.current_phase},
        agent_runner=_agent_runner_adapter,
    )
    logger.info(f"Discover playbook completed: {result.status}")


def setup_scheduler():
    """Configure and start the scheduler."""
    # Daily at 9 AM
    scheduler.add_job(
        run_daily,
        CronTrigger(hour=9, minute=0),
        id="daily_build_test",
        name="Daily content creation and distribution",
        replace_existing=True,
    )

    # Weekly Monday at 10 AM
    scheduler.add_job(
        run_weekly,
        CronTrigger(day_of_week="mon", hour=10, minute=0),
        id="weekly_review",
        name="Weekly analytics and review",
        replace_existing=True,
    )

    # Weekly Sunday at 8 PM
    scheduler.add_job(
        run_discover,
        CronTrigger(day_of_week="sun", hour=20, minute=0),
        id="weekly_discover",
        name="Weekly market signal scan",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started with 3 jobs: daily, weekly_review, weekly_discover")
