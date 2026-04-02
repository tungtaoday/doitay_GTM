# Playbook Implementation Status

> So sánh 6 playbook YAML vs code hiện tại trong `src/api/marketing.py`
> Cập nhật: 2026-03-25

---

## Tổng quan

| Phase | Playbook | Steps | Implemented | Coverage |
|-------|----------|-------|-------------|----------|
| DISCOVER | `discover.yaml` | 6 | 3 | **50%** |
| DEFINE | `define.yaml` | 10 + gate | 3 | **30%** |
| BUILD_TEST (daily) | `build_test_daily.yaml` | 6 | 2 | **33%** |
| BUILD_TEST (weekly) | `build_test_weekly.yaml` | 10 + gate | 2 | **20%** |
| DECIDE | `decide.yaml` | 8 + gate | 0 | **0%** |
| EXTRACT | `extract.yaml` | 7 | 1 | **15%** |

---

## Phase 1: DISCOVER

```
Trigger: weekly_cron OR event:new_vertical_added
```

```
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  R1 Market Scanning │   │  R2 Social Listening│   │  R4 Competitive     │
│  (scan_signals)     │   │  (social_listening) │   │  (competitive_scan) │
│  ✅ Implemented     │   │  ✅ Implemented     │   │  ✅ Implemented     │
└────────┬────────────┘   └────────┬────────────┘   └────────┬────────────┘
         │                         │                          │
         │                         │                          ▼
         │                         │               ┌─────────────────────┐
         │                         │               │  R5 Content         │
         │                         │               │  Benchmarking       │
         │                         │               │  ❌ NOT implemented │
         │                         │               └────────┬────────────┘
         ▼                         ▼                        │
┌──────────────────────────────────────┐                    │
│  A1 Stress Testing                   │                    │
│  (stress_test)                       │                    │
│  condition: signal_score >= 100      │                    │
│  ❌ NOT implemented                  │                    │
└────────────────┬─────────────────────┘                    │
                 │                                          │
                 ▼                                          ▼
         ┌─────────────────────────────────────────────────┐
         │  S1 Thesis Formation                            │
         │  (update_hypothesis_backlog)                    │
         │  ❌ NOT implemented                             │
         └─────────────────────────────────────────────────┘
```

### Chi tiết

| Step ID | Agent | Skill | Code hiện tại | Gap |
|---------|-------|-------|---------------|-----|
| `scan_signals` | research | R1 | `intel_scan_market()` — ✅ Gọi R1, dynamic queries từ project.yaml | — |
| `social_listening` | research | R2 | `intel_scan_audience()` — ✅ Gọi R2 (mapped qua R6) | Playbook nói R2, code gọi R6 — cần verify skill mapping |
| `competitive_scan` | research | R4 | `intel_scan_competitors()` — ✅ Gọi R4 | — |
| `content_benchmark` | research | R5 | ❌ Không có endpoint nào gọi R5 | Cần thêm endpoint hoặc chain vào scan |
| `stress_test` | devils_advocate | A1 | ❌ Không auto-trigger khi signal score ≥ 100 | Cần thêm condition check + A1 call sau scan |
| `update_hypothesis_backlog` | strategy | S1 | ❌ Không auto-update backlog từ scan results | Cần chain S1 sau stress test |

---

## Phase 2: DEFINE

```
Trigger: event:hypothesis_promoted_to_tier3 OR manual:ceo_selected_hypothesis
```

```
┌──────────────────┐  ┌──────────────────┐
│ R6 Customer      │  │ R7 Pricing       │
│ Research         │  │ Research         │
│ ✅ Partial       │  │ ❌ NOT impl      │
└───────┬──────────┘  └───────┬──────────┘
        │                     │
        ▼                     │
┌──────────────────┐          │
│ S2 Segmentation  │          │
│ ❌ NOT impl      │          │
└───────┬──────────┘          │
        ▼                     │
┌──────────────────┐          │
│ S1 Thesis Form.  │          │
│ ❌ NOT impl      │          │
└───────┬──────────┘          │
        ▼                     ▼
┌──────────────────────────────┐
│ S3 Value Proposition         │
│ ❌ NOT implemented           │
└───────┬──────────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
┌────────┐ ┌──────────┐
│ S4     │ │ S6       │
│ Offer  │ │ Channel  │
│ Design │ │ Strategy │
│ ❌     │ │ ❌       │
└───┬────┘ └────┬─────┘
    │           │
    │           ▼
    │    ┌──────────┐
    │    │ S5       │
    │    │ Content  │
    │    │ Pillars  │
    │    │ ❌       │
    │    └────┬─────┘
    │         │
    ▼         ▼
┌──────────────────────┐
│ S7 Experiment Design │
│ ✅ Implemented       │
│ (generate_hypotheses)│
└───────┬──────────────┘
        ▼
┌──────────────────────┐
│ S8 Go-to-Market      │
│ ❌ NOT implemented   │
└───────┬──────────────┘
        ▼
┌──────────────────────┐
│ A1 Stress Testing    │
│ (DA review)          │
│ ✅ Implemented       │
└───────┬──────────────┘
        ▼
┌──────────────────────┐
│ 🚪 CEO GATE         │
│ "Approve BUILD_TEST?"│
│ ❌ NOT implemented   │
└──────────────────────┘

 Scoring: A2 per hypothesis ✅ Implemented
```

### Chi tiết

| Step ID | Agent | Skill | Code hiện tại | Gap |
|---------|-------|-------|---------------|-----|
| `customer_research` | research | R6 | `intel_scan_audience()` — ✅ gọi R6 | Chỉ là scan, chưa deep research |
| `pricing_research` | research | R7 | ❌ Không có endpoint | Cần thêm |
| `segmentation` | research | S2 | ❌ Không có endpoint | Cần thêm |
| `thesis_formation` | strategy | S1 | ❌ Không có endpoint riêng | Cần thêm |
| `value_proposition` | strategy | S3 | ❌ Không có endpoint | Cần thêm |
| `offer_design` | strategy | S4 | ❌ Không có endpoint | Cần thêm |
| `channel_strategy` | strategy | S6 | ❌ Không có endpoint | Cần thêm |
| `content_pillars` | strategy | S5 | ❌ Không có endpoint | Cần thêm |
| `experiment_design` | strategy | S7 | ✅ `generate_hypotheses()` gọi S7 | Đang dùng cho hypothesis gen, không đúng context experiment design |
| `gtm_plan` | strategy | S8 | ❌ Không có endpoint | Cần thêm |
| `da_review` | devils_advocate | A1 | ✅ `generate_hypotheses()` gọi A1 | Chỉ stress test hypotheses, chưa stress test full define output |
| **CEO Gate** | — | — | ❌ Không có approval gate | Cần thêm ceo_approval flow |
| A2 scoring | analytics | A2 | ✅ Loop score từng hypothesis | Đúng playbook |

---

## Phase 3: BUILD_TEST — Daily

```
Trigger: daily_cron:09:00
```

```
┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ G10 Trend Riding    │  │ G1 Strategic     │  │ G2 Community     │
│ (check_trends)      │  │ Engagement       │  │ Building         │
│ ❌ NOT impl         │  │ ❌ NOT impl      │  │ ❌ NOT impl      │
└───────┬─────────────┘  └──────────────────┘  └──────────────────┘
        ▼
┌─────────────────────┐
│ C3 Shortform Writing│
│ (create_content)    │
│ ✅ Partial          │
│ weekly_plan gọi C1  │
└───────┬─────────────┘
        ▼
┌─────────────────────┐
│ C5 Visual Content   │
│ (create_visuals)    │
│ ✅ Partial          │
│ /post/{id}/image    │
│ gọi C11            │
└───────┬─────────────┘
        ▼
┌─────────────────────┐
│ G9 Scheduling Ops   │
│ (schedule_posts)    │
│ ❌ NOT impl         │
│ (manual scheduling) │
└─────────────────────┘
```

### Chi tiết

| Step ID | Agent | Skill | Code hiện tại | Gap |
|---------|-------|-------|---------------|-----|
| `check_trends` | distribution | G10 | ❌ Không có trend scanning | Cần thêm |
| `create_content` | content | C3 | ✅ Partial — `weekly_plan()` gọi Content Agent C1 tạo batch | Dùng C1 thay vì C3, weekly thay vì daily |
| `create_visuals` | content | C5 | ✅ Partial — `/post/{id}/image` gọi C11 | Per-post manual, không batch auto |
| `schedule_posts` | distribution | G9 | ❌ Manual approve + post riêng | Cần auto-scheduling |
| `strategic_engagement` | distribution | G1 | ❌ Không có endpoint | Cần thêm — 9 replies/platform/day |
| `community_interaction` | distribution | G2 | ❌ Không có endpoint | Cần thêm — respond comments, DMs |

---

## Phase 4: BUILD_TEST — Weekly

```
Trigger: weekly_cron:monday:10:00
```

```
┌─────────────────────┐
│ A4 Content Perf     │
│ (collect_metrics)   │
│ ✅ Partial          │
│ sync_fb_metrics     │
└───┬────────┬────────┘
    │        │
    ▼        ▼
┌────────┐ ┌──────────┐  ┌──────────────┐  ┌──────────────┐
│ A6 CMF │ │ A5       │  │ A8 Customer  │  │ C10 Repurpose│
│ Score  │ │ Traction │  │ Analytics    │  │ Top Content  │
│ ❌     │ │ Score    │  │ ❌ NOT impl  │  │ ❌ NOT impl  │
│        │ │ ❌       │  └──────────────┘  └──────────────┘
└───┬────┘ └────┬─────┘
    │           │
    ▼           ▼
┌──────────────────────┐  ┌──────────────────┐
│ A7 Pattern Extract   │  │ A1 Kill Signal   │
│ ✅ Implemented       │  │ Check            │
│ quarterly_report     │  │ ❌ NOT impl      │
└──────────────────────┘  └───────┬──────────┘
                                  │
                          ┌───────▼──────────┐
                          │ 🚨 CEO ALERT     │
                          │ if kill_signal    │
                          │ ❌ NOT impl      │
                          └──────────────────┘

┌──────────────────────┐  ┌──────────────────┐
│ G5 Email Newsletter  │  │ S6 Channel Adj   │
│ ❌ NOT impl          │  │ condition:        │
│                      │  │ CMF < 0.3        │
└──────────────────────┘  │ ❌ NOT impl      │
                          └──────────────────┘

┌──────────────────────┐
│ A1 Midpoint Review   │
│ (devils_advocate)    │
│ condition: week == 4 │
│ ❌ NOT impl          │
└──────────────────────┘
```

### Chi tiết

| Step ID | Agent | Skill | Code hiện tại | Gap |
|---------|-------|-------|---------------|-----|
| `collect_metrics` | analytics | A4 | ✅ Partial — `sync_fb_metrics()` chỉ Facebook | Cần multi-platform: IG, Twitter, LinkedIn, YouTube, Email |
| `cmf_scoring` | analytics | A6 | ❌ Không có endpoint | Cần thêm |
| `traction_scoring` | analytics | A5 | ❌ Không có endpoint | Cần thêm |
| `customer_analytics` | analytics | A8 | ❌ Không có endpoint | Cần thêm |
| `pattern_extraction` | analytics | A7 | ✅ `quarterly_report()` gọi A7 | Quarterly, chưa weekly |
| `repurpose_top_content` | content | C10 | ❌ Không có endpoint | Cần thêm |
| `weekly_email` | distribution | G5 | ❌ Không có endpoint | Cần thêm |
| `kill_signal_check` | analytics | A1 | ❌ Không auto-check | Cần thêm — critical |
| `strategy_adjustment` | strategy | S6 | ❌ Không auto-trigger | Cần thêm — condition: CMF < 0.3 |
| `midpoint_review` | devils_advocate | A1 | ❌ Không auto-trigger | Cần thêm — condition: week == 4 |
| **CEO Alert Gate** | — | — | ❌ Không có alert | Cần alert khi kill signal detected |

---

## Phase 5: DECIDE

```
Trigger: event:experiment_week_8 OR manual:ceo_request_assessment
```

```
┌─────────────────────┐
│ A4 Final Metrics    │
│ ❌ NOT implemented  │
└───────┬─────────────┘
        │
   ┌────┴────┐
   ▼         ▼
┌────────┐ ┌──────────┐
│ A6 CMF │ │ A5       │
│ Final  │ │ Traction │
│ ❌     │ │ Final ❌ │
└───┬────┘ └────┬─────┘
    │           │
    │    ┌──────┘
    │    │
    │    │  ┌──────────────┐
    │    │  │ A3 Unit      │
    │    │  │ Economics    │
    │    │  │ ❌ NOT impl  │
    │    │  └──────┬───────┘
    │    │         │
    ▼    ▼         ▼
┌──────────────────────┐
│ A2 Opportunity Score │
│ (final)              │
│ ❌ NOT implemented   │
└───────┬──────────────┘
        ▼
┌──────────────────────┐
│ A1 Final Stress Test │
│ (devils_advocate)    │
│ ❌ NOT implemented   │
└───────┬──────────────┘
        │
   ┌────┴────┐
   ▼         ▼
┌────────┐ ┌──────────────┐
│ D5     │ │ D2 Resource  │
│ Pivot  │ │ Allocation   │
│ ❌     │ │ ❌           │
└────────┘ └──────┬───────┘
                  ▼
          ┌──────────────────┐
          │ 🚪 CEO GO/NO-GO │
          │ Full scorecard   │
          │ ❌ NOT impl      │
          └──────────────────┘
```

### Chi tiết

| Step ID | Agent | Skill | Code hiện tại | Gap |
|---------|-------|-------|---------------|-----|
| `final_metrics` | analytics | A4 | ❌ | Toàn bộ DECIDE phase chưa implement |
| `final_cmf` | analytics | A6 | ❌ | |
| `final_traction` | analytics | A5 | ❌ | |
| `unit_economics` | analytics | A3 | ❌ | |
| `opportunity_score` | analytics | A2 | ❌ | A2 chỉ dùng cho hypothesis scoring, chưa cho final assessment |
| `final_stress_test` | devils_advocate | A1 | ❌ | |
| `pivot_analysis` | analytics | D5 | ❌ | condition: DA verdict != proceed |
| `resource_recommendation` | strategy | D2 | ❌ | |
| **CEO Decision Gate** | — | — | ❌ | Cần full GO/NO-GO flow |

---

## Phase 6: EXTRACT

```
Trigger: event:experiment_completed OR event:experiment_killed
```

```
┌─────────────────────┐
│ A4 Collect All Data │
│ ❌ NOT implemented  │
└───────┬─────────────┘
        │
   ┌────┼─────────────────────────┐
   ▼    ▼              ▼          ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ A7     │ │ A7       │ │ A7       │ │ A8 Customer  │
│Content │ │Distrib.  │ │Market-   │ │Patterns      │
│Pattern │ │Patterns  │ │place     │ │              │
│ ✅     │ │ ❌       │ │Patterns  │ │ ❌           │
│Partial │ │          │ │ ❌       │ │              │
└───┬────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘
    │           │             │              │
    ▼           ▼             ▼              ▼
┌──────────────────────────────────────────────────┐
│ A7 Compile All Patterns → Pattern Library        │
│ ❌ NOT implemented (no multi-focus compile)       │
└───────────────────────┬──────────────────────────┘
                        ▼
                ┌──────────────────┐
                │ S1 Update Thesis │
                │ + Hypothesis     │
                │ ❌ NOT impl      │
                └──────────────────┘
```

### Chi tiết

| Step ID | Agent | Skill | Code hiện tại | Gap |
|---------|-------|-------|---------------|-----|
| `collect_all_data` | analytics | A4 | ❌ | Không có comprehensive data collection |
| `content_patterns` | analytics | A7 | ✅ Partial — `quarterly_report()` gọi A7 1 lần | Chỉ 1 lần chung, không focus "content" |
| `distribution_patterns` | analytics | A7 | ❌ | Cần A7 với focus "distribution" |
| `marketplace_patterns` | analytics | A7 | ❌ | Cần A7 với focus "marketplace" |
| `customer_patterns` | analytics | A8 | ❌ | Cần A8 call |
| `compile_patterns` | analytics | A7 | ❌ | Cần compile step |
| `update_system` | strategy | S1 | ❌ | Cần update thesis từ patterns |

---

## Mapping: Endpoint → Playbook Step

| Endpoint | Playbook | Step(s) | Đúng flow? |
|----------|----------|---------|------------|
| `POST /intel/scan/market` | discover | `scan_signals` (R1) | ✅ |
| `POST /intel/scan/competitors` | discover | `competitive_scan` (R4) | ✅ |
| `POST /intel/scan/audience` | discover | `social_listening` (R2) / define `customer_research` (R6) | ⚠️ Gọi R6 thay vì R2 |
| `POST /hypotheses/generate` | define | `experiment_design` (S7) + A2 scoring | ⚠️ S7 dùng cho hypothesis gen, playbook dùng cho experiment design |
| `POST /marketing/weekly-plan` | build_test_daily | `create_content` (C3→C1) | ⚠️ Weekly batch thay vì daily |
| `POST /post/{id}/image` | build_test_daily | `create_visuals` (C5→C11) | ✅ Nhưng manual per-post |
| `POST /marketing/sync-metrics` | build_test_weekly | `collect_metrics` (A4) | ⚠️ Chỉ Facebook |
| `POST /marketing/quarterly-report` | extract | `content_patterns` (A7) | ⚠️ Partial — 1 A7 call chung |

---

## Skill Usage Summary

### Đang được gọi trong code

| Skill | Agent | Endpoint | Playbook Phase |
|-------|-------|----------|----------------|
| R1 | research | `intel_scan_market` | discover |
| R4 | research | `intel_scan_competitors` | discover |
| R6 | research | `intel_scan_audience` | discover / define |
| S7 | strategy | `generate_hypotheses` | define |
| A1 | devils_advocate | `generate_hypotheses` | define |
| A2 | analytics | `generate_hypotheses` (loop) | define |
| C1 | content | `weekly_plan` | build_test_daily |
| C11 | content | `/post/{id}/image` | build_test_daily |
| A7 | analytics | `quarterly_report` | extract |

### Chưa được gọi (cần implement)

| Skill | Agent | Playbook Phase | Priority |
|-------|-------|----------------|----------|
| R2 | research | discover | MEDIUM |
| R5 | research | discover | LOW |
| R7 | research | define | MEDIUM |
| S1 | strategy | discover / define / extract | HIGH |
| S2 | research | define | MEDIUM |
| S3 | strategy | define | MEDIUM |
| S4 | strategy | define | MEDIUM |
| S5 | strategy | define | MEDIUM |
| S6 | strategy | define / build_test_weekly | MEDIUM |
| S8 | strategy | define | LOW |
| A3 | analytics | decide | HIGH |
| A4 | analytics | build_test_weekly / decide / extract | HIGH |
| A5 | analytics | build_test_weekly / decide | HIGH |
| A6 | analytics | build_test_weekly / decide | HIGH |
| A8 | analytics | build_test_weekly / extract | MEDIUM |
| C3 | content | build_test_daily | MEDIUM |
| C5 | content | build_test_daily | LOW (C11 thay thế) |
| C10 | content | build_test_weekly | LOW |
| D2 | strategy | decide | HIGH |
| D5 | analytics | decide | MEDIUM |
| G1 | distribution | build_test_daily | LOW |
| G2 | distribution | build_test_daily | LOW |
| G5 | distribution | build_test_weekly | LOW |
| G9 | distribution | build_test_daily | MEDIUM |
| G10 | distribution | build_test_daily | LOW |

---

## Priority Roadmap

### 🔴 P0 — Critical (system broken without these)

1. **A4 multi-platform metrics collection** — hiện chỉ Facebook, cần all platforms
2. **A6 CMF Scoring + A5 Traction Scoring** — weekly scoring là core loop
3. **Kill signal auto-check (A1)** — phải auto-detect, không chờ CEO hỏi
4. **CEO Gates** — cả define gate và decide gate đều missing

### 🟡 P1 — Important (major gaps)

5. **DECIDE phase endpoints** — A2 final + A3 unit economics + D2 resource allocation
6. **S1 Thesis Formation** — chain từ discover → define → extract
7. **Weekly review automation** — chain A4→A6/A5→A7→kill check mỗi Monday
8. **Midpoint review (week 4)** — devils_advocate A1 auto-trigger

### 🟢 P2 — Enhancement (nice to have)

9. **Daily content pipeline** — G10 trends → C3 content → C5 visual → G9 schedule
10. **EXTRACT multi-focus** — 4 parallel A7 calls (content/distribution/marketplace/customer)
11. **Distribution agents** — G1 engagement, G2 community, G5 newsletter
12. **Define chain** — full S2→S1→S3→S4→S6→S5→S8 flow

---

## Playbook Engine Architecture (chưa có)

Hiện tại mỗi endpoint gọi agent riêng lẻ. Để implement đúng playbook, cần:

```python
# Conceptual — Playbook Runner
async def run_playbook(playbook_name: str, context: dict):
    playbook = load_yaml(f"playbooks/{playbook_name}.yaml")
    results = {}

    for step in topological_sort(playbook.steps):
        # Check depends_on
        if not all(dep in results for dep in step.depends_on):
            continue

        # Check condition
        if step.condition and not evaluate(step.condition, results):
            continue

        # Run agent with skill
        result = await run_agent(
            agent=step.agent,
            skill=step.skill,
            input=resolve_refs(step.input, results)
        )
        results[step.output_key] = result

    # Check gates
    for gate in playbook.gates:
        if gate.condition and evaluate(gate.condition, results):
            await notify_ceo(gate.message, results)

    return results
```

Hiện tại: **không có playbook runner**. Mỗi endpoint tự gọi 1-3 agents thủ công. Muốn follow playbook đúng cần build orchestrator layer này.
