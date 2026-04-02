"""Agent Management API — View, edit agents, skills, and prompts.

GET  /api/agents                     — List all agents with metadata
GET  /api/agents/{name}              — Get full agent detail (prompt, skills, model)
PUT  /api/agents/{name}              — Update agent (model, description, skills list)
GET  /api/agents/{name}/prompt       — Get assembled system prompt (read-only)
POST /api/agents/{name}/test         — Test-run agent with a task

GET  /api/skills                     — List all skills with metadata
GET  /api/skills/{code}              — Get full skill (content + metadata)
PUT  /api/skills/{code}              — Update skill content
POST /api/skills                     — Create new skill

GET  /api/agent-runs                 — Recent agent runs (from DB)
"""
from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any

import yaml
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.config import AGENTS_DIR, SKILLS_DIR

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/agents-admin")


# ── Request Models ──


class UpdateAgentRequest(BaseModel):
    model: str | None = None
    description: str | None = None
    skills: list[str] | None = None
    extra_tools: list[str] | None = None
    role_prompt: str | None = None  # markdown body (below frontmatter)


class UpdateSkillRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    content: str | None = None  # full markdown body


class CreateSkillRequest(BaseModel):
    code: str
    name: str
    category: str  # analysis, creation, growth, research, strategy, decision
    skill_type: str = "reasoning"  # reasoning | api
    description: str = ""
    tools_required: list[str] = []
    content: str = ""


class TestAgentRequest(BaseModel):
    task: str
    input_data: dict[str, Any] | None = None
    skill_code: str | None = None


# ── Helpers ──


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if match:
        try:
            fm = yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            # Fallback: extract key-value pairs manually for broken YAML
            fm = {}
            for line in match.group(1).split("\n"):
                if ":" in line and not line.startswith(" ") and not line.startswith("#"):
                    key, _, val = line.partition(":")
                    fm[key.strip()] = val.strip().strip('"').strip("'")
        content = match.group(2).strip()
        return fm, content
    return {}, text.strip()


def _write_md(path: Path, frontmatter: dict, content: str):
    """Write a .md file with YAML frontmatter + markdown body."""
    fm_str = yaml.dump(frontmatter, allow_unicode=True, default_flow_style=False).strip()
    path.write_text(f"---\n{fm_str}\n---\n\n{content}\n", encoding="utf-8")


def _find_skill_file(code: str) -> Path | None:
    """Find skill .md file by code (e.g. 'A1' finds A1_stress_testing.md)."""
    for category_dir in SKILLS_DIR.iterdir():
        if not category_dir.is_dir():
            continue
        for md_file in category_dir.glob(f"*{code}*.md"):
            return md_file
    return None


def _load_skill_meta(md_file: Path) -> dict:
    """Load skill metadata from a .md file."""
    text = md_file.read_text(encoding="utf-8")
    fm, content = _parse_frontmatter(text)
    # Derive code from filename if missing (e.g. "C1_hook_writing.md" → "C1")
    code = fm.get("code", "") or md_file.stem.split("_")[0]
    return {
        "code": code,
        "name": fm.get("name", md_file.stem),
        "category": md_file.parent.name,
        "type": fm.get("type", "reasoning"),
        "description": fm.get("description", ""),
        "tools_required": fm.get("tools_required", []),
        "output_format": fm.get("output_format", "json"),
        "path": str(md_file),
        "content_preview": content[:200] + "..." if len(content) > 200 else content,
    }


# ══════════════════════════════════════════
# AGENT ENDPOINTS
# ══════════════════════════════════════════


@router.get("/agents")
async def list_agents() -> list[dict]:
    """List all agents with metadata."""
    agents = []
    for md_file in sorted(AGENTS_DIR.glob("*.md")):
        if md_file.name == "README.md":
            continue
        text = md_file.read_text(encoding="utf-8")
        fm, body = _parse_frontmatter(text)
        agents.append({
            "name": md_file.stem,
            "display_name": fm.get("name", md_file.stem),
            "description": fm.get("description", ""),
            "model": fm.get("model", "sonnet"),
            "skills": fm.get("skills", []),
            "extra_tools": fm.get("extra_tools", []),
            "skill_count": len(fm.get("skills", [])),
            "prompt_length": len(body),
        })
    return agents


@router.get("/agents/{agent_name}")
async def get_agent(agent_name: str) -> dict:
    """Get full agent detail including prompt and skill details."""
    agent_path = AGENTS_DIR / f"{agent_name}.md"
    if not agent_path.exists():
        raise HTTPException(404, f"Agent not found: {agent_name}")

    text = agent_path.read_text(encoding="utf-8")
    fm, body = _parse_frontmatter(text)

    # Load skill details
    skills_detail = []
    for skill_name in fm.get("skills", []):
        skill_file = _find_skill_file(skill_name)
        if skill_file:
            skills_detail.append(_load_skill_meta(skill_file))
        else:
            skills_detail.append({"code": skill_name, "name": skill_name, "category": "unknown", "error": "file not found"})

    # Load assembled prompt (what Claude actually sees)
    from src.agents.loader import load_agent
    try:
        assembled = load_agent(agent_name)
        assembled_prompt = assembled["prompt"]
    except Exception as e:
        assembled_prompt = f"Error loading: {e}"

    return {
        "name": agent_name,
        "display_name": fm.get("name", agent_name),
        "description": fm.get("description", ""),
        "model": fm.get("model", "sonnet"),
        "skills": fm.get("skills", []),
        "extra_tools": fm.get("extra_tools", []),
        "role_prompt": body,
        "assembled_prompt_length": len(assembled_prompt),
        "assembled_prompt_preview": assembled_prompt[:2000] + "..." if len(assembled_prompt) > 2000 else assembled_prompt,
        "skills_detail": skills_detail,
    }


@router.put("/agents/{agent_name}")
async def update_agent(agent_name: str, req: UpdateAgentRequest) -> dict:
    """Update agent frontmatter and/or role prompt."""
    agent_path = AGENTS_DIR / f"{agent_name}.md"
    if not agent_path.exists():
        raise HTTPException(404, f"Agent not found: {agent_name}")

    text = agent_path.read_text(encoding="utf-8")
    fm, body = _parse_frontmatter(text)

    if req.model is not None:
        fm["model"] = req.model
    if req.description is not None:
        fm["description"] = req.description
    if req.skills is not None:
        fm["skills"] = req.skills
    if req.extra_tools is not None:
        fm["extra_tools"] = req.extra_tools
    if req.role_prompt is not None:
        body = req.role_prompt

    _write_md(agent_path, fm, body)
    logger.info(f"Updated agent: {agent_name}")
    return {"status": "updated", "agent": agent_name}


@router.get("/agents/{agent_name}/prompt")
async def get_assembled_prompt(agent_name: str) -> dict:
    """Get the full assembled system prompt (what Claude sees)."""
    from src.agents.loader import load_agent
    try:
        config = load_agent(agent_name)
        return {
            "agent": agent_name,
            "model": config["model"],
            "prompt": config["prompt"],
            "prompt_length": len(config["prompt"]),
            "tools": config["tools"],
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to assemble prompt: {e}")


@router.post("/agents/{agent_name}/test")
async def test_agent(agent_name: str, req: TestAgentRequest) -> dict:
    """Test-run an agent with a task. Returns output + timing."""
    from src.agents.runner import run_agent
    from src.api.marketing import _project_id

    result = await run_agent(
        agent_name=agent_name,
        task=req.task,
        experiment_id=_project_id(),
        phase="test",
        input_data=req.input_data,
        skill_code=req.skill_code,
        inject_patterns=False,
        max_tokens=4096,
    )
    return result


# ══════════════════════════════════════════
# SKILL ENDPOINTS
# ══════════════════════════════════════════


@router.get("/skills")
async def list_skills() -> list[dict]:
    """List all skills grouped by category."""
    skills = []
    for category_dir in sorted(SKILLS_DIR.iterdir()):
        if not category_dir.is_dir():
            continue
        for md_file in sorted(category_dir.glob("*.md")):
            skills.append(_load_skill_meta(md_file))
    return skills


@router.get("/skills/{code}")
async def get_skill(code: str) -> dict:
    """Get full skill content + metadata."""
    skill_file = _find_skill_file(code)
    if not skill_file:
        raise HTTPException(404, f"Skill not found: {code}")

    text = skill_file.read_text(encoding="utf-8")
    fm, content = _parse_frontmatter(text)

    # Find which agents use this skill
    used_by = []
    for agent_file in AGENTS_DIR.glob("*.md"):
        if agent_file.name == "README.md":
            continue
        agent_text = agent_file.read_text(encoding="utf-8")
        agent_fm, _ = _parse_frontmatter(agent_text)
        if code in agent_fm.get("skills", []):
            used_by.append(agent_file.stem)

    return {
        "code": fm.get("code", code),
        "name": fm.get("name", ""),
        "category": skill_file.parent.name,
        "type": fm.get("type", "reasoning"),
        "description": fm.get("description", ""),
        "tools_required": fm.get("tools_required", []),
        "output_format": fm.get("output_format", "json"),
        "content": content,
        "used_by_agents": used_by,
        "path": str(skill_file),
    }


@router.put("/skills/{code}")
async def update_skill(code: str, req: UpdateSkillRequest) -> dict:
    """Update skill metadata and/or content."""
    skill_file = _find_skill_file(code)
    if not skill_file:
        raise HTTPException(404, f"Skill not found: {code}")

    text = skill_file.read_text(encoding="utf-8")
    fm, content = _parse_frontmatter(text)

    if req.name is not None:
        fm["name"] = req.name
    if req.description is not None:
        fm["description"] = req.description
    if req.content is not None:
        content = req.content

    _write_md(skill_file, fm, content)
    logger.info(f"Updated skill: {code}")
    return {"status": "updated", "code": code}


@router.post("/skills")
async def create_skill(req: CreateSkillRequest) -> dict:
    """Create a new skill .md file."""
    # Validate category
    valid_categories = ["analysis", "creation", "growth", "research", "strategy", "decision"]
    if req.category not in valid_categories:
        raise HTTPException(400, f"Category must be one of: {valid_categories}")

    # Check doesn't exist
    if _find_skill_file(req.code):
        raise HTTPException(409, f"Skill {req.code} already exists")

    category_dir = SKILLS_DIR / req.category
    category_dir.mkdir(exist_ok=True)

    filename = f"{req.code}_{req.name.replace(' ', '_').replace('-', '_')}.md"
    skill_path = category_dir / filename

    fm = {
        "code": req.code,
        "name": req.name,
        "type": req.skill_type,
        "category": req.category,
        "description": req.description,
        "output_format": "json",
    }
    if req.tools_required:
        fm["tools_required"] = req.tools_required

    _write_md(skill_path, fm, req.content or "## Mục đích\n\n(Chưa có nội dung)\n")
    logger.info(f"Created skill: {req.code} at {skill_path}")
    return {"status": "created", "code": req.code, "path": str(skill_path)}


# ══════════════════════════════════════════
# AGENT RUN HISTORY
# ══════════════════════════════════════════


@router.get("/runs")
async def list_agent_runs(
    agent_name: str | None = None,
    skill_code: str | None = None,
    limit: int = 30,
) -> list[dict]:
    """Get recent agent execution history from DB."""
    from sqlalchemy import select, desc
    from src.db.models import AgentOutput
    from src.db.session import SessionLocal

    async with SessionLocal() as session:
        q = select(AgentOutput).order_by(desc(AgentOutput.created_at)).limit(limit)
        if agent_name:
            q = q.where(AgentOutput.agent_name == agent_name)
        if skill_code:
            q = q.where(AgentOutput.skill_code == skill_code)
        result = await session.execute(q)
        rows = result.scalars().all()

    return [
        {
            "id": r.id,
            "agent_name": r.agent_name,
            "skill_code": r.skill_code,
            "phase": r.phase,
            "experiment_id": r.experiment_id,
            "duration_ms": r.duration_ms,
            "cost_usd": r.cost_usd,
            "output_preview": str(r.output_data)[:300] if r.output_data else None,
            "has_errors": bool(r.output_data and isinstance(r.output_data, dict) and r.output_data.get("_validation_errors")),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]


# ══════════════════════════════════════════
# CONTRACTS
# ══════════════════════════════════════════


@router.get("/contracts")
async def list_contracts() -> dict:
    """Get all agent output contracts."""
    from src.agents.contracts import AGENT_CONTRACTS
    return AGENT_CONTRACTS
