from __future__ import annotations

import re
from pathlib import Path

import yaml

from src.config import AGENTS_DIR, SKILLS_DIR


def load_skill(skill_name: str) -> dict:
    """Load 1 skill .md file -> {meta, content, path}."""
    for category_dir in SKILLS_DIR.iterdir():
        if not category_dir.is_dir():
            continue
        for md_file in category_dir.glob(f"*{skill_name}*.md"):
            text = md_file.read_text(encoding="utf-8")
            frontmatter, content = _parse_frontmatter(text)
            return {"meta": frontmatter, "content": content, "path": str(md_file)}
    raise FileNotFoundError(f"Skill not found: {skill_name}")


def load_agent(
    agent_name: str,
    inject_patterns: list[dict] | None = None,
    focus_skill: str | None = None,
    focus_skills: list[str] | None = None,
    max_prompt_chars: int = 28_000,
) -> dict:
    """Load agent .md file + skills -> dict with prompt, tools, model.

    Args:
        focus_skill: If set, only load this skill fully; others get a 1-line summary.
        focus_skills: If set, load these skills fully (overrides focus_skill).
                     Helps keep prompt under Windows CLI arg limit (~32K).
        max_prompt_chars: Safety cap for system prompt length.
    """
    agent_path = AGENTS_DIR / f"{agent_name}.md"
    text = agent_path.read_text(encoding="utf-8")
    frontmatter, role_prompt = _parse_frontmatter(text)

    # Build set of skills to load fully
    _focus_set: set[str] = set()
    if focus_skills:
        _focus_set.update(focus_skills)
    elif focus_skill:
        _focus_set.add(focus_skill)

    api_skill_texts: list[str] = []
    reasoning_skill_texts: list[str] = []
    tools_from_skills: set[str] = set()

    for skill_name in frontmatter.get("skills", []):
        skill = load_skill(skill_name)
        skill_type = skill["meta"].get("type", "reasoning")
        code = skill["meta"].get("code", "")
        name = skill["meta"].get("name", "")

        # If focus set is defined, only include full content for matching skills
        if _focus_set and code not in _focus_set and skill_name not in _focus_set:
            summary = f"### Skill: {code} — {name} [{skill_type.upper()}] (available)\n"
            if skill_type == "api":
                api_skill_texts.append(summary)
                for tool_name in skill["meta"].get("tools_required", []):
                    tools_from_skills.add(tool_name)
            else:
                reasoning_skill_texts.append(summary)
            continue

        skill_text = (
            f"### Skill: {code} — {name} [{skill_type.upper()}]\n\n"
            f"{skill['content']}"
        )

        if skill_type == "api":
            api_skill_texts.append(skill_text)
            for tool_name in skill["meta"].get("tools_required", []):
                tools_from_skills.add(tool_name)
        else:
            reasoning_skill_texts.append(skill_text)

    sections = [role_prompt, "\n\n---\n"]

    if inject_patterns:
        sections.append("\n## Winning Patterns (from past experiments)\n\n")
        for p in inject_patterns[:10]:
            sections.append(
                f"- **{p['title']}** ({p['result']}): {p['description']}\n"
                f"  Evidence: {p.get('evidence', 'N/A')}\n\n"
            )

    if reasoning_skill_texts:
        sections.append("\n## Reasoning Skills (follow these instructions)\n\n")
        sections.append("\n---\n".join(reasoning_skill_texts))

    if api_skill_texts:
        sections.append("\n\n## API Skills (use corresponding MCP tools)\n\n")
        sections.append("\n---\n".join(api_skill_texts))

    full_prompt = "".join(sections)

    # Safety: truncate if still too long (Windows CLI arg limit)
    if len(full_prompt) > max_prompt_chars:
        full_prompt = full_prompt[:max_prompt_chars] + "\n\n[... truncated for length]"

    all_tools = list(set(frontmatter.get("extra_tools", [])) | tools_from_skills)

    return {
        "name": frontmatter.get("name", agent_name),
        "description": frontmatter.get("description", ""),
        "prompt": full_prompt,
        "tools": all_tools,
        "model": frontmatter.get("model", "sonnet"),
        "skills": frontmatter.get("skills", []),
    }


def load_all_agents(inject_patterns: list[dict] | None = None) -> dict[str, dict]:
    """Load all agent .md files -> dict of agent configs."""
    agents: dict[str, dict] = {}
    for md_file in AGENTS_DIR.glob("*.md"):
        if md_file.name == "README.md":
            continue
        name = md_file.stem
        agents[name] = load_agent(name, inject_patterns=inject_patterns)
    return agents


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if match:
        frontmatter = yaml.safe_load(match.group(1)) or {}
        content = match.group(2).strip()
        return frontmatter, content
    return {}, text.strip()
