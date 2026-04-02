# Agent System Blueprint — Marketing Department AI
> Xây dựng hệ thống multi-agent bằng Claude Agent SDK để vận hành phòng marketing tự động

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Hiện trạng codebase & kế hoạch chuyển đổi](#2-hiện-trạng-codebase--kế-hoạch-chuyển-đổi)
3. [Cấu trúc project mới](#3-cấu-trúc-project-mới)
4. [Database Schema](#4-database-schema)
5. [7 Agent Definitions](#5-7-agent-definitions)
6. [MCP Tools — Biến skills thành tools](#6-mcp-tools--biến-skills-thành-tools)
7. [Playbook YAML — Logic điều phối](#7-playbook-yaml--logic-điều-phối)
8. [Event System — Hybrid Time + Event](#8-event-system--hybrid-time--event)
9. [Execution Contracts](#9-execution-contracts)
10. [Feedback Loops — Closed-Loop Learning](#10-feedback-loops--closed-loop-learning)
11. [Orchestrator — Bộ não điều phối](#11-orchestrator--bộ-não-điều-phối)
12. [CEO Dashboard — Chuyển đổi Next.js frontend](#12-ceo-dashboard--chuyển-đổi-nextjs-frontend)
13. [Daily Automation Loop](#13-daily-automation-loop)
14. [Build Order — 7 Sprints](#14-build-order--7-sprints)
15. [Chi phí vận hành ước tính](#15-chi-phí-vận-hành-ước-tính)

---

## 1. Tổng quan kiến trúc

### Trước (hiện tại)

```
marketplace-factory/
  Next.js app (frontend + API routes)
  30+ tool wrappers (chưa kết nối thực)
  8 role prompts (hardcoded trong promptBuilder.ts)
  CEO phải tự thao tác mọi thứ qua UI
```

### Sau (mục tiêu) — 4-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CEO DASHBOARD (Next.js)                      │
│  Approve/Reject · View Reports · Monitor Pipeline · Chat         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────────┐
│  LAYER 1: ORCHESTRATOR (WHEN — bộ não điều phối)                │
│  Event Processor · Condition Evaluator · State Machine           │
│  → Quyết định KHI NÀO chạy gì, dựa trên events + time + state  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ triggers
┌───────────────────────────▼─────────────────────────────────────┐
│  LAYER 2: PLAYBOOK YAML (WHAT — kịch bản)                       │
│  discover.yaml · define.yaml · build_test_daily.yaml · ...       │
│  → Định nghĩa CÁI GÌ phải chạy: steps, conditions, gates       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ dispatches
┌───────────────────────────▼─────────────────────────────────────┐
│  LAYER 3: AGENT .MD (HOW — vai trò + năng lực)                  │
│  research.md · strategy.md · content.md · distribution.md · ...  │
│  → Định nghĩa CÁCH LÀM: role prompt, perspective, rules         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ uses
┌───────────────────────────▼─────────────────────────────────────┐
│  LAYER 4: SKILL .MD (WHAT EXACTLY — kỹ năng atomic)             │
│  R1_market_scanning.md · C3_shortform_writing.md · A6_cmf.md     │
│  → Input → Process → Output format. Reusable. Testable.          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ calls
┌───────────────────────────▼─────────────────────────────────────┐
│  SHARED INFRASTRUCTURE                                           │
│  SQLite (WAL) · MCP Tools (API) · Event Bus · Pattern Library    │
│  audience_intel · content_library · experiments · system_state    │
└─────────────────────────────────────────────────────────────────┘
```

### Tại sao 4 layers?

```
Vấn đề cũ: Orchestrator làm quá nhiều (WHEN + WHAT + HOW) → khó debug, khó mở rộng
Giải pháp:  Tách concerns rõ ràng:

Layer 1 (Orchestrator): "6AM rồi → trigger daily content playbook"
Layer 2 (Playbook):     "Chạy content agent với skill C3, rồi distribution agent"
Layer 3 (Agent):        "Tôi là Content Agent, tôi viết theo brand voice này"
Layer 4 (Skill):        "C3 yêu cầu: hook + body + CTA, max 280 chars"

Thêm playbook mới? → Tạo .yaml file → xong
Thêm skill mới?    → Tạo .md file → xong
Đổi schedule?      → Sửa orchestrator config → xong
Đổi cách viết?     → Sửa agent .md → xong
```

### Nguyên tắc thiết kế

```
1. AGENT = ROLE       → Mỗi agent là 1 identity (role + rules + perspective)
2. SKILL = ATOMIC     → Mỗi skill là input→output, reusable across agents
3. PLAYBOOK = LOGIC   → YAML defines WHAT runs in WHAT order with conditions
4. ORCHESTRATOR = WHEN → Event-driven + time-based hybrid, không hardcode logic
5. CEO = HUMAN        → Chỉ 3 checkpoints + weekly review, không micro-manage
6. DATA = SHARED      → Tất cả agents đọc/ghi cùng 1 SQLite database
7. LIGHTWEIGHT        → SQLite + .md files + .yaml files = zero infrastructure
8. CLOSED-LOOP        → Content → Metrics → Analysis → Pattern → Better Content
```

---

## 2. Hiện trạng codebase & kế hoạch chuyển đổi

### Cái gì GIỮ NGUYÊN

```
marketplace-factory/
  ├── src/app/page.tsx              → Rewrite thành CEO Dashboard 3-column
  ├── src/app/layout.tsx            → Giữ, thêm fonts
  ├── src/app/globals.css           → Giữ, thêm CSS vars
  ├── src/components/               → Giữ cockpit/ components đã build
  ├── src/lib/types.ts              → Mở rộng thêm types mới
  ├── src/lib/hooks.ts              → Giữ
  ├── prisma/schema.prisma          → Giữ SQLite + thêm models
  └── package.json                  → Giữ dependencies
```

### Cái gì XÓA / THAY THẾ

```
XÓA:
  src/lib/promptBuilder.ts          → Agents tự có system prompt
  src/lib/promptService.ts          → Không cần, agents handle
  src/lib/tools.ts                  → UI tool definitions → replace
  src/lib/tools/ai.ts               → Move sang Python MCP tools
  src/lib/tools/crawl.ts            → Move sang Python MCP tools
  src/lib/tools/data.ts             → Move sang Python MCP tools
  src/lib/tools/outreach.ts         → Move sang Python MCP tools
  src/lib/tools/analytics.ts        → Move sang Python MCP tools
  src/lib/tools/automation.ts       → Move sang Python MCP tools
  src/lib/tools/payment.ts          → Move sang Python MCP tools
  src/app/api/chat/route.ts         → Replace bằng call to Orchestrator
  src/app/api/cron/*/               → Replace bằng Python scheduler

THAY THẾ:
  src/app/api/chat/route.ts
    CŨ:  Frontend → Claude API direct (1 role prompt)
    MỚI: Frontend → Orchestrator API → đúng Agent → response

  src/app/api/tools/route.ts
    CŨ:  List tool definitions cho UI
    MỚI: List agent statuses + recent outputs

  Tất cả cron routes
    CŨ:  Node.js scripts gọi trực tiếp
    MỚI: Python scheduler gọi Orchestrator
```

### Cái gì TẠO MỚI

```
agent-system/                       ← TOÀN BỘ BACKEND MỚI (Python)
  ├── orchestrator.py               ← Pipeline state machine
  ├── agents/                       ← 7 agent definitions
  ├── tools/                        ← MCP tool servers
  ├── scheduler.py                  ← Daily/weekly automation
  ├── api.py                        ← FastAPI server cho Dashboard
  └── db.py                         ← Database access layer

marketplace-factory/                ← FRONTEND (giữ Next.js)
  ├── src/app/api/orchestrator/     ← Proxy to Python backend
  └── src/components/cockpit/       ← CEO Dashboard UI
```

---

## 3. Cấu trúc project mới

```
C:\doitay_all_in_one\Strategy\
├── CLAUDE.md                       (giữ — system rules)
├── skills-architecture.md          (giữ — reference tổng quan)
├── marketing-journey-frameworks-2025.md (giữ — reference)
├── AGENT_SYSTEM_BLUEPRINT.md       (file này)
│
├── agent-system/                   ★ MỚI — Python backend
│   ├── pyproject.toml
│   ├── .env
│   ├── data/
│   │   └── agent.db                ← SQLite database (WAL mode)
│   │
│   ├── playbooks/                  ★ PLAYBOOK YAML — orchestration logic
│   │   ├── discover.yaml           ← DISCOVER phase steps
│   │   ├── define.yaml             ← DEFINE phase steps
│   │   ├── build_test_daily.yaml   ← Daily content loop
│   │   ├── build_test_weekly.yaml  ← Weekly analysis + report
│   │   ├── decide.yaml             ← Decision phase steps
│   │   └── extract.yaml            ← Pattern extraction steps
│   │
│   ├── skills/                     ★ SKILL FILES — markdown, không code
│   │   ├── README.md               ← Hướng dẫn thêm/sửa skills
│   │   │
│   │   ├── research/               ← R category
│   │   │   ├── R1_market_scanning.md
│   │   │   ├── R2_social_listening.md
│   │   │   ├── R3_influencer_mapping.md
│   │   │   ├── R4_competitive_intelligence.md
│   │   │   ├── R5_content_benchmarking.md
│   │   │   ├── R6_customer_research.md
│   │   │   └── R7_pricing_research.md
│   │   │
│   │   ├── strategy/               ← S category
│   │   │   ├── S1_thesis_formation.md
│   │   │   ├── S2_segmentation.md
│   │   │   ├── S3_value_proposition.md
│   │   │   ├── S4_offer_design.md
│   │   │   ├── S5_content_pillars.md
│   │   │   ├── S6_channel_strategy.md
│   │   │   ├── S7_experiment_design.md
│   │   │   └── S8_go_to_market.md
│   │   │
│   │   ├── creation/               ← C category
│   │   │   ├── C1_hook_writing.md
│   │   │   ├── C2_longform_writing.md
│   │   │   ├── C3_shortform_writing.md
│   │   │   ├── C4_storytelling.md
│   │   │   ├── C5_visual_content.md
│   │   │   ├── C6_zero_click_content.md
│   │   │   ├── C7_cta_conversion_copy.md
│   │   │   ├── C8_mvp_prototype.md
│   │   │   ├── C9_offer_packaging.md
│   │   │   └── C10_repurposing.md
│   │   │
│   │   ├── growth/                 ← G category
│   │   │   ├── G1_strategic_engagement.md
│   │   │   ├── G2_community_building.md
│   │   │   ├── G3_profile_optimization.md
│   │   │   ├── G4_audience_nurturing.md
│   │   │   ├── G5_email_newsletter.md
│   │   │   ├── G6_paid_acquisition.md
│   │   │   ├── G7_outbound_sales.md
│   │   │   ├── G8_referral_partnership.md
│   │   │   ├── G9_scheduling_ops.md
│   │   │   └── G10_trend_riding.md
│   │   │
│   │   ├── analysis/               ← A category
│   │   │   ├── A1_stress_testing.md
│   │   │   ├── A2_opportunity_scoring.md
│   │   │   ├── A3_unit_economics.md
│   │   │   ├── A4_content_performance.md
│   │   │   ├── A5_traction_scoring.md
│   │   │   ├── A6_cmf_scoring.md
│   │   │   ├── A7_pattern_extraction.md
│   │   │   ├── A8_customer_analytics.md
│   │   │   └── A9_portfolio_analysis.md
│   │   │
│   │   └── decision/               ← D category
│   │       ├── D1_kill_pivot_continue.md
│   │       ├── D2_resource_allocation.md
│   │       ├── D3_phase_transition.md
│   │       ├── D4_build_buy_partner.md
│   │       ├── D5_strategy_pivot.md
│   │       └── D6_tension_resolution.md
│   │
│   ├── agents/                     ★ AGENT CONFIGS — markdown + loader
│   │   ├── README.md               ← Hướng dẫn thêm/sửa agents
│   │   ├── research.md             ← Agent role prompt + skill list
│   │   ├── strategy.md
│   │   ├── content.md
│   │   ├── distribution.md
│   │   ├── product.md
│   │   ├── analytics.md
│   │   └── devils_advocate.md
│   │
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py                 ← FastAPI entry point
│   │   ├── config.py               ← Settings (env vars, paths)
│   │   │
│   │   ├── orchestrator/
│   │   │   ├── __init__.py
│   │   │   ├── pipeline.py         ← State machine (DISCOVER→EXTRACT)
│   │   │   ├── executor.py         ← Playbook YAML executor
│   │   │   ├── event_bus.py        ← Event processor + condition evaluator
│   │   │   ├── dispatcher.py       ← Agent caller (Claude SDK query())
│   │   │   └── scheduler.py        ← Cron-like + event-based triggers
│   │   │
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── loader.py           ← Load .md files → AgentDefinition
│   │   │   └── skill_loader.py     ← Load skill .md files → inject into prompt
│   │   │
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── server.py           ← createSdkMcpServer() registry
│   │   │   ├── research_tools.py   ← R1-R7 API tools
│   │   │   ├── content_tools.py    ← C1-C10 generation tools
│   │   │   ├── growth_tools.py     ← G1-G10 distribution tools
│   │   │   ├── analysis_tools.py   ← A1-A9 analysis tools
│   │   │   ├── social_api.py       ← Twitter/LinkedIn/Reddit API wrappers
│   │   │   ├── search_api.py       ← Web search, scraping
│   │   │   └── db_tools.py         ← Database read/write tools
│   │   │
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── models.py           ← SQLAlchemy models (SQLite)
│   │   │   ├── session.py          ← DB connection (aiosqlite)
│   │   │   └── queries.py          ← Common queries
│   │   │
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── routes.py           ← FastAPI endpoints
│   │       └── schemas.py          ← Pydantic request/response models
│   │
│   └── tests/
│       ├── test_orchestrator.py
│       ├── test_agents.py
│       └── test_tools.py
│
├── marketplace-factory/            ★ CHỈNH SỬA — Next.js frontend
│   ├── prisma/
│   │   └── schema.prisma           → Giữ SQLite + thêm models mới
│   │
│   ├── src/app/
│   │   ├── page.tsx                → CEO Dashboard (3-column)
│   │   └── api/
│   │       ├── agent/route.ts      ★ MỚI — proxy to Python
│   │       ├── pipeline/route.ts   ★ MỚI — pipeline status
│   │       └── approve/route.ts    ★ MỚI — CEO approval endpoint
│   │
│   ├── src/components/
│   │   └── cockpit/                → Reuse existing + thêm agent panels
│   │       ├── AgentStatus.tsx     ★ MỚI — live agent activity
│   │       ├── PipelineFlow.tsx    ★ MỚI — visual pipeline
│   │       ├── ApprovalCard.tsx    ★ MỚI — approve/reject UI
│   │       └── ContentQueue.tsx    ★ MỚI — content review queue
│   │
│   └── src/lib/
│       ├── types.ts                → Thêm agent types
│       └── agentClient.ts         ★ MỚI — fetch wrapper cho Python API
│
└── (không cần docker-compose — SQLite = zero infrastructure)
```

---

## 4. Database Schema

### Giữ SQLite + WAL mode

```
Tại sao SQLite đủ:
  - 1 CEO, agents chạy mostly sequential (orchestrator điều phối)
  - WAL mode cho phép concurrent reads + 1 writer → đủ cho use case này
  - Zero infrastructure: không Docker, không server DB
  - File-based: backup = copy file, deploy = copy file
  - JSON columns vẫn work (SQLite JSON1 extension)

Khi nào cần upgrade PostgreSQL:
  - Nhiều CEO/users cùng dùng (multi-tenant)
  - Agents chạy heavy parallel writes (> 100 writes/sec)
  - Cần realtime push (LISTEN/NOTIFY)
  → Cho Phase 3+. Phase 1-2 SQLite thừa sức.
```

### Models (SQLAlchemy — Python side, SQLite backend)

```python
# agent-system/src/db/models.py

from sqlalchemy import Column, String, Integer, Float, DateTime, JSON, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime
import enum

class Base(DeclarativeBase):
    pass

# ── PIPELINE STATE ──

class PipelinePhase(enum.Enum):
    DISCOVER = "discover"
    DEFINE = "define"
    CEO_CHECKPOINT = "ceo_checkpoint"
    BUILD_TEST = "build_test"
    DECIDE = "decide"
    EXTRACT = "extract"
    COMPLETED = "completed"
    KILLED = "killed"

class Experiment(Base):
    """1 experiment = 1 vòng 8 tuần qua pipeline"""
    __tablename__ = "experiments"

    id = Column(String, primary_key=True)          # cuid
    name = Column(String, nullable=False)           # "Vietnamese SME Lending"
    business_type = Column(String, nullable=False)  # digital/service/physical/marketplace/hybrid
    vertical = Column(String, nullable=False)       # "SME cross-border finance"
    geography = Column(String, nullable=False)      # "Ho Chi Minh City"

    phase = Column(String, default="discover")  # SQLite không có native Enum
    week_number = Column(Integer, default=0)        # 0-8
    is_active = Column(Boolean, default=True)

    # Scores
    cmf_score = Column(Float, nullable=True)        # Content-Market Fit (0-1)
    traction_score = Column(Float, nullable=True)    # Traction (0-1)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    agent_outputs = relationship("AgentOutput", back_populates="experiment")
    content_items = relationship("ContentItem", back_populates="experiment")
    metrics = relationship("WeeklyMetric", back_populates="experiment")
    approvals = relationship("CEOApproval", back_populates="experiment")


class AgentOutput(Base):
    """Mỗi lần 1 agent chạy xong → lưu output ở đây"""
    __tablename__ = "agent_outputs"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    agent_name = Column(String, nullable=False)     # "research", "strategy", "content"...
    skill_code = Column(String, nullable=True)      # "R1", "S3", "C1"...
    phase = Column(String, nullable=False)           # pipeline phase khi chạy

    input_data = Column(JSON, nullable=True)         # input nhận từ agent trước
    output_data = Column(JSON, nullable=False)       # structured output
    raw_text = Column(Text, nullable=True)           # full text response

    session_id = Column(String, nullable=True)       # Claude SDK session ID
    cost_usd = Column(Float, nullable=True)          # chi phí lần chạy này
    duration_ms = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="agent_outputs")


# ── CONTENT PIPELINE ──

class ContentStatus(enum.Enum):
    DRAFT = "draft"           # Agent tạo xong, chưa review
    APPROVED = "approved"     # CEO/human approved
    SCHEDULED = "scheduled"   # Đã lên lịch đăng
    POSTED = "posted"         # Đã đăng
    FAILED = "failed"         # Đăng lỗi

class ContentItem(Base):
    """Mỗi bài post/tweet/article/video"""
    __tablename__ = "content_items"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)

    platform = Column(String, nullable=False)        # twitter, linkedin, newsletter...
    content_type = Column(String, nullable=False)     # short, thread, article, carousel...
    pillar = Column(String, nullable=True)            # content pillar nào

    hook = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    cta = Column(Text, nullable=True)
    media_urls = Column(JSON, nullable=True)          # image/video URLs

    status = Column(String, default="draft")  # draft/approved/scheduled/posted/failed
    scheduled_at = Column(DateTime, nullable=True)
    posted_at = Column(DateTime, nullable=True)
    post_url = Column(String, nullable=True)          # URL bài đã đăng

    # Performance (cập nhật bởi Analytics Agent)
    impressions = Column(Integer, nullable=True)
    engagements = Column(Integer, nullable=True)
    clicks = Column(Integer, nullable=True)
    replies = Column(Integer, nullable=True)
    reposts = Column(Integer, nullable=True)
    bookmarks = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="content_items")


# ── METRICS ──

class WeeklyMetric(Base):
    """Metrics mỗi tuần cho mỗi experiment"""
    __tablename__ = "weekly_metrics"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    week_number = Column(Integer, nullable=False)

    # Content-Market Fit components
    engagement_quality = Column(Float, nullable=True)   # 0-1
    audience_relevance = Column(Float, nullable=True)   # 0-1
    conversion_signal = Column(Float, nullable=True)    # 0-1
    cmf_score = Column(Float, nullable=True)            # product of above

    # Traction components (vary by business type — store in JSON)
    acquisition_signal = Column(Float, nullable=True)
    activation_signal = Column(Float, nullable=True)
    retention_signal = Column(Float, nullable=True)
    traction_score = Column(Float, nullable=True)

    # Raw numbers
    raw_metrics = Column(JSON, nullable=True)           # platform-specific numbers
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="metrics")


# ── CEO DECISIONS ──

class CEOApproval(Base):
    """CEO checkpoint decisions"""
    __tablename__ = "ceo_approvals"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    checkpoint = Column(String, nullable=False)      # "strategy", "midpoint", "final"
    phase = Column(String, nullable=False)

    # Agent recommendation
    agent_recommendation = Column(JSON, nullable=False)  # structured recommendation
    agent_rationale = Column(Text, nullable=True)

    # CEO decision
    decision = Column(String, nullable=True)          # approve/reject/adjust/kill/scale
    ceo_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="approvals")


# ── PATTERN LIBRARY ──

class Pattern(Base):
    """Patterns extracted after each experiment"""
    __tablename__ = "patterns"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=True)

    category = Column(String, nullable=False)         # content, product, market, growth
    business_type = Column(String, nullable=False)
    result = Column(String, nullable=False)            # win, fail, pivot

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)             # metrics that back this pattern

    # Reusability
    applies_to = Column(JSON, nullable=True)           # which business types
    confidence = Column(Float, nullable=True)          # 0-1

    created_at = Column(DateTime, default=datetime.utcnow)


# ── HYPOTHESIS BACKLOG ──

class Hypothesis(Base):
    """Hypothesis backlog (Tier 1/2/3)"""
    __tablename__ = "hypotheses"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    business_type = Column(String, nullable=True)

    tier = Column(Integer, default=1)                  # 1=raw, 2=refined, 3=ready
    signal_type = Column(String, nullable=True)        # fragmentation, trust_gap, etc
    signal_score = Column(Integer, nullable=True)      # Signal Strength Score

    source_agent = Column(String, nullable=True)       # which agent proposed
    stress_test = Column(JSON, nullable=True)          # devil's advocate output

    is_active = Column(Boolean, default=True)
    promoted_to_experiment_id = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── AUDIENCE INTELLIGENCE (shared memory) ──

class AudienceIntel(Base):
    """Audience intelligence — shared across all agents.
    Research Agent writes, Content/Distribution Agents read.
    Compound knowledge: mỗi lần research → thêm data points."""
    __tablename__ = "audience_intel"

    id = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)

    pain_phrase = Column(Text, nullable=False)       # exact quote từ audience
    source_platform = Column(String, nullable=False) # twitter, reddit, linkedin, forum
    source_url = Column(String, nullable=True)       # link to original post
    frequency = Column(Integer, default=1)           # số lần gặp phrase tương tự
    sentiment = Column(String, nullable=True)         # negative, neutral, positive
    segment = Column(String, nullable=True)           # thuộc segment nào

    used_in_content = Column(Boolean, default=False) # đã dùng để tạo content chưa?
    content_id = Column(String, nullable=True)        # content nào đã dùng phrase này
    performance_score = Column(Float, nullable=True)  # content dùng phrase này perform thế nào

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── SYSTEM STATE (singleton — orchestrator state) ──

class SystemState(Base):
    """System state singleton — orchestrator reads/writes.
    Tracks global state that isn't per-experiment."""
    __tablename__ = "system_state"

    id = Column(String, primary_key=True, default="singleton")
    current_phase = Column(Integer, default=1)        # Phase 1/2/3
    active_experiment_id = Column(String, nullable=True)
    automation_mode = Column(String, default="semi_auto")  # full_auto, semi_auto, manual

    # Counters
    total_experiments = Column(Integer, default=0)
    total_patterns = Column(Integer, default=0)
    total_content_posted = Column(Integer, default=0)

    # Last run timestamps
    last_daily_run = Column(DateTime, nullable=True)
    last_weekly_run = Column(DateTime, nullable=True)
    last_event_processed = Column(DateTime, nullable=True)

    # Event queue (JSON array of pending events)
    pending_events = Column(JSON, default=list)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ── EVENT LOG ──

class EventLog(Base):
    """Log of all events processed by the orchestrator."""
    __tablename__ = "event_log"

    id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False)       # content_posted, cmf_below_threshold, etc.
    experiment_id = Column(String, nullable=True)
    payload = Column(JSON, nullable=True)              # event-specific data
    triggered_playbook = Column(String, nullable=True) # which playbook was triggered
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### DB Session Setup (SQLite + WAL + aiosqlite)

```python
# agent-system/src/db/session.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent.parent / "data" / "agent.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

engine = create_async_engine(
    f"sqlite+aiosqlite:///{DB_PATH}",
    echo=False,
    connect_args={"check_same_thread": False},
)

# Enable WAL mode for concurrent reads
@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_session():
    async with SessionLocal() as session:
        yield session
```

### Prisma schema (Next.js side — share cùng SQLite file)

```prisma
// marketplace-factory/prisma/schema.prisma
// Giữ SQLite, thêm models mirror Python side

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  // DATABASE_URL = "file:../../agent-system/data/agent.db"
  // → Next.js READ cùng DB file mà Python WRITE
}

// Thêm models tương ứng với Python SQLAlchemy models
// Next.js chỉ READ — Python side WRITE
```

---

## 5. 7 Agent Definitions

### Cách mỗi Agent map với Skills Architecture

```
AGENT              ROLE(S)                    SKILLS             MODEL
─────────────────────────────────────────────────────────────────────────
Research Agent     Market Research +          R1-R7, S2          Sonnet
                   Segment Analyst

Strategy Agent     Strategy Director +        S1,S3-S8, D2,D6   Opus
                   Value Architect

Content Agent      Growth Marketer            C1-C7, C10         Sonnet
                   (Creation track)

Distribution Agent Growth Marketer            G1-G6, G8-G10     Sonnet
                   (Distribution track)

Product Agent      Product Builder            C8, C9, R6, A8    Sonnet

Analytics Agent    Financial Analyst +        A1-A9, D5          Opus
                   Analysis skills

Devil's Advocate   Devil's Advocate           A1, D6             Opus
─────────────────────────────────────────────────────────────────────────
```

### Skill File Format (.md) — 2 Types

Mỗi skill có 1 trong 2 types:

```
type: api        → Skill CẦN gọi external API (Twitter, Reddit, SerpAPI, analytics...)
                   → Tạo MCP tool tương ứng trong tools/*.py
                   → Agent gọi tool, nhận data, process

type: reasoning  → Skill CHỈ CẦN LLM reasoning (phân tích, viết content, đánh giá...)
                   → KHÔNG cần MCP tool
                   → Inject nội dung skill vào agent prompt on-demand
                   → Agent đọc instructions + input data → output structured JSON
```

Mỗi skill là 1 file markdown với frontmatter YAML:

```markdown
# Ví dụ API skill: agent-system/skills/research/R2_social_listening.md

---
code: R2
name: Social Listening
type: api
category: research
description: Thu thập conversations, ngôn ngữ, pain points từ platforms
tools_required:
  - mcp__marketing-tools__social_listen
output_format: json
---

## Mục đích

Thu thập conversations và ngôn ngữ thực tế từ target audience
trên các platforms (Twitter, Reddit, LinkedIn, forums).

## Input cần có

- Target segment (từ S2 hoặc từ experiment config)
- Platform list (twitter, reddit, linkedin, etc.)
- Search keywords / phrases

## Quy trình thực hiện

1. Search conversations trên mỗi platform bằng keywords
2. Thu thập: exact phrases, questions asked, complaints, wishes
3. Identify language patterns (cách audience MÔ TẢ problem)
4. Map watering holes (communities, groups, hashtags)

## Output format

```json
{
  "pain_phrases": ["exact quotes from real people"],
  "questions_asked": ["câu hỏi audience hay hỏi"],
  "complaints": ["điều họ không hài lòng"],
  "watering_holes": ["community/platform/group names"],
  "language_patterns": ["cách họ mô tả problem"],
  "sample_posts": [
    {"platform": "twitter", "text": "...", "engagement": 150}
  ]
}
```

## Business Type Adaptations

- **Digital Product**: Focus trên feature requests, complaints about rivals
- **Service**: Focus trên "need help with...", "looking for..."
- **Physical Product**: Focus trên "looking for best...", reviews, returns
- **Marketplace**: Supply-side "where to sell" + Demand-side "where to find"

## Quy tắc

- Chỉ report FACTS. Không interpret. Không recommend.
- Mọi quote phải có source (platform + approximate date)
- Minimum 10 data points per platform
```

```markdown
# Ví dụ REASONING skill: agent-system/skills/strategy/S3_value_proposition.md

---
code: S3
name: Value Proposition Design
type: reasoning
category: strategy
description: Thiết kế CVP cho supply và demand side
tools_required: []
output_format: json
---

## Mục đích

Thiết kế Customer Value Proposition (CVP) dựa trên segment data
và competitive intelligence đã thu thập.

## Input cần có

- Segment profile (từ S2 — pain/gain mapping)
- Competitive analysis (từ R4 — differentiation gaps)
- Business type

## Quy trình thực hiện

1. Map Supply-side pains/gains + Demand-side pains/gains
2. Build Differentiation Matrix (Pain × Alt A × Alt B × Gap)
3. Identify GAP = nơi CVP sống
4. Design Moat (Network Effect / Data / Trust / Supply Lock-in / Regulatory)
5. Solve Chicken-Egg (Supply First / Demand First / Single-player mode)
6. Define Day 1 CVP (wedge) vs Day 365 CVP (platform)

## Output format

```json
{
  "cvp_statement": "For [segment] who [job], our platform provides [capability] that [alternative] cannot because [structural reason]",
  "supply_cvp": {"pains_addressed": [], "gains_delivered": []},
  "demand_cvp": {"pains_addressed": [], "gains_delivered": []},
  "differentiation_gaps": [{"pain": "", "alt_a": "", "alt_b": "", "our_gap": ""}],
  "moat_type": "network_effect|data|trust|supply_lockin|regulatory",
  "moat_timeline": "",
  "chicken_egg_solution": {"approach": "", "day1_plan": ""},
  "day1_cvp": "",
  "day365_cvp": "",
  "transition_path": ""
}
```

## Quality Check (fail 1 thì redesign)

- [ ] Customer thực sự sẽ tin pitch này — không aspirational
- [ ] Có ít nhất 1 thứ competitors structurally không replicate được
- [ ] Chicken-egg solution cụ thể (không phải "build community")
- [ ] Moat theory có timeline, không chỉ có direction
```

### Skill Type Map (44 skills)

```
TYPE: api (17 skills — cần MCP tools)
  R1 Market Scanning, R2 Social Listening, R3 Influencer Mapping,
  R4 Competitive Intelligence, R5 Content Benchmarking, R7 Pricing Research,
  G1 Strategic Engagement, G5 Email/Newsletter, G7 Outbound Sales,
  G9 Scheduling Ops, G10 Trend Riding,
  A4 Content Performance, A8 Customer Analytics,
  C5 Visual Content (image generation),
  + social_api tools (post, reply, fetch_metrics)

TYPE: reasoning (27 skills — LLM reasoning only)
  S1-S8 (all strategy), C1-C4 C6-C7 C9-C10 (content creation),
  A1-A3 A5-A7 A9 (analysis), D1-D6 (all decision),
  G2-G4 G6 G8 (growth — LLM suggestions, manual execution)
```

### Agent Config File Format (.md)

Mỗi agent là 1 file markdown chỉ định role + skills nào load:

```markdown
# Ví dụ: agent-system/agents/research.md

---
name: research
description: >
  Research Agent — scans markets, listens to audiences,
  maps competitors, identifies segments. Use for any task
  requiring external data gathering or audience intelligence.
model: sonnet
skills:
  - R1_market_scanning
  - R2_social_listening
  - R3_influencer_mapping
  - R4_competitive_intelligence
  - R5_content_benchmarking
  - R6_customer_research
  - R7_pricing_research
  - S2_segmentation
extra_tools:
  - WebSearch
  - WebFetch
  - Read
  - Glob
  - Grep
  - mcp__db-tools__save_agent_output
  - mcp__db-tools__read_experiment
---

## Role

Bạn là Research Agent trong hệ thống Marketing Department AI.
Kết hợp Market Research Agent + Segment Analyst.

Core question: "Thực tế ngoài kia đang diễn ra gì?"

## Quy tắc tuyệt đối

1. Chỉ report FACTS. KHÔNG recommend. KHÔNG interpret.
2. Viết "therefore we should..." → VI PHẠM role.
3. Mọi claim phải có source hoặc evidence.
4. Output LUÔN là structured JSON.

## Output tổng hợp (khi chạy full research)

```json
{
  "signals": [...],
  "audience_intel": {...},
  "segments": [...],
  "recommended_wedge": {...}
}
```
```

### Agent + Skill Loader (Python) — Handles type: api|reasoning

```python
# agent-system/src/agents/loader.py

from pathlib import Path
from claude_agent_sdk import AgentDefinition
import yaml
import re

SKILLS_DIR = Path(__file__).parent.parent.parent / "skills"
AGENTS_DIR = Path(__file__).parent.parent.parent / "agents"


def load_skill(skill_name: str) -> dict:
    """Load 1 skill .md file → {frontmatter, content}."""
    for category_dir in SKILLS_DIR.iterdir():
        if not category_dir.is_dir():
            continue
        for md_file in category_dir.glob(f"*{skill_name}*.md"):
            text = md_file.read_text(encoding="utf-8")
            frontmatter, content = _parse_frontmatter(text)
            return {"meta": frontmatter, "content": content, "path": str(md_file)}

    raise FileNotFoundError(f"Skill not found: {skill_name}")


def load_agent(agent_name: str, inject_patterns: list[dict] | None = None) -> AgentDefinition:
    """Load agent .md file + all its skills → AgentDefinition.

    Args:
        agent_name: Name of agent (matches filename in agents/)
        inject_patterns: Optional list of Pattern dicts to inject into prompt
                         (feedback loop — winning patterns guide future behavior)
    """
    agent_path = AGENTS_DIR / f"{agent_name}.md"
    text = agent_path.read_text(encoding="utf-8")
    frontmatter, role_prompt = _parse_frontmatter(text)

    # Load all skills listed in frontmatter — separate by type
    api_skill_texts = []
    reasoning_skill_texts = []
    tools_from_skills = set()

    for skill_name in frontmatter.get("skills", []):
        skill = load_skill(skill_name)
        skill_type = skill["meta"].get("type", "reasoning")
        skill_text = (
            f"### Skill: {skill['meta'].get('code', '')} — "
            f"{skill['meta'].get('name', '')} [{skill_type.upper()}]\n\n"
            f"{skill['content']}"
        )

        if skill_type == "api":
            api_skill_texts.append(skill_text)
            # Collect MCP tools required by API skills
            for tool_name in skill["meta"].get("tools_required", []):
                tools_from_skills.add(tool_name)
        else:
            reasoning_skill_texts.append(skill_text)

    # Assemble full system prompt
    sections = [role_prompt, "\n---\n"]

    # Inject winning patterns from Pattern Library (feedback loop)
    if inject_patterns:
        sections.append("\n## Winning Patterns (from past experiments)\n\n")
        for p in inject_patterns[:10]:  # max 10 patterns to avoid prompt bloat
            sections.append(
                f"- **{p['title']}** ({p['result']}): {p['description']}\n"
                f"  Evidence: {p.get('evidence', 'N/A')}\n\n"
            )

    if reasoning_skill_texts:
        sections.append("\n## Reasoning Skills (follow these instructions)\n\n")
        sections.append("\n---\n".join(reasoning_skill_texts))

    if api_skill_texts:
        sections.append("\n## API Skills (use corresponding MCP tools)\n\n")
        sections.append("\n---\n".join(api_skill_texts))

    full_prompt = "".join(sections)

    # Merge tools: extra_tools + tools_required from API skills only
    all_tools = list(set(frontmatter.get("extra_tools", [])) | tools_from_skills)

    return AgentDefinition(
        description=frontmatter["description"],
        prompt=full_prompt,
        tools=all_tools,
        model=frontmatter.get("model", "sonnet"),
    )


def load_all_agents(inject_patterns: list[dict] | None = None) -> dict[str, AgentDefinition]:
    """Load all agent .md files → dict of AgentDefinitions."""
    agents = {}
    for md_file in AGENTS_DIR.glob("*.md"):
        if md_file.name == "README.md":
            continue
        name = md_file.stem
        agents[name] = load_agent(name, inject_patterns=inject_patterns)
    return agents


def _parse_frontmatter(text: str) -> tuple[dict, str]:
    """Parse YAML frontmatter from markdown."""
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if match:
        frontmatter = yaml.safe_load(match.group(1)) or {}
        content = match.group(2).strip()
        return frontmatter, content
    return {}, text.strip()
```

### Sử dụng trong definitions.py (giờ rất đơn giản)

```python
# agent-system/src/agents/definitions.py

from .loader import load_all_agents

# Load tất cả agents từ .md files — không hardcode gì
AGENTS = load_all_agents()

# Thêm agent mới? Tạo file .md trong agents/ + skills/ → tự động load.
# Sửa skill? Edit file .md → restart server → agent có prompt mới.
# Không cần sửa Python code.
```

### 7 Agent Configs (tóm tắt — mỗi cái là 1 .md file)

```
FILE                    SKILLS LOADED                  MODEL    EXTRA TOOLS
─────────────────────────────────────────────────────────────────────────────
agents/research.md      R1-R7, S2                      sonnet   WebSearch, WebFetch
agents/strategy.md      S1, S3-S8, D2, D6              opus     Read only
agents/content.md       C1-C7, C10                     sonnet   generate_image
agents/distribution.md  G1-G6, G8-G10                  sonnet   post_twitter, schedule
agents/product.md       C8, C9, R6, A8                 sonnet   Write, Edit, Bash
agents/analytics.md     A1-A9, D5                      opus     fetch_metrics
agents/devils_advocate.md A1, D6                        opus     Read only
─────────────────────────────────────────────────────────────────────────────
```

### Workflow: Thêm skill mới hoặc sửa skill

```
THÊM SKILL MỚI:
  1. Tạo file .md trong skills/<category>/
  2. Viết frontmatter (code, name, tools_required, output_format)
  3. Viết nội dung skill (mục đích, input, quy trình, output format, adaptations)
  4. Thêm skill_name vào agent .md file nào cần dùng
  5. Restart server → agent tự load skill mới

SỬA SKILL:
  1. Edit file .md
  2. Restart server → xong

XÓA SKILL:
  1. Xóa file .md
  2. Remove khỏi agent .md files
  3. Restart server → xong

THÊM AGENT MỚI:
  1. Tạo file .md trong agents/
  2. List skills cần load trong frontmatter
  3. Viết role prompt
  4. Restart server → tự động available

→ ZERO Python code changes cho skill/agent modifications.
```

### Assembled Prompt (ví dụ — khi Research Agent load xong)

```
Loader đọc agents/research.md → lấy role prompt + skill list
Loader đọc skills/research/R1_market_scanning.md → nội dung skill R1
Loader đọc skills/research/R2_social_listening.md → nội dung skill R2
... (tất cả 8 skills)

FINAL PROMPT gửi cho Claude SDK:
┌─────────────────────────────────────────────┐
│ [Role prompt từ agents/research.md]         │
│                                             │
│ ---                                         │
│                                             │
│ ## Skills Available                         │
│                                             │
│ ### Skill: R1 — Market Scanning             │
│ [Nội dung từ R1_market_scanning.md]         │
│                                             │
│ ### Skill: R2 — Social Listening            │
│ [Nội dung từ R2_social_listening.md]        │
│                                             │
│ ... (R3-R7, S2)                             │
└─────────────────────────────────────────────┘

TOOLS tự động collect:
  = extra_tools từ agents/research.md
  + tools_required từ mỗi skill .md
  = ["WebSearch", "WebFetch", "Read", ..., "social_listen", "scan_market", ...]
```

---

## 6. MCP Tools — Biến skills thành tools

### Tool Server Setup

```python
# agent-system/src/tools/server.py

from claude_agent_sdk import tool, create_sdk_mcp_server
from .research_tools import research_tools
from .content_tools import content_tools
from .growth_tools import growth_tools
from .analysis_tools import analysis_tools
from .social_api import social_api_tools
from .search_api import search_api_tools
from .db_tools import db_tools


marketing_tools_server = create_sdk_mcp_server(
    name="marketing-tools",
    version="1.0.0",
    tools=[
        *research_tools,
        *content_tools,
        *growth_tools,
        *analysis_tools,
        *social_api_tools,
        *search_api_tools,
    ],
)

db_tools_server = create_sdk_mcp_server(
    name="db-tools",
    version="1.0.0",
    tools=db_tools,
)
```

### Ví dụ: Research Tools

```python
# agent-system/src/tools/research_tools.py

from claude_agent_sdk import tool
from zod import z  # hoặc dùng Pydantic

@tool(
    "social_listen",
    "R2 — Social Listening: Thu thập conversations và pain points từ platforms",
    {
        "query": str,           # search terms
        "platforms": list[str], # ["twitter", "reddit", "linkedin"]
        "limit": int,           # max results per platform
    },
)
async def social_listen(args: dict) -> dict:
    """Gọi Twitter API, Reddit API, LinkedIn API để search conversations."""
    results = {}

    if "twitter" in args["platforms"]:
        # Twitter API v2 search
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.twitter.com/2/tweets/search/recent",
                params={
                    "query": args["query"],
                    "max_results": min(args.get("limit", 20), 100),
                    "tweet.fields": "public_metrics,created_at",
                },
                headers={"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"},
            )
            results["twitter"] = resp.json().get("data", [])

    if "reddit" in args["platforms"]:
        # Reddit search
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.reddit.com/search.json",
                params={"q": args["query"], "limit": args.get("limit", 20), "sort": "relevance"},
                headers={"User-Agent": "MarketingAgent/1.0"},
            )
            posts = resp.json().get("data", {}).get("children", [])
            results["reddit"] = [
                {
                    "title": p["data"]["title"],
                    "selftext": p["data"].get("selftext", "")[:500],
                    "score": p["data"]["score"],
                    "num_comments": p["data"]["num_comments"],
                    "subreddit": p["data"]["subreddit"],
                    "url": f"https://reddit.com{p['data']['permalink']}",
                }
                for p in posts
            ]

    return {
        "content": [{
            "type": "text",
            "text": json.dumps(results, indent=2, ensure_ascii=False),
        }]
    }


@tool(
    "scan_market",
    "R1 — Market Scanning: Scan tín hiệu thị trường trong vertical cụ thể",
    {
        "vertical": str,
        "geography": str,
        "business_type": str,
    },
)
async def scan_market(args: dict) -> dict:
    """Gọi web search + news APIs để scan market signals."""
    import httpx

    queries = [
        f"{args['vertical']} market {args['geography']} problems",
        f"{args['vertical']} complaints reviews {args['geography']}",
        f"{args['vertical']} startups funding {args['geography']}",
        f"{args['vertical']} regulation changes 2025 2026",
    ]

    all_results = []
    async with httpx.AsyncClient() as client:
        for q in queries:
            resp = await client.get(
                "https://serpapi.com/search",
                params={"q": q, "api_key": SERPAPI_KEY, "num": 10},
            )
            data = resp.json()
            for r in data.get("organic_results", []):
                all_results.append({
                    "title": r["title"],
                    "snippet": r.get("snippet", ""),
                    "link": r["link"],
                    "query": q,
                })

    return {
        "content": [{
            "type": "text",
            "text": json.dumps(all_results, indent=2, ensure_ascii=False),
        }]
    }


@tool(
    "map_competitors",
    "R4 — Competitive Intelligence: Phân tích đối thủ trong vertical",
    {
        "vertical": str,
        "geography": str,
        "known_competitors": list[str],
    },
)
async def map_competitors(args: dict) -> dict:
    """Search và phân tích competitors."""
    # Similar to scan_market but focused on competitor analysis
    ...


research_tools = [social_listen, scan_market, map_competitors]
```

### Ví dụ: Social API Tools (Twitter posting)

```python
# agent-system/src/tools/social_api.py

@tool(
    "post_twitter",
    "G9 — Post content to Twitter/X",
    {
        "text": str,
        "reply_to_id": str | None,    # nếu là reply
        "media_ids": list[str] | None, # nếu có media
    },
)
async def post_twitter(args: dict) -> dict:
    """Post tweet via Twitter API v2."""
    import httpx

    payload = {"text": args["text"]}
    if args.get("reply_to_id"):
        payload["reply"] = {"in_reply_to_tweet_id": args["reply_to_id"]}
    if args.get("media_ids"):
        payload["media"] = {"media_ids": args["media_ids"]}

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.twitter.com/2/tweets",
            json=payload,
            headers={"Authorization": f"Bearer {TWITTER_OAUTH_TOKEN}"},
        )
        data = resp.json()

    return {
        "content": [{
            "type": "text",
            "text": json.dumps({
                "tweet_id": data.get("data", {}).get("id"),
                "url": f"https://twitter.com/i/status/{data.get('data', {}).get('id')}",
                "status": "posted" if resp.status_code == 201 else "failed",
            }),
        }]
    }


@tool(
    "fetch_twitter_metrics",
    "A4 — Fetch performance metrics for posted tweets",
    {
        "tweet_ids": list[str],
    },
)
async def fetch_twitter_metrics(args: dict) -> dict:
    """Lấy metrics cho list tweets."""
    import httpx

    ids = ",".join(args["tweet_ids"])
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.twitter.com/2/tweets",
            params={
                "ids": ids,
                "tweet.fields": "public_metrics,created_at",
            },
            headers={"Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"},
        )
        data = resp.json()

    return {
        "content": [{
            "type": "text",
            "text": json.dumps(data.get("data", []), indent=2),
        }]
    }


social_api_tools = [post_twitter, fetch_twitter_metrics]
```

### Ví dụ: DB Tools

```python
# agent-system/src/tools/db_tools.py

@tool(
    "save_agent_output",
    "Lưu output của agent vào database",
    {
        "experiment_id": str,
        "agent_name": str,
        "skill_code": str,
        "output_data": dict,
    },
)
async def save_agent_output(args: dict) -> dict:
    """Insert agent output into database."""
    from db.session import get_session
    from db.models import AgentOutput
    from cuid2 import cuid

    async with get_session() as session:
        output = AgentOutput(
            id=cuid(),
            experiment_id=args["experiment_id"],
            agent_name=args["agent_name"],
            skill_code=args.get("skill_code"),
            phase="current",
            output_data=args["output_data"],
        )
        session.add(output)
        await session.commit()

    return {"content": [{"type": "text", "text": f"Saved output {output.id}"}]}


@tool(
    "read_agent_output",
    "Đọc output trước đó của agent khác",
    {
        "experiment_id": str,
        "agent_name": str | None,
        "skill_code": str | None,
    },
)
async def read_agent_output(args: dict) -> dict:
    """Read previous agent outputs from database."""
    from db.session import get_session
    from db.models import AgentOutput
    from sqlalchemy import select

    async with get_session() as session:
        q = select(AgentOutput).where(
            AgentOutput.experiment_id == args["experiment_id"]
        )
        if args.get("agent_name"):
            q = q.where(AgentOutput.agent_name == args["agent_name"])
        if args.get("skill_code"):
            q = q.where(AgentOutput.skill_code == args["skill_code"])

        result = await session.execute(q.order_by(AgentOutput.created_at.desc()))
        outputs = result.scalars().all()

    return {
        "content": [{
            "type": "text",
            "text": json.dumps([
                {"agent": o.agent_name, "skill": o.skill_code, "data": o.output_data}
                for o in outputs
            ], indent=2, ensure_ascii=False),
        }]
    }


@tool(
    "save_content",
    "Lưu content item vào queue",
    {
        "experiment_id": str,
        "platform": str,
        "content_type": str,
        "hook": str | None,
        "body": str,
        "cta": str | None,
        "pillar": str | None,
    },
)
async def save_content(args: dict) -> dict:
    """Save content to database as DRAFT."""
    ...


db_tools = [save_agent_output, read_agent_output, save_content]
```

### Tool Map tổng hợp: Skill → Tool

```
SKILL CODE  SKILL NAME                    MCP TOOL NAME                TYPE
──────────────────────────────────────────────────────────────────────────────
R1          Market Scanning               scan_market                  API call
R2          Social Listening              social_listen                API call
R3          Influencer Mapping            map_influencers              API call
R4          Competitive Intelligence      map_competitors              API call
R5          Content Benchmarking          benchmark_content            API call
R6          Customer Research             (manual/survey — CEO input)  Human
R7          Pricing Research              research_pricing             API call
S1-S8       Strategy skills               (LLM reasoning only)         Prompt
C1-C7       Content Creation              (LLM generation)             Prompt
C8          MVP Design                    (LLM + Write/Edit)           Prompt+File
C9          Offer Packaging               (LLM reasoning)              Prompt
C10         Repurposing                   (LLM generation)             Prompt
G1          Strategic Engagement          reply_twitter                API call
G2          Community Building            (manual + LLM suggestions)   Hybrid
G3          Profile Optimization          (manual — CEO implements)    Human
G4          Audience Nurturing            (LLM + scheduling)           Prompt+API
G5          Email/Newsletter              send_email                   API call
G6          Paid Acquisition              (manual — ad platforms)      Human
G7          Outbound & Sales              send_dm                      API call
G8          Referral & Partnership        (manual + LLM suggestions)   Hybrid
G9          Scheduling & Ops              schedule_content             API call
G10         Trend Riding                  scan_trends                  API call
A1          Stress Testing                (LLM reasoning)              Prompt
A2          Opportunity Scoring           (LLM + data)                 Prompt
A3          Unit Economics                (LLM + calculator)           Prompt
A4          Content Performance           fetch_twitter_metrics, etc   API call
A5          Traction Scoring              (LLM + data from A4/A8)     Prompt+DB
A6          CMF Scoring                   (LLM + data from A4)        Prompt+DB
A7          Pattern Extraction            save_pattern                 Prompt+DB
A8          Customer Analytics            fetch_web_analytics          API call
A9          Portfolio Analysis            (LLM + DB queries)           Prompt+DB
D1-D6       Decision skills               (LLM reasoning)              Prompt
──────────────────────────────────────────────────────────────────────────────
```

---

## 7. Playbook YAML — Logic điều phối

### Tại sao cần Playbook layer?

```
Vấn đề: Orchestrator hardcode logic → sửa Python code mỗi khi đổi flow
Giải pháp: YAML files define WHAT runs, Python chỉ execute

Playbook = kịch bản
  - Steps: agent nào chạy skill nào
  - Conditions: chạy step này KHI NÀO
  - Gates: human approval trước khi tiếp
  - Output routing: output step A → input step B
```

### Playbook Format

```yaml
# Cấu trúc chung của 1 playbook

name: playbook_name
description: Mô tả playbook
trigger: time|event|manual      # KHI NÀO chạy
trigger_config:                  # Chi tiết trigger
  cron: "0 6 * * *"             # (nếu time-based)
  event: content_posted          # (nếu event-based)

steps:
  - id: step_1
    agent: research              # Agent nào chạy
    skill: R2                    # Skill cụ thể (optional — nếu không set, agent tự chọn)
    input:                       # Input cho agent
      query: "{{experiment.vertical}} problems"
      platforms: ["twitter", "reddit"]
    output_key: research_data    # Lưu output với key này
    on_success: step_2           # Chạy step nào tiếp
    on_failure: notify_ceo       # Nếu fail

  - id: step_2
    agent: devils_advocate
    skill: A1
    input:
      data: "{{research_data}}"  # Dùng output từ step trước
    condition: "{{research_data.signal_score}} >= 100"  # Chỉ chạy nếu...
    output_key: stress_test

  - id: notify_ceo
    type: notification           # Special step type
    channel: telegram
    message: "Step failed: {{error}}"

gates:                           # Human approval points
  - after: step_2
    type: ceo_approval
    message: "Review stress test results before proceeding"
    timeout_hours: 48
    on_timeout: pause            # pause | skip | abort
```

### discover.yaml

```yaml
name: discover
description: Scan market signals, gather audience intel, stress test findings
trigger: manual
trigger_config:
  event: new_experiment_created

steps:
  - id: scan_market
    agent: research
    skill: R1
    input:
      vertical: "{{experiment.vertical}}"
      geography: "{{experiment.geography}}"
      business_type: "{{experiment.business_type}}"
    output_key: market_signals

  - id: social_listen
    agent: research
    skill: R2
    input:
      query: "{{experiment.vertical}} problems complaints"
      platforms: ["twitter", "reddit", "linkedin"]
    output_key: audience_data
    parallel_with: scan_market    # Chạy song song với scan_market

  - id: competitive_intel
    agent: research
    skill: R4
    input:
      vertical: "{{experiment.vertical}}"
      geography: "{{experiment.geography}}"
    output_key: competitors
    parallel_with: scan_market

  - id: segment_analysis
    agent: research
    skill: S2
    input:
      market_data: "{{market_signals}}"
      audience_data: "{{audience_data}}"
    output_key: segments
    depends_on: [scan_market, social_listen]

  - id: stress_test
    agent: devils_advocate
    skill: A1
    input:
      signals: "{{market_signals}}"
      segments: "{{segments}}"
      competitors: "{{competitors}}"
    output_key: stress_report
    depends_on: [segment_analysis, competitive_intel]

gates:
  - after: stress_test
    type: ceo_review
    message: "DISCOVER complete. Review signals + segments + stress test."
    data_keys: [market_signals, segments, stress_report]
```

### define.yaml

```yaml
name: define
description: Form thesis, design CVP, plan go-to-market
trigger: event
trigger_config:
  event: discover_approved

steps:
  - id: thesis
    agent: strategy
    skill: S1
    input:
      signals: "{{discover.market_signals}}"
      segments: "{{discover.segments}}"
      stress_test: "{{discover.stress_report}}"
    output_key: thesis

  - id: cvp_design
    agent: strategy
    skill: S3
    input:
      thesis: "{{thesis}}"
      segments: "{{discover.segments}}"
      competitors: "{{discover.competitors}}"
    output_key: cvp
    depends_on: [thesis]

  - id: content_pillars
    agent: strategy
    skill: S5
    input:
      cvp: "{{cvp}}"
      audience: "{{discover.audience_data}}"
    output_key: pillars
    depends_on: [cvp_design]

  - id: experiment_design
    agent: strategy
    skill: S7
    input:
      thesis: "{{thesis}}"
      cvp: "{{cvp}}"
      pillars: "{{pillars}}"
    output_key: experiment_plan
    depends_on: [content_pillars]

  - id: stress_test_strategy
    agent: devils_advocate
    skill: A1
    input:
      thesis: "{{thesis}}"
      cvp: "{{cvp}}"
      experiment: "{{experiment_plan}}"
    output_key: strategy_stress_test
    depends_on: [experiment_design]

gates:
  - after: stress_test_strategy
    type: ceo_approval
    message: "DEFINE complete. Approve strategy + experiment plan to begin BUILD_TEST."
    data_keys: [thesis, cvp, pillars, experiment_plan, strategy_stress_test]
```

### build_test_daily.yaml

```yaml
name: build_test_daily
description: Daily content creation + distribution + metrics collection
trigger: time
trigger_config:
  cron: "0 6 * * *"             # 6 AM daily
  phase_required: build_test     # Chỉ chạy trong BUILD_TEST phase

steps:
  - id: create_content
    agent: content
    input:
      pillars: "{{strategy.pillars}}"
      audience_intel: "{{latest_audience_intel}}"
      top_patterns: "{{winning_patterns}}"
      day_of_week: "{{today.day_name}}"
      week_number: "{{experiment.week_number}}"
    output_key: daily_content

  - id: distribute
    agent: distribution
    input:
      content: "{{daily_content}}"
      schedule: "{{strategy.channel_strategy}}"
    output_key: distribution_result
    depends_on: [create_content]
    condition: "{{system.automation_mode}} == 'full_auto'"
    # Nếu semi_auto → content saved as DRAFT, CEO approves via dashboard

  - id: engage
    agent: distribution
    skill: G1
    input:
      vertical: "{{experiment.vertical}}"
      talking_points: "{{daily_content.engagement_points}}"
    output_key: engagement_result
    depends_on: [distribute]

  - id: collect_metrics
    agent: analytics
    skill: A4
    input:
      content_ids: "{{distribution_result.posted_ids}}"
    output_key: daily_metrics
    trigger_config:
      cron: "0 18 * * *"        # 6 PM — override, run in evening
    depends_on: [distribute]
```

### build_test_weekly.yaml

```yaml
name: build_test_weekly
description: Weekly analysis, scoring, reporting, and kill signal detection
trigger: time
trigger_config:
  cron: "0 9 * * 1"             # Monday 9 AM
  phase_required: build_test

steps:
  - id: performance_analysis
    agent: analytics
    skill: A4
    input:
      experiment_id: "{{experiment.id}}"
      week_number: "{{experiment.week_number}}"
    output_key: weekly_performance

  - id: cmf_score
    agent: analytics
    skill: A6
    input:
      performance: "{{weekly_performance}}"
      audience_data: "{{latest_audience_intel}}"
    output_key: cmf_result
    depends_on: [performance_analysis]

  - id: traction_score
    agent: analytics
    skill: A5
    input:
      performance: "{{weekly_performance}}"
      business_type: "{{experiment.business_type}}"
    output_key: traction_result
    depends_on: [performance_analysis]

  - id: pattern_check
    agent: analytics
    skill: A7
    input:
      cmf: "{{cmf_result}}"
      traction: "{{traction_result}}"
      content_data: "{{weekly_performance}}"
    output_key: new_patterns
    depends_on: [cmf_score, traction_score]

  - id: kill_signal_check
    type: condition
    condition: "{{cmf_result.score}} < 0.1 AND {{traction_result.score}} < 0.1 AND {{experiment.week_number}} >= 4"
    on_true: kill_alert
    on_false: weekly_report

  - id: kill_alert
    type: notification
    channel: [telegram, dashboard]
    priority: critical
    message: "KILL SIGNAL: CMF={{cmf_result.score}}, Traction={{traction_result.score}} after week {{experiment.week_number}}"

  - id: weekly_report
    type: notification
    channel: [telegram, dashboard]
    message: |
      Week {{experiment.week_number}} Report:
      CMF: {{cmf_result.score}} ({{cmf_result.trend}})
      Traction: {{traction_result.score}} ({{traction_result.trend}})
      Top content: {{weekly_performance.top_content}}
      New patterns: {{new_patterns.count}}

  - id: midpoint_stress_test
    agent: devils_advocate
    input:
      all_metrics: "{{weekly_performance}}"
      cmf: "{{cmf_result}}"
      traction: "{{traction_result}}"
    output_key: midpoint_review
    condition: "{{experiment.week_number}} == 4"
    depends_on: [traction_score, cmf_score]

gates:
  - after: midpoint_stress_test
    type: ceo_approval
    condition: "{{experiment.week_number}} == 4"
    message: "Midpoint review — Continue, Adjust, or Kill?"
    data_keys: [cmf_result, traction_result, midpoint_review]
```

### decide.yaml

```yaml
name: decide
description: Final decision — Kill, Continue, or Scale
trigger: event
trigger_config:
  event: experiment_week_8

steps:
  - id: final_analysis
    agent: analytics
    input:
      experiment_id: "{{experiment.id}}"
      full_history: true
    output_key: final_report

  - id: final_stress_test
    agent: devils_advocate
    input:
      report: "{{final_report}}"
    output_key: final_stress

  - id: opportunity_score
    agent: analytics
    skill: A2
    input:
      report: "{{final_report}}"
      stress_test: "{{final_stress}}"
    output_key: opportunity_score
    depends_on: [final_analysis, final_stress_test]

gates:
  - after: opportunity_score
    type: ceo_decision
    message: "GO/NO-GO: Kill, Continue, or Scale?"
    data_keys: [final_report, final_stress, opportunity_score]
    options: [kill, continue, scale, pivot]
```

### extract.yaml

```yaml
name: extract
description: Extract patterns from completed experiment
trigger: event
trigger_config:
  event: experiment_decided

steps:
  - id: extract_patterns
    agent: analytics
    skill: A7
    input:
      experiment_id: "{{experiment.id}}"
      decision: "{{experiment.decision}}"
      all_outputs: true
    output_key: extracted_patterns

  - id: update_library
    type: db_action
    action: save_patterns
    input:
      patterns: "{{extracted_patterns}}"
      experiment_id: "{{experiment.id}}"
```

### Playbook Executor (Python)

```python
# agent-system/src/orchestrator/executor.py

from pathlib import Path
from dataclasses import dataclass, field
import yaml
import re

PLAYBOOKS_DIR = Path(__file__).parent.parent.parent.parent / "playbooks"


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
    step_outputs: dict[str, dict] = field(default_factory=dict)
    completed_steps: list[str] = field(default_factory=list)
    current_step: str | None = None
    status: str = "running"  # running, paused_at_gate, completed, failed


def load_playbook(name: str) -> dict:
    """Load playbook YAML file."""
    path = PLAYBOOKS_DIR / f"{name}.yaml"
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def resolve_template(template: str, context: dict) -> str:
    """Resolve {{variable}} templates in playbook values."""
    def replace(match):
        key_path = match.group(1).strip()
        parts = key_path.split(".")
        value = context
        for part in parts:
            if isinstance(value, dict):
                value = value.get(part, f"UNRESOLVED:{key_path}")
            else:
                return f"UNRESOLVED:{key_path}"
        return str(value) if not isinstance(value, (dict, list)) else str(value)

    return re.sub(r"\{\{(.+?)\}\}", replace, template)


def evaluate_condition(condition: str, context: dict) -> bool:
    """Evaluate a playbook condition string against context."""
    resolved = resolve_template(condition, context)
    # Simple evaluator — supports ==, !=, >=, <=, >, <, AND, OR
    # In production: use a safe expression parser, NOT eval()
    try:
        # Replace AND/OR with Python operators for safe eval
        expr = resolved.replace(" AND ", " and ").replace(" OR ", " or ")
        return bool(eval(expr, {"__builtins__": {}}, {}))
    except Exception:
        return False


async def execute_playbook(
    playbook_name: str,
    experiment_id: str,
    initial_context: dict,
    agent_runner,  # callable: async (agent_name, skill, input) -> dict
) -> PlaybookRun:
    """Execute a playbook step by step."""
    import asyncio

    playbook = load_playbook(playbook_name)
    run = PlaybookRun(playbook_name=playbook_name, experiment_id=experiment_id)

    # Build execution context
    context = {**initial_context, "experiment": {"id": experiment_id}}

    steps = playbook["steps"]
    gates = {g["after"]: g for g in playbook.get("gates", [])}

    # Build dependency graph
    step_map = {s["id"]: s for s in steps}
    parallel_groups = _build_execution_order(steps)

    for group in parallel_groups:
        # Run steps in this group in parallel
        tasks = []
        for step_id in group:
            step = step_map[step_id]

            # Check condition
            if "condition" in step and not evaluate_condition(step["condition"], context):
                run.completed_steps.append(step_id)
                continue

            # Resolve input templates
            resolved_input = {}
            if "input" in step:
                for k, v in step["input"].items():
                    resolved_input[k] = resolve_template(str(v), context) if isinstance(v, str) else v

            run.current_step = step_id

            if step.get("type") == "notification":
                # Handle notification steps
                tasks.append(_handle_notification(step, context))
            elif step.get("type") == "condition":
                # Handle condition branch steps
                if evaluate_condition(step["condition"], context):
                    # Jump to on_true step
                    pass
                continue
            else:
                # Normal agent step
                tasks.append(agent_runner(step["agent"], step.get("skill"), resolved_input))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for step_id, result in zip(group, results):
            step = step_map[step_id]
            if isinstance(result, Exception):
                run.step_outputs[step_id] = {"error": str(result)}
                if "on_failure" in step:
                    # Trigger failure handler
                    pass
            else:
                output_key = step.get("output_key", step_id)
                run.step_outputs[output_key] = result
                context[output_key] = result
                run.completed_steps.append(step_id)

            # Check gates
            if step_id in gates:
                gate = gates[step_id]
                run.status = "paused_at_gate"
                run.current_step = f"gate:{step_id}"
                return run  # Pause execution — resume after CEO approval

    run.status = "completed"
    return run


def _build_execution_order(steps: list[dict]) -> list[list[str]]:
    """Build parallel execution groups from step dependencies."""
    groups = []
    completed = set()

    while len(completed) < len(steps):
        # Find all steps whose dependencies are satisfied
        ready = []
        for step in steps:
            if step["id"] in completed:
                continue
            deps = step.get("depends_on", [])
            parallel = step.get("parallel_with")
            if all(d in completed for d in deps):
                ready.append(step["id"])

        if not ready:
            break  # Circular dependency or all done
        groups.append(ready)
        completed.update(ready)

    return groups


async def _handle_notification(step: dict, context: dict) -> dict:
    """Send notification (Telegram, Dashboard, etc.)."""
    message = resolve_template(step.get("message", ""), context)
    channels = step.get("channel", ["dashboard"])
    if isinstance(channels, str):
        channels = [channels]
    # TODO: implement actual notification sending
    return {"notified": channels, "message": message}
```

---

## 8. Event System — Hybrid Time + Event

### Tại sao cần Event System?

```
Vấn đề: Chỉ dùng cron (time-based) → bỏ lỡ phản ứng real-time
Ví dụ:
  - Content viral → cần repurpose NGAY, không chờ đến sáng mai
  - Kill signal → cần alert CEO NGAY, không chờ weekly report
  - Supply dip → cần research NGAY, không chờ quarterly scan

Giải pháp: Hybrid = Time-based (cron) + Event-driven (reactive)
  - Cron: daily content, weekly analysis — predictable cadence
  - Events: spike detected, kill signal, new signal — reactive response
```

### Event Definitions

```python
# agent-system/src/orchestrator/event_bus.py

from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable, Awaitable
from enum import Enum


class EventType(str, Enum):
    # ── Content Events ──
    CONTENT_CREATED = "content_created"           # Content Agent tạo xong
    CONTENT_APPROVED = "content_approved"         # CEO approved content
    CONTENT_POSTED = "content_posted"             # Distribution Agent đăng xong
    CONTENT_PERFORMANCE_SPIKE = "content_performance_spike"  # Engagement vượt 3x avg

    # ── Metric Events ──
    CMF_BELOW_THRESHOLD = "cmf_below_threshold"   # CMF Score < 0.1
    CMF_ABOVE_THRESHOLD = "cmf_above_threshold"   # CMF Score > 0.5 (tốt)
    TRACTION_DROP = "traction_drop"               # Traction giảm 2 tuần liên tiếp
    KILL_SIGNAL = "kill_signal"                   # CMF + Traction both < 0.1 after week 4

    # ── Pipeline Events ──
    EXPERIMENT_CREATED = "experiment_created"
    PHASE_COMPLETED = "phase_completed"
    DISCOVER_APPROVED = "discover_approved"       # CEO approved DISCOVER results
    STRATEGY_APPROVED = "strategy_approved"       # CEO approved strategy
    EXPERIMENT_WEEK_8 = "experiment_week_8"       # Reached week 8
    EXPERIMENT_DECIDED = "experiment_decided"     # CEO made final decision

    # ── Signal Events ──
    SIGNAL_DETECTED_HIGH = "signal_detected_high" # Signal Score >= 200
    TREND_SPIKE = "trend_spike"                   # Trending topic relevant to vertical
    COMPETITOR_MOVE = "competitor_move"            # Competitor launched something

    # ── System Events ──
    AGENT_ERROR = "agent_error"                   # Agent failed to run
    CEO_APPROVAL_TIMEOUT = "ceo_approval_timeout" # CEO hasn't responded in 48h


@dataclass
class Event:
    type: EventType
    experiment_id: str | None = None
    payload: dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    source: str = ""  # which agent/system emitted this


# ── Event → Playbook Mapping ──

EVENT_PLAYBOOK_MAP: dict[EventType, str] = {
    EventType.EXPERIMENT_CREATED: "discover",
    EventType.DISCOVER_APPROVED: "define",
    EventType.STRATEGY_APPROVED: "build_test_daily",  # kicks off daily loop
    EventType.EXPERIMENT_WEEK_8: "decide",
    EventType.EXPERIMENT_DECIDED: "extract",

    # Reactive events → specialized mini-playbooks
    EventType.CONTENT_PERFORMANCE_SPIKE: "react_viral",     # repurpose viral content
    EventType.KILL_SIGNAL: "react_kill_signal",              # alert CEO + pause
    EventType.SIGNAL_DETECTED_HIGH: "react_high_signal",     # fast-track to hypothesis
    EventType.TREND_SPIKE: "react_trend",                    # create trend content
}


# ── Event Bus ──

class EventBus:
    """Simple in-process event bus. Events are also persisted to EventLog table."""

    def __init__(self):
        self._handlers: dict[EventType, list[Callable]] = {}

    def subscribe(self, event_type: EventType, handler: Callable[[Event], Awaitable[None]]):
        self._handlers.setdefault(event_type, []).append(handler)

    async def publish(self, event: Event):
        """Publish event → persist to DB + trigger handlers."""
        # 1. Persist to EventLog table
        await self._persist_event(event)

        # 2. Check if event maps to a playbook
        playbook_name = EVENT_PLAYBOOK_MAP.get(event.type)
        if playbook_name:
            await self._trigger_playbook(playbook_name, event)

        # 3. Call registered handlers
        for handler in self._handlers.get(event.type, []):
            try:
                await handler(event)
            except Exception as e:
                # Log but don't fail — event processing should be resilient
                logger.exception(f"Event handler failed: {e}")

    async def _persist_event(self, event: Event):
        """Save event to EventLog table."""
        from db.session import get_session
        from db.models import EventLog
        from cuid2 import cuid

        async with get_session() as session:
            log = EventLog(
                id=cuid(),
                event_type=event.type.value,
                experiment_id=event.experiment_id,
                payload=event.payload,
                triggered_playbook=EVENT_PLAYBOOK_MAP.get(event.type),
            )
            session.add(log)
            await session.commit()

    async def _trigger_playbook(self, playbook_name: str, event: Event):
        """Trigger a playbook execution from an event."""
        from .executor import execute_playbook
        # Build context from event
        context = {
            "event": {"type": event.type.value, **event.payload},
            "experiment_id": event.experiment_id,
        }
        await execute_playbook(
            playbook_name=playbook_name,
            experiment_id=event.experiment_id or "",
            initial_context=context,
            agent_runner=self._default_agent_runner,
        )


# Global event bus instance
event_bus = EventBus()
```

### Event Emission Points

```
Ở đâu emit events:

1. Orchestrator scheduler:
   - Cron triggers → emit CONTENT_CREATED, PHASE_COMPLETED

2. Distribution Agent (sau khi post):
   - await event_bus.publish(Event(type=CONTENT_POSTED, payload={...}))

3. Analytics Agent (sau khi tính metrics):
   - if cmf < 0.1 and traction < 0.1 and week >= 4:
       await event_bus.publish(Event(type=KILL_SIGNAL, ...))
   - if engagement > 3 * avg_engagement:
       await event_bus.publish(Event(type=CONTENT_PERFORMANCE_SPIKE, ...))

4. CEO Dashboard (khi CEO approve):
   - await event_bus.publish(Event(type=DISCOVER_APPROVED, ...))
   - await event_bus.publish(Event(type=STRATEGY_APPROVED, ...))

5. Research Agent (khi scan):
   - if signal_score >= 200:
       await event_bus.publish(Event(type=SIGNAL_DETECTED_HIGH, ...))
```

---

## 9. Execution Contracts

### Tại sao cần Execution Contracts?

```
Vấn đề: Agent output không predictable → downstream agents nhận garbage input
Giải pháp: JSON Schema contract cho mỗi agent

Contract = {
  input_schema:  "Agent này PHẢI nhận input dạng này"
  output_schema: "Agent này PHẢI trả output dạng này"
  kpis:          "Đo lường agent performance bằng metrics này"
}

Benefit:
  - Validate input/output tại runtime → fail fast nếu sai format
  - Downstream agents biết chắc input format
  - KPIs cho phép so sánh agent performance theo thời gian
```

### Agent Contracts

```python
# agent-system/src/agents/contracts.py

AGENT_CONTRACTS = {
    "research": {
        "input_schema": {
            "type": "object",
            "required": ["vertical", "geography", "business_type"],
            "properties": {
                "vertical": {"type": "string"},
                "geography": {"type": "string"},
                "business_type": {"type": "string", "enum": ["digital", "service", "physical", "marketplace", "hybrid"]},
                "focus_skills": {"type": "array", "items": {"type": "string"}},
            }
        },
        "output_schema": {
            "type": "object",
            "required": ["signals", "audience_intel", "segments"],
            "properties": {
                "signals": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["type", "evidence", "score"],
                        "properties": {
                            "type": {"type": "string"},
                            "evidence": {"type": "array", "items": {"type": "string"}},
                            "score": {"type": "integer", "minimum": 0, "maximum": 625},
                        }
                    }
                },
                "audience_intel": {
                    "type": "object",
                    "required": ["pain_phrases", "watering_holes"],
                    "properties": {
                        "pain_phrases": {"type": "array", "items": {"type": "string"}, "minItems": 5},
                        "watering_holes": {"type": "array", "items": {"type": "string"}},
                        "questions_asked": {"type": "array", "items": {"type": "string"}},
                    }
                },
                "segments": {
                    "type": "array",
                    "minItems": 1,
                    "items": {
                        "type": "object",
                        "required": ["name", "job", "workaround", "underservice_score"],
                    }
                },
            }
        },
        "kpis": {
            "signal_quality": "% of signals that pass Devil's Advocate stress test",
            "audience_intel_depth": "# unique pain phrases collected per run",
            "segment_accuracy": "% segments that survive customer validation",
        }
    },

    "strategy": {
        "input_schema": {
            "type": "object",
            "required": ["signals", "segments"],
            "properties": {
                "signals": {"type": "array"},
                "segments": {"type": "array"},
                "competitors": {"type": "array"},
                "stress_test": {"type": "object"},
            }
        },
        "output_schema": {
            "type": "object",
            "required": ["thesis", "cvp", "content_pillars", "experiment_plan"],
            "properties": {
                "thesis": {
                    "type": "object",
                    "required": ["statement", "playing_field", "constraints", "success_definition"],
                },
                "cvp": {
                    "type": "object",
                    "required": ["supply_cvp", "demand_cvp", "moat_type", "chicken_egg_solution"],
                },
                "content_pillars": {
                    "type": "array",
                    "minItems": 3,
                    "maxItems": 5,
                },
                "experiment_plan": {
                    "type": "object",
                    "required": ["hypothesis", "success_metric", "failure_metric", "timeline_weeks"],
                },
            }
        },
        "kpis": {
            "thesis_survival": "% theses that survive 8-week experiment",
            "cvp_clarity": "CEO approval rate on first submission (no revision needed)",
            "experiment_hit_rate": "% experiments that achieve success_metric",
        }
    },

    "content": {
        "input_schema": {
            "type": "object",
            "required": ["pillars", "audience_intel"],
            "properties": {
                "pillars": {"type": "array"},
                "audience_intel": {"type": "object"},
                "winning_patterns": {"type": "array"},
                "day_of_week": {"type": "string"},
                "week_number": {"type": "integer"},
            }
        },
        "output_schema": {
            "type": "object",
            "required": ["items"],
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["platform", "content_type", "body"],
                        "properties": {
                            "platform": {"type": "string"},
                            "content_type": {"type": "string"},
                            "hook": {"type": "string"},
                            "body": {"type": "string"},
                            "cta": {"type": "string"},
                            "pillar": {"type": "string"},
                        }
                    }
                },
                "engagement_points": {"type": "array", "items": {"type": "string"}},
            }
        },
        "kpis": {
            "cmf_contribution": "Average CMF Score of content produced",
            "audience_language_usage": "% content using exact audience pain phrases",
            "approval_rate": "% content approved by CEO without edits (semi-auto mode)",
        }
    },

    "distribution": {
        "input_schema": {
            "type": "object",
            "required": ["content"],
        },
        "output_schema": {
            "type": "object",
            "required": ["posted_ids", "engagement_actions"],
            "properties": {
                "posted_ids": {"type": "array", "items": {"type": "string"}},
                "engagement_actions": {"type": "integer"},
                "errors": {"type": "array"},
            }
        },
        "kpis": {
            "post_success_rate": "% content posted without errors",
            "engagement_reply_rate": "% strategic engagements that get replies",
            "schedule_adherence": "% posts published within scheduled window",
        }
    },

    "analytics": {
        "input_schema": {
            "type": "object",
            "required": ["experiment_id"],
        },
        "output_schema": {
            "type": "object",
            "required": ["cmf_score", "traction_score"],
            "properties": {
                "cmf_score": {"type": "number", "minimum": 0, "maximum": 1},
                "traction_score": {"type": "number", "minimum": 0, "maximum": 1},
                "trend": {"type": "string", "enum": ["up", "down", "flat"]},
                "kill_signal": {"type": "boolean"},
                "top_content": {"type": "array"},
                "recommendations": {"type": "array", "items": {"type": "string"}},
            }
        },
        "kpis": {
            "score_accuracy": "Correlation between predicted and actual outcomes",
            "kill_signal_precision": "% kill signals that CEO agreed with",
            "pattern_extraction_rate": "# actionable patterns extracted per experiment",
        }
    },

    "devils_advocate": {
        "input_schema": {
            "type": "object",
            "required": ["data"],
        },
        "output_schema": {
            "type": "object",
            "required": ["critical_weaknesses", "unvalidated_assumptions", "verdict"],
            "properties": {
                "critical_weaknesses": {"type": "array", "minItems": 1},
                "unvalidated_assumptions": {"type": "array"},
                "competitive_vulnerability": {"type": "string"},
                "kill_criteria": {"type": "array"},
                "verdict": {"type": "string", "enum": ["proceed", "caution", "more_evidence", "kill"]},
            }
        },
        "kpis": {
            "weakness_hit_rate": "% identified weaknesses that materialized",
            "false_alarm_rate": "% kill recommendations that CEO overrode successfully",
            "assumption_clarity": "% assumptions that were testable (had clear test defined)",
        }
    },
}
```

### Contract Validation

```python
# agent-system/src/agents/validator.py

import jsonschema
from .contracts import AGENT_CONTRACTS


def validate_agent_input(agent_name: str, input_data: dict) -> list[str]:
    """Validate input against agent contract. Returns list of errors (empty = valid)."""
    contract = AGENT_CONTRACTS.get(agent_name)
    if not contract:
        return []

    try:
        jsonschema.validate(input_data, contract["input_schema"])
        return []
    except jsonschema.ValidationError as e:
        return [f"Input validation failed for {agent_name}: {e.message}"]


def validate_agent_output(agent_name: str, output_data: dict) -> list[str]:
    """Validate output against agent contract. Returns list of errors."""
    contract = AGENT_CONTRACTS.get(agent_name)
    if not contract:
        return []

    try:
        jsonschema.validate(output_data, contract["output_schema"])
        return []
    except jsonschema.ValidationError as e:
        return [f"Output validation failed for {agent_name}: {e.message}"]
```

---

## 10. Feedback Loops — Closed-Loop Learning

### Tại sao cần Feedback Loops?

```
Vấn đề hiện tại: Agent tạo content → post → quên → tạo content mới
Không có learning loop → lặp lại sai lầm cũ, bỏ lỡ cái đã work

Giải pháp: Closed-loop learning cycle

Content → Metrics → Analysis → Pattern → Better Content
   ↑                                          │
   └──────────── feedback ────────────────────┘

3 Feedback Loops:

Loop 1: Content → Performance
  Content Agent tạo → post → collect metrics → identify TOP/BOTTOM performers
  → TOP patterns inject vào Content Agent prompt lần sau

Loop 2: Audience Intel → Content Language
  Research Agent thu thập pain_phrases → save to AudienceIntel table
  → Content Agent đọc pain_phrases → dùng exact language trong content
  → Track: content dùng audience language perform tốt hơn bao nhiêu?

Loop 3: Experiment → Pattern Library → Next Experiment
  8 tuần experiment → extract patterns (win/fail)
  → Pattern Library inject vào ALL agents cho experiment tiếp theo
  → Mỗi experiment mới bắt đầu từ foundation của experiment trước
```

### Pattern Injection Mechanism

```python
# agent-system/src/agents/feedback.py

from db.session import get_session
from db.models import Pattern, AudienceIntel, ContentItem
from sqlalchemy import select, func


async def get_winning_patterns(
    business_type: str | None = None,
    category: str | None = None,
    min_confidence: float = 0.5,
    limit: int = 10,
) -> list[dict]:
    """Get winning patterns from Pattern Library for prompt injection.

    Called by loader.py when building agent prompts.
    → Patterns with result='win' and high confidence are injected.
    """
    async with get_session() as session:
        q = select(Pattern).where(
            Pattern.result == "win",
            Pattern.confidence >= min_confidence,
        )
        if business_type:
            q = q.where(Pattern.business_type == business_type)
        if category:
            q = q.where(Pattern.category == category)
        q = q.order_by(Pattern.confidence.desc()).limit(limit)

        result = await session.execute(q)
        patterns = result.scalars().all()

    return [
        {
            "title": p.title,
            "description": p.description,
            "result": p.result,
            "evidence": p.evidence,
            "business_type": p.business_type,
            "confidence": p.confidence,
        }
        for p in patterns
    ]


async def get_audience_language(
    experiment_id: str,
    unused_only: bool = True,
    limit: int = 20,
) -> list[dict]:
    """Get audience pain phrases for Content Agent to use.

    Loop: Research → AudienceIntel → Content → track performance
    """
    async with get_session() as session:
        q = select(AudienceIntel).where(
            AudienceIntel.experiment_id == experiment_id,
        )
        if unused_only:
            q = q.where(AudienceIntel.used_in_content == False)
        q = q.order_by(AudienceIntel.frequency.desc()).limit(limit)

        result = await session.execute(q)
        phrases = result.scalars().all()

    return [
        {
            "phrase": p.pain_phrase,
            "platform": p.source_platform,
            "frequency": p.frequency,
            "segment": p.segment,
        }
        for p in phrases
    ]


async def track_audience_language_performance(content_id: str) -> None:
    """After collecting metrics, track how content using audience language performed.

    This closes the loop:
    pain_phrase → used in content → content performance → update phrase score
    → next time, prioritize high-performing phrases
    """
    async with get_session() as session:
        # Find which audience_intel phrases were used in this content
        intels = await session.execute(
            select(AudienceIntel).where(AudienceIntel.content_id == content_id)
        )
        phrases = intels.scalars().all()

        # Get content performance
        content = await session.get(ContentItem, content_id)
        if not content or not content.engagements:
            return

        # Calculate performance score (engagement rate)
        score = (content.engagements or 0) / max(content.impressions or 1, 1)

        # Update each phrase with performance data
        for phrase in phrases:
            phrase.performance_score = score
            session.add(phrase)

        await session.commit()


async def get_content_performance_patterns(
    experiment_id: str,
    top_n: int = 5,
) -> dict:
    """Analyze TOP and BOTTOM performing content to extract patterns.

    Returns patterns that Content Agent should REPEAT or AVOID.
    """
    async with get_session() as session:
        # Top performers
        top_q = (
            select(ContentItem)
            .where(
                ContentItem.experiment_id == experiment_id,
                ContentItem.status == "posted",
                ContentItem.engagements.isnot(None),
            )
            .order_by(ContentItem.engagements.desc())
            .limit(top_n)
        )
        top_result = await session.execute(top_q)
        top_content = top_result.scalars().all()

        # Bottom performers
        bottom_q = (
            select(ContentItem)
            .where(
                ContentItem.experiment_id == experiment_id,
                ContentItem.status == "posted",
                ContentItem.engagements.isnot(None),
            )
            .order_by(ContentItem.engagements.asc())
            .limit(top_n)
        )
        bottom_result = await session.execute(bottom_q)
        bottom_content = bottom_result.scalars().all()

    return {
        "repeat_these": [
            {
                "hook": c.hook,
                "pillar": c.pillar,
                "content_type": c.content_type,
                "engagement": c.engagements,
                "platform": c.platform,
            }
            for c in top_content
        ],
        "avoid_these": [
            {
                "hook": c.hook,
                "pillar": c.pillar,
                "content_type": c.content_type,
                "engagement": c.engagements,
                "platform": c.platform,
            }
            for c in bottom_content
        ],
    }
```

### How Feedback Flows Into Agent Prompts

```python
# Trong orchestrator, TRƯỚC KHI chạy Content Agent:

from agents.feedback import (
    get_winning_patterns,
    get_audience_language,
    get_content_performance_patterns,
)
from agents.loader import load_agent

async def prepare_content_agent(experiment_id: str, business_type: str):
    """Load Content Agent with feedback data injected into prompt."""

    # 1. Get winning patterns from Pattern Library
    patterns = await get_winning_patterns(
        business_type=business_type,
        category="content",
    )

    # 2. Load agent with patterns injected
    agent = load_agent("content", inject_patterns=patterns)

    # 3. Get audience language (for the prompt's input context)
    audience_phrases = await get_audience_language(experiment_id)

    # 4. Get performance patterns (what worked, what didn't)
    performance = await get_content_performance_patterns(experiment_id)

    # 5. Build rich input for the agent
    agent_input = {
        "audience_pain_phrases": audience_phrases,
        "top_performing_content": performance["repeat_these"],
        "underperforming_content": performance["avoid_these"],
        # ... plus pillars, day_of_week, etc from playbook
    }

    return agent, agent_input
```

### Closed-Loop Learning Diagram

```
Week 1:
  Research Agent → pain_phrases → AudienceIntel table
  Content Agent → creates content (generic, no patterns yet)
  Distribution Agent → posts
  Analytics Agent → collects metrics

Week 2:
  Content Agent now has:
    ✓ audience pain_phrases (from Research)
    ✓ top/bottom performers from Week 1
  → Content quality IMPROVES

Week 4:
  Content Agent now has:
    ✓ audience pain_phrases (growing database)
    ✓ 3 weeks of performance data
    ✓ Patterns: "hooks with questions get 2x engagement"
  → Content quality SIGNIFICANTLY IMPROVES

Week 8:
  Analytics Agent → extracts patterns:
    "Vietnamese SME lending: question-hooks + pain-phrase CTAs = 3x avg"
  → Saved to Pattern Library

Next Experiment:
  ALL agents load with Pattern Library injected:
    "From past experiments: question-hooks work for SME audience..."
  → Cold start is FASTER because agents start with proven knowledge
```

---

## 11. Orchestrator — Bộ não điều phối

### Architecture: Event Processor + Playbook Executor + State Machine

```
Orchestrator cũ: 1 file lớn, hardcode tất cả logic
Orchestrator mới: 3 thành phần tách biệt

┌─────────────────────────────────────────────────┐
│              ORCHESTRATOR                         │
│                                                   │
│  ┌─────────────┐   ┌──────────────┐              │
│  │ Event Bus   │──▶│ Condition    │              │
│  │ (receives)  │   │ Evaluator    │              │
│  └─────────────┘   └──────┬───────┘              │
│                           │ triggers              │
│                    ┌──────▼───────┐               │
│                    │ Playbook     │               │
│                    │ Executor     │               │
│                    └──────┬───────┘               │
│                           │ dispatches            │
│                    ┌──────▼───────┐               │
│                    │ Agent        │               │
│                    │ Dispatcher   │               │
│                    └──────┬───────┘               │
│                           │ validates             │
│                    ┌──────▼───────┐               │
│                    │ Contract     │               │
│                    │ Validator    │               │
│                    └──────────────┘               │
└─────────────────────────────────────────────────┘
```

### Pipeline State Machine (simplified — delegates to playbooks)

```python
# agent-system/src/orchestrator/pipeline.py

from enum import Enum
from dataclasses import dataclass, field


class Phase(Enum):
    DISCOVER = "discover"
    DEFINE = "define"
    CEO_CHECKPOINT_STRATEGY = "ceo_checkpoint_strategy"
    BUILD_TEST = "build_test"
    CEO_CHECKPOINT_MIDPOINT = "ceo_checkpoint_midpoint"
    DECIDE = "decide"
    EXTRACT = "extract"
    COMPLETED = "completed"
    KILLED = "killed"


# Phase → which playbook to execute
PHASE_PLAYBOOK: dict[Phase, str | None] = {
    Phase.DISCOVER: "discover",
    Phase.DEFINE: "define",
    Phase.CEO_CHECKPOINT_STRATEGY: None,  # PAUSE — wait for CEO
    Phase.BUILD_TEST: None,               # Managed by daily/weekly cron playbooks
    Phase.CEO_CHECKPOINT_MIDPOINT: None,  # PAUSE — wait for CEO
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
    week_number: int
    session_ids: dict[str, str] = field(default_factory=dict)
    playbook_runs: dict[str, str] = field(default_factory=dict)  # phase → playbook_run_id
```

### Agent Dispatcher (Claude SDK integration)

```python
# agent-system/src/orchestrator/dispatcher.py

from claude_agent_sdk import query, ClaudeAgentOptions, ResultMessage
from agents.loader import load_agent
from agents.validator import validate_agent_input, validate_agent_output
from agents.feedback import get_winning_patterns
from tools.server import marketing_tools_server, db_tools_server
from db.models import AgentOutput
from db.session import get_session
import logging

logger = logging.getLogger(__name__)


async def run_agent(
    agent_name: str,
    skill: str | None,
    input_data: dict,
    experiment_id: str = "",
    business_type: str = "",
) -> dict:
    """Run an agent with contract validation and feedback injection.

    This is the single entry point for all agent execution.
    Called by: Playbook Executor, Event handlers, API endpoints.
    """

    # 1. Validate input against contract
    input_errors = validate_agent_input(agent_name, input_data)
    if input_errors:
        logger.warning("Input validation failed for %s: %s", agent_name, input_errors)
        # Don't hard-fail — log warning, agent may still produce useful output

    # 2. Load agent with winning patterns injected (feedback loop)
    patterns = await get_winning_patterns(business_type=business_type or None)
    agent_def = load_agent(agent_name, inject_patterns=patterns)

    # 3. Build prompt from input data
    prompt = _build_prompt(agent_name, skill, input_data, experiment_id)

    # 4. Run via Claude Agent SDK
    result_data = {}
    async for message in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep", "WebSearch", "WebFetch"],
            agents={agent_name: agent_def},
            mcp_servers={
                "marketing-tools": marketing_tools_server,
                "db-tools": db_tools_server,
            },
            max_turns=30,
        ),
    ):
        if isinstance(message, ResultMessage):
            result_data = {
                "session_id": message.session_id,
                "result": message.result if message.subtype == "success" else None,
                "status": message.subtype,
                "cost": message.total_cost_usd,
            }

    # 5. Validate output against contract
    if result_data.get("result"):
        output_errors = validate_agent_output(agent_name, result_data["result"])
        if output_errors:
            logger.warning("Output validation failed for %s: %s", agent_name, output_errors)

    # 6. Save output to DB
    if experiment_id and result_data.get("result"):
        await _save_output(experiment_id, agent_name, skill, input_data, result_data)

    return result_data.get("result", {})


def _build_prompt(agent_name: str, skill: str | None, input_data: dict, experiment_id: str) -> str:
    """Build agent prompt from structured input."""
    import json

    skill_instruction = f"\nFocus on skill: {skill}" if skill else ""
    return f"""
Experiment: {experiment_id}
{skill_instruction}

Input data:
{json.dumps(input_data, indent=2, ensure_ascii=False)}

Instructions:
1. Read any relevant previous outputs from database (read_agent_output tool).
2. Execute the appropriate skills based on the input.
3. Save your output to database (save_agent_output tool).
4. Return structured JSON matching your output contract.
"""


async def _save_output(experiment_id, agent_name, skill, input_data, result_data):
    """Persist agent output to database."""
    from cuid2 import cuid
    async with get_session() as session:
        output = AgentOutput(
            id=cuid(),
            experiment_id=experiment_id,
            agent_name=agent_name,
            skill_code=skill,
            phase="current",
            input_data=input_data,
            output_data=result_data.get("result"),
            session_id=result_data.get("session_id"),
            cost_usd=result_data.get("cost"),
        )
        session.add(output)
        await session.commit()
```

### Scheduler (Cron + Event hybrid)

```python
# agent-system/src/orchestrator/scheduler.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .event_bus import event_bus, Event, EventType
from .executor import execute_playbook
from .dispatcher import run_agent

scheduler = AsyncIOScheduler()


# ── Time-based triggers (cron) ──

scheduler.add_job(
    _trigger_daily_content, "cron",
    hour=6, minute=0,
    id="daily_content",
)

scheduler.add_job(
    _trigger_daily_metrics, "cron",
    hour=18, minute=0,
    id="daily_metrics",
)

scheduler.add_job(
    _trigger_weekly_analysis, "cron",
    day_of_week="mon", hour=9,
    id="weekly_analysis",
)

scheduler.add_job(
    _trigger_trend_scan, "cron",
    hour="*/4",
    id="trend_scan",
)


async def _trigger_daily_content():
    """Cron → execute build_test_daily playbook."""
    from db.session import get_session
    from db.models import SystemState
    async with get_session() as session:
        state = await session.get(SystemState, "singleton")
        if not state or not state.active_experiment_id:
            return

    await execute_playbook(
        playbook_name="build_test_daily",
        experiment_id=state.active_experiment_id,
        initial_context={"today": {"day_name": datetime.now().strftime("%A")}},
        agent_runner=run_agent,
    )


async def _trigger_weekly_analysis():
    """Cron → execute build_test_weekly playbook."""
    # Similar to daily but for weekly playbook
    ...


async def _trigger_trend_scan():
    """Cron → Research Agent scans trends every 4 hours."""
    # Lightweight — only G10 skill
    ...


# ── Event-based triggers (reactive) ──

@event_bus.subscribe(EventType.CONTENT_PERFORMANCE_SPIKE)
async def on_viral_content(event: Event):
    """React to viral content — repurpose immediately."""
    await run_agent(
        agent_name="content",
        skill="C10",  # Repurposing
        input_data={"viral_content": event.payload},
        experiment_id=event.experiment_id or "",
    )


@event_bus.subscribe(EventType.KILL_SIGNAL)
async def on_kill_signal(event: Event):
    """React to kill signal — alert CEO immediately."""
    # Send Telegram/Slack notification
    # Pause all automation for this experiment
    ...


@event_bus.subscribe(EventType.SIGNAL_DETECTED_HIGH)
async def on_high_signal(event: Event):
    """React to high-score signal — fast-track to hypothesis backlog."""
    # Auto-create Tier 1 hypothesis
    ...
```

---

## 12. CEO Dashboard — Chuyển đổi Next.js frontend

### API Routes mới (proxy to Python backend)

```typescript
// marketplace-factory/src/app/api/agent/route.ts
// Proxy mọi agent requests sang Python backend

import { NextRequest, NextResponse } from "next/server";

const AGENT_API = process.env.AGENT_API_URL || "http://localhost:8001";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const resp = await fetch(`${AGENT_API}/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  return NextResponse.json(data);
}
```

```typescript
// marketplace-factory/src/app/api/pipeline/route.ts

export async function GET() {
  const resp = await fetch(`${AGENT_API}/pipeline/status`);
  return NextResponse.json(await resp.json());
}
```

```typescript
// marketplace-factory/src/app/api/approve/route.ts

export async function POST(req: NextRequest) {
  const { experiment_id, checkpoint, decision, notes } = await req.json();

  const resp = await fetch(`${AGENT_API}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ experiment_id, checkpoint, decision, notes }),
  });

  return NextResponse.json(await resp.json());
}
```

### Components mới

```typescript
// marketplace-factory/src/components/cockpit/AgentStatus.tsx
// Hiển thị real-time status của mỗi agent

"use client";
import { useEffect, useState } from "react";

interface AgentState {
  name: string;
  status: "idle" | "running" | "done" | "error";
  last_run: string;
  last_output_summary: string;
  cost_today: number;
}

export function AgentStatus() {
  const [agents, setAgents] = useState<AgentState[]>([]);

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch("/api/agent?action=status");
      setAgents(await res.json());
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-mono text-text1">AGENTS</h3>
      {agents.map((a) => (
        <div key={a.name} className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${
            a.status === "running" ? "bg-amber animate-pulse" :
            a.status === "done" ? "bg-teal" :
            a.status === "error" ? "bg-red" : "bg-text2"
          }`} />
          <span className="font-mono text-text0">{a.name}</span>
          <span className="text-text2 ml-auto">{a.last_run}</span>
        </div>
      ))}
    </div>
  );
}
```

```typescript
// marketplace-factory/src/components/cockpit/ApprovalCard.tsx
// CEO approve/reject interface

"use client";
import { useState } from "react";

interface Approval {
  id: string;
  experiment_id: string;
  checkpoint: string;
  agent_recommendation: {
    decision: string;
    rationale: string;
    key_data: Record<string, any>;
  };
}

export function ApprovalCard({ approval }: { approval: Approval }) {
  const [notes, setNotes] = useState("");

  const handleDecision = async (decision: string) => {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experiment_id: approval.experiment_id,
        checkpoint: approval.checkpoint,
        decision,
        notes,
      }),
    });
  };

  return (
    <div className="bg-bg2 border border-amber/30 rounded-lg p-4">
      <h3 className="text-amber font-mono text-sm">
        ⚡ CEO DECISION REQUIRED
      </h3>
      <p className="text-text0 mt-2">{approval.checkpoint}</p>

      <div className="mt-3 bg-bg1 rounded p-3 text-xs text-text1">
        <p className="font-bold">Agent Recommendation:</p>
        <p className="text-text0">{approval.agent_recommendation.decision}</p>
        <p className="mt-1">{approval.agent_recommendation.rationale}</p>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)..."
        className="w-full mt-3 bg-bg1 text-text0 text-xs p-2 rounded"
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => handleDecision("approve")}
          className="bg-teal text-bg0 px-3 py-1 rounded text-xs"
        >
          Approve
        </button>
        <button
          onClick={() => handleDecision("adjust")}
          className="bg-amber text-bg0 px-3 py-1 rounded text-xs"
        >
          Adjust
        </button>
        <button
          onClick={() => handleDecision("kill")}
          className="bg-red text-bg0 px-3 py-1 rounded text-xs"
        >
          Kill
        </button>
      </div>
    </div>
  );
}
```

```typescript
// marketplace-factory/src/components/cockpit/ContentQueue.tsx
// Review + approve content trước khi post

"use client";
import { useEffect, useState } from "react";

interface ContentItem {
  id: string;
  platform: string;
  content_type: string;
  hook: string;
  body: string;
  cta: string;
  status: string;
  pillar: string;
}

export function ContentQueue() {
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    fetch("/api/agent?action=content_queue").then(r => r.json()).then(setItems);
  }, []);

  const approve = async (id: string) => {
    await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ action: "approve_content", content_id: id }),
    });
    setItems(items.map(i => i.id === id ? { ...i, status: "approved" } : i));
  };

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-sm text-text1">CONTENT QUEUE</h3>
      {items.filter(i => i.status === "draft").map((item) => (
        <div key={item.id} className="bg-bg2 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-text2">
            <span className="bg-bg3 px-2 py-0.5 rounded">{item.platform}</span>
            <span>{item.content_type}</span>
            <span className="text-violet">{item.pillar}</span>
          </div>
          {item.hook && (
            <p className="text-amber text-sm mt-2 font-medium">{item.hook}</p>
          )}
          <p className="text-text0 text-xs mt-1 whitespace-pre-wrap">{item.body}</p>
          {item.cta && (
            <p className="text-teal text-xs mt-1">{item.cta}</p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => approve(item.id)}
              className="bg-teal/20 text-teal px-2 py-0.5 rounded text-xs"
            >
              Approve
            </button>
            <button className="bg-red/20 text-red px-2 py-0.5 rounded text-xs">
              Reject
            </button>
            <button className="bg-amber/20 text-amber px-2 py-0.5 rounded text-xs">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Dashboard Layout cập nhật

```
┌─────────────────────────────────────────────────────────────────┐
│ TOP BAR: Logo · Experiment Name · Phase Badge · Week Counter    │
├────────────┬──────────────────────────────────┬─────────────────┤
│            │                                  │                 │
│  LEFT      │         CENTER                   │    RIGHT        │
│  280px     │         flex-1                   │    300px        │
│            │                                  │                 │
│  Pipeline  │  Tabs:                           │  Agent Status   │
│  Cards     │  [Content] [Metrics] [Actions]   │  (7 agents)     │
│            │  [Timeline]                      │                 │
│  ────────  │                                  │  ────────       │
│            │  Content Tab:                    │  CEO Approvals  │
│  Hypothesis│    Content Queue                 │  (pending)      │
│  Backlog   │    (approve/reject posts)        │                 │
│            │                                  │  ────────       │
│  ────────  │  Metrics Tab:                    │                 │
│            │    CMF Score gauge               │  AI Assessment  │
│  Quick     │    Traction Score gauge          │  (latest)       │
│  Capture   │    Weekly trend chart            │                 │
│            │                                  │  ────────       │
│            │  Actions Tab:                    │                 │
│            │    What agents are doing/did     │  Cost Tracker   │
│            │    Full output history           │  ($X.XX today)  │
│            │                                  │                 │
└────────────┴──────────────────────────────────┴─────────────────┘
```

---

## 13. Daily Automation Loop

### Chế độ hoạt động

```
MODE 1: FULL AUTO (không cần CEO approve content)
  Content Agent tạo → Distribution Agent post ngay
  CEO chỉ review tuần 1 lần + 3 checkpoints

MODE 2: SEMI AUTO (CEO approve content trước khi post) ← RECOMMEND Phase 1
  Content Agent tạo → CEO approve trên Dashboard → Distribution Agent post
  CEO review content 1 lần/ngày (5-10 phút)

MODE 3: MANUAL (CEO trigger mỗi bước)
  Cho debugging / learning
```

### Cron Schedule

```python
# agent-system/src/orchestrator/scheduler.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

# Daily tasks (trong BUILD_TEST phase)
scheduler.add_job(daily_content_creation, "cron", hour=6, minute=0)   # Tạo content
scheduler.add_job(daily_distribution, "cron", hour=8, minute=0)       # Post + engage
scheduler.add_job(daily_metrics_collection, "cron", hour=18, minute=0) # Collect metrics

# Weekly tasks
scheduler.add_job(weekly_analysis, "cron", day_of_week="mon", hour=9)  # Full analysis
scheduler.add_job(weekly_ceo_report, "cron", day_of_week="mon", hour=10) # CEO report

# Continuous (every 4 hours)
scheduler.add_job(trend_scan, "cron", hour="*/4")  # G10 Trend scanning
```

### Notification Flow

```
Agent chạy xong → lưu DB → trigger event
Event → check: CEO cần biết không?

ALWAYS notify:
  - CEO Checkpoint cần approve
  - Kill signal detected (CMF + Traction both < 0.1)
  - Agent error (failed to run)

DAILY digest (1 lần/ngày qua Telegram):
  - Content created: N items
  - Content posted: N items
  - Top performing: [title] — [engagement]
  - Scores: CMF [X] Traction [X]

WEEKLY report (1 lần/tuần qua Slack + Dashboard):
  - Full scorecard
  - Week-over-week comparison
  - Agent cost summary
  - Recommendation
```

---

## 14. Build Order — 7 Sprints

### Sprint 0: Foundation (4 ngày)

```
□ Tạo agent-system/ project structure
  $ mkdir -p agent-system/{src/{orchestrator,agents,tools,db,api},skills/{research,strategy,creation,growth,analysis,decision},agents,playbooks,data,tests}
  $ cd agent-system && uv init

□ Setup dependencies
  pyproject.toml:
    dependencies = [
      "claude-agent-sdk",
      "fastapi",
      "uvicorn",
      "sqlalchemy[asyncio]",
      "aiosqlite",      # SQLite async driver
      "httpx",          # HTTP client
      "apscheduler",    # Cron scheduler
      "python-dotenv",
      "cuid2",          # ID generation
      "pyyaml",         # Parse .md frontmatter + playbook YAML
      "jsonschema",     # Contract validation
    ]

□ Database setup (SQLite — no Docker needed)
  - Tạo models.py (copy từ Section 4 — includes AudienceIntel, SystemState, EventLog)
  - Tạo session.py với WAL mode
  - Run: `uv run python -c "from db.models import Base; ...create_all()"`
  - Verify: data/agent.db exists with ALL tables

□ Skill files — tạo 44 .md files
  - Extract từ skills-architecture.md → individual .md files
  - Mỗi file có frontmatter (code, name, TYPE: api|reasoning, category, tools_required)
  - Verify: loader.py đọc được tất cả 44 skills
  - Verify: loader separates api vs reasoning skills correctly

□ Agent configs — tạo 7 .md files
  - Mỗi file: role prompt + skill list + model + extra_tools
  - Verify: loader.py build được 7 AgentDefinitions

□ Playbook YAML files — tạo 6 playbooks
  - discover.yaml, define.yaml, build_test_daily.yaml,
    build_test_weekly.yaml, decide.yaml, extract.yaml
  - Verify: executor.py can parse all playbooks
  - Verify: template resolution works ({{variable}} → actual values)

□ Execution contracts — tạo contracts.py
  - JSON Schema cho mỗi agent input/output
  - validator.py cho runtime validation
  - Verify: validate_agent_input/output works

□ Event bus setup
  - event_bus.py với EventType definitions
  - EVENT_PLAYBOOK_MAP linking events → playbooks
  - Verify: event_bus.publish() → persists to EventLog

□ Verify: `uv run python -c "from claude_agent_sdk import query; print('OK')"`
□ Verify: `uv run python -c "from agents.loader import load_all_agents; print(load_all_agents().keys())"`
□ Verify: `uv run python -c "from orchestrator.executor import load_playbook; print(load_playbook('discover'))"`

DELIVERABLE: Project chạy được, DB created (all tables), 44 skills loaded (api/reasoning),
7 agents loadable, 6 playbooks parseable, contracts defined, event bus working.
```

### Sprint 1: Research Agent (5 ngày)

```
□ Viết agents/research.md + skills/research/R1-R7.md (đã có từ Sprint 0)
□ Build research_tools.py:
  - social_listen (Twitter API + Reddit API)
  - scan_market (SerpAPI)
  - map_competitors (SerpAPI + web scrape)
□ Build db_tools.py:
  - save_agent_output
  - read_agent_output
  - read_experiment
□ Build tools/server.py (MCP server setup)
□ Build agents/definitions.py (research agent only)
□ Build simple dispatcher (run 1 agent)
□ Build FastAPI endpoint: POST /agent/run

TEST:
  Input: {"agent": "research", "experiment_id": "test1",
          "prompt": "Scan Vietnamese tutoring market"}
  Expected: JSON output với signals, audience_intel, segments

DELIVERABLE: Research Agent chạy end-to-end, output saved to DB.
```

### Sprint 2: Strategy + Devil's Advocate Agents (5 ngày)

```
□ Viết strategy.py system prompt
□ Viết devils_advocate.py system prompt
□ Add agents to definitions.py
□ Build pipeline.py — DISCOVER + DEFINE phases
□ Build CEO approval endpoint: POST /approve
□ Build notification: Telegram webhook

TEST:
  1. Trigger DISCOVER → Research Agent chạy
  2. Auto-advance to DEFINE → Strategy Agent chạy
  3. Devil's Advocate auto-triggers
  4. Pipeline PAUSES at CEO_CHECKPOINT
  5. CEO approves via API
  6. Pipeline advances

DELIVERABLE: Pipeline DISCOVER → DEFINE → CEO_CHECKPOINT works.
```

### Sprint 3: Content + Distribution Agents (7 ngày)

```
□ Viết content.py system prompt
□ Viết distribution.py system prompt
□ Build content_tools.py (save_content, read_content_queue)
□ Build social_api.py:
  - post_twitter (Twitter API v2 OAuth)
  - reply_twitter
  - fetch_twitter_metrics
□ Build growth_tools.py:
  - schedule_content
  - update_content_status
□ Build daily_loop trong scheduler.py
□ Integrate content review flow

TEST (MODE 2 — semi auto):
  1. Daily 6AM: Content Agent tạo 1 tweet + 1 thread → saved as DRAFT
  2. CEO opens dashboard → reviews → approves
  3. Distribution Agent posts approved content
  4. Evening: metrics collected

DELIVERABLE: Content pipeline runs daily, posts to real Twitter account.
```

### Sprint 4: Analytics Agent + Scores (5 ngày)

```
□ Viết analytics.py system prompt
□ Build analysis_tools.py:
  - save_weekly_metric
  - save_pattern
  - fetch_web_analytics
□ Implement CMF Score calculation (A6)
□ Implement Traction Score calculation (A5)
□ Build weekly_analysis trong scheduler.py
□ Build weekly CEO report (Telegram + Dashboard)
□ Implement kill signal detection

TEST:
  After 1 week of content:
  1. Analytics Agent calculates CMF Score
  2. Score appears on Dashboard
  3. Weekly report sent to Telegram
  4. If score < threshold → kill signal alert

DELIVERABLE: Metrics pipeline works, scores calculated, CEO notified.
```

### Sprint 5: Dashboard + Full Loop (7 ngày)

```
□ Rewrite marketplace-factory/src/app/page.tsx → 3-column layout
□ Build AgentStatus.tsx
□ Build ApprovalCard.tsx
□ Build ContentQueue.tsx
□ Build PipelineFlow.tsx (visual pipeline progress)
□ Build Score gauges (CMF + Traction)
□ Wire up all API proxies (agent/, pipeline/, approve/)
□ Build Product Agent (Sprint 5 hoặc defer)
□ End-to-end test: full 1-week cycle

TEST (full cycle):
  1. Create experiment via Dashboard
  2. Research Agent runs DISCOVER
  3. Strategy Agent runs DEFINE
  4. CEO approves strategy
  5. Content + Distribution run daily for 7 days
  6. Analytics calculates weekly scores
  7. Dashboard shows all data real-time
  8. CEO receives weekly report

DELIVERABLE: Full system operational for 1-week test run.
```

### Sprint 6: Feedback Loops + Closed-Loop Learning (5 ngày)

```
□ Build feedback.py:
  - get_winning_patterns() — inject patterns into agent prompts
  - get_audience_language() — audience phrases for Content Agent
  - track_audience_language_performance() — close the loop
  - get_content_performance_patterns() — top/bottom analysis

□ Update loader.py:
  - inject_patterns parameter
  - Separate api/reasoning skill sections in prompt

□ AudienceIntel pipeline:
  - Research Agent → save pain_phrases to AudienceIntel table
  - Content Agent → read unused phrases → use in content
  - Analytics Agent → track which phrases → which performance

□ Pattern Library auto-extraction:
  - Analytics Agent (A7) → auto-extract after experiment ends
  - Patterns saved with confidence score
  - Next experiment loads patterns into all agent prompts

□ Content performance feedback:
  - Weekly: identify TOP 5 and BOTTOM 5 content
  - Inject into Content Agent prompt: "repeat these / avoid these"

TEST:
  1. Week 1: Content generic (no patterns yet)
  2. Week 2: Content uses audience phrases + avoids week 1 failures
  3. Week 3+: Measurable improvement in engagement quality
  4. End of experiment: Patterns extracted + saved

DELIVERABLE: Closed-loop learning working. Content quality improves week over week.
```

### Sprint 7: Polish + Scale (5 ngày)

```
□ Hypothesis Backlog management (auto-feed from Research Agent)
□ Multi-platform: LinkedIn posting
□ Email/Newsletter integration (G5)
□ Content repurposing (C10): tweet → thread → newsletter
□ Cost tracking dashboard
□ Error handling + retry logic
□ Logging + monitoring
□ Reactive event handlers (viral content, trend spike, kill signal)

DELIVERABLE: Production-ready system.
```

### Tổng timeline

```
Sprint 0:  4 ngày   Foundation (DB + skills + playbooks + contracts + events)
Sprint 1:  5 ngày   Research Agent
Sprint 2:  5 ngày   Strategy + Devil's Advocate
Sprint 3:  7 ngày   Content + Distribution
Sprint 4:  5 ngày   Analytics + Scores
Sprint 5:  7 ngày   Dashboard + Full Loop
Sprint 6:  5 ngày   Feedback Loops + Closed-Loop Learning
Sprint 7:  5 ngày   Polish

TỔNG: ~43 ngày làm việc (8-9 tuần)

NHƯNG: Sprint 1-2 là đủ để chạy DISCOVER + DEFINE.
        Sprint 3 là đủ để bắt đầu post content thực tế.
        Sprint 6 là khi system bắt đầu LEARN và improve.
        → Bắt đầu experiment thực từ tuần 3-4.
        → System bắt đầu compound learning từ tuần 7-8.
```

---

## 15. Chi phí vận hành ước tính

### Claude API Cost

```
AGENT          MODEL    AVG TOKENS/RUN   RUNS/DAY   COST/DAY
────────────────────────────────────────────────────────────────
Research       Sonnet   ~50K             0.14/day    $0.15
Strategy       Opus     ~30K             0.03/day    $0.30
Content        Sonnet   ~20K             1/day       $0.12
Distribution   Sonnet   ~10K             1/day       $0.06
Analytics      Opus     ~30K             0.14/day    $0.30
Devil's Advoc  Opus     ~20K             0.07/day    $0.15
Product        Sonnet   ~15K             0.07/day    $0.03
────────────────────────────────────────────────────────────────
TOTAL DAILY:                                         ~$1.11
TOTAL MONTHLY:                                       ~$33

(Giả sử: DISCOVER/DEFINE chạy 1 lần/experiment,
 BUILD_TEST chạy daily, Analytics 1/tuần trong tuần thường)
```

### External APIs

```
Twitter API:    Free tier (read) + Basic $100/mo (write)
SerpAPI:        $50/mo (5000 searches)
SQLite:         $0 (file-based, zero infrastructure)
Hosting:        $10-20/mo (VPS cho Python + Next.js)
────────────────────────────────────────────────────────────
TOTAL MONTHLY:  ~$195 (conservative)
```

### So sánh với thuê người

```
1 junior marketer:     $500-1500/tháng (VN market)
1 content writer:      $300-800/tháng
1 data analyst:        $500-1200/tháng
────────────────────────────────────────────────────────────
TOTAL (3 người):       $1300-3500/tháng

Agent System:           $200/tháng + CEO 30 phút/ngày
Savings:               ~85-95%
```

---

## File References

```
Tham chiếu khi build:

SKILLS → AGENTS:     skills-architecture.md (Section 5 — Role × Skill map)
AGENT PROMPTS:       skills-architecture.md (Section 4 — skill details)
PIPELINE FLOW:       skills-architecture.md (Section 2 — universal pipeline)
BUSINESS TYPES:      skills-architecture.md (Section 6 — adaptations)
METRICS:             skills-architecture.md (Section 10 — Traction Score)
MARKETING TACTICS:   marketing-journey-frameworks-2025.md (thought leader frameworks)
SYSTEM RULES:        CLAUDE.md (phase constraints, role definitions)
```
