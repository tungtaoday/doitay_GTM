from __future__ import annotations

import asyncio
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

import yaml

from src.config import PLAYBOOKS_DIR

logger = logging.getLogger(__name__)


@dataclass
class StepResult:
    step_id: str
    status: str  # success, failed, skipped, waiting_gate
    output: dict | None = None
    error: str | None = None


@dataclass
class PlaybookRun:
    playbook_name: str
    experiment_id: str
    step_outputs: dict[str, Any] = field(default_factory=dict)
    completed_steps: list[str] = field(default_factory=list)
    current_step: str | None = None
    status: str = "running"  # running, paused_at_gate, completed, failed


def load_playbook(name: str) -> dict:
    path = PLAYBOOKS_DIR / f"{name}.yaml"
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def resolve_template(template: str, context: dict) -> str:
    def _replace(match: re.Match) -> str:
        key_path = match.group(1).strip()
        parts = key_path.split(".")
        value: Any = context
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part, f"UNRESOLVED:{key_path}")
            else:
                return f"UNRESOLVED:{key_path}"
        return str(value) if not isinstance(value, (dict, list)) else str(value)

    return re.sub(r"\{\{(.+?)\}\}", _replace, template)


def evaluate_condition(condition: str, context: dict) -> bool:
    resolved = resolve_template(condition, context)
    try:
        expr = resolved.replace(" AND ", " and ").replace(" OR ", " or ")
        return bool(eval(expr, {"__builtins__": {}}, {}))  # noqa: S307
    except Exception:
        return False


async def execute_playbook(
    playbook_name: str,
    experiment_id: str,
    initial_context: dict,
    agent_runner: Callable,
) -> PlaybookRun:
    playbook = load_playbook(playbook_name)
    run = PlaybookRun(playbook_name=playbook_name, experiment_id=experiment_id)
    context = {**initial_context, "experiment": {"id": experiment_id}}

    steps = playbook.get("steps", [])
    gates = {g["after"]: g for g in playbook.get("gates", [])}
    step_map = {s["id"]: s for s in steps}
    groups = _build_execution_order(steps)

    for group in groups:
        tasks = []
        group_step_ids = []

        for step_id in group:
            step = step_map[step_id]

            if "condition" in step and not evaluate_condition(step["condition"], context):
                run.completed_steps.append(step_id)
                continue

            resolved_input: dict[str, Any] = {}
            if "input" in step:
                for k, v in step["input"].items():
                    resolved_input[k] = resolve_template(str(v), context) if isinstance(v, str) else v

            run.current_step = step_id

            if step.get("type") == "notification":
                tasks.append(_handle_notification(step, context))
            elif step.get("type") in ("condition", "db_action"):
                run.completed_steps.append(step_id)
                continue
            elif "agent" in step:
                tasks.append(agent_runner(step["agent"], step.get("skill"), resolved_input))
            else:
                run.completed_steps.append(step_id)
                continue

            group_step_ids.append(step_id)

        if not tasks:
            continue

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for step_id, result in zip(group_step_ids, results):
            step = step_map[step_id]
            if isinstance(result, Exception):
                logger.exception("Step %s failed: %s", step_id, result)
                run.step_outputs[step_id] = {"error": str(result)}
            else:
                output_key = step.get("output_key", step_id)
                run.step_outputs[output_key] = result
                context[output_key] = result
                run.completed_steps.append(step_id)

            if step_id in gates:
                run.status = "paused_at_gate"
                run.current_step = f"gate:{step_id}"
                return run

    run.status = "completed"
    return run


def _build_execution_order(steps: list[dict]) -> list[list[str]]:
    groups: list[list[str]] = []
    completed: set[str] = set()
    all_ids = {s["id"] for s in steps}

    while len(completed) < len(all_ids):
        ready = []
        for step in steps:
            if step["id"] in completed:
                continue
            deps = step.get("depends_on", [])
            if all(d in completed for d in deps):
                ready.append(step["id"])
        if not ready:
            remaining = all_ids - completed
            logger.warning("Unresolvable deps for steps: %s", remaining)
            break
        groups.append(ready)
        completed.update(ready)

    return groups


async def _handle_notification(step: dict, context: dict) -> dict:
    message = resolve_template(step.get("message", ""), context)
    channels = step.get("channel", ["dashboard"])
    if isinstance(channels, str):
        channels = [channels]
    logger.info("Notification [%s]: %s", channels, message[:200])
    return {"notified": channels, "message": message}
