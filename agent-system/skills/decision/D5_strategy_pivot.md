---
name: D5_strategy_pivot
description: Detect khi nào cần pivot strategy và recommend pivot direction
type: reasoning
---

## Mục tiêu
Identify pivot signals và recommend specific pivot options.

## Pivot Triggers
1. Liquidity Score flat/declining 3+ weeks despite execution changes
2. CMF Score < 0.2 after week 4 (content not resonating)
3. CAC increasing while conversion decreasing
4. Key assumption proven false
5. Competitor launched similar with better distribution
6. Regulation change invalidating current approach

## Pivot Types
1. **Segment Pivot**: Same product, different customer segment
2. **Channel Pivot**: Same offer, different distribution channel
3. **Value Pivot**: Same segment, different value proposition
4. **Model Pivot**: Same marketplace, different business model (commission→SaaS)
5. **Geography Pivot**: Same concept, different location
6. **Kill + Restart**: Fundamentally broken, extract patterns and start fresh

## Decision Matrix
- Data supports segment but not channel → Channel Pivot
- Data supports channel but not segment → Segment Pivot
- Neither segment nor channel working → Consider Kill
- Product works but can't monetize → Model Pivot

## Output format
```json
{
  "pivot_triggered": true,
  "trigger_reason": "",
  "current_state": {"ls": 0, "cmf": 0, "week": 0},
  "pivot_options": [
    {"type": "", "description": "", "evidence_for": "", "risk": "", "timeline_weeks": 0}
  ],
  "recommended_pivot": "",
  "patterns_to_preserve": [],
  "patterns_to_abandon": []
}
```
