---
code: A5
name: Traction Scoring
type: reasoning
category: analysis
description: >
  Tính Traction Score tổng hợp cho experiment hoặc marketplace. Trọng số thay đổi
  theo business type. Normalization deterministic theo benchmark per metric.
  Trend và kill signals yêu cầu historical context. Output là observation — không phải prescription.
tools_required: []
output_format: json
---

## Mục đích

Đánh giá mức độ traction của một experiment hoặc marketplace bằng cách tính điểm tổng hợp
từ nhiều metrics. Trọng số thay đổi theo business type để phản ánh đúng thực tế từng loại hình.

Skill này **chỉ score và observe** — không recommend action, không thiết kế experiment.
`dimension_signals` mô tả pattern quan sát được, không phải việc phải làm. Quyết định thuộc CEO.

---

## Input cần có

```json
{
  "experiment_name": "string",
  "business_type": "marketplace | content_platform | saas | service | b2b",
  "experiment_week": 0,
  "current_metrics": {
    "liquidity": {
      "listings_transacted_30d_percent": 0.0,
      "buyers_found_match_percent": 0.0,
      "repeat_rate_no_incentive": 0.0
    },
    "growth": {
      "supply_growth_wow": 0.0,
      "demand_growth_wow": 0.0,
      "organic_percent": 0.0,
      "referral_rate": 0.0
    },
    "engagement": {
      "dau_mau_ratio": 0.0,
      "avg_session_duration_minutes": 0.0,
      "actions_per_session": 0.0
    },
    "revenue": {
      "gmv_growth_wow": 0.0,
      "revenue_per_transaction": 0.0,
      "arpu_monthly": 0.0,
      "take_rate_effective": 0.0,
      "revenue_per_tx_target": 0.0,
      "arpu_target": 0.0
    },
    "retention": {
      "d7_retention": 0.0,
      "d30_retention": 0.0,
      "supply_churn_monthly": 0.0,
      "demand_churn_monthly": 0.0
    },
    "content": {
      "engagement_index": 0.0,
      "save_rate": 0.0,
      "share_rate": 0.0,
      "conversion_from_content": 0.0
    }
  },
  "historical_context": {
    "previous_week_dimension_scores": {
      "liquidity": 0.0,
      "growth": 0.0,
      "engagement": 0.0,
      "revenue": 0.0,
      "retention": 0.0,
      "content": 0.0,
      "traction_score": 0.0
    },
    "last_n_weeks_traction_scores": [0.0],
    "weeks_available": 0
  }
}
```

> **Lưu ý về `historical_context`:**
> - `previous_week_dimension_scores`: dimension scores từ tuần trước — dùng để tính trend per dimension.
> - `last_n_weeks_traction_scores`: list traction scores từ tuần gần nhất đến xa nhất. Ví dụ [62, 58, 55, 50] = 4 tuần gần nhất. Dùng để tính velocity và kill signals.
> - `weeks_available`: số tuần có data thực sự. Nếu = 0, trend và kill signals không thể tính — ghi `trend_available: false`.
> - Content metrics nhận `engagement_index` từ A4 output (đã normalized theo platform benchmark), không phải raw engagement rate.

---

## Normalization Framework

**Vấn đề cốt lõi:** Mỗi raw metric có đơn vị và range khác nhau. Không thể cộng trực tiếp.
**Giải pháp:** Mỗi metric được convert sang thang 0–100 dựa trên benchmark range trước khi tính dimension score.

### Công thức normalize chung
```
Normalized = clamp((raw - floor) / (ceiling - floor) × 100, 0, 100)

Trong đó:
- floor = giá trị tối thiểu meaningful (dưới đây = 0 điểm)
- ceiling = giá trị target tốt (trên đây = 100 điểm, clamp tại 100)
- clamp = không cho vượt quá 0 hoặc 100
```

### Benchmark ranges per metric

**Liquidity metrics:**

| Metric | Floor | Ceiling | Lý do |
|---|---|---|---|
| listings_transacted_30d_percent | 0% | 30% | < 5% = illiquid, > 30% = very liquid |
| buyers_found_match_percent | 0% | 70% | < 20% = poor matching, > 70% = excellent |
| repeat_rate_no_incentive | 0% | 50% | Organic repeat = trust signal |

**Growth metrics:**

| Metric | Floor | Ceiling | Lý do |
|---|---|---|---|
| supply_growth_wow | 0% | 15% | > 15%/week = hypergrowth, rare |
| demand_growth_wow | 0% | 15% | Same |
| organic_percent | 0% | 80% | 80%+ organic = strong PMF |
| referral_rate | 0% | 30% | 30%+ referral = viral loop |

**Engagement metrics:**

| Metric | Floor | Ceiling | Lý do |
|---|---|---|---|
| dau_mau_ratio | 0% | 50% | 50%+ = daily habit formed |
| avg_session_duration_minutes | 0 | 15 | Context-dependent, 15min = strong |
| actions_per_session | 0 | 10 | 10+ actions = high engagement |

**Revenue metrics:**

| Metric | Floor | Ceiling | Lý do |
|---|---|---|---|
| gmv_growth_wow | 0% | 20% | > 20%/week = exceptional |
| revenue_per_transaction | 0 | context-dependent* | Xem note bên dưới |
| arpu_monthly | 0 | context-dependent* | Xem note bên dưới |
| take_rate_effective | 0% | 20% | > 20% = premium marketplace |

> **Revenue metrics — target bắt buộc:**
> - `revenue_per_tx_target` và `arpu_target` PHẢI được cung cấp để normalize chính xác.
> - Nếu có target: ceiling = target × 1.5, floor = 0. Score phản ánh progress toward target.
> - **Nếu không có target → `revenue_score_confidence: LOW`.** Normalize bằng cách dùng current value làm 50th percentile (score = 50) nhưng flag rõ — hai experiments khác nhau đều ra 50 là vô nghĩa khi không có benchmark chung.
> - `gmv_growth_wow` và `take_rate_effective` có universal benchmark, không cần target.

**Retention metrics:**

| Metric | Floor | Ceiling | Lý do |
|---|---|---|---|
| d7_retention | 0% | 40% | 40%+ D7 = excellent (benchmark: mobile apps ~25%) |
| d30_retention | 0% | 25% | 25%+ D30 = very good |
| supply_churn_monthly | 20% | 0% | Inverted: 0% churn = 100, 20%+ = 0 |
| demand_churn_monthly | 20% | 0% | Inverted: 0% churn = 100, 20%+ = 0 |

> **Inverted metrics** (churn): `Normalized = clamp((ceiling_raw - raw) / (ceiling_raw - floor_raw) × 100, 0, 100)`
> Ví dụ: churn 5% → (20 - 5) / (20 - 0) × 100 = 75 điểm.

**Content metrics (từ A4):**

| Metric | Floor | Ceiling | Lý do |
|---|---|---|---|
| engagement_index | 0 | 200 | 100 = at benchmark, 200 = 2x benchmark |
| save_rate | 0% | 10% | 10%+ save rate = exceptional |
| share_rate | 0% | 5% | 5%+ share rate = viral |
| conversion_from_content | 0% | 3% | 3%+ content → action = strong |

---

## Business Type Weights

### Marketplace (truyền thống)
```
Liquidity:   35%
Growth:      25%
Retention:   20%
Revenue:     15%
Engagement:   5%
Content:      0%
```

### Content Platform / Creator Economy
```
Engagement:  30%
Growth:      25%
Content:     20%
Retention:   15%
Revenue:     10%
Liquidity:    0%
```

### SaaS-enabled Marketplace
```
Retention:   30%
Revenue:     25%
Growth:      20%
Liquidity:   15%
Engagement:  10%
Content:      0%
```

### Service Marketplace (local)
```
Liquidity:   30%
Retention:   25%
Growth:      20%
Revenue:     15%
Engagement:  10%
Content:      0%
```

### B2B Marketplace
```
Revenue:     30%
Retention:   25%
Liquidity:   20%
Growth:      15%
Engagement:  10%
Content:      0%
```

> **Rule về missing dimensions — Proportional Redistribution:**
> Nếu một dimension có weight > 0 nhưng không có data input → ghi score = `null`, không điền 0.
> Redistribute weight **proportionally** cho tất cả dimensions còn lại theo tỷ lệ relative weights.
>
> Ví dụ: Marketplace weights = Liquidity 35%, Growth 25%, Retention 20%, Revenue 15%, Engagement 5%.
> Nếu Revenue = null → tổng remaining = 80%. Redistribute: Liquidity = 35/80 = 43.75%, Growth = 25/80 = 31.25%, v.v.
>
> **Không dồn toàn bộ về dimension lớn nhất** — điều đó overweight dimension dominant và distort score.
> Ghi rõ redistribution trong `weight_adjustments`.

---

## Dimension Score Formulas

Tất cả inputs phải được **normalize trước** theo bảng benchmark ranges ở trên. Công thức dưới dùng normalized values (0–100).

### Liquidity Score
```
= listings_transacted_norm × 0.40
+ buyers_found_match_norm × 0.30
+ repeat_rate_norm × 0.30
```

### Growth Score
```
= supply_growth_norm × 0.30
+ demand_growth_norm × 0.30
+ organic_percent_norm × 0.25
+ referral_rate_norm × 0.15
```

### Engagement Score
```
= dau_mau_norm × 0.40
+ session_duration_norm × 0.30
+ actions_per_session_norm × 0.30
```

### Revenue Score
```
= gmv_growth_norm × 0.30
+ revenue_per_tx_norm × 0.25
+ arpu_norm × 0.25
+ take_rate_norm × 0.20
```

### Retention Score
```
= d7_retention_norm × 0.25
+ d30_retention_norm × 0.35
+ supply_churn_norm × 0.20
+ demand_churn_norm × 0.20
```

### Content Score
```
= engagement_index_norm × 0.30
+ save_rate_norm × 0.25
+ share_rate_norm × 0.25
+ conversion_norm × 0.20
```

---

## Traction Score Tổng hợp

```
Traction Score = Σ (dimension_score × adjusted_weight)
Range: 0–100
```

---

## Trend và Velocity (yêu cầu historical_context)

**Nếu `weeks_available = 0`** → `trend_available: false`. Không tính trend, không tính velocity, không check kill signals dựa trên lịch sử.

**Dimension trend** (dùng `previous_week_dimension_scores`):
```
dimension_delta = current_score - previous_week_score

Nếu delta > +3: trend = "UP"
Nếu delta < -3: trend = "DOWN"
Nếu -3 ≤ delta ≤ 3: trend = "FLAT"
```

**Traction velocity** (dùng `last_n_weeks_traction_scores`):
```
Nếu weeks_available ≥ 2:
  velocity = traction_score_hiện_tại - last_n_weeks_scores[0]  (so với tuần trước)

Nếu weeks_available ≥ 3:
  avg_velocity = (traction_score_hiện_tại - last_n_weeks_scores[weeks_available-1])
                 / weeks_available
```

**Traction trend** (dựa trên `last_n_weeks_traction_scores` + current):
```
Nếu weeks_available ≥ 3:
  Tính linear regression slope trên last 3+ scores
  slope > +2/week: ACCELERATING
  slope 0 đến +2: STEADY
  slope -2 đến 0: DECELERATING
  slope < -2: DECLINING

Nếu weeks_available = 1:
  Dùng velocity đơn: positive → ACCELERATING/STEADY, negative → DECELERATING/DECLINING
  Ghi note: "trend_confidence: LOW — only 1 week comparison available"

Nếu weeks_available = 0:
  traction_trend = null
```

---

## Health Classification

| Traction Score | Health | Ý nghĩa |
|---|---|---|
| 80–100 | **STRONG** | Traction rõ ràng, có thể double down |
| 60–79 | **GOOD** | Traction tốt, tiếp tục và optimize |
| 40–59 | **MODERATE** | Có tín hiệu nhưng chưa đủ mạnh |
| 20–39 | **WEAK** | Tín hiệu yếu, cần investigate |
| 0–19 | **NO_TRACTION** | Không có tín hiệu meaningful |

> **Rule quan trọng:** Trend quan trọng hơn absolute score. Một experiment có score 45 đang
> ACCELERATING tốt hơn score 65 đang DECLINING. Health classification chỉ dựa trên score — nhưng
> `health_with_trend` phải kết hợp cả hai.

### Health with Trend (composite signal)

| Score | Trend | health_with_trend |
|---|---|---|
| ≥ 60 | ACCELERATING hoặc STEADY | ON_TRACK |
| ≥ 60 | DECELERATING | WATCH |
| ≥ 60 | DECLINING | AT_RISK |
| 40–59 | ACCELERATING | PROMISING |
| 40–59 | STEADY hoặc DECELERATING | MODERATE |
| 40–59 | DECLINING | AT_RISK |
| < 40 | bất kỳ | CRITICAL |
| Trend unavailable | — | health_with_trend = null |

---

## Kill Signal Check

Kill signals chỉ có thể check khi `weeks_available > 0`. Ghi rõ `checkable: false` nếu không đủ history.

**Kill thresholds per business type** — thay vì universal week 8:

| Business Type | Traction Score kill threshold | Kill week | Lý do |
|---|---|---|---|
| Marketplace | Score < 20 | Week ≥ 8 | Cold start nhanh, liquidity signal rõ trong 8 tuần |
| Content Platform | 3 tuần decline liên tiếp | Bất kỳ | Engagement decay = audience mismatch |
| SaaS | Score < 20 | Week ≥ 10 | Sales cycle dài hơn, cần thêm thời gian |
| Service | Score < 20 | Week ≥ 10 | Operational ramp-up cần 10 tuần |
| B2B | Score < 20 | Week ≥ 12 | Enterprise sales cycle dài, cần grace period |

**Universal kill signals (áp dụng mọi business type):**

| Signal | Điều kiện | Severity |
|---|---|---|
| **Decline liên tục** | Traction Score giảm ≥ 3 tuần liên tiếp | WARNING |
| **Dimension dead** | Bất kỳ dimension nào có weight > 20% mà score = 0 tại week ≥ kill_week/2 | INVESTIGATE |
| **No primary signal** | Dimension có weight cao nhất = 0 tại kill_week | KILL |

**Early signal check per business type:**

| Business Type | Early signal cần có (Week 4) | Nếu thiếu |
|---|---|---|
| Marketplace | Liquidity Score > 20 | WARNING |
| Content Platform | Engagement Score > 30 | WARNING |
| SaaS | D7 retention > 40% | WARNING |
| Service | Ít nhất 1 completed booking có repeat signal | WARNING |
| B2B | Ít nhất 1 paid contract hoặc LOI | WARNING |

---

## Quy trình thực hiện

**Bước 1 — Validate input.** Kiểm tra business_type, xác định weights. Kiểm tra revenue targets — nếu thiếu, set `revenue_score_confidence: LOW`. Kiểm tra `weeks_available`.

**Bước 2 — Normalize từng metric** theo benchmark ranges. Inverted metrics dùng inverted formula. Ghi lại normalized value trong `normalized_metrics`.

**Bước 3 — Tính dimension scores.** Nếu metric trong dimension là null, redistribute weight proportionally trong dimension đó.

**Bước 4 — Apply business type weights.** Nếu dimension null, redistribute proportionally cho tất cả dimensions còn lại theo tỷ lệ relative weights — không dồn về dimension lớn nhất.

**Bước 5 — Tính Traction Score tổng hợp.**

**Bước 6 — Score Confidence per dimension.** Xác định confidence dựa trên: số metrics null, revenue target có hay không, weeks_available.

**Bước 7 — Trend và Velocity** (chỉ khi weeks_available > 0).

**Bước 8 — Health Classification.** Tính `health` và `health_with_trend`.

**Bước 9 — Kill Signal Check.** Dùng kill_week threshold theo business type, không phải universal week 8.

**Bước 10 — Interaction Flags.** Detect cross-dimension patterns nguy hiểm.

**Bước 11 — Dimension Signals.** Observe patterns — không prescribe.

**Bước 12 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A5",
  "experiment_name": "string",
  "business_type": "string",
  "experiment_week": 0,
  "trend_available": true,
  "weights_applied": {
    "liquidity": 0.0,
    "growth": 0.0,
    "engagement": 0.0,
    "revenue": 0.0,
    "retention": 0.0,
    "content": 0.0
  },
  "weight_adjustments": [
    "string — mô tả nếu có dimension null và weight được redistribute"
  ],
  "normalized_metrics": {
    "liquidity": {
      "listings_transacted_30d_percent": { "raw": 0.0, "normalized": 0.0 },
      "buyers_found_match_percent": { "raw": 0.0, "normalized": 0.0 },
      "repeat_rate_no_incentive": { "raw": 0.0, "normalized": 0.0 }
    },
    "growth": {
      "supply_growth_wow": { "raw": 0.0, "normalized": 0.0 },
      "demand_growth_wow": { "raw": 0.0, "normalized": 0.0 },
      "organic_percent": { "raw": 0.0, "normalized": 0.0 },
      "referral_rate": { "raw": 0.0, "normalized": 0.0 }
    },
    "engagement": {
      "dau_mau_ratio": { "raw": 0.0, "normalized": 0.0 },
      "avg_session_duration_minutes": { "raw": 0.0, "normalized": 0.0 },
      "actions_per_session": { "raw": 0.0, "normalized": 0.0 }
    },
    "revenue": {
      "gmv_growth_wow": { "raw": 0.0, "normalized": 0.0 },
      "revenue_per_transaction": { "raw": 0.0, "normalized": 0.0, "benchmark_note": "string | null" },
      "arpu_monthly": { "raw": 0.0, "normalized": 0.0, "benchmark_note": "string | null" },
      "take_rate_effective": { "raw": 0.0, "normalized": 0.0 }
    },
    "retention": {
      "d7_retention": { "raw": 0.0, "normalized": 0.0 },
      "d30_retention": { "raw": 0.0, "normalized": 0.0 },
      "supply_churn_monthly": { "raw": 0.0, "normalized": 0.0, "inverted": true },
      "demand_churn_monthly": { "raw": 0.0, "normalized": 0.0, "inverted": true }
    },
    "content": {
      "engagement_index": { "raw": 0.0, "normalized": 0.0 },
      "save_rate": { "raw": 0.0, "normalized": 0.0 },
      "share_rate": { "raw": 0.0, "normalized": 0.0 },
      "conversion_from_content": { "raw": 0.0, "normalized": 0.0 }
    }
  },
  "dimension_scores": {
    "liquidity": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "trend": "UP | DOWN | FLAT | null",
      "delta_vs_last_week": 0.0
    },
    "growth": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "trend": "UP | DOWN | FLAT | null",
      "delta_vs_last_week": 0.0
    },
    "engagement": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "trend": "UP | DOWN | FLAT | null",
      "delta_vs_last_week": 0.0
    },
    "revenue": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "trend": "UP | DOWN | FLAT | null",
      "delta_vs_last_week": 0.0
    },
    "retention": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "trend": "UP | DOWN | FLAT | null",
      "delta_vs_last_week": 0.0
    },
    "content": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "trend": "UP | DOWN | FLAT | null",
      "delta_vs_last_week": 0.0
    }
  },
  "traction_score": 0.0,
  "traction_velocity": 0.0,
  "traction_trend": "ACCELERATING | STEADY | DECELERATING | DECLINING | null",
  "trend_confidence": "HIGH | MEDIUM | LOW | null",
  "score_confidence": {
    "liquidity": "HIGH | MEDIUM | LOW",
    "growth": "HIGH | MEDIUM | LOW",
    "engagement": "HIGH | MEDIUM | LOW",
    "revenue": "HIGH | MEDIUM | LOW",
    "retention": "HIGH | MEDIUM | LOW",
    "content": "HIGH | MEDIUM | LOW | N/A",
    "overall": "HIGH | MEDIUM | LOW",
    "revenue_score_confidence": "HIGH | LOW",
    "confidence_notes": ["string — lý do cụ thể nếu dimension bị LOW, ví dụ: 'revenue targets not provided'"]
  },
  "health": "STRONG | GOOD | MODERATE | WEAK | NO_TRACTION",
  "health_with_trend": "ON_TRACK | PROMISING | WATCH | AT_RISK | MODERATE | CRITICAL | null",
  "strongest_dimension": "string",
  "weakest_dimension": "string",
  "kill_signals": {
    "checkable": true,
    "kill_week_threshold": 0,
    "triggered": false,
    "signals": [
      {
        "type": "string — tên signal",
        "severity": "KILL | WARNING | INVESTIGATE",
        "condition_met": "string — mô tả cụ thể tại sao trigger"
      }
    ]
  },
  "interaction_flags": [
    {
      "pattern": "string — tên pattern, ví dụ: 'low_liquidity_suppressing_retention'",
      "dimensions_involved": ["string"],
      "observation": "string — mô tả cụ thể pattern quan sát được",
      "severity": "HIGH | MEDIUM | LOW"
    }
  ],
  "dimension_signals": [
    {
      "dimension": "string",
      "observation": "string — mô tả pattern quan sát được, không phải action cần làm",
      "signal_strength": "STRONG | MODERATE | WEAK"
    }
  ]
}
```

---

## Interaction Flags

Sau khi có đủ dimension scores, kiểm tra các cross-dimension patterns nguy hiểm:

| Pattern | Điều kiện detect | Severity |
|---|---|---|
| `low_liquidity_suppressing_retention` | Liquidity < 30 VÀ Retention < 40 | HIGH |
| `growth_without_retention` | Growth > 60 VÀ Retention < 30 | HIGH |
| `revenue_without_engagement` | Revenue > 60 VÀ Engagement < 25 | MEDIUM |
| `engagement_without_conversion` | Engagement > 60 VÀ Revenue < 20 | MEDIUM |
| `retention_masking_low_growth` | Retention > 70 VÀ Growth < 20 | MEDIUM |
| `all_dimensions_flat` | Tất cả dimensions FLAT ≥ 3 tuần | LOW |

> Interaction flags là observation — mô tả tại sao pattern này đáng chú ý, không prescribe action.
> Nếu không có pattern nào: `interaction_flags: []`.

---

## Rules bắt buộc

1. **Normalize PHẢI chạy trước mọi formula.** Không cộng raw values với nhau. `normalized_metrics` là audit trail bắt buộc.
2. **Null ≠ 0.** Metric không có data = `null`. Redistribute weight, không điền 0.
3. **Weight redistribution PHẢI proportional** — không dồn về dimension lớn nhất. Tính lại ratio từ remaining weights.
4. **Revenue targets bắt buộc để score chính xác.** Nếu thiếu `revenue_per_tx_target` và `arpu_target` → `revenue_score_confidence: LOW`, flag trong `confidence_notes`.
5. **Weights PHẢI thay đổi theo business type.** Không dùng một bộ weights cho tất cả.
6. **Kill week threshold PHẢI per business type** — Marketplace 8w, SaaS/Service 10w, B2B 12w. Ghi `kill_week_threshold` trong output.
7. **Trend và kill signals chỉ tính khi `weeks_available > 0`.** Nếu không đủ history → `trend_available: false`, `kill_signals.checkable: false`.
8. **Content score chỉ tính khi business type = content_platform.** Các types khác: content weight = 0.
9. **Content metrics nhận `engagement_index` từ A4**, không phải raw engagement rate.
10. **`interaction_flags` PHẢI được kiểm tra** sau khi có dimension scores. Nếu không có pattern: `[]`, không bỏ trống field.
11. **`dimension_signals` và `interaction_flags` là observation only** — không dùng từ "cần/nên/phải/hãy".
12. **Không so sánh Traction Score giữa các business types khác nhau.**
13. **`health_with_trend` là primary signal cho CEO**, không phải `health` đơn thuần.
14. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.