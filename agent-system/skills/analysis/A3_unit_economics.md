---
code: A3
name: Unit Economics
type: reasoning
category: analysis
description: >
  Mô hình hóa unit economics cho bất kỳ business model nào. Tính LTV/CAC per side
  (với marketplace), payback period, contribution margin, break-even, và sensitivity
  analysis gắn với assumptions thực tế. Output hoàn toàn có audit trail.
tools_required: []
output_format: json
---

## Mục đích

Xây dựng mô hình unit economics chi tiết cho bất kỳ opportunity nào đang được xem xét BUILD.
Đảm bảo CEO có đủ data về financial viability trước khi commit resources vào experiment.

Skill này **chỉ mô hình hóa và đánh giá economics** — không làm opportunity scoring (A2),
không thiết kế experiment, không đề xuất strategy. Key levers được list để inform decisions,
không phải để prescribe action.

---

## Input cần có

```json
{
  "opportunity_name": "string",
  "business_model": "marketplace | saas | content_platform | ecommerce | service | b2b | hybrid",
  "currency": "VND | USD",
  "revenue_model": {
    "type": "take_rate | subscription | freemium | advertising | hybrid",
    "take_rate_percent": 0,
    "subscription_price_per_month": 0,
    "ad_rpm": 0,
    "other_revenue_streams": ["string — mô tả cụ thể"]
  },
  "transaction_data": {
    "avg_transaction_value": 0,
    "transactions_per_demand_user_per_month": 0,
    "transactions_per_supply_unit_per_month": 0
  },
  "acquisition_costs": {
    "supply_cac": 0,
    "demand_cac": 0,
    "organic_percent_supply": 0,
    "organic_percent_demand": 0
  },
  "retention_data": {
    "supply_monthly_churn_percent": 0,
    "demand_monthly_churn_percent": 0
  },
  "operating_costs": {
    "cogs_percent_of_revenue": 0,
    "fixed_monthly_costs": 0,
    "variable_cost_per_supply_unit_per_month": 0,
    "variable_cost_per_demand_user_per_month": 0
  },
  "scale_context": {
    "current_supply_units": 0,
    "current_demand_users": 0,
    "target_supply_units_month_12": 0,
    "target_demand_users_month_12": 0
  },
  "data_confidence": {
    "transaction_data": "ACTUAL | COMPARABLE | ASSUMED",
    "cac_data": "ACTUAL | COMPARABLE | ASSUMED",
    "churn_data": "ACTUAL | COMPARABLE | ASSUMED",
    "cost_data": "ACTUAL | COMPARABLE | ASSUMED"
  },
  "early_stage_context": {
    "current_month": 0,
    "early_cac_multiplier": 1.0,
    "early_churn_multiplier": 1.0,
    "supply_demand_ratio_current": 0.0,
    "supply_demand_ratio_target": 0.0
  },
  "runway_context": {
    "cash_available": 0,
    "monthly_burn_current": 0
  }
}
```

> **Lưu ý về data_confidence:**
> - `ACTUAL` = data từ chính business này (pilot, experiment, hoặc đã vận hành)
> - `COMPARABLE` = data từ comparable business trong cùng geography/vertical
> - `ASSUMED` = assumption không có basis dữ liệu cụ thể
>
> **Lưu ý về early_stage_context:**
> - `early_cac_multiplier`: CAC ở month 1–3 thường cao hơn steady-state. Ví dụ: 2.0 = CAC gấp đôi.
>   Nếu không có data, dùng default 1.5 cho marketplace, 1.3 cho SaaS.
> - `early_churn_multiplier`: Churn ở early cohorts thường cao hơn. Default 1.5 nếu không có data.
> - `supply_demand_ratio`: Tỷ lệ supply/demand hiện tại vs target — imbalance lớn = matching kém = revenue thấp hơn model.
>
> **Lưu ý về runway_context:**
> - Nếu `monthly_burn_current = 0`, A3 sẽ estimate burn từ `operating_costs` trong input.

---

## Data Sufficiency Check

**Trước khi chạy bất kỳ formula nào**, kiểm tra data quality:

| Input field | Confidence = ASSUMED | Hành động |
|---|---|---|
| transaction_data | ASSUMED | Flag, dùng benchmark, confidence → LOW |
| cac_data | ASSUMED | Flag, LTV/CAC không đáng tin |
| churn_data | ASSUMED | Flag, dùng industry average với note rõ |
| cost_data | ASSUMED | Flag, break-even sẽ unreliable |

**Nếu ≥ 2 fields = ASSUMED → `data_confidence_overall = LOW`.** Output vẫn được tính nhưng
health_assessment KHÔNG thể là HEALTHY — tối đa NEEDS IMPROVEMENT, kèm note rõ.

**Nếu `cac_data = ASSUMED` → LTV/CAC ratio không đáng tin.** Không dùng LTV/CAC làm basis
cho health_assessment đơn độc — phải dùng contribution margin thay.

---

## Business Model Routing

Chọn đúng formula path trước khi tính:

| business_model | Formula Path |
|---|---|
| marketplace, service, ecommerce | Path A — Two-sided |
| saas, b2b | Path B — Subscription |
| content_platform | Path C — Content |
| hybrid | Tính cả hai paths liên quan, ghi rõ revenue split |

---

## Early-Stage Dynamics Check

**Chạy sau Data Sufficiency Check, trước khi tính unit economics chính.**

Mục tiêu: Phát hiện gap giữa steady-state model và thực tế month 1–6, nơi business hay chết
trước khi reach economics đẹp trên paper.

### Bước ES1 — Tính early-stage LTV/CAC

```
Early supply effective CAC = supply_cac × early_cac_multiplier × (1 - organic_percent_supply/100)
Early demand effective CAC = demand_cac × early_cac_multiplier × (1 - organic_percent_demand/100)

Early supply churn = supply_monthly_churn_percent × early_churn_multiplier
Early demand churn = demand_monthly_churn_percent × early_churn_multiplier

Early supply lifetime = 100 / Early supply churn
Early demand lifetime = 100 / Early demand churn

Early supply LTV = Supply CM/month × Early supply lifetime
Early demand LTV = Demand CM/month × Early demand lifetime

Early supply LTV/CAC = Early supply LTV / Early supply effective CAC
Early demand LTV/CAC = Early demand LTV / Early demand effective CAC
```

### Bước ES2 — Supply-demand imbalance impact

```
Imbalance ratio = |supply_demand_ratio_current - supply_demand_ratio_target|
                  / supply_demand_ratio_target

If imbalance ratio > 0.3:
  → matching_efficiency_penalty = "HIGH" — revenue thực tế thấp hơn model ~20-40%
If imbalance ratio 0.1–0.3:
  → matching_efficiency_penalty = "MEDIUM" — revenue thực tế thấp hơn model ~10-20%
If imbalance ratio < 0.1:
  → matching_efficiency_penalty = "LOW"
```

### Bước ES3 — Early-stage risk flag

| Điều kiện | early_stage_risk |
|---|---|
| Early LTV/CAC < 1 ở cả hai sides | CRITICAL — business likely chết trước steady-state |
| Early LTV/CAC < 1 ở một side | HIGH — một side đang subsidize side kia |
| Early LTV/CAC 1–2 và matching penalty HIGH/MEDIUM | HIGH |
| Early LTV/CAC > 2 và matching penalty LOW | LOW |
| Còn lại | MEDIUM |

> **Nếu `early_stage_risk = CRITICAL` → health_assessment verdict tối đa NEEDS IMPROVEMENT**,
> bất kể steady-state economics có đẹp đến đâu. Business phải survive early stage trước đã.



### A1. Gross Revenue per Transaction
```
Gross revenue/transaction = ATV × take_rate_percent / 100
```

### A2. Gross Margin
```
Gross margin % = 1 - cogs_percent_of_revenue / 100
Gross margin/transaction = Gross revenue/transaction × Gross margin %
```

### A3. Contribution Margin per Unit per Month

Supply side:
```
Supply gross revenue/month = Gross revenue/transaction × transactions_per_supply_unit/month
Supply contribution margin/month = (Supply gross revenue/month × Gross margin %)
                                   - variable_cost_per_supply_unit/month
```

Demand side:
```
Demand gross revenue/month = Gross revenue/transaction × transactions_per_demand_user/month
Demand contribution margin/month = (Demand gross revenue/month × Gross margin %)
                                   - variable_cost_per_demand_user/month
```

> **Nếu contribution margin < 0 ở base case → UNSUSTAINABLE bất kể LTV/CAC.**

### A4. Lifetime per Side
```
Supply avg lifetime months = 100 / supply_monthly_churn_percent
Demand avg lifetime months = 100 / demand_monthly_churn_percent
```

### A5. LTV per Side
```
Supply LTV = Supply contribution margin/month × Supply avg lifetime months
Demand LTV = Demand contribution margin/month × Demand avg lifetime months
```

### A6. Effective CAC per Side
```
Supply effective CAC = supply_cac × (1 - organic_percent_supply / 100)
Demand effective CAC = demand_cac × (1 - organic_percent_demand / 100)
```

### A7. LTV/CAC per Side + Blended
```
Supply LTV/CAC = Supply LTV / Supply effective CAC
Demand LTV/CAC = Demand LTV / Demand effective CAC

Supply ratio = current_supply_units / (current_supply_units + current_demand_users)
Demand ratio = 1 - Supply ratio
Blended LTV/CAC = (Supply LTV/CAC × Supply ratio) + (Demand LTV/CAC × Demand ratio)
```

> **Blended có thể mislead nếu một side economics rất kém.**
> Luôn report cả hai sides riêng lẻ — không chỉ dùng blended.

### A8. Payback Period per Side
```
Supply payback months = Supply effective CAC / Supply contribution margin/month
Demand payback months = Demand effective CAC / Demand contribution margin/month
```

### A9. Break-even
```
Total contribution per user pair = Supply CM/month + Demand CM/month
Break-even user pairs = fixed_monthly_costs / Total contribution per user pair
Break-even demand users = Break-even user pairs (demand side)
Break-even GMV/month = Break-even demand users × ATV × transactions_per_demand_user/month
```

---

## Path B — Subscription (SaaS / B2B)

### B1. Contribution Margin per User per Month
```
Gross margin/user/month = subscription_price_per_month × (1 - cogs_percent / 100)
Contribution margin/user/month = Gross margin/user/month
                                 - variable_cost_per_demand_user/month
```

### B2. Lifetime + LTV
```
Avg lifetime months = 100 / demand_monthly_churn_percent
LTV = Contribution margin/user/month × Avg lifetime months
```

### B3. LTV/CAC + Payback
```
Effective CAC = demand_cac × (1 - organic_percent_demand / 100)
LTV/CAC = LTV / Effective CAC
Payback months = Effective CAC / Contribution margin/user/month
```

### B4. Break-even
```
Break-even users = fixed_monthly_costs / Contribution margin/user/month
```

---

## Path C — Content Platform

### C1. Revenue per User per Month
```
Ad revenue/user/month = (pageviews_per_user/month × ad_rpm) / 1000
Subscription revenue/user/month = subscription_price × paid_conversion_rate
Total revenue/user/month = Ad revenue + Subscription revenue
```

### C2. Creator Payout (nếu có)
```
Creator payout % = creator_revenue_share_percent / 100
Net revenue/user/month = Total revenue/user/month × (1 - creator_payout %)
```

### C3. Contribution Margin + LTV/CAC/Payback
```
Gross margin/user/month = Net revenue/user/month × (1 - cogs_percent / 100)
Contribution margin/user/month = Gross margin/user/month
                                 - variable_cost_per_demand_user/month
LTV = Contribution margin/user/month × Avg lifetime months
LTV/CAC = LTV / Effective CAC
Payback months = Effective CAC / Contribution margin/user/month
```

---

## Sensitivity Analysis

Sensitivity analysis gắn với **top 3 levers nhạy cảm nhất** theo business model.

### Levers nhạy cảm theo business model

| Business Model | Lever 1 | Lever 2 | Lever 3 |
|---|---|---|---|
| Marketplace | Demand churn rate | Take rate | ATV |
| SaaS / B2B | Churn rate | CAC | Expansion revenue |
| Content Platform | Creator churn | CPM / RPM | Paid conversion rate |
| Service | Completion / no-show rate | Supply churn | Geographic density |
| E-commerce | Demand churn | CAC | Average order value |

### Stress scenarios per lever

Với mỗi lever trong top 3, tính 3 scenarios (thay đổi lever đó ±25%, giữ nguyên tất cả còn lại):

| Scenario | Thay đổi |
|---|---|
| **Optimistic** | Lever cải thiện 25% |
| **Base** | Như input |
| **Pessimistic** | Lever xấu đi 25% |

> **Tại sao per-lever thay vì all-at-once worst case?**
> All worst case cùng lúc = stress test không thực tế và không actionable.
> Per-lever isolation giúp CEO biết chính xác cái gì cần protect nhất.

---

## Health Assessment

Dựa trên composite của 3 metrics, không chỉ LTV/CAC:

### Metric 1 — LTV/CAC

> **Rule cứng trước khi score:**
> - Nếu **một side LTV/CAC < 1** (Path A) → blended LTV/CAC **KHÔNG được dùng** cho health assessment.
>   Thay vào đó: dùng side yếu hơn làm basis, flag `one_sided_failure_risk: true`.
> - Nếu **cả hai sides LTV/CAC < 1** → override UNSUSTAINABLE ngay, không cần tính composite.

Dùng blended (Path A) hoặc demand-side (Path B/C) — chỉ khi không có one-sided failure:

| Giá trị | Điểm |
|---|---|
| ≥ 5 | 3 |
| 3–4.9 | 2 |
| 1–2.9 | 1 |
| < 1 | 0 |

### Metric 2 — Payback Period

| Giá trị | Điểm |
|---|---|
| ≤ 6 tháng | 3 |
| 7–12 tháng | 2 |
| 13–24 tháng | 1 |
| > 24 tháng | 0 |

### Metric 3 — Contribution Margin %

| Giá trị | Điểm |
|---|---|
| > 40% | 3 |
| 20–40% | 2 |
| 0–19% | 1 |
| < 0 (âm) | 0 — triggers UNSUSTAINABLE override |

### Composite → Verdict

| Total điểm | Health Assessment |
|---|---|
| 7–9 | **HEALTHY** |
| 4–6 | **NEEDS IMPROVEMENT** |
| 0–3 | **UNSUSTAINABLE** |

### Override rules (áp dụng bất kể composite score)

| Điều kiện | Verdict bắt buộc |
|---|---|
| Contribution margin < 0 | UNSUSTAINABLE |
| LTV/CAC < 1 (hoặc side yếu hơn < 1 với Path A) | UNSUSTAINABLE |
| Payback > 36 tháng | UNSUSTAINABLE |
| early_stage_risk = CRITICAL | NEEDS IMPROVEMENT (tối đa) |
| Sensitivity swing > 50% giữa optimistic và pessimistic ở bất kỳ lever nào | NEEDS IMPROVEMENT (tối đa) |
| data_confidence_overall = LOW | HEALTH UNVERIFIABLE (không output HEALTHY) |

> **Sensitivity swing** = (optimistic LTV/CAC - pessimistic LTV/CAC) / base LTV/CAC × 100%.
> Swing > 50% có nghĩa là model quá nhạy cảm với assumption đó — verdict HEALTHY
> không thể đứng vững khi một thay đổi nhỏ có thể lật ngược economics hoàn toàn.

---

## Key Levers

List tối đa 5 levers, **ranked by leverage ratio**:

```
Leverage ratio = % cải thiện LTV/CAC per 10% cải thiện của lever
```

Tính leverage ratio cho mỗi lever bằng cách thay đổi lever +10% và quan sát % thay đổi LTV/CAC.

> **Key levers là observation từ model** — không phải recommendation về strategy.
> CEO quyết định có pursue lever nào không, A3 không prescribe.

---

## Business Type Benchmarks

Dùng khi data = COMPARABLE hoặc ASSUMED. Ghi rõ `source = benchmark [business type]`:

| Business Type | LTV/CAC | Payback | Gross Margin |
|---|---|---|---|
| Marketplace (SEA) | 2–4x | 9–18 tháng | 60–80% |
| SaaS (SMB) | 3–5x | 12–18 tháng | 70–85% |
| Service Marketplace (SEA) | 1.5–3x | 6–12 tháng | 40–60% |
| Content Platform | 2–6x | 6–24 tháng | 50–75% |
| E-commerce | 1.5–3x | 3–9 tháng | 20–50% |
| B2B | 4–8x | 12–24 tháng | 60–80% |

---

## Quy trình thực hiện

**Bước 1 — Data Sufficiency Check.** Kiểm tra data_confidence từng field. Flag ASSUMED fields.
Xác định `data_confidence_overall`. Nếu LOW, ghi note trước khi tiếp tục.

**Bước 2 — Business Model Routing.** Xác định Path A/B/C. Với hybrid: identify revenue split.

**Bước 3 — Early-Stage Dynamics Check.** Tính early LTV/CAC với multipliers, đánh giá
matching imbalance, xác định `early_stage_risk`. Nếu CRITICAL, flag ngay trước khi tiếp tục.

**Bước 4 — Tính formulas theo path.** Tính contribution margin trước — nếu âm, flag ngay.

**Bước 5 — Tính LTV, CAC, LTV/CAC, Payback.** Path A: tính supply và demand riêng trước.
Kiểm tra one-sided failure rule trước khi tính blended.

**Bước 6 — Tính Break-even.**

**Bước 7 — Tính Capital Requirements.**
```
Estimated monthly burn = fixed_monthly_costs + (variable costs × current users)
                         (hoặc dùng monthly_burn_current nếu có)
Months to break-even = tính từ current users → break-even users với growth rate
Total capital required = Estimated monthly burn × months_to_break_even
Capital gap = Total capital required - cash_available
Runway months current = cash_available / estimated_monthly_burn
```

**Bước 8 — Sensitivity Analysis.** Top 3 levers, 3 scenarios per lever (±25%).
Sau đó tính `sensitivity_max_swing_percent` = swing lớn nhất giữa các levers.

**Bước 9 — Health Assessment.** Score 3 metrics, tính composite, apply override rules
(bao gồm early_stage_risk và sensitivity swing check).

**Bước 10 — Key Levers.** Tính leverage ratio per lever, rank, list tối đa 5.

**Bước 11 — Confidence Overall + Unvalidated Assumptions.**

**Bước 12 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A3",
  "opportunity_name": "string",
  "business_model": "string",
  "formula_path": "A | B | C | hybrid",
  "currency": "VND | USD",
  "data_sufficiency": {
    "transaction_data_confidence": "ACTUAL | COMPARABLE | ASSUMED",
    "cac_data_confidence": "ACTUAL | COMPARABLE | ASSUMED",
    "churn_data_confidence": "ACTUAL | COMPARABLE | ASSUMED",
    "cost_data_confidence": "ACTUAL | COMPARABLE | ASSUMED",
    "data_confidence_overall": "HIGH | MEDIUM | LOW",
    "flags": ["string — field nào ASSUMED và impact lên model"]
  },
  "early_stage_dynamics": {
    "early_supply_ltv_cac": 0,
    "early_demand_ltv_cac": 0,
    "early_cac_multiplier_used": 0,
    "early_churn_multiplier_used": 0,
    "matching_efficiency_penalty": "LOW | MEDIUM | HIGH",
    "imbalance_ratio": 0,
    "early_stage_risk": "LOW | MEDIUM | HIGH | CRITICAL",
    "note": "string — mô tả gap giữa early-stage và steady-state nếu có"
  },
  "unit_economics": {
    "supply_side": {
      "gross_revenue_per_transaction": 0,
      "gross_margin_percent": 0,
      "contribution_margin_per_month": 0,
      "avg_lifetime_months": 0,
      "ltv": 0,
      "effective_cac": 0,
      "ltv_cac_ratio": 0,
      "payback_period_months": 0
    },
    "demand_side": {
      "gross_revenue_per_transaction": 0,
      "gross_margin_percent": 0,
      "contribution_margin_per_month": 0,
      "avg_lifetime_months": 0,
      "ltv": 0,
      "effective_cac": 0,
      "ltv_cac_ratio": 0,
      "payback_period_months": 0
    },
    "blended": {
      "ltv_cac_ratio": 0,
      "one_sided_failure_risk": false,
      "health_assessment_basis": "blended | weak_side — blended nếu cả hai sides OK, weak_side nếu một side < 1",
      "note": "string — warning nếu hai sides có khoảng cách lớn"
    },
    "break_even": {
      "break_even_demand_users": 0,
      "break_even_supply_units": 0,
      "break_even_gmv_per_month": 0,
      "vs_current_trajectory": "string — realistic hay không so với scale_context"
    }
  },
  "sensitivity_analysis": {
    "levers_analyzed": [
      {
        "lever_name": "string",
        "current_value": "string — với đơn vị",
        "scenarios": {
          "optimistic": {
            "lever_value": "string — +25%",
            "ltv_cac_ratio": 0,
            "payback_months": 0,
            "break_even_gmv": 0
          },
          "base": {
            "lever_value": "string",
            "ltv_cac_ratio": 0,
            "payback_months": 0,
            "break_even_gmv": 0
          },
          "pessimistic": {
            "lever_value": "string — -25%",
            "ltv_cac_ratio": 0,
            "payback_months": 0,
            "break_even_gmv": 0
          }
        },
        "leverage_ratio": "string — ví dụ: '18% LTV/CAC improvement per 10% churn reduction'"
      }
    ]
  },
  "health_assessment": {
    "ltv_cac_score": 0,
    "payback_score": 0,
    "contribution_margin_score": 0,
    "composite_score": 0,
    "sensitivity_max_swing_percent": 0,
    "override_triggered": "string | null",
    "verdict": "HEALTHY | NEEDS IMPROVEMENT | UNSUSTAINABLE | HEALTH UNVERIFIABLE"
  },
  "capital_requirements": {
    "estimated_monthly_burn": 0,
    "months_to_break_even": 0,
    "total_capital_required": 0,
    "cash_available": 0,
    "runway_months_current": 0,
    "capital_gap": 0,
    "survival_assessment": "SUFFICIENT | AT RISK | INSUFFICIENT",
    "survival_note": "string — ví dụ: 'Runway 8 tháng, cần 14 tháng để reach break-even — gap 6 tháng cần được funded'"
  },
  "key_levers": [
    {
      "rank": 1,
      "lever": "string",
      "current_value": "string — với đơn vị",
      "target_realistic": "string",
      "impact_on_ltv_cac": "string — ví dụ: 'từ 2.1x lên 3.4x'",
      "leverage_ratio": "string",
      "feasibility": "EASY | MEDIUM | HARD"
    }
  ],
  "unvalidated_assumptions": [
    {
      "assumption": "string — field ASSUMED cụ thể",
      "current_value_used": "string — với đơn vị",
      "if_wrong_impact": "string — impact lên LTV/CAC hoặc break-even",
      "test_to_validate": "string — cụ thể, không để trống"
    }
  ],
  "confidence_overall": "HIGH | MEDIUM | LOW | UNVERIFIABLE",
  "confidence_reasoning": "string — rule nào triggered",
  "model_limitations": [
    "string — những gì model này không capture được"
  ]
}
```

---

## Rules bắt buộc

1. **Mọi số PHẢI có đơn vị** (VND, USD, %, tháng) — không để số trôi.
2. **Data Sufficiency Check PHẢI chạy trước mọi formula.** Không bỏ qua.
3. **Early-Stage Dynamics Check PHẢI chạy trước unit economics chính.** Nếu bỏ qua, model có thể output HEALTHY cho business sẽ chết ở month 3.
4. **Path A: PHẢI tính supply và demand riêng lẻ** trước khi blend. Không chỉ output blended.
5. **Nếu một side LTV/CAC < 1 → không dùng blended cho health assessment.** Dùng side yếu hơn làm basis, flag `one_sided_failure_risk: true`.
6. **Contribution margin âm = UNSUSTAINABLE override**, bất kể LTV/CAC cao đến đâu.
7. **early_stage_risk = CRITICAL → verdict tối đa NEEDS IMPROVEMENT**, bất kể steady-state economics.
8. **Sensitivity swing > 50% → verdict tối đa NEEDS IMPROVEMENT.** Tính và ghi `sensitivity_max_swing_percent`.
9. **Sensitivity analysis PHẢI per-lever**, không phải all-at-once worst case. ±25% per lever.
10. **data_confidence_overall = LOW → verdict tối đa NEEDS IMPROVEMENT**, không phải HEALTHY.
11. **`capital_requirements` PHẢI được tính** và `survival_assessment` phải reflect gap giữa runway và months-to-break-even.
12. Mọi `unvalidated_assumption` phải có `test_to_validate` cụ thể — không để trống.
13. **`model_limitations` PHẢI có ít nhất 2 items** — mọi model đều có giới hạn.
14. Khi dùng benchmarks thay actual data, ghi rõ `source = benchmark [business type]`.
15. Skill này là Investment Analyst role — **KHÔNG đề xuất strategy, KHÔNG thiết kế experiment.** Key levers là observation, không phải prescription.
16. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.