from __future__ import annotations

import enum
from datetime import datetime
from zoneinfo import ZoneInfo

_VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")


def _now_vn() -> datetime:
    return datetime.now(_VN_TZ)

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


# ── Enums (stored as strings in SQLite) ──


class PipelinePhase(str, enum.Enum):
    DISCOVER = "discover"
    DEFINE = "define"
    CEO_CHECKPOINT = "ceo_checkpoint"
    BUILD_TEST = "build_test"
    CEO_CHECKPOINT_MIDPOINT = "ceo_checkpoint_midpoint"
    DECIDE = "decide"
    EXTRACT = "extract"
    COMPLETED = "completed"
    KILLED = "killed"


class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    POSTED = "posted"
    FAILED = "failed"


# ── PIPELINE STATE ──


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    vertical = Column(String, nullable=False)
    geography = Column(String, nullable=False)

    phase = Column(String, default=PipelinePhase.DISCOVER.value)
    week_number = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    cmf_score = Column(Float, nullable=True)
    traction_score = Column(Float, nullable=True)

    created_at = Column(DateTime, default=_now_vn)
    updated_at = Column(DateTime, default=_now_vn, onupdate=_now_vn)

    agent_outputs = relationship("AgentOutput", back_populates="experiment")
    content_items = relationship("ContentItem", back_populates="experiment")
    metrics = relationship("WeeklyMetric", back_populates="experiment")
    approvals = relationship("CEOApproval", back_populates="experiment")


# ── AGENT OUTPUTS ──


class AgentOutput(Base):
    __tablename__ = "agent_outputs"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    skill_code = Column(String, nullable=True)
    phase = Column(String, nullable=False)

    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=False)
    raw_text = Column(Text, nullable=True)

    session_id = Column(String, nullable=True)
    cost_usd = Column(Float, nullable=True)
    duration_ms = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=_now_vn)

    experiment = relationship("Experiment", back_populates="agent_outputs")


# ── CONTENT PIPELINE ──


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)

    platform = Column(String, nullable=False)  # twitter, instagram, facebook, linkedin, etc.
    content_type = Column(String, nullable=False)  # short, thread, reel, carousel, story, article
    pillar = Column(String, nullable=True)

    hook = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    cta = Column(Text, nullable=True)
    media_urls = Column(JSON, nullable=True)

    status = Column(String, default=ContentStatus.DRAFT.value)
    scheduled_at = Column(DateTime, nullable=True)
    posted_at = Column(DateTime, nullable=True)
    post_url = Column(String, nullable=True)

    # Performance
    impressions = Column(Integer, nullable=True)
    engagements = Column(Integer, nullable=True)
    clicks = Column(Integer, nullable=True)
    replies = Column(Integer, nullable=True)
    reposts = Column(Integer, nullable=True)
    bookmarks = Column(Integer, nullable=True)
    saves = Column(Integer, nullable=True)  # Instagram saves
    shares = Column(Integer, nullable=True)  # Facebook shares
    reactions = Column(Integer, nullable=True)  # Facebook reactions

    created_at = Column(DateTime, default=_now_vn)

    experiment = relationship("Experiment", back_populates="content_items")


# ── METRICS ──


class WeeklyMetric(Base):
    __tablename__ = "weekly_metrics"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    week_number = Column(Integer, nullable=False)

    engagement_quality = Column(Float, nullable=True)
    audience_relevance = Column(Float, nullable=True)
    conversion_signal = Column(Float, nullable=True)
    cmf_score = Column(Float, nullable=True)

    acquisition_signal = Column(Float, nullable=True)
    activation_signal = Column(Float, nullable=True)
    retention_signal = Column(Float, nullable=True)
    traction_score = Column(Float, nullable=True)

    raw_metrics = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=_now_vn)

    experiment = relationship("Experiment", back_populates="metrics")


# ── CEO DECISIONS ──


class CEOApproval(Base):
    __tablename__ = "ceo_approvals"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    checkpoint = Column(String, nullable=False)
    phase = Column(String, nullable=False)

    agent_recommendation = Column(JSON, nullable=False)
    agent_rationale = Column(Text, nullable=True)

    decision = Column(String, nullable=True)
    ceo_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=_now_vn)

    experiment = relationship("Experiment", back_populates="approvals")


# ── PATTERN LIBRARY ──


class Pattern(Base):
    __tablename__ = "patterns"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=True)

    category = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    result = Column(String, nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)

    applies_to = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)

    created_at = Column(DateTime, default=_now_vn)


# ── HYPOTHESIS BACKLOG ──


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    business_type = Column(String, nullable=True)

    tier = Column(Integer, default=1)
    signal_type = Column(String, nullable=True)
    signal_score = Column(Integer, nullable=True)

    source_agent = Column(String, nullable=True)
    source_data = Column(JSON, nullable=True)  # tracks which signals/pain_phrases generated this
    stress_test = Column(JSON, nullable=True)

    is_active = Column(Boolean, default=True)
    promoted_to_experiment_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=_now_vn)
    updated_at = Column(DateTime, default=_now_vn, onupdate=_now_vn)


# ── AUDIENCE INTELLIGENCE ──


class AudienceIntel(Base):
    __tablename__ = "audience_intel"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)

    pain_phrase = Column(Text, nullable=False)
    source_platform = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    frequency = Column(Integer, default=1)
    sentiment = Column(String, nullable=True)
    segment = Column(String, nullable=True)

    used_in_content = Column(Boolean, default=False)
    content_id = Column(String, nullable=True)
    performance_score = Column(Float, nullable=True)

    created_at = Column(DateTime, default=_now_vn)
    updated_at = Column(DateTime, default=_now_vn, onupdate=_now_vn)


# ── SYSTEM STATE ──


class SystemState(Base):
    __tablename__ = "system_state"

    id = Column(String, primary_key=True, default="singleton")
    current_phase = Column(Integer, default=1)
    active_experiment_id = Column(String, nullable=True)
    automation_mode = Column(String, default="semi_auto")

    total_experiments = Column(Integer, default=0)
    total_patterns = Column(Integer, default=0)
    total_content_posted = Column(Integer, default=0)

    last_daily_run = Column(DateTime, nullable=True)
    last_weekly_run = Column(DateTime, nullable=True)
    last_event_processed = Column(DateTime, nullable=True)

    pending_events = Column(JSON, default=list)

    updated_at = Column(DateTime, default=_now_vn, onupdate=_now_vn)


# ── EVENT LOG ──


class EventLog(Base):
    __tablename__ = "event_log"

    id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False)
    experiment_id = Column(String, nullable=True)
    payload = Column(JSON, nullable=True)
    triggered_playbook = Column(String, nullable=True)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_now_vn)


# ── INTEL SCAN REPORTS ──


class ScanReport(Base):
    """Stored results from market/competitor scans for history."""

    __tablename__ = "scan_reports"

    id = Column(String, primary_key=True)
    scan_type = Column(String, nullable=False)  # "market" or "competitor"
    data = Column(JSON, nullable=True)  # Full scan result
    summary = Column(Text, nullable=True)  # Short summary for display
    created_at = Column(DateTime, default=_now_vn)


# ── DECISION INSIGHTS (Synthetic Interview Pipeline) ──


class DecisionInsight(Base):
    """Stores Decision Map outputs from Synthetic Interview pipeline."""

    __tablename__ = "decision_insights"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, nullable=False)

    # Pipeline outputs
    personas = Column(JSON, nullable=True)  # List of persona profiles
    interviews = Column(JSON, nullable=True)  # Interview transcripts
    decision_map = Column(JSON, nullable=True)  # buy_triggers, objections, deal_breakers, etc.
    validation = Column(JSON, nullable=True)  # Validation results with confidence scores
    growth_actions = Column(JSON, nullable=True)  # Recommended actions

    # Metadata
    source_pain_phrases_count = Column(Integer, default=0)
    source_signals_count = Column(Integer, default=0)
    total_personas = Column(Integer, default=0)
    total_interviews = Column(Integer, default=0)
    verified_insights_count = Column(Integer, default=0)

    # Scoring
    avg_confidence = Column(Float, nullable=True)
    pipeline_status = Column(String, default="pending")  # pending, complete, partial, failed

    created_at = Column(DateTime, default=_now_vn)
    updated_at = Column(DateTime, default=_now_vn, onupdate=_now_vn)


# ── MARKETING SCHEDULED POSTS ──


class ScheduledPost(Base):
    """Posts planned via weekly content planning workflow."""

    __tablename__ = "scheduled_posts"

    id = Column(String, primary_key=True)

    # Content
    hook = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    cta = Column(Text, nullable=True)
    hashtags = Column(JSON, nullable=True)  # ["#tag1", "#tag2"]
    angle = Column(String, nullable=True)  # Cái Uy / Sĩ Diện / Cơ Hội
    content_type = Column(String, default="post")  # post | reel | carousel | story
    content_format = Column(String, nullable=True)  # longform | shortform | storytelling | zero_click | cta_focused

    # Image
    image_prompt = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    # Reel / Video
    reel_script = Column(JSON, nullable=True)  # Full reel script with frames
    video_path = Column(String, nullable=True)  # Generated video file
    video_url = Column(String, nullable=True)  # Served video URL

    # Scheduling
    scheduled_date = Column(String, nullable=False)  # "2026-03-24"
    scheduled_time = Column(String, nullable=True)  # "10:00"
    platform = Column(String, default="facebook")

    # Status: draft → approved → posted / rejected
    status = Column(String, default="draft")

    # Publishing result
    post_url = Column(String, nullable=True)
    fb_post_id = Column(String, nullable=True)
    posted_at = Column(DateTime, nullable=True)

    # Performance (updated later)
    impressions = Column(Integer, nullable=True)  # total views (post_impressions)
    reach = Column(Integer, nullable=True)  # unique people (post_impressions_unique)
    engagements = Column(Integer, nullable=True)
    clicks = Column(Integer, nullable=True)
    comments = Column(Integer, nullable=True)
    shares = Column(Integer, nullable=True)
    reactions = Column(Integer, nullable=True)

    # Grouping
    week_label = Column(String, nullable=True)  # "2026-W13"

    created_at = Column(DateTime, default=_now_vn)
    updated_at = Column(DateTime, default=_now_vn, onupdate=_now_vn)
