---
code: A7
name: Pattern Extraction
type: reasoning
category: analysis
description: >
  Extract và structure actionable patterns từ experiment data. Tổng hợp signals từ A5
  (traction) và A6 (CMF) thành patterns có thể reuse. Output là observations có evidence
  trail — không phải recommendations.
tools_required: []
output_format: json
---

## Mục đích

Sau mỗi experiment (win / fail / pivot), extract patterns có thể reuse ở experiments tiếp theo
hoặc ở verticals khác. A7 là memory layer của hệ thống — nó biến raw data thành structured
knowledge.

Skill này **chỉ extract và structure patterns** — không design experiments, không recommend
actions. `pattern_hypotheses` mô tả "nếu pattern này đúng thì có thể test gì", không phải
"phải làm gì."

---

## Input cần có

```json
{
  "experiment_name": "string",
  "business_type": "marketplace | content_platform | saas | service | b2b",
  "experiment_duration_weeks": 0,
  "outcome": "WIN | FAIL | PIVOT | ONGOING",
  "outcome_description": "string — mô tả ngắn kết quả và context",

  "traction_data": {
    "from_a5": true,
    "weekly_traction_scores": [
      {
        "week": 0,
        "traction_score": 0.0,
        "health_with_trend": "string",
        "dimension_scores": {
          "liquidity": 0.0,
          "growth": 0.0,
          "engagement": 0.0,
          "revenue": 0.0,
          "retention": 0.0,
          "content": 0.0
        },
        "interaction_flags": ["string"]
      }
    ],
    "strongest_dimension_overall": "string",
    "weakest_dimension_overall": "string",
    "kill_signals_triggered": ["string"]
  },

  "cmf_data": {
    "from_a6": true,
    "weekly_cmf_scores": [
      {
        "week": 0,
        "cmf_score": 0.0,
        "engagement_quality": 0.0,
        "audience_quality": 0.0,
        "conversion_signal": 0.0,
        "content_signals": ["string"]
      }
    ],
    "best_performing_content_types": ["string"],
    "worst_performing_content_types": ["string"]
  },

  "qualitative_data": {
    "user_feedback": ["string — direct quotes hoặc paraphrase từ users"],
    "supply_feedback": ["string — feedback từ supply side nếu marketplace"],
    "team_observations": ["string — observations từ team trong quá trình experiment"],
    "anomalies_noted": ["string — bất kỳ outlier nào được chú ý"]
  },

  "intervention_log": [
    {
      "week": 0,
      "intervention": "string — action đã thực hiện",
      "metric_before": "string",
      "metric_after": "string",
      "delta": "string"
    }
  ],

  "context": {
    "geography": "string",
    "vertical": "string",
    "target_segment": "string",
    "channels_used": ["string"],
    "resources_deployed": "string"
  }
}
```

> **Lưu ý về data sources:**
> - `traction_data.from_a5: true` = data được populate từ A5 weekly runs.
> - `cmf_data.from_a6: true` = data được populate từ A6 weekly runs.
> - `intervention_log` là critical input — không có intervention log, A7 không thể isolate causal variables.
> - Nếu `traction_data` hoặc `cmf_data` thiếu, A7 vẫn chạy nhưng confidence của patterns sẽ bị cap ở LOW hoặc MEDIUM.

---

## Pattern Categories

7 categories — generalized cho mọi business type, không chỉ marketplace:

| Code | Category | Câu hỏi cốt lõi |
|---|---|---|
| `CS` | **Cold Start** | Làm thế nào để có first meaningful activity khi chưa có gì? |
| `LQ` | **Liquidity / Activation** | Mechanism nào tạo ra recurring activity sau cold start? |
| `TR` | **Trust Building** | Điều gì làm cho một side tin tưởng side kia đủ để act? |
| `CT` | **Content** | Format, topic, hook, timing nào của content produce outcome tốt nhất? |
| `DT` | **Distribution** | Channel, sequence, frequency nào reach đúng audience hiệu quả nhất? |
| `MN` | **Monetization** | Pricing, timing, model nào produce revenue mà không kill adoption? |
| `RT` | **Retention** | Mechanism nào khiến user quay lại mà không cần incentive? |

> **Không bắt buộc phải có patterns cho tất cả 7 categories.** Chỉ extract những gì data thực sự support. Nếu không có evidence cho một category → không fabricate pattern.

---

## Pattern Structure

Mỗi pattern PHẢI follow format:

```
"When [CONDITION], [ACTION] produces [RESULT] because [MECHANISM]"
```

**Định nghĩa từng component:**

- **CONDITION**: Context cụ thể mà pattern này apply — segment, stage, channel, resource level, hoặc metric threshold. *Không được abstract.*
- **ACTION**: Điều đã được làm (hoặc không làm) — measurable, specific.
- **RESULT**: Outcome quan sát được — có số hoặc direction rõ ràng.
- **MECHANISM**: Lý do tại sao ACTION produce RESULT trong CONDITION đó — causal hypothesis.

**Ví dụ đúng:**
> "When demand users are in week 1 of onboarding (no completed transaction yet), showing 3 curated supply profiles with reviews produces 2.4× higher first booking rate because social proof reduces uncertainty at the highest-friction moment."

**Ví dụ sai:**
> "Engagement was low so we improved content." — Không phải pattern. Không có CONDITION cụ thể, ACTION không measurable, không có MECHANISM.

---

## Confidence Framework

Confidence không chỉ dựa trên số lượng data points — phải tính đến chất lượng evidence.

### Confidence Levels

| Level | Điều kiện | Ý nghĩa |
|---|---|---|
| **HIGH** | ≥ 3 independent evidence points + intervention log confirm causal link + pattern hold across ≥ 2 different weeks | Pattern đáng tin để replicate |
| **MEDIUM** | 2 evidence points + ít nhất 1 có intervention data, hoặc 3+ evidence points không có intervention | Promising nhưng cần thêm validation |
| **LOW** | 1 evidence point, hoặc correlation không có causal explanation, hoặc chỉ từ qualitative data | Hypothesis — cần test trước khi reuse |

### Data Point Definition

Để tránh ambiguity — một "data point" được định nghĩa là:

| Nguồn | Counts as |
|---|---|
| 1 tuần A5 data với dimension score rõ ràng | 1 data point |
| 1 tuần A6 data với CMF score rõ ràng | 1 data point |
| 1 intervention entry với before/after metric | 1 data point (weight cao hơn vì causal) |
| 1 user feedback quote với specific behavior | 0.5 data point |
| 1 team observation không có metric backup | 0.25 data point |

> Intervention data có weight cao hơn vì nó gần với causal evidence hơn là correlation.

---

## Extraction Process

### Bước 1 — Timeline Construction

Từ `weekly_traction_scores` và `weekly_cmf_scores`, xây dựng timeline tổng hợp:

```
Week N: traction_score, cmf_score, dimension highlights, content_signals, interventions trong tuần đó
```

Mục tiêu: thấy rõ "tuần nào tốt, tuần nào xấu, tuần nào có intervention."

### Bước 2 — Inflection Point Detection

Xác định các inflection points:
- Traction score thay đổi đột ngột (> ±10 points trong 1 tuần)
- CMF score thay đổi đột ngột (> ±15 points)
- Dimension score đảo chiều rõ rệt

Với mỗi inflection point: có intervention nào trong tuần đó hoặc tuần trước không?

### Bước 3 — Variable Isolation

Với mỗi inflection point, kiểm tra:
- Có ≥ 1 intervention trùng thời điểm không?
- Có external factor nào (seasonal, platform change, competitor) không?
- Metric nào changed, metric nào không changed?

**Chỉ extract pattern khi có thể isolate variable** — nếu nhiều thứ thay đổi cùng lúc, ghi rõ `confounders` thay vì assume causality.

### Bước 4 — Pattern Formulation

Với mỗi isolated variable, formulate pattern theo template:
```
"When [CONDITION], [ACTION] produces [RESULT] because [MECHANISM]"
```

Assign category, confidence, evidence list.

### Bước 5 — Counter-Example Check

Với mỗi pattern đã formulate: có tuần nào CONDITION đúng nhưng ACTION KHÔNG produce RESULT không?

Nếu có → ghi vào `counter_examples`. Nếu nhiều counter-examples → hạ confidence hoặc refine CONDITION để narrow scope.

### Bước 6 — Anti-Pattern Extraction

Anti-patterns là "thứ trông có vẻ work nhưng không work" — khác với counter-examples của patterns.

Ví dụ: "Incentivizing first transactions seemed to boost liquidity in week 3 but led to 80% churn by week 5 because users had no intrinsic motivation."

Anti-patterns quan trọng ngang với patterns — chúng prevent expensive mistakes.

### Bước 7 — Cross-Pattern Synthesis

Sau khi có danh sách patterns, kiểm tra:
- Patterns nào reinforce nhau (cùng mechanism)?
- Patterns nào conflict với nhau (cùng condition nhưng different recommended actions)?
- Pattern nào có scope rộng nhất (applicable to most similar experiments)?

### Bước 8 — Pattern Hypotheses

Từ patterns đã extract, formulate `pattern_hypotheses` — "nếu pattern này đúng, thì ở context khác có thể test như thế nào." Đây là observation về transferability, không phải recommendation.

---

## Output format (JSON)

```json
{
  "skill": "A7",
  "experiment_name": "string",
  "business_type": "string",
  "experiment_duration_weeks": 0,
  "outcome": "WIN | FAIL | PIVOT | ONGOING",
  "data_quality": {
    "traction_data_available": true,
    "cmf_data_available": true,
    "intervention_log_available": true,
    "weeks_with_data": 0,
    "pattern_confidence_ceiling": "HIGH | MEDIUM | LOW",
    "note": "string — ví dụ: 'No intervention log — causal patterns not possible, only correlational'"
  },
  "timeline_summary": [
    {
      "week": 0,
      "traction_score": 0.0,
      "cmf_score": 0.0,
      "inflection_point": false,
      "interventions_this_week": ["string"],
      "notable_signals": ["string"]
    }
  ],
  "patterns": [
    {
      "pattern_id": "A7-001",
      "category": "CS | LQ | TR | CT | DT | MN | RT",
      "pattern_statement": "When [CONDITION], [ACTION] produces [RESULT] because [MECHANISM]",
      "condition": "string — context cụ thể",
      "action": "string — điều đã làm, measurable",
      "result": "string — outcome với số hoặc direction",
      "mechanism": "string — causal hypothesis",
      "evidence": [
        {
          "source": "A5_week_N | A6_week_N | intervention_log | user_feedback | team_observation",
          "description": "string — data point cụ thể",
          "data_point_weight": 1.0
        }
      ],
      "total_evidence_score": 0.0,
      "confidence": "HIGH | MEDIUM | LOW",
      "confounders": ["string — variables không isolated được, nếu có"],
      "applicable_to": ["string — business types / verticals / contexts có thể apply"],
      "counter_examples": [
        {
          "week": 0,
          "condition_met": true,
          "action_taken": true,
          "result_produced": "string — what actually happened",
          "possible_explanation": "string"
        }
      ]
    }
  ],
  "anti_patterns": [
    {
      "pattern_id": "A7-AP001",
      "category": "CS | LQ | TR | CT | DT | MN | RT",
      "description": "string — what seemed to work but didn't",
      "apparent_signal": "string — metric that looked positive",
      "actual_outcome": "string — what happened later",
      "evidence": ["string"],
      "warning_condition": "string — khi nào cần cẩn thận với anti-pattern này"
    }
  ],
  "cross_pattern_synthesis": {
    "reinforcing_pairs": [
      {
        "pattern_ids": ["string", "string"],
        "shared_mechanism": "string — tại sao chúng reinforce nhau"
      }
    ],
    "conflicting_pairs": [
      {
        "pattern_ids": ["string", "string"],
        "conflict_description": "string — conflict ở điều kiện nào",
        "resolution_note": "string — CONDITION nào phân biệt khi nào dùng cái nào"
      }
    ],
    "highest_leverage_pattern": "string — pattern_id có scope rộng nhất hoặc impact lớn nhất",
    "system_observation": "string — 1-2 câu tổng hợp về điều gì drove hoặc killed experiment này"
  },
  "pattern_hypotheses": [
    {
      "based_on_pattern": "string — pattern_id",
      "hypothesis": "string — nếu pattern này đúng, thì ở [context X] có thể expect [outcome Y]",
      "transferability": "HIGH | MEDIUM | LOW",
      "transferability_reasoning": "string — tại sao pattern này likely hoặc unlikely transfer"
    }
  ],
  "extraction_confidence": "HIGH | MEDIUM | LOW",
  "extraction_confidence_reasoning": "string — overall quality của evidence base"
}
```

---

## Business Type Guidance

Pattern categories nào thường có signal rõ nhất theo business type:

| Business Type | High-signal categories | Low-signal categories | Special focus |
|---|---|---|---|
| Marketplace | CS, LQ, TR | MN (late signal) | Cold start và liquidity pattern thường linked |
| Content Platform | CT, DT, RT | LQ (không applicable) | Content và Distribution thường reinforce nhau |
| SaaS | RT, MN | CS (different dynamic) | Retention pattern là most reusable |
| Service | TR, CS, RT | CT | Trust pattern critical vì service = high-stakes transaction |
| B2B | TR, MN | CT, DT | Monetization timing pattern rất specific to sales cycle |

---

## Quy trình thực hiện

**Bước 1 — Data Quality Check.** Kiểm tra availability của traction_data, cmf_data, intervention_log. Xác định `pattern_confidence_ceiling`. Nếu không có intervention_log → ghi note, tất cả patterns sẽ là correlational, không causal.

**Bước 2 — Timeline Construction.** Merge traction và CMF data theo week. Overlay interventions.

**Bước 3 — Inflection Point Detection.** Identify weeks với changes > threshold.

**Bước 4 — Variable Isolation per inflection point.** Correlate với interventions, check confounders.

**Bước 5 — Pattern Formulation.** Write pattern statement, assign category, list evidence với weights.

**Bước 6 — Counter-Example Check** cho mỗi pattern.

**Bước 7 — Anti-Pattern Extraction.** Identify apparent signals that didn't hold.

**Bước 8 — Cross-Pattern Synthesis.** Find reinforcing/conflicting pairs.

**Bước 9 — Pattern Hypotheses.** Formulate transferability observations.

**Bước 10 — Compose JSON output.**

---

## Rules bắt buộc

1. **Pattern PHẢI follow template "When [CONDITION], [ACTION] produces [RESULT] because [MECHANISM]."** Thiếu bất kỳ component nào → không phải pattern, đưa vào `extraction_confidence_reasoning` thay.
2. **Không extract pattern nếu không có evidence.** "We think X happened" không đủ — phải có ít nhất 1 data point với weight ≥ 0.5.
3. **Confounders PHẢI được ghi rõ** khi không thể isolate variable. Không assume causality khi nhiều thứ thay đổi cùng lúc.
4. **Counter-examples PHẢI được checked** cho mỗi pattern trước khi assign confidence. Nhiều counter-examples → hạ confidence hoặc narrow CONDITION.
5. **Anti-patterns quan trọng ngang với patterns.** Nếu có apparent signal that didn't hold → PHẢI được extracted.
6. **`pattern_hypotheses` là observation về transferability**, không phải recommendation về action. Không dùng từ "nên/cần/phải."
7. **Confidence ceiling bị cap bởi data quality** — nếu không có intervention log, không một pattern nào được assign HIGH confidence (maximum MEDIUM).
8. **Không fabricate patterns** để fill categories. 3 good patterns với HIGH/MEDIUM confidence tốt hơn 7 patterns với LOW confidence.
9. Pattern `applicable_to` PHẢI specific — "all businesses" không được chấp nhận. Phải narrow: business type, stage, vertical, hoặc resource level.
10. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.