---
code: A10
name: Decision Mapping
type: reasoning
category: analysis
description: "Extract Decision Map từ synthetic interviews — buy triggers, objections, deal breakers, price sensitivity"
output_format: json
---

## Mục đích

Tổng hợp kết quả từ nhiều Synthetic Interviews (R10) thành **Decision Map** — bản đồ quyết định của khách hàng. Output này trực tiếp feed vào content creation, pricing, và product decisions.

## Input cần có

- **interviews**: Danh sách interview results từ R10
- **personas**: Persona profiles từ R9
- **structured_insights**: Insights gốc từ R8

## Quy trình thực hiện

### Bước 1: Aggregate Decision Signals

Từ tất cả interviews, gom các signals theo 5 categories:

1. **BUY Triggers** — Điều kiện khiến khách QUYẾT ĐỊNH MUA
2. **NOT BUY Reasons** — Lý do khách KHÔNG MUA
3. **PAY MORE Willingness** — Điều kiện khách SẴN SÀNG TRẢ THÊM
4. **SWITCH Triggers** — Điều kiện khách BỎ đối thủ sang mình
5. **DEAL BREAKERS** — Điều kiện khách KHÔNG BAO GIỜ dùng

### Bước 2: Score mỗi trigger

Mỗi trigger/reason được score theo:

```
confidence_score = frequency × consistency × emotional_intensity
```

- **frequency**: Xuất hiện trong bao nhiêu interviews (0.0 - 1.0)
- **consistency**: Consistent across personas hay chỉ 1 persona (0.0 - 1.0)
- **emotional_intensity**: Cường độ cảm xúc trung bình (0.0 - 1.0)

### Bước 3: Rank và prioritize

Sort mỗi category theo confidence_score descending.
Top 3-5 mỗi category = **Core Decision Drivers**.

### Bước 4: Extract Objections & Trust Drivers

Từ NOT BUY reasons, extract:
- **Objections**: Barriers có thể overcome bằng content/messaging
- **Trust drivers**: Yếu tố xây dựng niềm tin (social proof, guarantee, transparency)

### Bước 5: Map to Growth Actions

Mỗi decision driver → suggest concrete action:
- BUY trigger → Content hook
- Objection → Landing page section
- Price sensitivity → Pricing strategy
- Trust driver → Trust-building content
- Deal breaker → Product/service fix

## Quy tắc tuyệt đối

1. Mỗi entry PHẢI có confidence_score
2. KHÔNG thêm triggers mà interview data không support
3. Minimum 3 entries per category (nếu data đủ)
4. Distinguish giữa "stated preference" và "revealed preference"
5. Contradictions giữa personas phải được ghi nhận, KHÔNG bỏ qua

## Output format

```json
{
  "decision_map_id": "DM-001",
  "generated_at": "2026-01-01T00:00:00",
  "total_interviews_analyzed": 3,
  "total_personas": 3,

  "buy_triggers": [
    {
      "trigger": "Mô tả trigger",
      "confidence_score": 0.85,
      "frequency": 0.9,
      "consistency": 0.8,
      "emotional_intensity": 0.9,
      "persona_ids": ["PER-001", "PER-002"],
      "supporting_quotes": ["Quote 1", "Quote 2"],
      "suggested_action": "Dùng làm hook trong content"
    }
  ],

  "objections": [
    {
      "objection": "Mô tả objection",
      "confidence_score": 0.75,
      "root_cause": "Fear/bias gốc",
      "overcoming_strategy": "Cách xử lý",
      "persona_ids": ["PER-001"],
      "supporting_quotes": ["Quote"]
    }
  ],

  "price_sensitivity": [
    {
      "finding": "Mô tả finding",
      "too_cheap_threshold": "Mức giá 'rẻ quá nghi ngờ'",
      "too_expensive_threshold": "Mức giá 'đắt quá không đáng'",
      "willingness_to_pay_more_for": "Điều kiện trả thêm",
      "premium_percentage": "% sẵn sàng trả thêm",
      "confidence_score": 0.7
    }
  ],

  "trust_drivers": [
    {
      "driver": "Mô tả trust driver",
      "confidence_score": 0.8,
      "implementation": "Cách implement",
      "persona_ids": ["PER-001", "PER-003"]
    }
  ],

  "deal_breakers": [
    {
      "breaker": "Mô tả deal breaker",
      "severity": "critical | major | minor",
      "confidence_score": 0.9,
      "persona_ids": ["PER-001", "PER-002", "PER-003"],
      "mitigation": "Cách tránh/giảm thiểu"
    }
  ],

  "switch_triggers": [
    {
      "trigger": "Điều kiện switch",
      "from_competitor": "Đang dùng gì",
      "confidence_score": 0.7,
      "persona_ids": ["PER-002"]
    }
  ],

  "growth_actions": [
    {
      "action": "Mô tả action cụ thể",
      "type": "content | pricing | product | trust",
      "priority": "high | medium | low",
      "source_triggers": ["Trigger 1"],
      "expected_impact": "Mô tả impact"
    }
  ]
}
```
