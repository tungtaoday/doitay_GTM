"""Tests for agent contracts and validation."""
from src.agents.contracts import AGENT_CONTRACTS
from src.agents.validator import validate_agent_output


def test_all_agents_have_contracts():
    expected = {"research", "strategy", "content", "distribution", "analytics", "devils_advocate", "product"}
    assert set(AGENT_CONTRACTS.keys()) == expected


def test_contract_structure():
    for name, contract in AGENT_CONTRACTS.items():
        assert "input_schema" in contract, f"{name} missing input_schema"
        assert "output_schema" in contract, f"{name} missing output_schema"
        assert "kpis" in contract, f"{name} missing kpis"


def test_validate_research_output_valid():
    output = {
        "signals": [{"type": "fragmentation", "score": 200}],
        "audience_intel": {"pain_phrases": ["đau"], "watering_holes": ["fb"]},
        "segments": [{"name": "seg1"}],
    }
    result = validate_agent_output("research", output)
    assert result["valid"] is True


def test_validate_research_output_invalid():
    output = {"signals": []}  # missing required fields
    result = validate_agent_output("research", output)
    assert result["valid"] is False
    assert len(result["errors"]) > 0


def test_validate_analytics_output():
    output = {
        "cmf_score": 0.45,
        "traction_score": 0.3,
    }
    result = validate_agent_output("analytics", output)
    assert result["valid"] is True


def test_validate_devils_advocate_output():
    output = {
        "critical_weaknesses": ["weak cold start"],
        "unvalidated_assumptions": ["demand exists"],
        "verdict": "caution",
    }
    result = validate_agent_output("devils_advocate", output)
    assert result["valid"] is True
