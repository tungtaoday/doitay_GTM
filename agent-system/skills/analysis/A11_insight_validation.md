---
code: A11
name: Insight Validation
type: reasoning
category: analysis
description: "Cross-validate synthetic insights với real social data — scoring confidence và flagging unverified claims"
output_format: json
---

## Mục đích

Validate insights từ Synthetic Interview (R10) và Decision Map (A10) bằng cách cross-reference với real social data. Đảm bảo synthetic insights không bị hallucination — chỉ giữ những gì có evidence thật.

## Input cần có

- **decision_map**: Decision Map từ A10
- **original_insights**: Structured insights từ R8
- **pain_phrases**: Raw pain phrases từ social listening
- **social_data**: Fresh social data (nếu có scan mới)

## Quy trình thực hiện

### Bước 1: Map mỗi decision trigger → real evidence

Với mỗi entry trong Decision Map:
- Tìm pain phrases matching
- Tìm social comments supporting
- Tìm review data confirming

### Bước 2: Score Validation

Mỗi insight nhận validation_status:

- **verified**: Có >= 3 real data points supporting
- **partially_verified**: Có 1-2 real data points
- **synthetic_only**: Không có real data — chỉ từ interview simulation
- **contradicted**: Real data mâu thuẫn với insight

### Bước 3: Confidence Adjustment

```
adjusted_confidence = original_confidence × validation_multiplier
```

Multipliers:
- verified: 1.0 (giữ nguyên)
- partially_verified: 0.7
- synthetic_only: 0.4
- contradicted: 0.1

### Bước 4: Generate Validation Gaps

List các insights cần thêm real data:
- Synthetic_only insights → suggest search queries để verify
- Contradicted insights → flag cho CEO review

### Bước 5: Update Recommendations

Re-rank growth_actions dựa trên adjusted_confidence:
- Chỉ recommend high-confidence actions
- Flag low-confidence actions cần validation

## Quy tắc tuyệt đối

1. KHÔNG auto-verify insights mà không có real evidence
2. Synthetic insights PHẢI được marked rõ ràng
3. Contradicted insights KHÔNG được bỏ — phải giữ lại với flag
4. Validation gaps phải có actionable next steps
5. Output phải include cả verified VÀ unverified insights

## Output format

```json
{
  "validation_id": "VAL-001",
  "validated_at": "2026-01-01T00:00:00",
  "total_insights_validated": 20,
  "summary": {
    "verified": 8,
    "partially_verified": 6,
    "synthetic_only": 4,
    "contradicted": 2
  },

  "validated_insights": [
    {
      "insight_type": "buy_trigger | objection | deal_breaker | trust_driver | price_sensitivity",
      "content": "Nội dung insight",
      "original_confidence": 0.85,
      "validation_status": "verified | partially_verified | synthetic_only | contradicted",
      "validation_multiplier": 1.0,
      "adjusted_confidence": 0.85,
      "real_evidence": [
        {
          "source": "social_listening | review | pain_phrase",
          "text": "Evidence text",
          "platform": "facebook | zalo | google",
          "match_quality": "exact | semantic | partial"
        }
      ],
      "contradiction_evidence": [],
      "recommendation": "use_in_content | needs_more_data | do_not_use | test_first"
    }
  ],

  "validation_gaps": [
    {
      "insight": "Insight cần validate",
      "current_status": "synthetic_only",
      "suggested_queries": ["Search query 1", "Search query 2"],
      "suggested_platforms": ["facebook_groups", "google_reviews"],
      "priority": "high | medium | low"
    }
  ],

  "updated_growth_actions": [
    {
      "action": "Action description",
      "adjusted_confidence": 0.85,
      "recommendation": "proceed | test_first | hold",
      "evidence_strength": "strong | moderate | weak"
    }
  ]
}
```
