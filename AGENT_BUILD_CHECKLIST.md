# Checklist thực thi Agent System Blueprint

> Tổng: ~43 ngày | 8 Sprints (0-7) | ~160 tasks
> Track: [ ] chưa làm · [x] xong · [~] đang làm
> Reference: `AGENT_SYSTEM_BLUEPRINT.md`
> Last updated: 2026-03-22

---

## Pre-flight: Chuẩn bị

### Accounts & API Keys
- [x] Anthropic API key (Claude Agent SDK) ✅
- [ ] Twitter/X API v2 Basic tier ($100/mo)
- [ ] Instagram Business Account + Access Token (Doitay.vn chưa link IG)
- [x] Facebook Page Access Token ✅ (Doitay.vn — 663482443525186, never-expiring)
- [x] SerpAPI key ✅
- [x] Firecrawl API key ✅
- [ ] Telegram Bot Token (notifications)
- [ ] (Optional) LinkedIn API
- [ ] (Optional) Reddit API

### Environment
- [x] Python >= 3.12
- [ ] `uv` installed (dùng pip thay thế OK)
- [ ] Node.js >= 18 (Next.js frontend — Sprint 5)
- [ ] Git init cho `agent-system/`

### Kiến thức cần nắm
- [ ] Đọc Blueprint Section 1 — kiến trúc 4 lớp
- [ ] Đọc skills architecture — 49 skills, 7 roles
- [ ] Đọc Claude Agent SDK docs — `query()`, `AgentDefinition`, MCP tools

---

## Sprint 0: Foundation (4 ngày) ✅ DONE

### 0.1 Project Structure
- [x] Tạo `agent-system/` root
- [x] Tạo `src/` với subdirs: orchestrator, agents, tools, db, api
- [x] Tạo `skills/` với 6 subdirs: research, strategy, creation, growth, analysis, decision
- [x] Tạo `agents/` dir
- [x] Tạo `playbooks/` dir
- [x] Tạo `data/` dir
- [x] Tạo `tests/` dir
- [x] Tạo `.env` template (with Instagram, Facebook, LinkedIn, Reddit keys)
- [x] Tạo `__init__.py` cho mỗi package (7 files)
- [x] Tạo `src/main.py` (FastAPI skeleton)
- [x] Tạo `src/config.py` (Settings — env vars, paths)

### 0.2 Dependencies
- [x] `pyproject.toml` created
- [x] Deps: claude-agent-sdk, fastapi, uvicorn, sqlalchemy[asyncio], aiosqlite, httpx, apscheduler, python-dotenv, cuid2, pyyaml, jsonschema, requests-oauthlib, pydantic
- [x] `pip install -e ".[dev]"` — all deps installed
- [x] Verify: claude_agent_sdk imports OK

### 0.3 Database (10 tables)
- [x] `src/db/models.py` — Experiment model
- [x] `src/db/models.py` — AgentOutput model
- [x] `src/db/models.py` — ContentItem model (with saves/shares/reactions for IG/FB)
- [x] `src/db/models.py` — WeeklyMetric model
- [x] `src/db/models.py` — CEOApproval model
- [x] `src/db/models.py` — Pattern model
- [x] `src/db/models.py` — Hypothesis model
- [x] `src/db/models.py` — AudienceIntel model
- [x] `src/db/models.py` — SystemState model (singleton)
- [x] `src/db/models.py` — EventLog model
- [x] `src/db/session.py` — engine + WAL mode + SessionLocal
- [x] `src/db/queries.py` — common queries
- [x] 10 tables verified

### 0.4 Skill Files — 49 .md (type: api hoặc reasoning)

**Research (7)** ✅
- [x] `R1_market_scanning.md` (api)
- [x] `R2_social_listening.md` (api)
- [x] `R3_influencer_mapping.md` (api)
- [x] `R4_competitive_intelligence.md` (api)
- [x] `R5_content_benchmarking.md` (api)
- [x] `R6_customer_research.md` (reasoning)
- [x] `R7_pricing_research.md` (api) — full Vietnamese version with business type adaptations

**Strategy (8)** ✅
- [x] `S1_thesis_formation.md` (reasoning)
- [x] `S2_segmentation.md` (reasoning)
- [x] `S3_value_proposition.md` (reasoning)
- [x] `S4_offer_design.md` (reasoning)
- [x] `S5_content_pillars.md` (reasoning)
- [x] `S6_channel_strategy.md` (reasoning)
- [x] `S7_experiment_design.md` (reasoning)
- [x] `S8_go_to_market.md` (reasoning)

**Creation (10)** ✅
- [x] `C1_hook_writing.md` (reasoning)
- [x] `C2_longform_writing.md` (reasoning)
- [x] `C3_shortform_writing.md` (reasoning)
- [x] `C4_storytelling.md` (reasoning)
- [x] `C5_visual_content.md` (api)
- [x] `C6_zero_click_content.md` (reasoning)
- [x] `C7_cta_conversion_copy.md` (reasoning)
- [x] `C8_mvp_prototype.md` (reasoning)
- [x] `C9_offer_packaging.md` (reasoning)
- [x] `C10_repurposing.md` (reasoning)

**Growth (10)** ✅
- [x] `G1_strategic_engagement.md` (api)
- [x] `G2_community_building.md` (reasoning)
- [x] `G3_profile_optimization.md` (reasoning)
- [x] `G4_audience_nurturing.md` (reasoning)
- [x] `G5_email_newsletter.md` (api)
- [x] `G6_paid_acquisition.md` (reasoning)
- [x] `G7_outbound_sales.md` (api)
- [x] `G8_referral_partnership.md` (reasoning)
- [x] `G9_scheduling_ops.md` (api)
- [x] `G10_trend_riding.md` (api)

**Analysis (9)** ✅
- [x] `A1_stress_testing.md` (reasoning)
- [x] `A2_opportunity_scoring.md` (reasoning)
- [x] `A3_unit_economics.md` (reasoning)
- [x] `A4_content_performance.md` (api)
- [x] `A5_traction_scoring.md` (reasoning)
- [x] `A6_cmf_scoring.md` (reasoning)
- [x] `A7_pattern_extraction.md` (reasoning)
- [x] `A8_customer_analytics.md` (api)
- [x] `A9_portfolio_analysis.md` (reasoning)

**Decision (6)** ✅
- [x] `D1_kill_pivot_continue.md` (reasoning)
- [x] `D2_resource_allocation.md` (reasoning)
- [x] `D3_phase_transition.md` (reasoning)
- [x] `D4_build_buy_partner.md` (reasoning) ✅
- [x] `D5_strategy_pivot.md` (reasoning)
- [x] `D6_tension_resolution.md` (reasoning)

### 0.5 Agent Configs — 7 .md ✅
- [x] `agents/research.md` — R1-R7, S2 · sonnet
- [x] `agents/strategy.md` — S1, S3-S8, D2, D6 · opus
- [x] `agents/content.md` — C1-C7, C10 · sonnet (with IG/FB guidelines)
- [x] `agents/distribution.md` — G1-G6, G8-G10 · sonnet (with post_instagram/post_facebook)
- [x] `agents/product.md` — C8, C9, R6, A8 · sonnet
- [x] `agents/analytics.md` — A1-A9, D5 · opus
- [x] `agents/devils_advocate.md` — A1, D6 · opus

### 0.6 Loader ✅
- [x] `src/agents/loader.py` — `load_skill()`, `load_agent()`, `load_all_agents()`, `_parse_frontmatter()`
- [x] api/reasoning skill separation
- [x] inject_patterns support

### 0.7 Playbook YAML — 6 files ✅
- [x] `playbooks/discover.yaml`
- [x] `playbooks/define.yaml`
- [x] `playbooks/build_test_daily.yaml`
- [x] `playbooks/build_test_weekly.yaml`
- [x] `playbooks/decide.yaml`
- [x] `playbooks/extract.yaml`

### 0.8 Playbook Executor ✅
- [x] `src/orchestrator/executor.py` — load, resolve, evaluate, execute, build order

### 0.9 Execution Contracts ✅
- [x] `src/agents/contracts.py` — 7 agent contracts
- [x] `src/agents/validator.py` — validate input/output

### 0.10 Event Bus ✅
- [x] `src/orchestrator/event_bus.py` — 19 event types, Event, EventBus, persist

### Sprint 0 Gate ✅
- [x] 7 agents load OK (test passed)
- [x] All 6 playbooks parse OK (test passed)
- [x] Contracts validate OK (test passed)
- [x] Event bus works (test passed)
- [x] DB 10 tables OK
- [x] **28/28 tests passed**

---

## Sprint 1: Research Agent + MCP Tools (5 ngày) — PARTIALLY DONE

### 1.1 MCP Tools (merged Sprint 1-3 into single build)
- [x] `src/tools/db_tools.py` — 15 DB functions (save/read agent_output, content, metrics, patterns, hypotheses, experiments, audience_intel)
- [x] `src/tools/marketing_tools.py` — 12 platform tools (post_twitter, post_instagram, post_facebook, post_linkedin, reply, search, schedule, email, trends, metrics, analytics, image)
- [x] `src/tools/mcp_db_server.py` — MCP server wrapping DB tools
- [x] `src/tools/mcp_marketing_server.py` — MCP server wrapping marketing tools
- [ ] Test mỗi tool individually với real API (CẦN API KEYS)

### 1.2 Agent Runner
- [x] `src/agents/runner.py` — `run_agent()` + `run_agent_with_retry()` + `_extract_json()`
- [x] Pattern injection from DB
- [x] Contract validation on output
- [x] Auto-save to DB
- [x] Test với real Claude API call ✅ (research agent, 6.4s, $0.002)

### 1.3 API Endpoints
- [x] `src/api/routes.py` — 15 endpoints (run-agent, run-playbook, experiment CRUD, hypotheses, content, metrics, patterns, events, scheduler)
- [x] `src/api/dashboard.py` — 4 CEO dashboard endpoints (dashboard, scorecard, approve, timeline)
- [x] Pydantic request models
- [x] Wired into main.py

### 1.4 Scheduler
- [x] `src/orchestrator/scheduler.py` — 3 cron jobs (daily 9AM, weekly Mon 10AM, discover Sun 8PM)

### 1.5 Notifications
- [x] `src/tools/notifications.py` — Telegram alerts + send_weekly_scorecard + send_kill_signal_alert

### 1.6 Feedback Loops
- [x] `src/orchestrator/feedback.py` — pattern injection, audience language, content performance, phrase performance tracking

### Sprint 1 Gate
- [x] Code written and structured
- [x] E2E test with real API keys ✅ (SerpAPI, Firecrawl, Facebook, Claude, DB all tested)

---

## Sprint 2: Strategy + Devil's Advocate (5 ngày) — CODE DONE, NEEDS TESTING

### 2.1-2.2 Agent Code
- [x] Strategy + Devil's Advocate agent configs written
- [x] All skills load OK (verified by test)
- [ ] Test với real Claude API (CẦN API KEY)

### 2.3 Pipeline State Machine
- [x] `src/orchestrator/pipeline.py` — Phase enum, PHASE_PLAYBOOK, PipelineContext
- [x] Executor supports dependency DAG + condition evaluation

### 2.4 CEO Approval
- [x] `POST /api/dashboard/approve` endpoint
- [x] Saves to `ceo_approvals` table
- [x] Updates experiment phase on decision

### 2.5 Notifications
- [x] Telegram notification system built
- [ ] Test: actual Telegram message received (CẦN BOT TOKEN)

---

## Sprint 3: Content + Distribution (7 ngày) — CODE DONE, NEEDS TESTING

- [x] Social API tools: Twitter, Instagram, Facebook, LinkedIn
- [x] Content save/read/update/schedule tools
- [x] Daily loop scheduler
- [ ] Test: real post to social media (CẦN API KEYS)

---

## Sprint 4: Analytics + Scores (5 ngày) — CODE DONE, NEEDS TESTING

- [x] Analytics agent config + 9 skills
- [x] CMF Score skill (A6)
- [x] Traction Score skill (A5)
- [x] Kill Signal detection (in event bus + weekly playbook)
- [x] Weekly report (in dashboard scorecard)
- [ ] Test: calculate real scores from real data (CẦN RUNNING EXPERIMENT)

---

## Sprint 5: Dashboard + Full Loop (7 ngày) — ❌ NOT STARTED

### 5.1 Next.js Frontend
- [ ] Tạo Next.js project
- [ ] `api/agent/route.ts` — proxy to Python
- [ ] `api/pipeline/route.ts` — pipeline status
- [ ] `api/approve/route.ts` — CEO approval
- [ ] `src/lib/agentClient.ts` — fetch wrapper
- [ ] `src/lib/types.ts` — agent types

### 5.2 Dashboard Components
- [ ] `AgentStatus.tsx` — 7 agents real-time
- [ ] `ApprovalCard.tsx` — approve/reject/adjust/kill
- [ ] `ContentQueue.tsx` — review content
- [ ] `PipelineFlow.tsx` — visual pipeline
- [ ] CMF Score gauge
- [ ] Traction Score gauge
- [ ] Weekly trend chart
- [ ] Cost tracker

### 5.3 Dashboard Layout
- [ ] `page.tsx` → 3-column (Left 280px + Center flex + Right 300px)
- [ ] Google Fonts: Syne + IBM Plex Mono
- [ ] Dark theme CSS variables

### 5.4 Full Cycle E2E Test
- [ ] Create experiment → DISCOVER → DEFINE → PAUSE → approve → daily cycle → weekly scores

---

## Sprint 6: Feedback Loops (5 ngày) — ✅ CODE DONE

- [x] `src/orchestrator/feedback.py` — get_pattern_injection_context, get_audience_language_context, get_content_performance_feedback, update_audience_phrase_performance
- [x] Pattern injection via loader.py
- [x] Audience intel pipeline (save → use → track performance)
- [ ] Integration test: verify week 2 content uses week 1 patterns (CẦN RUNNING SYSTEM)

---

## Sprint 7: Polish + Scale (5 ngày) — PARTIALLY DONE

### 7.1 Hypothesis Backlog
- [x] DB model + CRUD endpoints
- [ ] Dashboard UI: Tier 1/2/3 view
- [ ] Promote workflow in UI

### 7.2 Multi-Platform ✅
- [x] Instagram posting tool
- [x] Facebook posting tool
- [x] LinkedIn posting tool
- [x] Content Agent: platform-specific guidelines (all 7 platforms)
- [ ] Reddit engagement tool (basic structure exists)
- [ ] Email/Newsletter integration (placeholder in send_email)

### 7.3 Content Repurposing
- [x] C10_repurposing skill exists
- [x] Auto-trigger on CONTENT_PERFORMANCE_SPIKE event ✅ (reactive.py)

### 7.4 Reactive Event Handlers
- [x] Event types defined (19)
- [x] EVENT_PLAYBOOK_MAP exists
- [x] `src/orchestrator/reactive.py` — 7 handlers wired ✅ (kill, viral, high_signal, trend, ceo_timeout, traction_drop, agent_error)
- [x] Registered on startup in main.py

### 7.5 Error Handling + Observability
- [x] Retry logic in runner.py (run_agent_with_retry)
- [x] `/health` endpoint
- [ ] Cost tracking per agent/day
- [ ] Structured JSON logging
- [x] Error → Telegram alert (wired via AGENT_ERROR event handler in reactive.py)

---

## Post-Launch — ❌ NOT STARTED
- [ ] Week 1: Dry Run (test accounts)
- [ ] Week 2: Soft Launch (production, SEMI_AUTO)
- [ ] Week 3-4: Optimization
- [ ] Week 5-8: Full Experiment
- [ ] Post-Experiment: Patterns extracted, next experiment

---

## Risk Checklist
- [ ] Twitter API rate limits — test trước khi go live
- [ ] Claude API cost — set alert $5/day
- [ ] SQLite WAL — verify concurrent reads OK
- [ ] Agent prompt size — monitor, trim nếu >50K tokens
- [ ] Content quality — CEO PHẢI review 50 posts đầu trước FULL_AUTO
- [ ] Kill signal false positive — tune threshold
- [ ] Event bus — đảm bảo events processed, không pile up
- [ ] Playbook YAML — validate at startup, không phải runtime

---

## Summary

```
Sprint 0:  4 ngày   Foundation                          ✅ DONE (28/28 tests)
Sprint 1:  5 ngày   MCP Tools + Agent Runner + API      ✅ DONE (6/6 integration tests)
Sprint 2:  5 ngày   Strategy + Pipeline + Approvals     ✅ CODE DONE
Sprint 3:  7 ngày   Content + Distribution              ✅ CODE DONE
Sprint 4:  5 ngày   Analytics + Scores                  ✅ CODE DONE
Sprint 5:  7 ngày   Dashboard (Next.js Frontend)        ❌ NOT STARTED
Sprint 6:  5 ngày   Feedback Loops                      ✅ CODE DONE
Sprint 7:  5 ngày   Polish + Scale                      ✅ MOSTLY DONE (reactive handlers wired)
────────────────────────────────────────────────────────
Backend: ~95% code complete
Frontend: 0% (Sprint 5) — has 3-column cockpit plan ready
Integration testing: PASSED (SerpAPI, Firecrawl, Facebook, Claude, DB, Agent Runner)
```

## BẠN CẦN LÀM GÌ TIẾP

### ✅ Đã xong
- [x] Anthropic API key ✅
- [x] Facebook Page token ✅ (Doitay.vn)
- [x] SerpAPI + Firecrawl keys ✅
- [x] D4 skill ✅
- [x] Reactive event handlers ✅
- [x] Agent runner E2E test ✅

### Ưu tiên 1 — Còn thiếu API Keys
1. `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` → unlock CEO notifications
2. Link Instagram Business Account to Doitay.vn → unlock IG posting
3. (Optional) Twitter/X, LinkedIn, Reddit API keys

### Ưu tiên 2 — Dashboard Frontend (Sprint 5 — BIGGEST REMAINING PIECE)
4. Init Next.js project trong `agent-system/frontend/`
5. Build 3-column CEO cockpit (plan đã ready: `cheeky-crunching-cerf.md`)
6. 19 components: LeftSidebar, CenterPanel, RightSidebar, LSGauge, etc.
7. CEO approval UI + AI Assessment panel

### Ưu tiên 3 — Remaining Backend Polish
8. Cost tracking aggregation per agent/day
9. Structured JSON logging
10. Test full daily playbook cycle E2E
11. Test Facebook posting with real API

### Ưu tiên 4 — Go Live
12. Dry run 7 ngày trên test accounts
13. Soft launch SEMI_AUTO
14. CEO review 50 posts đầu
