---
code: D1
name: Kill/Pivot/Continue
type: reasoning
category: decision
description: "Framework quyet dinh Kill, Pivot, hoac Continue cho experiment dang chay, dua tren data va kill criteria da dinh truoc."
tools_required: []
output_format: json
---

## Muc dich

Cung cap framework co cau truc de CEO ra quyet dinh Kill, Pivot, hoac Continue cho bat ky experiment nao. Dam bao quyet dinh dua tren data va kill criteria da dinh truoc, khong phai emotion hoac sunk cost.

## Input can co

```json
{
  "experiment_name": "string",
  "experiment_week": 0,
  "business_type": "marketplace | content_platform | saas | service | b2b",
  "original_hypothesis": "string",
  "kill_criteria_predefined": [
    {
      "criterion": "string",
      "threshold": "string",
      "current_value": "string",
      "triggered": false
    }
  ],
  "metrics": {
    "traction_score": 0,
    "traction_trend": "ACCELERATING | STEADY | DECELERATING | DECLINING",
    "liquidity_score": 0,
    "liquidity_trend": "UP | DOWN | FLAT",
    "cmf_score": 0,
    "ltv_cac_ratio": 0,
    "repeat_rate_no_incentive": 0,
    "organic_growth_rate": 0,
    "weekly_metrics_history": []
  },
  "resources_invested": {
    "total_budget_spent": 0,
    "team_hours": 0,
    "ceo_hours": 0
  },
  "qualitative_signals": {
    "customer_feedback": ["string"],
    "team_morale": "HIGH | MEDIUM | LOW",
    "market_changes": ["string"],
    "competitive_moves": ["string"]
  },
  "pivot_options": [
    {
      "description": "string",
      "what_changes": "string",
      "what_stays": "string",
      "estimated_weeks_to_test": 0
    }
  ]
}
```

## Quy trinh thuc hien

### Buoc 1 — Kill Criteria Check (Binary)
- Review tung kill criterion da dinh truoc
- Neu BAT KY criterion nao triggered → KILL la default recommendation
- CEO co the override, nhung phai ghi ly do cu the

### Buoc 2 — Traction Trajectory Analysis
```
Week-over-week trend analysis:
- 3+ tuan tang lien tuc → POSITIVE TRAJECTORY
- Flat → STAGNANT
- 3+ tuan giam lien tuc → NEGATIVE TRAJECTORY
- Volatile (tang giam lien tuc) → UNCLEAR SIGNAL
```

### Buoc 3 — Core Hypothesis Validation
- Original hypothesis da duoc validate chua?
- Key assumptions nao da proven true/false?
- Co assumption nao bi invalidated ma invalidate toan bo thesis?

### Buoc 4 — Sunk Cost Removal
- Tinh "future value" khong tinh resources da spent
- Hoi: "Neu bat dau tu zero hom nay voi data nay, co invest khong?"
- Neu answer la NO → strong KILL signal

### Buoc 5 — Pivot Viability Assessment (neu co pivot options)
- Pivot giu lai duoc gi tu experiment hien tai (users, data, learnings)?
- Pivot can bao nhieu resources them?
- Pivot co address root cause cua underperformance khong?
- Estimated time to validate pivot hypothesis?

### Buoc 6 — Opportunity Cost
- Resources dang bi lock trong experiment nay co the lam gi khac?
- Co Tier 3 hypothesis nao dang cho resources khong?
- Continue co block pipeline khong?

### Buoc 7 — Decision Matrix
```
KILL khi:
- Kill criteria triggered (bat ky 1 cai)
- Liquidity Score khong tang sau 8 tuan
- Key assumption proven false
- Team khong solve duoc cold start
- Sunk cost test: "would not invest again from zero"

PIVOT khi:
- Core insight van valid nhung execution sai
- Co segment/channel moi co signal
- Pivot giu duoc >50% assets tu experiment hien tai
- Root cause cua underperformance co the address bang pivot

CONTINUE khi:
- Traction trajectory positive
- Key assumptions dang duoc validate
- Metrics trending up du cham
- Clear path to next milestone
```

### Buoc 8 — Generate Decision

## Output format (JSON)

```json
{
  "skill": "D1",
  "experiment_name": "string",
  "experiment_week": 0,
  "kill_criteria_review": {
    "criteria_checked": 0,
    "criteria_triggered": 0,
    "details": [
      {
        "criterion": "string",
        "threshold": "string",
        "actual": "string",
        "triggered": false
      }
    ]
  },
  "trajectory_analysis": {
    "traction_trajectory": "POSITIVE | STAGNANT | NEGATIVE | UNCLEAR",
    "liquidity_trajectory": "POSITIVE | STAGNANT | NEGATIVE | UNCLEAR",
    "weeks_of_positive_trend": 0,
    "weeks_of_negative_trend": 0
  },
  "hypothesis_validation": {
    "original_hypothesis": "string",
    "validated": false,
    "key_assumptions": [
      {
        "assumption": "string",
        "status": "PROVEN_TRUE | PROVEN_FALSE | UNVALIDATED",
        "evidence": "string"
      }
    ],
    "thesis_still_valid": true
  },
  "sunk_cost_test": {
    "total_invested": 0,
    "would_invest_from_zero": true,
    "reasoning": "string"
  },
  "pivot_assessment": {
    "viable_pivots": [
      {
        "description": "string",
        "assets_retained_percent": 0,
        "additional_resources_needed": "string",
        "addresses_root_cause": true,
        "estimated_weeks": 0,
        "viability": "HIGH | MEDIUM | LOW"
      }
    ],
    "best_pivot": "string | null"
  },
  "opportunity_cost": {
    "resources_locked": "string",
    "alternative_uses": ["string"],
    "tier_3_waiting": 0,
    "pipeline_blocked": false
  },
  "decision": "KILL | PIVOT | CONTINUE",
  "decision_reasoning": "string",
  "confidence": "HIGH | MEDIUM | LOW",
  "if_continue": {
    "next_milestone": "string",
    "timeline": "string",
    "success_metric": "string",
    "next_review_date": "string"
  },
  "if_pivot": {
    "pivot_description": "string",
    "what_changes": "string",
    "what_stays": "string",
    "new_hypothesis": "string",
    "timeline": "string"
  },
  "if_kill": {
    "patterns_to_extract": ["string"],
    "resources_freed": "string",
    "next_experiment": "string"
  }
}
```

## Business Type Adaptations

| Business Type | Primary Kill Signal | Pivot Indicators | Continue Threshold |
|---|---|---|---|
| **Marketplace** | Liquidity Score = 0 after 8w | Segment interest but wrong channel | Repeat rate appearing |
| **Content Platform** | CMF < 0.1 after 4w | Engagement on wrong platform | Save/share rate growing |
| **SaaS** | Churn > 15%/month after 8w | Feature request pattern shift | MRR growing steadily |
| **Service** | No repeat bookings after 8w | Demand in adjacent service | Repeat + referral emerging |
| **B2B** | No paid contract after 8w | Interest from different segment | Contract expansion |

## Quy tac

1. **Kill criteria triggered = KILL la default.** CEO co the override nhung phai ghi ly do bang van ban
2. KHONG BAO GIO continue vi "da dau tu nhieu" — sunk cost la KHONG relevant
3. Pivot chi viable khi giu duoc >50% assets (users, data, infrastructure) tu experiment hien tai
4. Liquidity Score khong tang sau 8 tuan → KILL, khong exception, khong extend
5. Moi CONTINUE decision phai co next milestone + timeline + review date cu the
6. Moi KILL decision phai trigger Pattern Extraction (A7) truoc khi dong experiment
7. Decision confidence PHAI honest — "LOW" confidence co nghia la can them data truoc khi finalize
8. Skill nay KHONG execute decision — chi recommend. CEO la nguoi final decision maker
