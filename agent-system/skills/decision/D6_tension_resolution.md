---
name: D6_tension_resolution
description: Resolve conflicts giữa agents khi có disagreement — dùng data, không debate
type: reasoning
---

## Mục tiêu
Khi 2+ agents disagree, resolve bằng structured process.

## Tension Types
1. **Research vs Strategy**: "Market saturated" vs "Still has gaps"
2. **Biz Dev vs Devil's Advocate**: "Opportunity is real" vs "It will fail"
3. **Content vs Analytics**: "This content style works" vs "Data says otherwise"
4. **Strategy vs Investment**: "Good economics" vs "Doesn't fit thesis"

## Resolution Protocol
1. Each side presents STRONGEST EVIDENCE (not opinion)
2. Identify the SPECIFIC ASSUMPTION they disagree on
3. Define a TEST that will resolve the disagreement
4. Run the test — no more debate until data arrives
5. Data wins. Period.

## Test Design
- Must be completable in ≤ 2 weeks
- Must have clear success/failure criteria BEFORE running
- Must be measurable (numbers, not feelings)
- Both sides agree on test design before execution

## Output format
```json
{
  "tension": {"agent_a": "", "position_a": "", "agent_b": "", "position_b": ""},
  "core_disagreement": "",
  "specific_assumption": "",
  "proposed_test": {
    "description": "",
    "success_criteria": "",
    "failure_criteria": "",
    "timeline_days": 0,
    "resources_needed": ""
  },
  "resolution": "pending_test|agent_a_wins|agent_b_wins|compromise",
  "action_items": []
}
```
