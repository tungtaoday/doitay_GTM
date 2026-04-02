---
code: A9
name: Portfolio Analysis
type: reasoning
category: analysis
description: >
  Phân tích cross-experiment portfolio để tìm synergy, phát hiện cannibalization,
  đánh giá resource efficiency, và assess phase transition readiness. Output là
  observations có evidence — không phải recommendations. CEO quyết định.
tools_required: []
output_format: json
---

## Mục đích

Nhìn toàn cảnh portfolio của tất cả experiments và marketplaces đang chạy hoặc đã kết thúc.
Tìm synergies, phát hiện cannibalization, đánh giá resource efficiency, và check pipeline health.

Skill này **chỉ analyze và observe** — không prescribe resource reallocation, không decide kill/double-down. `portfolio_signals` mô tả patterns quan sát được để CEO có đủ context ra quyết định.

---

## Input cần có

```json
{
  "current_phase": 1,
  "snapshot_date": "YYYY-MM-DD",
  "active_experiments": [
    {
      "name": "string",
      "stage": "Signal | Hypothesis | Intelligence | Strategy | Experiment | Decision",
      "business_type": "marketplace | saas | content_platform | service | b2b",
      "vertical": "string",
      "geography": "string",
      "week": 0,
      "a5_output": {
        "traction_score": 0.0,
        "health_with_trend": "string",
        "strongest_dimension": "string",
        "weakest_dimension": "string",
        "kill_signals_triggered": ["string"]
      },
      "a2_output": {
        "opportunity_score": 0.0,
        "effective_priority": "HIGH | MEDIUM | PARK"
      },
      "supply_profile": {
        "segment": "string — mô tả supply segment",
        "channels": ["string"],
        "geography_coverage": ["string"]
      },
      "demand_profile": {
        "segment": "string — mô tả demand/user segment",
        "channels": ["string"],
        "geography_coverage": ["string"]
      },
      "resources_allocated": {
        "budget_monthly": 0,
        "team_members": 0,
        "ceo_hours_weekly": 0
      }
    }
  ],
  "completed_experiments": [
    {
      "name": "string",
      "result": "WIN | FAIL | PIVOT",
      "business_type": "string",
      "vertical": "string",
      "geography": "string",
      "duration_weeks": 0,
      "total_investment": 0,
      "final_traction_score": 0.0,
      "patterns_extracted": [
        {
          "pattern_id": "string",
          "category": "string",
          "applied_in": ["string — tên experiment đã apply pattern này"]
        }
      ]
    }
  ],
  "total_resources": {
    "monthly_budget": 0,
    "team_size": 0,
    "ceo_hours_available_weekly": 0
  },
  "pipeline_definition": {
    "quarters": [
      {
        "quarter": "string — ví dụ: Q2 2025",
        "expected_stage": "string — stage expected tại quarter này",
        "assigned_experiment": "string | null"
      }
    ]
  },
  "hypothesis_backlog": {
    "tier_1": 0,
    "tier_2": 0,
    "tier_3": 0
  }
}
```

> **Lưu ý:**
> - `a5_output` được populate từ A5 run gần nhất cho từng experiment. Nếu A5 chưa chạy → `traction_score: null`.
> - `a2_output` được populate từ A2 run khi opportunity được scored. Nếu A2 chưa chạy → `opportunity_score: null`.
> - `supply_profile` và `demand_profile` là key inputs cho synergy và cannibalization analysis.
> - `pipeline_definition` cho phép CEO define expected pipeline thay vì hardcode marketplace assumption.

---

## Synergy Scoring Rubric

Synergy Score đo mức độ hai experiments có thể leverage nhau. Mỗi dimension có rubric rõ ràng.

### Dimension 1 — Supply Overlap (0–4)

| Score | Điều kiện |
|---|---|
| **4** | Cùng supply segment, cùng geography — supply từ experiment A có thể directly serve experiment B |
| **3** | Supply segment tương tự, geography gần — có thể cross-sell với minimal onboarding |
| **2** | Supply segment khác nhau nhưng cùng industry — có thể share trust/verification infrastructure |
| **1** | Supply segment khác nhau hoàn toàn nhưng cùng channel acquisition |
| **0** | Không có overlap nào |

### Dimension 2 — Demand Overlap (0–4)

| Score | Điều kiện |
|---|---|
| **4** | Cùng demand segment, cùng geography — demand từ A sẽ có nhu cầu với B |
| **3** | Demand segment tương tự — có thể cross-promote với minimal education |
| **2** | Jobs-to-be-done liên quan — demand của A có adjacent need mà B serves |
| **1** | Demographics tương tự nhưng different jobs-to-be-done |
| **0** | Không có overlap nào |

### Dimension 3 — Distribution Overlap (0–4)

| Score | Điều kiện |
|---|---|
| **4** | Cùng channel chính — content, community, hoặc referral channel work for both |
| **3** | 2+ channels shared — significant distribution leverage possible |
| **2** | 1 channel shared — some leverage nhưng limited |
| **1** | Tương tự channel type nhưng khác audience |
| **0** | Distribution hoàn toàn khác nhau |

### Dimension 4 — Infrastructure Overlap (0–4)

| Score | Điều kiện |
|---|---|
| **4** | Core infrastructure reusable: payment, trust graph, matching algorithm, verification |
| **3** | 2+ infrastructure components có thể share — significant dev cost saving |
| **2** | 1 infrastructure component shareable — moderate saving |
| **1** | Cùng tech stack nhưng different data models |
| **0** | Không có infrastructure overlap nào |

### Synergy Score tổng hợp

```
Synergy Score = Supply_overlap + Demand_overlap + Distribution_overlap + Infrastructure_overlap
Range: 0–16

≥ 12: STRONG SYNERGY — explore explicit leverage strategy
8–11: MODERATE SYNERGY — monitor for opportunistic leverage
4–7: WEAK SYNERGY — note but don't prioritize
0–3: NO SYNERGY — treat as independent
```

---

## Resource Efficiency Formula

```
Resource Efficiency Score = Traction Score / Resource Index

Resource Index = (budget_monthly / total_resources.monthly_budget × 0.5)
              + (team_members / total_resources.team_size × 0.3)
              + (ceo_hours_weekly / total_resources.ceo_hours_available_weekly × 0.2)

Resource Index range: 0–1 (% of total resources consumed)
Efficiency Score = Traction Score / (Resource Index × 100)
```

> **Interpretation:**
> - High traction + low resource consumption = HIGH efficiency
> - Low traction + high resource consumption = LOW efficiency
> - `null` traction → Efficiency = `null`, ghi note "A5 not run yet"

### Efficiency Classification

| Efficiency Score | Status |
|---|---|
| ≥ 2.0 | **UNDER_RESOURCED** — high traction relative to resources, could scale faster with more |
| 1.0–1.9 | **OPTIMAL** — balanced allocation |
| 0.5–0.9 | **OVER_RESOURCED** — low traction relative to resources consumed |
| < 0.5 | **CRITICALLY_OVER_RESOURCED** — very low traction for resources spent |
| null | **UNASSESSABLE** — traction data not available |

---

## Pattern Library Utilization

```
Utilization Rate = patterns_applied_count / total_patterns_in_library × 100

patterns_applied_count = count of unique pattern_ids từ completed_experiments.patterns_extracted
                         mà có applied_in list không rỗng
total_patterns = count tất cả unique pattern_ids trong completed_experiments.patterns_extracted
```

| Rate | Signal |
|---|---|
| ≥ 70% | Patterns đang được leverage tốt |
| 50–69% | Moderate utilization |
| < 50% | **FLAG: Patterns đang bị lãng phí** — knowledge không được transfer sang experiments mới |

---

## Cannibalization Check

Kiểm tra 3 loại conflict giữa các experiment pairs:

### Type 1 — Supply Conflict
```
Condition: supply_profile.segment overlap VÀ supply_profile.geography_coverage overlap
Severity HIGH: cùng segment, cùng geography, cùng acquisition channel
Severity MEDIUM: cùng segment, geography gần nhau
Severity LOW: segment tương tự, geography khác
```

### Type 2 — Demand Conflict
```
Condition: demand_profile.segment overlap VÀ demand_profile.geography_coverage overlap
Severity HIGH: cùng segment, cùng geography, cùng acquisition channel
Severity MEDIUM: cùng segment, geography gần nhau
Severity LOW: segment tương tự, different jobs-to-be-done
```

### Type 3 — Distribution Conflict
```
Condition: cùng primary channel VÀ cùng geography VÀ cùng target segment
Severity HIGH: audience attention là zero-sum trong channel này
Severity MEDIUM: channel overlap nhưng content type khác
Severity LOW: cùng channel type nhưng different timing/format
```

> **Cannibalization là observation** — `conflict_mechanism` mô tả tại sao conflict xảy ra,
> không phải cách giải quyết. Resolution là CEO decision.

---

## Quarterly Pipeline Check

Dùng `pipeline_definition` từ input — không hardcode stage expectations.

Với mỗi quarter trong pipeline:
```
Status = ON_TRACK nếu: assigned_experiment.stage = expected_stage (±1 stage)
Status = DELAYED nếu: assigned_experiment.stage < expected_stage - 1
Status = AHEAD nếu: assigned_experiment.stage > expected_stage + 1
Status = EMPTY nếu: assigned_experiment = null (gap trong pipeline)
```

**Pipeline gaps** — vị trí trong pipeline không có experiment assigned:
```
Gap severity = HIGH nếu Q+1 hoặc Q+2 empty (short-term pipeline risk)
Gap severity = MEDIUM nếu Q+3 empty (medium-term)
Gap severity = LOW nếu Q+4+ empty
```

**Backlog check:**
```
Nếu total gap_count > hypothesis_backlog.tier_1 + tier_2:
  flag: "pipeline_risk" — không đủ qualified hypotheses để fill gaps
```

---

## Phase Transition Readiness

### Phase 1 → 2 Criteria

| Criterion | Evidence needed | Met? |
|---|---|---|
| Proven liquidity | Ít nhất 1 experiment có traction_score > 60 sustained ≥ 4 tuần | Check A5 data |
| Documented playbook | Patterns extracted ≥ 5 từ WIN experiment | Check completed_experiments |
| Resource headroom | Current utilization < 80% của total_resources | Compute từ input |
| No critical kill signals | Không có active experiment có KILL signal từ A5 | Check a5_output |

### Phase 2 → 3 Criteria

| Criterion | Evidence needed | Met? |
|---|---|---|
| 2+ experiments với synergy | Synergy score ≥ 8 giữa ít nhất 1 pair | Compute từ synergy analysis |
| Shared infrastructure value | Infrastructure overlap ≥ 3 trong synergy pair | Check synergy matrix |
| Pattern library ≥ 10 patterns | Total unique patterns từ completed experiments | Count từ input |
| Pipeline health | No EMPTY gaps trong Q+1 và Q+2 | Check pipeline |

> Phase transition readiness là **assessment**, không phải decision. CEO decides.

---

## Portfolio Signals

Sau khi chạy tất cả analyses, detect các cross-portfolio patterns:

| Pattern | Điều kiện | Severity |
|---|---|---|
| `portfolio_concentration_risk` | > 70% resources trong 1 experiment | HIGH |
| `pipeline_starvation` | ≥ 2 EMPTY gaps trong Q+1 đến Q+3 | HIGH |
| `pattern_waste` | Pattern utilization < 50% | MEDIUM |
| `cannibalization_active` | Cannibalization severity HIGH giữa bất kỳ pair nào | HIGH |
| `synergy_unrealized` | Strong synergy (≥ 12) pair tồn tại nhưng không có shared resource | MEDIUM |
| `ceo_bottleneck` | ceo_hours_weekly > 80% của ceo_hours_available trên 1 experiment | HIGH |
| `efficiency_imbalance` | Gap > 1.5x giữa highest và lowest efficiency score | MEDIUM |

> `portfolio_signals` là observation — không dùng từ "cần/nên/phải/hãy."

---

## Quy trình thực hiện

**Bước 1 — Portfolio Snapshot.** List tất cả active experiments với stage, traction, resources. Compute tổng burn rate, avg traction score, total resource utilization.

**Bước 2 — Resource Efficiency.** Tính Resource Index và Efficiency Score cho mỗi experiment. Classify theo table. Ghi null nếu A5 data thiếu.

**Bước 3 — Synergy Matrix.** Score mọi pairs của active experiments theo 4 dimensions. Tính Synergy Score tổng hợp. Classify theo threshold.

**Bước 4 — Cannibalization Check.** Check 3 conflict types cho mọi pairs. Flag conflicts với mechanism description.

**Bước 5 — Pipeline Check.** So sánh actual vs expected theo `pipeline_definition`. Identify gaps và severity.

**Bước 6 — Pattern Library Utilization.** Tính utilization rate từ completed experiments. Flag nếu < 50%.

**Bước 7 — Phase Transition Readiness.** Check criteria cho phase hiện tại → phase tiếp theo.

**Bước 8 — Portfolio Signals.** Detect cross-portfolio patterns.

**Bước 9 — Confidence Assessment.** Overall confidence dựa trên data completeness.

**Bước 10 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A9",
  "current_phase": 0,
  "snapshot_date": "YYYY-MM-DD",
  "portfolio_snapshot": {
    "active_count": 0,
    "completed_count": 0,
    "avg_traction_score": 0.0,
    "total_monthly_burn": 0,
    "total_resource_utilization": {
      "budget_percent": 0.0,
      "team_percent": 0.0,
      "ceo_hours_percent": 0.0
    },
    "experiments": [
      {
        "name": "string",
        "stage": "string",
        "business_type": "string",
        "vertical": "string",
        "geography": "string",
        "week": 0,
        "traction_score": 0.0,
        "health_with_trend": "string | null",
        "kill_signals": ["string"],
        "a5_available": true,
        "resource_percent_of_total": 0.0
      }
    ]
  },
  "resource_efficiency": {
    "ranking": [
      {
        "experiment": "string",
        "traction_score": 0.0,
        "resource_index": 0.0,
        "efficiency_score": 0.0,
        "status": "UNDER_RESOURCED | OPTIMAL | OVER_RESOURCED | CRITICALLY_OVER_RESOURCED | UNASSESSABLE"
      }
    ],
    "most_efficient": "string | null",
    "least_efficient": "string | null",
    "efficiency_gap": 0.0
  },
  "synergy_matrix": {
    "pairs": [
      {
        "experiment_a": "string",
        "experiment_b": "string",
        "supply_overlap": 0,
        "demand_overlap": 0,
        "distribution_overlap": 0,
        "infrastructure_overlap": 0,
        "synergy_score": 0,
        "synergy_level": "STRONG | MODERATE | WEAK | NONE",
        "leverage_opportunities": ["string — observable opportunities, not prescriptions"]
      }
    ],
    "strongest_synergy_pair": "string | null",
    "strongest_synergy_score": 0
  },
  "cannibalization": {
    "overall_risk": "HIGH | MEDIUM | LOW | NONE",
    "conflicts": [
      {
        "experiment_a": "string",
        "experiment_b": "string",
        "conflict_type": "supply | demand | distribution",
        "severity": "HIGH | MEDIUM | LOW",
        "conflict_mechanism": "string — tại sao conflict xảy ra, không phải cách giải quyết",
        "overlap_description": "string — specific overlap observed"
      }
    ]
  },
  "pipeline_health": {
    "overall_status": "HEALTHY | AT_RISK | CRITICAL",
    "quarters": [
      {
        "quarter": "string",
        "expected_stage": "string",
        "assigned_experiment": "string | null",
        "actual_stage": "string | null",
        "status": "ON_TRACK | DELAYED | AHEAD | EMPTY"
      }
    ],
    "gaps": [
      {
        "quarter": "string",
        "severity": "HIGH | MEDIUM | LOW",
        "backlog_available": true
      }
    ],
    "pipeline_risk_flag": false,
    "pipeline_risk_note": "string | null"
  },
  "pattern_library": {
    "total_patterns": 0,
    "patterns_applied_count": 0,
    "utilization_rate": 0.0,
    "utilization_flag": false,
    "patterns_by_category": {
      "CS": 0,
      "LQ": 0,
      "TR": 0,
      "CT": 0,
      "DT": 0,
      "MN": 0,
      "RT": 0
    },
    "unapplied_patterns": ["string — pattern_ids chưa được apply vào bất kỳ experiment nào"]
  },
  "phase_transition": {
    "current_phase": 0,
    "next_phase": 0,
    "readiness_assessment": "READY | ALMOST_READY | NOT_READY",
    "criteria": [
      {
        "criterion": "string",
        "met": true,
        "evidence": "string — data point cụ thể support assessment"
      }
    ],
    "blocking_criteria": ["string — criteria chưa được met"]
  },
  "portfolio_signals": [
    {
      "pattern": "string — tên pattern từ bảng Portfolio Signals",
      "severity": "HIGH | MEDIUM | LOW",
      "observation": "string — mô tả cụ thể, không phải action",
      "affected_experiments": ["string"]
    }
  ],
  "confidence_overall": "HIGH | MEDIUM | LOW",
  "confidence_notes": [
    "string — ví dụ: '3/5 experiments missing A5 data — efficiency scores are UNASSESSABLE'"
  ]
}
```

---

## Business Type Adaptations

| Portfolio Composition | Synergy Focus | Cannibalization Risk | Pipeline Pattern |
|---|---|---|---|
| All Marketplaces | Supply/Demand overlap — shared trust graph | Supply competition trong cùng vertical | Sequential: 1 per quarter |
| Marketplace + Content | Distribution overlap — content drives demand | Audience attention zero-sum | Parallel: content feeds marketplace |
| Marketplace + SaaS | Infrastructure overlap — SaaS users become supply | Low cannibalization risk | Independent timelines |
| Multi-vertical | Infrastructure overlap — payment, trust, support | Low nếu verticals truly different | Sequential per vertical |
| Single vertical, multi-geo | Playbook reuse — patterns transfer directly | Supply competition nếu geo overlap | Staggered rollout pattern |

---

## Rules bắt buộc

1. **Synergy Score PHẢI dùng rubric 4-dimension** với criteria cụ thể per score level — không assign scores bằng judgment.
2. **Resource Efficiency PHẢI tính Resource Index trước** rồi mới tính Efficiency Score. Nếu A5 data null → `status: UNASSESSABLE`, không điền 0.
3. **Cannibalization chỉ report `conflict_mechanism`** — không có `resolution` field. Resolution là CEO decision.
4. **Pipeline check dùng `pipeline_definition` từ input** — không hardcode marketplace stages.
5. **Pattern Library utilization < 50% PHẢI được flag** với `utilization_flag: true`.
6. **Phase transition chỉ là readiness assessment** — không có "recommendation" field. CEO decides.
7. **`portfolio_signals` là observation only** — không dùng từ "cần/nên/phải/hãy."
8. **Experiments thiếu A5 data PHẢI được ghi rõ** trong `confidence_notes` — không assume traction từ other sources.
9. Skill này là **portfolio-level analysis** — không re-run A5/A2 logic. Dùng data từ A5/A2 output trong input.
10. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.