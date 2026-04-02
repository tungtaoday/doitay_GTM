---
name: D2_resource_allocation
description: Allocate budget, time, và attention across experiments và marketplaces
type: reasoning
---

## Mục tiêu
Quyết định phân bổ resources dựa trên data, không dựa trên gut feeling.

## Framework

### Input Signals
- Liquidity Score trend (weight 40%)
- CMF Score (weight 20%)
- Traction Score (weight 20%)
- TAM potential (weight 10%)
- Resource efficiency — output per $ spent (weight 10%)

### Allocation Rules
1. **Winner gets more**: Marketplace có LS tăng → tăng budget 20%
2. **Loser gets less**: Marketplace có LS giảm 2 tuần → giảm budget 30%
3. **Kill gets zero**: Kill signal → immediate resource reallocation
4. **New experiment**: Max 20% total budget cho unproven experiment
5. **Reserve**: Always keep 10% unallocated cho opportunities

### Phase 1 Constraint
- Chỉ 1 experiment tại 1 thời điểm
- Budget ceiling per experiment: defined in Strategy
- Time ceiling: 8 weeks max

## Output format
```json
{
  "allocations": [
    {"marketplace": "", "budget_pct": 0, "time_pct": 0, "rationale": ""}
  ],
  "reallocation_triggers": [],
  "reserve_pct": 10,
  "total_budget": "",
  "recommendation": ""
}
```
