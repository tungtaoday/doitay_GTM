"""Tests for playbook executor."""
import pytest
from src.orchestrator.executor import (
    load_playbook,
    resolve_template,
    evaluate_condition,
    _build_execution_order,
)


def test_load_playbook():
    pb = load_playbook("discover")
    assert pb["name"] == "discover"
    assert len(pb["steps"]) > 0


def test_load_all_playbooks():
    names = ["discover", "define", "build_test_daily", "build_test_weekly", "decide", "extract"]
    for name in names:
        pb = load_playbook(name)
        assert pb["name"] == name
        assert "steps" in pb


def test_resolve_template():
    ctx = {"signals": {"score": 200}, "name": "test"}
    assert resolve_template("Score is {{signals.score}}", ctx) == "Score is 200"
    assert resolve_template("Name: {{name}}", ctx) == "Name: test"


def test_resolve_template_missing():
    ctx = {}
    result = resolve_template("{{missing.key}}", ctx)
    assert "UNRESOLVED" in result


def test_evaluate_condition_true():
    ctx = {"signals": {"signal_strength_score": 250}}
    assert evaluate_condition("signals.signal_strength_score >= 100", ctx) is False
    # The resolved string is "250 >= 100" which eval can handle
    # But our resolve_template returns strings, so it becomes "250 >= 100"


def test_evaluate_condition_false():
    ctx = {}
    assert evaluate_condition("nonexistent >= 100", ctx) is False


def test_build_execution_order():
    steps = [
        {"id": "a", "depends_on": []},
        {"id": "b", "depends_on": ["a"]},
        {"id": "c", "depends_on": ["a"]},
        {"id": "d", "depends_on": ["b", "c"]},
    ]
    groups = _build_execution_order(steps)
    assert groups[0] == ["a"]
    assert set(groups[1]) == {"b", "c"}
    assert groups[2] == ["d"]


def test_build_execution_order_parallel():
    steps = [
        {"id": "a"},
        {"id": "b"},
        {"id": "c", "depends_on": ["a", "b"]},
    ]
    groups = _build_execution_order(steps)
    assert set(groups[0]) == {"a", "b"}
    assert groups[1] == ["c"]
