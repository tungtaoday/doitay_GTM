---
code: A2
name: Opportunity Scoring
type: reasoning
category: analysis
description: >
  Tính Opportunity Score cho mọi cơ hội kinh doanh theo 5 dimensions có trọng số,
  áp dụng Power Law Filter (Phase 2+), và xếp hạng để CEO ra quyết định ưu tiên.
  Score hoàn toàn deterministic — không dựa trên judgment.
tools_required: []
output_format: json
---

## Mục đích

Đánh giá và xếp hạng opportunities bằng cách tính Opportunity Score theo công thức chuẩn.
Đảm bảo chỉ những opportunity có score đủ cao mới được đưa vào experiment, tiết kiệm
resources và thời gian của CEO.

Skill này **chỉ score và rank**, không thiết kế CVP hay experiment. Đó là vai trò của các
skills khác trong hệ thống.

---

## Input cần có

```json
{
  "opportunity_name": "string",
  "business_type": "Marketplace | SaaS | Content | E-commerce | Service | B2B | Other",
  "vertical": "string — ngành cụ thể",
  "geography": "string — địa lý cụ thể",
  "current_phase": 1,
  "signal_data": {
    "signal_type": "Fragmentation | Trust Gap | Information Asymmetry | Regulation Shift | Behavior Shift",
    "evidence": ["string — evidence cụ thể, có nguồn"]
  },
  "tam_estimate": {
    "value": "string — con số cụ thể",
    "source": "string — nguồn dữ liệu",
    "confidence": "LOW | MEDIUM | HIGH"
  },
  "timing_factors": ["string — observable event, không phải prediction"],
  "feasibility_assessment": {
    "resources_needed": "string",
    "team_capability": "string",
    "technical_complexity": "LOW | MEDIUM | HIGH"
  },
  "network_effect_potential": {
    "type": "direct | indirect | data | none",
    "mechanism": "string — cơ chế cụ thể"
  },
  "comparable_exits": [
    {
      "company": "string",
      "exit_value": "string",
      "multiple": "string",
      "relevance": "string — tại sao comparable này relevant"
    }
  ],
  "portfolio_context": {
    "current_opportunities": ["string — tên các opportunity đang active"],
    "next_best_option": "string — opportunity tốt nhất để so sánh",
    "active_verticals": ["string — các vertical đang có opportunity active"],
    "active_geographies": ["string — các geography đang có opportunity active"]
  }
}
```

---

## Scoring System

### 5 Dimensions và trọng số

| Dimension | Trọng số | Lý do |
|---|---|---|
| **TAM Relevance** | 30% | Market size quyết định ceiling của opportunity |
| **Timing** | 20% | Window có thể đóng — wrong timing = wasted effort |
| **Feasibility** | 20% | Không executable = không có value |
| **Signal Strength** | 15% | Evidence của demand thực sự |
| **Network Effect Potential** | 15% | Upside multiplier dài hạn |

> **Tại sao weighted additive thay vì multiplicative?**
> Công thức multiplicative (A×B×C×D) sẽ collapse toàn bộ score nếu bất kỳ dimension nào = 1.
> Một service business tốt không có network effect sẽ bị giết sai. Weighted additive phản ánh
> đúng thực tế hơn: mọi dimension đều contribute, không có dimension nào có quyền veto đơn độc.

### Công thức

```
Raw Score = TAM×0.30 + Timing×0.20 + Feasibility×0.20 + Signal×0.15 + NE×0.15
Opportunity Score = Raw Score / 5 × 100
Max = 100
```

### Priority thresholds

| Score | Priority | Action |
|---|---|---|
| ≥ 72 | **HIGH** | Experiment ngay trong quarter hiện tại |
| 45–71 | **MEDIUM** | Experiment tối thiểu, monitor 1 quarter |
| < 45 | **PARK** | Vào Tier 1 backlog, không invest thêm |

### Override rules

Được kiểm tra SAU khi tính score. Override chỉ hạ priority xuống, không bao giờ nâng lên.

| Điều kiện | Priority tối đa |
|---|---|
| TAM score = 1 | MEDIUM (ceiling quá thấp) |
| Feasibility score = 1 | MEDIUM (không executable hiện tại) |
| Timing score = 1 | PARK (sai timing = wasted effort) |
| Signal score = 1 | PARK (không có evidence của real demand) |
| TAM confidence = LOW và TAM score ≥ 4 | MEDIUM (score cao nhưng data không đáng tin) |

### Confidence Overall (rule-based)

| Điều kiện | confidence_overall |
|---|---|
| TAM source = "estimated" hoặc không có source | LOW |
| ≥ 3 timing factors là predictions, không phải observable events | LOW |
| TAM confidence = LOW **và** signal evidence < 2 data points | LOW |
| TAM confidence = MEDIUM, signal có 2+ data points | MEDIUM |
| TAM confidence = HIGH, signal có 3+ concrete evidence, timing factors observable | HIGH |

---

## 5 Scoring Dimensions

### Dimension 1 — TAM Relevance (1–5)

Mục tiêu: Đánh giá quy mô thị trường có đủ lớn để justify đầu tư không.

> **Quan trọng:** Score PHẢI dựa trên TAM estimate có source. Nếu không có source
> hoặc source là "estimated" không có basis → tối đa score 2.

| Score | Điều kiện |
|---|---|
| **5** | TAM > $500M trong geography cụ thể, growth trajectory rõ ràng, source đáng tin |
| **4** | TAM $100M–$500M, có thể chiếm meaningful share trong 3 năm |
| **3** | TAM $30M–$100M, niche nhưng defensible, hoặc TAM lớn hơn nhưng addressable portion nhỏ hơn |
| **2** | TAM $5M–$30M, hoặc TAM lớn nhưng nguồn dữ liệu không đáng tin |
| **1** | TAM < $5M, không rõ ràng, hoặc không có source nào |

*Lưu ý: TAM được đo ở geography cụ thể trong input, không phải global TAM.*

---

### Dimension 2 — Timing (1–5)

Mục tiêu: Đánh giá "bây giờ" có phải là thời điểm đúng không, và window còn mở bao lâu.

> **Quan trọng:** Timing factors PHẢI là observable events đã hoặc đang xảy ra.
> Predictions về tương lai không được tính. Nếu tất cả timing factors là predictions → tối đa score 2.

| Score | Điều kiện |
|---|---|
| **5** | Nhiều forces hội tụ đồng thời (regulation + behavior + technology shift); window đang mở và có thể đóng trong 12–18 tháng |
| **4** | 1 major catalyst rõ ràng (regulatory change, platform shift); thị trường bắt đầu move |
| **3** | 2+ timing factors observable, thị trường đang shift nhưng chậm |
| **2** | 1 timing factor yếu, hoặc timing còn 2–3 năm nữa |
| **1** | Quá sớm (thị trường chưa ready) hoặc quá muộn (opportunity đã bị capture) |

**time_to_window** — field bổ sung, không ảnh hưởng score nhưng ảnh hưởng urgency:

| Giá trị | Ý nghĩa |
|---|---|
| `<3 months` | Act now or miss — cần quyết định trong tuần này |
| `3-12 months` | Prioritize trong quarter này |
| `1-3 years` | Có thể plan, không cần rush |
| `>3 years` | Monitor, revisit định kỳ |

---

### Dimension 3 — Feasibility (1–5)

Mục tiêu: Đánh giá khả năng execute với resources HIỆN TẠI (không phải resources "sẽ có").

> **Quan trọng:** Feasibility phải tính đến resources hiện tại. Resources "sẽ huy động được"
> không được tính vào score — đưa vào unvalidated_assumptions thay.

| Score | Điều kiện |
|---|---|
| **5** | Có unfair advantage rõ ràng (distribution, data, relationships, domain expertise); team đã làm tương tự trước đây |
| **4** | Team có kinh nghiệm liên quan, resources sẵn sàng, cần ≤ 1 key hire |
| **3** | Khả thi với team hiện tại + 1–2 hire; không có major technical blocker |
| **2** | Cần stretch đáng kể hoặc phụ thuộc vào partnership chưa secured |
| **1** | Cần resources hoặc capabilities vượt xa hiện tại; không có path thực tế |

---

### Dimension 4 — Signal Strength (1–5)

Mục tiêu: Đánh giá evidence của real demand — không phải assumed demand.

> **Quan trọng:** Signal PHẢI là evidence quan sát được từ bên ngoài.
> Không tính: internal assumptions, viết "customers want X" mà không có data.

| Score | Điều kiện |
|---|---|
| **5** | 3+ concrete evidence points: search volume data, customer interviews với intent, existing workarounds với clear pain, competitor traction data |
| **4** | 2 concrete evidence points, signal type phù hợp với opportunity |
| **3** | 1 strong evidence point hoặc 2 weak ones; signal type identified nhưng chưa đủ validated |
| **2** | Signal chủ yếu từ anecdote hoặc 1 weak data point; signal type assumptions |
| **1** | Không có evidence thực; demand là assumed; không có observable signal |

---

### Dimension 5 — Network Effect Potential (1–5)

Mục tiêu: Đánh giá khả năng tạo compound value theo scale.

> **Lưu ý:** Score thấp ở dimension này không kill opportunity — NE chỉ chiếm 15% weight.
> Một service business tốt có NE=1 vẫn có thể đạt HIGH priority nếu các dimensions khác mạnh.

| Score | Điều kiện |
|---|---|
| **5** | Direct + data network effects; value compound mạnh theo scale; switching cost cao |
| **4** | Strong indirect network effects cả 2 sides; data flywheel bắt đầu build |
| **3** | Moderate network effects; value tăng theo scale nhưng chậm; cross-side effects |
| **2** | Weak indirect NE; có một chiều nhưng không có two-sided dynamics |
| **1** | Không có network effect; value per user không tăng theo scale |

---

## Power Law Filter (Phase 2+ only)

Mục tiêu: Đảm bảo resources được allocate vào opportunity có 10x potential so với next best option.

> **Chỉ áp dụng khi `current_phase >= 2`.** Phase 1 → `applicable: false`.
> Reason: Phase 1 là discovery — chưa đủ data để so sánh meaningfully.

Quy trình:
- Xác định `next_best_option` cụ thể từ portfolio context — không phải "làm gì khác"
- So sánh dựa trên comparable exit data — không dùng judgment
- 10x được đo ở chiều nào? (ROI, market share, time-to-value, margin) — phải specify

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Comparable data cho thấy ≥ 10x potential ở ít nhất 1 chiều quan trọng |
| **CONDITIONAL** | 3–9x potential, hoặc 10x khả thi nhưng phụ thuộc vào assumptions chưa validated |
| **FAIL** | < 3x so với next best option; hoặc không có comparable data để justify |

> **Override — hardened:**
> - Power Law Filter = FAIL + Opportunity Score < 80 → **PARK** (capital misallocation rõ ràng)
> - Power Law Filter = FAIL + Opportunity Score ≥ 80 → **MEDIUM** (score cao nhưng thiếu 10x potential)
> - Power Law Filter = CONDITIONAL → không override, giữ priority từ score
>
> Lý do: ở Phase 2+ mà không có 10x potential so với next best option, giữ ở MEDIUM
> chỉ tạo ra "pretty good but not great" — phân tán focus mà không tạo ra outlier return.

---

## Business Type Adaptations

| Business Type | Dimension trọng tâm | Lưu ý interpret |
|---|---|---|
| **Marketplace** | Signal + NE | NE quan trọng hơn average — score 1 là warning |
| **SaaS** | Feasibility + TAM | Switching cost = proxy NE; expansion revenue ảnh hưởng effective TAM |
| **Content / Media** | Signal + Timing | Creator retention là leading indicator; algorithm changes là timing catalyst |
| **E-commerce** | TAM + Feasibility | Logistics/inventory capability ảnh hưởng feasibility nặng |
| **Service** | Signal + Timing | Geographic density = critical mass; behavior shift to online là timing signal |
| **B2B** | Feasibility + Signal | Sales cycle dài → feasibility score cần tính deal velocity |
| **Regulated** | Timing + Signal | Regulatory timeline là timing anchor; compliance cost ảnh hưởng TAM effective |

---

## Synthesis Check

Sau khi score xong 5 dimensions, kiểm tra các pattern sau:

| Pattern | Interpretation |
|---|---|
| TAM ≥ 4 + Feasibility ≤ 2 | "Too big for us now" — cần partnership hoặc phasing strategy |
| Timing ≥ 4 + Signal ≤ 2 | "Urgency without evidence" — high risk of false positive |
| NE ≥ 4 + Signal ≤ 2 | "Network effect trap" — không thể reach critical mass nếu demand chưa validated |
| Signal ≥ 4 + Timing ≤ 2 | "Real problem, wrong time" — monitor và re-evaluate |
| Feasibility ≥ 4 + TAM ≤ 2 | "Can do it, but why" — execution capability wasted on small market |

Nếu có pattern match: flag trong `synthesis_check.patterns_detected` và điều chỉnh
`synthesis_check.strategic_note` tương ứng.

---

## Quy trình thực hiện

**Bước 1 — Đọc và internalize toàn bộ input.** Kiểm tra evidence quality trước khi score.

**Bước 2 — Score 5 dimensions tuần tự.** Mỗi dimension: score (1–5), reasoning, evidence_used.

**Bước 3 — Tính Opportunity Score** theo công thức weighted additive.

**Bước 4 — Xác định base priority** theo threshold table.

**Bước 5 — Apply override rules.** Override chỉ hạ priority, không nâng.

**Bước 6 — Power Law Filter.** Chỉ chạy nếu current_phase >= 2. Apply hardened override logic:
  - FAIL + score < 80 → PARK
  - FAIL + score ≥ 80 → MEDIUM

**Bước 7 — Portfolio Effect.** So sánh vertical và geography của opportunity với `active_verticals`
và `active_geographies` trong portfolio_context. Đánh giá correlated risk và diversification value.

**Bước 8 — Synthesis Check.** Detect patterns từ combination of dimension scores.

**Bước 9 — Xác định `time_to_window`** từ timing factors.

**Bước 10 — Xác định `confidence_overall`** theo rule-based table. Sau đó tính `effective_priority`:

| priority | confidence_overall | effective_priority |
|---|---|---|
| HIGH | HIGH | HIGH |
| HIGH | MEDIUM | HIGH |
| HIGH | LOW | MEDIUM |
| MEDIUM | HIGH | MEDIUM |
| MEDIUM | MEDIUM | MEDIUM |
| MEDIUM | LOW | PARK |
| PARK | bất kỳ | PARK |

**Bước 11 — List unvalidated assumptions** với test_to_validate cụ thể.

**Bước 12 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A2",
  "opportunity_name": "string",
  "business_type": "string",
  "vertical": "string",
  "geography": "string",
  "current_phase": 0,
  "scoring": {
    "tam_relevance": {
      "score": 0,
      "reasoning": "string",
      "tam_estimate": "string",
      "tam_source": "string",
      "evidence_quality": "string — nhận xét về chất lượng source"
    },
    "timing": {
      "score": 0,
      "reasoning": "string",
      "key_factors": ["string — observable events only"],
      "time_to_window": "<3 months | 3-12 months | 1-3 years | >3 years"
    },
    "feasibility": {
      "score": 0,
      "reasoning": "string",
      "unfair_advantage": "string | null",
      "key_constraints": ["string"]
    },
    "signal_strength": {
      "score": 0,
      "signal_type": "string",
      "reasoning": "string",
      "evidence_points": ["string — concrete evidence với source"]
    },
    "network_effect": {
      "score": 0,
      "type": "direct | indirect | data | none",
      "mechanism": "string",
      "reasoning": "string"
    },
    "raw_score": 0.0,
    "opportunity_score": 0,
    "score_breakdown": {
      "tam_contribution": 0.0,
      "timing_contribution": 0.0,
      "feasibility_contribution": 0.0,
      "signal_contribution": 0.0,
      "ne_contribution": 0.0
    }
  },
  "power_law_filter": {
    "applicable": false,
    "next_best_option": "string | null",
    "ten_x_dimension": "string | null — chiều nào 10x (ROI, market share, margin...)",
    "comparable_data": "string | null",
    "result": "PASS | CONDITIONAL | FAIL | N/A",
    "reasoning": "string | null"
  },
  "portfolio_effect": {
    "vertical_overlap": "HIGH | MEDIUM | LOW | NONE",
    "geography_overlap": "HIGH | MEDIUM | LOW | NONE",
    "correlated_risk": "string — nếu overlap HIGH/MEDIUM: mô tả risk cụ thể nếu vertical/geography này fail",
    "diversification_value": "HIGH | MEDIUM | LOW",
    "diversification_note": "string — tại sao opportunity này add hoặc không add diversification cho portfolio"
  },
  "override_rules_triggered": [
    "string — mô tả override rule nào triggered và tại sao"
  ],
  "synthesis_check": {
    "patterns_detected": [
      {
        "pattern": "string — tên pattern từ bảng Synthesis Check",
        "implication": "string — ý nghĩa cụ thể với opportunity này"
      }
    ],
    "strategic_note": "string — 1-2 câu tổng hợp, null nếu không có pattern"
  },
  "unvalidated_assumptions": [
    {
      "assumption": "string",
      "source_dimension": "tam_relevance | timing | feasibility | signal_strength | network_effect",
      "if_wrong_impact": "string",
      "test_to_validate": "string — cụ thể, không để trống"
    }
  ],
  "confidence_overall": "LOW | MEDIUM | HIGH",
  "confidence_reasoning": "string — rule nào triggered confidence level này",
  "priority": "HIGH | MEDIUM | PARK",
  "priority_source": "score | override | power_law_filter",
  "effective_priority": "HIGH | MEDIUM | PARK",
  "effective_priority_reasoning": "string — nếu effective_priority khác priority: giải thích tại sao confidence_overall hạ xuống; nếu giống nhau: 'Consistent with scored priority'",
  "recommended_action": "Experiment ngay | Experiment tối thiểu | Park vào backlog",
  "backlog_tier": "Experiment | Tier 1 | Tier 2 | Tier 3"
}
```

---

## Rules bắt buộc

1. Mọi dimension PHẢI có `reasoning` cụ thể — không chỉ có số.
2. **Score PHẢI dựa trên evidence có trong input.** Nếu không có evidence → tối đa score 2, không phải score cao hơn.
3. TAM estimate PHẢI có source rõ ràng. "Estimated" hoặc không có source → tối đa TAM score 2.
4. Timing factors PHẢI là observable events, không phải predictions. Predictions → không được tính vào timing score.
5. Feasibility PHẢI tính đến resources HIỆN TẠI. Resources "sẽ huy động" → đưa vào `unvalidated_assumptions`.
6. **Power Law Filter chỉ active khi `current_phase >= 2`.** Phase 1 → `applicable: false`.
7. Override rules chỉ **hạ** priority, không bao giờ nâng.
8. **`effective_priority` PHẢI được tính theo bảng priority × confidence.** Không dùng judgment để override bảng này.
9. `portfolio_effect` PHẢI được điền dựa trên `portfolio_context` trong input. Nếu input không cung cấp `active_verticals` / `active_geographies` → ghi `"correlated_risk": "Unknown — portfolio context not provided"`.
10. Mọi `unvalidated_assumption` phải có `test_to_validate` cụ thể — không để trống.
11. Comparable exits là anchor, không phải prediction — ghi rõ `relevance` của từng comparable.
12. Skill này là Biz Dev role — **KHÔNG làm Investment Analysis** (unit economics, IRR, DCF). Đó là A3.
13. Khi score < 45, **KHÔNG recommend "explore more"** — PARK và move on.
14. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.