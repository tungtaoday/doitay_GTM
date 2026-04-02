from __future__ import annotations

import enum
from dataclasses import dataclass, field


class Phase(str, enum.Enum):
    DISCOVER = "discover"
    DEFINE = "define"
    CEO_CHECKPOINT = "ceo_checkpoint"
    BUILD_TEST = "build_test"
    CEO_CHECKPOINT_MIDPOINT = "ceo_checkpoint_midpoint"
    DECIDE = "decide"
    EXTRACT = "extract"
    COMPLETED = "completed"
    KILLED = "killed"


PHASE_PLAYBOOK: dict[Phase, str | None] = {
    Phase.DISCOVER: "discover",
    Phase.DEFINE: "define",
    Phase.CEO_CHECKPOINT: None,
    Phase.BUILD_TEST: None,
    Phase.CEO_CHECKPOINT_MIDPOINT: None,
    Phase.DECIDE: "decide",
    Phase.EXTRACT: "extract",
}


@dataclass
class PipelineContext:
    experiment_id: str
    business_type: str
    vertical: str
    geography: str
    current_phase: Phase
    week_number: int = 0
    session_ids: dict[str, str] = field(default_factory=dict)
    playbook_runs: dict[str, str] = field(default_factory=dict)
