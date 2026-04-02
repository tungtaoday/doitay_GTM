from __future__ import annotations

import jsonschema

from src.agents.contracts import AGENT_CONTRACTS


def validate_agent_input(agent_name: str, input_data: dict) -> dict:
    """Validate agent input against contract schema."""
    contract = AGENT_CONTRACTS.get(agent_name)
    if not contract:
        return {"valid": True, "errors": []}
    try:
        jsonschema.validate(input_data, contract["input_schema"])
        return {"valid": True, "errors": []}
    except jsonschema.ValidationError as e:
        return {"valid": False, "errors": [e.message]}


def validate_agent_output(agent_name: str, output_data: dict) -> dict:
    """Validate agent output against contract schema."""
    contract = AGENT_CONTRACTS.get(agent_name)
    if not contract:
        return {"valid": True, "errors": []}
    try:
        jsonschema.validate(output_data, contract["output_schema"])
        return {"valid": True, "errors": []}
    except jsonschema.ValidationError as e:
        return {"valid": False, "errors": [e.message]}
