---
code: D3
name: Phase Transition
type: reasoning
category: decision
description: "Danh gia su san sang chuyen Phase 1→2→3 cua he thong, chi CEO quyet dinh, skill nay chi assess va recommend."
tools_required: []
output_format: json
---

## Muc dich

Danh gia he thong da san sang chuyen sang Phase tiep theo chua. Phase transition la quyet dinh lon nhat cua CEO — skill nay cung cap evidence va assessment, khong phai decision.

## Input can co

```json
{
  "current_phase": 1,
  "target_phase": 2,
  "system_state": {
    "active_marketplaces": [
      {
        "name": "string",
        "stage": "string",
        "liquidity_score": 0,
        "liquidity_trend": "UP | DOWN | FLAT",
        "weeks_active": 0,
        "proven_liquidity": false
      }
    ],
    "pattern_library_size": 0,
    "hypothesis_backlog": {
      "tier_1": 0,
      "tier_2": 0,
      "tier_3": 0
    },
    "completed_experiments": 0,
    "win_rate": 0.0
  },
  "playbook_status": {
    "documented": false,
    "components": {
      "cold_start_playbook": false,
      "liquidity_playbook": false,
      "distribution_playbook": false,
      "trust_playbook": false,
      "monetization_playbook": false
    }
  },
  "team_readiness": {
    "current_team_size": 0,
    "roles_filled": ["string"],
    "roles_needed_next_phase": ["string"],
    "team_capability_score": "HIGH | MEDIUM | LOW"
  },
  "financial_readiness": {
    "current_runway_months": 0,
    "monthly_burn": 0,
    "revenue_if_any": 0,
    "funding_for_next_phase": false
  },
  "cross_marketplace_signals": {
    "synergies_detected": false,
    "shared_supply_potential": false,
    "shared_demand_potential": false,
    "shared_infra_value": false
  }
}
```

## Quy trinh thuc hien

### Buoc 1 — Phase Transition Criteria Check

**Phase 1 → Phase 2 Criteria:**
```
REQUIRED (tat ca phai met):
□ Marketplace dau tien co PROVEN liquidity (Liquidity Score tang consistent 4+ tuan)
□ Cold start playbook documented tu experiment dau tien
□ Pattern Library co it nhat 5 patterns tu experiment dau
□ Hypothesis backlog co it nhat 2 Tier 3 ideas ready
□ Team co kha nang run 2 experiments song song

PREFERRED (tot neu co):
□ Repeat rate khong incentive > 20%
□ Unit economics trajectory positive
□ At least 1 distribution channel proven scalable
```

**Phase 2 → Phase 3 Criteria:**
```
REQUIRED (tat ca phai met):
□ 2+ marketplaces dang chay voi proven liquidity
□ Cross-marketplace synergy visible va measurable
□ Pattern Library co 15+ patterns voi HIGH confidence
□ Playbook da duoc replicate thanh cong it nhat 1 lan
□ Shared infrastructure co ROI positive

PREFERRED (tot neu co):
□ Portfolio Synergy Score > 10
□ Cold start time giam 50%+ so voi marketplace dau
□ Team structured cho parallel execution
□ Revenue tu marketplace(s) cover pipeline costs
```

### Buoc 2 — Criteria Scoring
- Moi criterion: MET / PARTIALLY_MET / NOT_MET
- Required criteria weight: 2x
- Preferred criteria weight: 1x
- Tinh overall readiness score

### Buoc 3 — Risk Assessment
- Chuyen Phase qua som: risks gi?
- O lai Phase hien tai: opportunity cost gi?
- Partial transition: co the activate 1 so Phase 2 capabilities ma khong full transition?

### Buoc 4 — Gap Analysis
- Criteria nao chua met?
- Mat bao lau de close gap?
- Co gap nao la blocker tuyet doi khong?

### Buoc 5 — Transition Plan (neu recommend)
- What activates in new phase
- What stays the same
- Team changes needed
- Budget changes needed
- Timeline for full transition

## Output format (JSON)

```json
{
  "skill": "D3",
  "current_phase": 1,
  "target_phase": 2,
  "criteria_assessment": {
    "required": [
      {
        "criterion": "string",
        "status": "MET | PARTIALLY_MET | NOT_MET",
        "evidence": "string",
        "gap_if_not_met": "string"
      }
    ],
    "preferred": [
      {
        "criterion": "string",
        "status": "MET | PARTIALLY_MET | NOT_MET",
        "evidence": "string"
      }
    ],
    "required_met": 0,
    "required_total": 0,
    "preferred_met": 0,
    "preferred_total": 0
  },
  "readiness_score": {
    "score": 0,
    "max_score": 0,
    "percentage": 0.0,
    "level": "READY | ALMOST_READY | NOT_READY | FAR_FROM_READY"
  },
  "risk_assessment": {
    "transition_too_early": {
      "risks": ["string"],
      "severity": "HIGH | MEDIUM | LOW"
    },
    "staying_current_phase": {
      "opportunity_costs": ["string"],
      "severity": "HIGH | MEDIUM | LOW"
    },
    "partial_transition": {
      "possible": true,
      "what_to_activate": ["string"],
      "what_to_defer": ["string"]
    }
  },
  "gap_analysis": [
    {
      "criterion": "string",
      "current_state": "string",
      "required_state": "string",
      "estimated_time_to_close": "string",
      "is_blocker": true,
      "action_to_close": "string"
    }
  ],
  "recommendation": "TRANSITION | PARTIAL_TRANSITION | STAY_CURRENT | NOT_READY",
  "recommendation_reasoning": "string",
  "transition_plan": {
    "applicable": true,
    "new_capabilities_to_activate": ["string"],
    "team_changes": ["string"],
    "budget_changes": "string",
    "timeline": "string",
    "milestones": [
      {
        "milestone": "string",
        "target_date": "string",
        "owner": "string"
      }
    ],
    "rollback_criteria": ["string"]
  },
  "ceo_decision_brief": {
    "one_line_summary": "string",
    "key_evidence_for": ["string"],
    "key_evidence_against": ["string"],
    "recommended_action": "string",
    "time_sensitivity": "URGENT | THIS_QUARTER | CAN_WAIT"
  }
}
```

## Business Type Adaptations

| Portfolio Type | Phase 1→2 Key Signal | Phase 2→3 Key Signal |
|---|---|---|
| **Pure Marketplace** | Proven liquidity + playbook | 2nd marketplace replicates playbook |
| **Content-led Marketplace** | CMF proven + conversion pipeline | Content engine replicable across verticals |
| **SaaS + Marketplace** | SaaS retention + marketplace traction | Shared user base across products |
| **Service Marketplace** | Repeat bookings + geographic proof | Multi-city expansion with same playbook |
| **B2B Platform** | Paid contracts + retention | Multi-vertical expansion |

## Quy tac

1. **CHI CEO quyet dinh Phase transition** — skill nay chi assess va recommend, KHONG decide
2. Tat ca REQUIRED criteria phai MET de recommend TRANSITION — khong co exception
3. PARTIALLY_MET khong dem la MET cho required criteria
4. Partial transition la option valid — khong phai all-or-nothing
5. Gap analysis phai co estimated time to close — khong de open-ended
6. Transition plan phai co ROLLBACK criteria — neu Phase moi khong work, cach quay lai
7. CEO decision brief phai fit trong 1 trang — concise, evidence-based
8. KHONG recommend transition vi "da o Phase 1 qua lau" — thoi gian khong phai criterion
