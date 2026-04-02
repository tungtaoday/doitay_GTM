"""Agent Runner — executes a single agent with Claude API.

Takes agent config (from loader), input data, runs Claude query,
validates output, saves to DB.
"""
from __future__ import annotations

import json
import logging
import time
from typing import Any

from claude_agent_sdk import AssistantMessage, ClaudeAgentOptions, ResultMessage, query

from src.agents.contracts import AGENT_CONTRACTS
from src.agents.loader import load_agent
from src.agents.validator import validate_agent_output
from src.db.queries import get_winning_patterns
from src.db.session import SessionLocal
from src.tools.db_tools import save_agent_output

logger = logging.getLogger(__name__)

# Model mapping
MODEL_MAP = {
    "opus": "claude-opus-4-6",
    "sonnet": "claude-sonnet-4-6",
    "haiku": "claude-haiku-4-5-20251001",
}


async def run_agent(
    agent_name: str,
    task: str,
    experiment_id: str,
    phase: str,
    input_data: dict[str, Any] | None = None,
    skill_code: str | None = None,
    skill_codes: list[str] | None = None,
    inject_patterns: bool = True,
    max_tokens: int = 8192,
) -> dict[str, Any]:
    """Run a single agent and return its output.

    1. Load agent config (prompt + skills + tools)
    2. Optionally inject winning patterns from Pattern Library
    3. Build user message from task + input_data
    4. Call Claude API via Agent SDK
    5. Parse JSON output
    6. Validate against contract
    7. Save to DB
    8. Return output
    """
    start_ms = time.monotonic()

    # 1. Load agent with optional pattern injection
    patterns = None
    if inject_patterns:
        try:
            async with SessionLocal() as session:
                pattern_rows = await get_winning_patterns(session)
                patterns = [
                    {
                        "title": p.title,
                        "description": p.description,
                        "result": p.result,
                        "evidence": p.evidence,
                    }
                    for p in pattern_rows
                ]
        except Exception:
            patterns = None

    # Support both single skill_code and multiple skill_codes
    _focus_skills = skill_codes or ([skill_code] if skill_code else None)
    agent_config = load_agent(
        agent_name,
        inject_patterns=patterns,
        focus_skill=skill_code if not skill_codes else None,
        focus_skills=_focus_skills,
    )

    # 2. Build user message
    user_message_parts = [f"## Task\n{task}\n"]
    if input_data:
        user_message_parts.append(
            f"## Input Data\n```json\n{json.dumps(input_data, ensure_ascii=False, indent=2)}\n```"
        )
    if experiment_id:
        user_message_parts.append(f"\n## Experiment ID: {experiment_id}")
    if _focus_skills:
        user_message_parts.append(f"\n## Focus Skills: {', '.join(_focus_skills)}")

    user_message = "\n".join(user_message_parts)

    # 3. Build options
    model_id = MODEL_MAP.get(agent_config["model"], "claude-sonnet-4-6")

    # Agents with tools need more turns to complete tool calls
    agent_tools = agent_config.get("tools", [])
    has_tools = bool(agent_tools)
    needs_computer_use = "computer" in agent_tools or "browser" in agent_tools
    agent_max_turns = 25 if needs_computer_use else (5 if has_tools else 1)

    options_kwargs: dict[str, Any] = {
        "model": model_id,
        "system_prompt": agent_config["prompt"],
        "max_turns": agent_max_turns,
        "permission_mode": "bypassPermissions",
        "output_format": {"type": "json"} if not has_tools else None,
    }
    # Remove None values
    options_kwargs = {k: v for k, v in options_kwargs.items() if v is not None}

    # Pass allowed tools (MCP tools, computer_use, etc.)
    if agent_tools:
        options_kwargs["allowed_tools"] = agent_tools

    # Computer Use requires beta flag
    if needs_computer_use:
        options_kwargs["betas"] = ["computer-use-2025-01-24"]
        logger.info(f"Agent '{agent_name}' using Computer Use with {agent_max_turns} max turns")

    options = ClaudeAgentOptions(**options_kwargs)

    # 4. Call Claude API
    logger.info(f"Running agent '{agent_name}' with skill '{skill_code}' for experiment '{experiment_id}'")

    raw_text = ""
    cost_usd = 0.0
    try:
        async for message in query(prompt=user_message, options=options):
            if isinstance(message, AssistantMessage) and hasattr(message, "content"):
                for block in message.content:
                    if hasattr(block, "text"):
                        raw_text += block.text
            if isinstance(message, ResultMessage):
                cost_usd = getattr(message, "total_cost_usd", 0) or 0
                if hasattr(message, "result") and message.result:
                    raw_text = message.result
    except Exception as e:
        logger.error(f"Agent '{agent_name}' failed: {e}")
        return {
            "error": str(e),
            "agent": agent_name,
            "status": "failed",
        }

    duration_ms = int((time.monotonic() - start_ms) * 1000)

    # 5. Parse JSON output from response
    output_data = _extract_json(raw_text) if raw_text else None

    # 6. Validate against contract
    contract = AGENT_CONTRACTS.get(agent_name)
    if contract and output_data:
        validation = validate_agent_output(agent_name, output_data)
        if not validation["valid"]:
            logger.warning(
                f"Agent '{agent_name}' output validation failed: {validation['errors']}"
            )
            output_data["_validation_errors"] = validation["errors"]

    # 7. Save to DB
    if output_data and experiment_id:
        try:
            await save_agent_output(
                experiment_id=experiment_id,
                agent_name=agent_name,
                phase=phase,
                output_data=output_data,
                skill_code=skill_code,
                input_data=input_data,
                raw_text=raw_text,
                duration_ms=duration_ms,
                cost_usd=cost_usd,
            )
        except Exception as e:
            logger.error(f"Failed to save agent output: {e}")

    # 8. Return
    return {
        "agent": agent_name,
        "skill_code": skill_code,
        "output": output_data,
        "raw_text": raw_text,
        "duration_ms": duration_ms,
        "status": "success" if output_data else "no_json_output",
    }


def _extract_text_from_message(message: Any) -> str:
    """Extract text content from a Claude SDK message."""
    if hasattr(message, "text"):
        return message.text

    # Try to get text from content blocks
    if hasattr(message, "content"):
        content = message.content
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts = []
            for block in content:
                if hasattr(block, "text"):
                    parts.append(block.text)
                elif isinstance(block, dict) and "text" in block:
                    parts.append(block["text"])
            return "\n".join(parts)

    # Try message attribute
    if hasattr(message, "message"):
        return _extract_text_from_message(message.message)

    return str(message)


def _extract_json(text: str) -> dict[str, Any] | None:
    """Extract JSON from agent response text.

    Tries multiple strategies:
    1. Full text is valid JSON
    2. JSON in ```json code block
    3. First { to last } in text
    """
    import re

    text = text.strip()
    if not text:
        return None

    # Strategy 1: Full text (object or array)
    if text.startswith("{") or text.startswith("["):
        try:
            result = json.loads(text)
            # Wrap bare arrays in {"items": [...]} for consistency
            if isinstance(result, list):
                return {"items": result}
            return result
        except json.JSONDecodeError:
            pass

    # Strategy 2: Code block
    code_block = re.search(r"```(?:json)?\s*\n(.*?)\n```", text, re.DOTALL)
    if code_block:
        try:
            result = json.loads(code_block.group(1).strip())
            if isinstance(result, list):
                return {"items": result}
            return result
        except json.JSONDecodeError:
            pass

    # Strategy 3: First { to last } or first [ to last ]
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(text[first_brace : last_brace + 1])
        except json.JSONDecodeError:
            pass

    # Strategy 4: Array — first [ to last ]
    first_bracket = text.find("[")
    last_bracket = text.rfind("]")
    if first_bracket != -1 and last_bracket > first_bracket:
        try:
            result = json.loads(text[first_bracket : last_bracket + 1])
            if isinstance(result, list):
                return {"items": result}
        except json.JSONDecodeError:
            pass

    logger.warning("Could not extract JSON from agent response. First 500 chars: %s", text[:500])
    return None


async def run_agent_with_retry(
    agent_name: str,
    task: str,
    experiment_id: str,
    phase: str,
    input_data: dict[str, Any] | None = None,
    skill_code: str | None = None,
    skill_codes: list[str] | None = None,
    max_retries: int = 2,
) -> dict[str, Any]:
    """Run agent with retry on failure."""
    result = {}
    for attempt in range(max_retries + 1):
        result = await run_agent(
            agent_name=agent_name,
            task=task,
            experiment_id=experiment_id,
            phase=phase,
            input_data=input_data,
            skill_code=skill_code,
            skill_codes=skill_codes,
        )
        if result.get("status") == "success":
            return result
        if attempt < max_retries:
            logger.info(f"Retrying agent '{agent_name}' (attempt {attempt + 2}/{max_retries + 1})")

    return result
