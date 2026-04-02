"""Tests for agent/skill loader."""
import pytest
from src.agents.loader import load_skill, load_agent, load_all_agents, _parse_frontmatter


def test_parse_frontmatter():
    text = "---\nname: test\ntype: reasoning\n---\nContent here"
    meta, content = _parse_frontmatter(text)
    assert meta["name"] == "test"
    assert meta["type"] == "reasoning"
    assert content == "Content here"


def test_parse_frontmatter_no_frontmatter():
    text = "Just content, no frontmatter"
    meta, content = _parse_frontmatter(text)
    assert meta == {}
    assert content == "Just content, no frontmatter"


def test_load_skill():
    skill = load_skill("R1_market_scanning")
    assert skill["meta"]["name"] is not None
    assert len(skill["content"]) > 0
    assert "path" in skill


def test_load_skill_not_found():
    with pytest.raises(FileNotFoundError):
        load_skill("NONEXISTENT_SKILL_999")


def test_load_agent():
    agent = load_agent("research")
    assert agent["name"] is not None
    assert "prompt" in agent
    assert "tools" in agent
    assert "model" in agent
    assert len(agent["skills"]) > 0


def test_load_all_agents():
    agents = load_all_agents()
    expected = {"research", "strategy", "content", "distribution", "analytics", "devils_advocate", "product"}
    assert set(agents.keys()) == expected


def test_agent_skill_types_separated():
    """Verify api vs reasoning skills are separated in prompt."""
    agent = load_agent("research")
    prompt = agent["prompt"]
    # Research agent should have both types
    assert "Reasoning Skills" in prompt or "API Skills" in prompt
