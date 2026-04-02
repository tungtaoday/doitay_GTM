---
code: A1
name: Stress Testing
type: reasoning
category: analysis
description: >
  Thực hiện 7 Devil's Advocate stress tests cho bất kỳ opportunity hoặc hypothesis nào,
  ở bất kỳ loại business nào. Phát hiện điểm yếu trước khi commit resources.
  Verdict hoàn toàn deterministic dựa trên scoring matrix + override rules.
tools_required: []
output_format: json
---

## Mục đích

Áp dụng framework Devil's Advocate để challenge mọi opportunity trước khi commit resources.
Skill này đảm bảo mọi hypothesis phải vượt qua 7 stress tests trước khi được promote lên Tier
tiếp theo hoặc trước khi CEO ra quyết định Go/No-Go.

Skill này **chỉ phát hiện vấn đề**, không recommend giải pháp.
Giải pháp thuộc về CVP Architect hoặc Biz Dev.

---

## Input cần có

```json
{
  "opportunity_name": "Tên opportunity hoặc hypothesis",
  "business_type": "Marketplace | SaaS | Content | E-commerce | Service | B2B | Other",
  "current_stage": "Hypothesis | Intelligence | Strategy | Experiment | Decision",
  "thesis": "1-2 câu mô tả thesis của opportunity",
  "target_segment": "Mô tả segment theo behavior / jobs-to-be-done",
  "cvp_summary": "Value proposition hiện tại",
  "current_metrics": {
    "key_data_points": ["data point 1", "data point 2"]
  },
  "competitive_landscape": "Mô tả đối thủ và alternatives hiện tại",
  "resources_committed": "Nguồn lực đã commit hoặc dự định commit"
}
```

---

## Scoring System

Mỗi test cho ra một trong ba kết quả:

| Kết quả | Điểm | Ý nghĩa |
|---|---|---|
| **PASS** | 2 | Không có concern đáng kể |
| **CONDITIONAL** | 1 | Có concern nhưng manageable với điều kiện cụ thể |
| **FAIL** | 0 | Có weakness nghiêm trọng cần giải quyết trước khi tiến |

### Stage-aware passing threshold

10x Test chỉ áp dụng ở stage Decision — ở các stage khác, tổng điểm tối đa là 12.

| Stage | Max score | Min để PROCEED | Min để CAUTION | Dưới là KILL |
|---|---|---|---|---|
| Hypothesis | 12 | ≥ 9 | 6–8 | ≤ 5 |
| Intelligence | 12 | ≥ 10 | 7–9 | ≤ 6 |
| Strategy | 12 | ≥ 10 | 8–9 | ≤ 7 |
| Experiment | 12 | ≥ 11 | 9–10 | ≤ 8 |
| Decision | 14 | ≥ 12 | 9–11 | ≤ 8 |

### Confidence Overall (rule-based, không dùng math)

`confidence_overall` phản ánh độ tin cậy của **toàn bộ analysis**, không phải của verdict.
Được xác định theo rules sau — áp dụng rule đầu tiên match:

| Điều kiện | confidence_overall |
|---|---|
| ≥ 4 unvalidated assumptions | LOW |
| ≥ 2 tests dựa chủ yếu trên assumed data (không có evidence thực) | LOW |
| ≥ 3 unvalidated assumptions **hoặc** ≥ 1 FAIL test thiếu data | MEDIUM |
| Tất cả tests có evidence cụ thể, ≤ 2 unvalidated assumptions | HIGH |

> **Lưu ý cho CEO:** `confidence_overall = LOW` không có nghĩa verdict sai.
> Nó có nghĩa verdict đang dựa trên dữ liệu chưa đủ — cần thu thập thêm trước khi commit lớn.

---

### Override rules (áp dụng bất kể score)

Các override rules được kiểm tra SAU khi tính score và có thể nâng verdict lên mức
nghiêm trọng hơn. Override rules KHÔNG thể hạ verdict xuống mức nhẹ hơn.

| Điều kiện | Verdict tối thiểu bắt buộc |
|---|---|
| Có ≥ 1 test với result = FAIL | REQUIRE MORE EVIDENCE |
| Có ≥ 2 critical weaknesses | REQUIRE MORE EVIDENCE |
| Có ≥ 1 critical weakness tại stage Decision | RECOMMEND KILL |
| Có ≥ 4 unvalidated assumptions tại stage Decision | REQUIRE MORE EVIDENCE |
| Có ≥ 2 tests FAIL | RECOMMEND KILL |

---

## 7 Stress Tests

### Test 1 — Demand Reality Test
*"Nhu cầu này có thật và đủ cấp bách không?"*

Mục tiêu: Xác định demand có tồn tại thực sự không, hay chỉ là assumed need.

Quy trình:
- Xác định workaround hiện tại của customer (họ đang giải quyết pain này bằng gì?)
- Đánh giá mức độ pain của workaround (thời gian, tiền, effort, tần suất)
- Đánh giá switching cost từ workaround sang solution mới
- Hỏi: "Segment này có đủ lý do để thay đổi hành vi không?"

Rubric:

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Workaround hiện tại gây pain rõ ràng (tốn kém hoặc bất tiện đáng kể); có tín hiệu segment sẵn sàng trả tiền hoặc thay đổi hành vi |
| **CONDITIONAL** | Workaround tồn tại nhưng pain là moderate; hoặc demand signal còn gián tiếp / chưa validated |
| **FAIL** | Workaround hiện tại "đủ tốt" với phần lớn segment; không có urgency rõ ràng; switching cost cao hơn perceived benefit |

---

### Test 2 — Defensibility Test
*"Chúng ta có thể giữ lợi thế này không?"*

Mục tiêu: Xác định moat thực sự và thời gian defensibility window.

Quy trình:
- List 3–5 players có thể copy trong 12 tháng (incumbents, well-funded startups, platform giants)
- Với mỗi player: xác định lợi thế của họ (distribution, capital, brand, data, regulatory access)
- Ước tính thời gian để replicate core value proposition
- Xác định moat thực sự của mình (nếu có): network effect, data flywheel, switching cost, regulatory, brand

Rubric:

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Không có player nào replicate được core value trong 12 tháng; hoặc có structural moat rõ ràng (network effect, data, regulatory, brand) |
| **CONDITIONAL** | Replication khả thi trong 6–12 tháng; hoặc moat dựa trên execution speed thay vì structural advantage |
| **FAIL** | Một player có nguồn lực tốt có thể replicate core value trong < 6 tháng; không có moat structural |

---

### Test 3 — Bootstrap Test
*"Chúng ta có thể tạo traction đầu tiên từ zero không?"*

Mục tiêu: Xác định path đến initial momentum mà không cần "điều kiện lý tưởng" đã tồn tại.

Quy trình:
- Mô tả trạng thái ngày 1: không có users, không có proof, không có network
- Xác định: ai đến trước và tại sao họ đến khi chưa có ai khác?
- Đánh giá: solution có standalone value (single-player value) không — tức là có ích ngay cả khi không có network/community?
- Mô tả cụ thể kế hoạch 30 ngày đầu để có người dùng / khách hàng đầu tiên

Rubric:

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Có path rõ ràng đến 10 customers đầu tiên mà không cần critical mass; solution có standalone value hoặc seeding strategy khả thi |
| **CONDITIONAL** | Cần coordinated effort để seed cả hai sides hoặc phụ thuộc vào early partnership; khả thi nhưng requires execution precision |
| **FAIL** | Không có path đến traction ban đầu nếu thiếu critical mass; không có single-player value; kế hoạch 30 ngày đầu không thực tế |

---

### Test 4 — Dependency Test
*"Chúng ta đang phụ thuộc vào những gì ngoài tầm kiểm soát?"*

Mục tiêu: Map toàn bộ critical dependencies và đánh giá rủi ro nếu chúng thay đổi.

Quy trình:
- List tất cả dependencies: đối tác, platform, regulation, technology, key person, supply source
- Phân loại: Internal (trong tầm kiểm soát) vs External (ngoài tầm kiểm soát)
- Với mỗi External dependency: đánh giá impact nếu nó fail / thay đổi / bị rút
- Xác định: có single point of failure nào không?

Rubric:

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Không có single point of failure ngoài tầm kiểm soát; hoặc mọi critical dependency đều có fallback rõ ràng |
| **CONDITIONAL** | Có 1–2 external dependencies quan trọng nhưng impact nếu fail là manageable hoặc có partial mitigation |
| **FAIL** | Có ≥ 1 critical dependency ngoài tầm kiểm soát mà nếu fail sẽ kill opportunity; không có viable alternative |

---

### Test 5 — Critical Mass Test
*"Chúng ta có đạt được ngưỡng tối thiểu để vận hành không?"*

Mục tiêu: Xác định minimum viable scale và khả năng đạt được nó trong timeline/budget hiện tại.

Quy trình:
- Định nghĩa "critical mass" cụ thể cho business này (số users, revenue threshold, geographic density, số SKU, v.v.)
- Ước tính nguồn lực cần để đạt critical mass (thời gian, tiền, team)
- So sánh với resources hiện có hoặc có thể huy động
- Xác định "death zone" — vùng mà nếu bị kẹt ở đó thì không self-sustain được

Rubric:

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Critical mass có thể đạt được trong timeline và budget hiện tại với reasonable assumptions; có milestones rõ ràng |
| **CONDITIONAL** | Critical mass có thể đạt được nhưng requires một số assumptions lạc quan; hoặc cần thêm funding chưa được secured |
| **FAIL** | Critical mass đòi hỏi resources hoặc thời gian vượt xa hiện tại; không có path thực tế để thoát khỏi death zone |

---

### Test 6 — Monetization Timing Test
*"Khi nào monetize mà không giết growth?"*

Mục tiêu: Xác định timing monetization tối ưu và rủi ro nếu monetize quá sớm hoặc quá muộn.

Quy trình:
- Xác định thời điểm bắt đầu charge revenue (milestone nào trigger việc monetize?)
- Đánh giá: nếu monetize ở thời điểm đó, có làm giảm adoption đáng kể không?
- Đánh giá rủi ro monetize muộn: có đủ runway không? investor expectation?
- Mô tả free → freemium → paid timeline hoặc equivalent

Rubric:

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Revenue model không conflict với growth; timing monetization hợp lý; có clear conversion path; runway đủ để reach monetization milestone |
| **CONDITIONAL** | Có tension nhỏ giữa monetization và growth nhưng manageable; hoặc timing phụ thuộc vào assumption về user behavior |
| **FAIL** | Monetize ở timing reasonable sẽ significantly hurt adoption; hoặc không có runway để đợi đến timing hợp lý |

---

### Test 7 — 10x Test *(chỉ áp dụng tại stage Decision)*
*"Opportunity này có thể produce kết quả tốt hơn 10x so với next best option không?"*

Mục tiêu: So sánh expected outcome của opportunity này với alternative tốt nhất bằng comparable data.

Quy trình:
- Xác định next best option cụ thể (không phải "làm gì khác" mà phải tên cụ thể)
- So sánh dựa trên comparable data — không dùng judgment hay intuition
- Đánh giá: 10x ở chiều nào? (ROI, time-to-value, market size, margin, v.v.)
- Nếu không có comparable data, đánh dấu là unvalidated assumption và giảm score

Rubric:

| Kết quả | Điều kiện |
|---|---|
| **PASS** | Comparable data cho thấy ≥ 10x potential so với next best option ở ít nhất một chiều quan trọng |
| **CONDITIONAL** | Potential là 3–9x; hoặc 10x có thể đạt nếu một số assumptions đúng; data còn hạn chế |
| **FAIL** | < 3x so với next best option; hoặc không có comparable data để justify; opportunity cost quá cao |

*Nếu current_stage ≠ Decision: đặt `applicable: false`, không score test này, max score = 12.*

---

## Business Type Adaptations

Tùy business type, một số tests cần được nhấn mạnh hơn trong interpretation:

| Business Type | Tests cần nhấn mạnh | Lưu ý khi interpret |
|---|---|---|
| **Marketplace** | Bootstrap Test + Critical Mass Test | Single-player value và liquidity threshold là critical |
| **SaaS** | Defensibility Test + Monetization Timing | Switching cost và expansion revenue model |
| **Content / Media** | Defensibility Test + Monetization Timing | Creator/contributor retention, content uniqueness |
| **E-commerce** | Dependency Test + Critical Mass Test | Logistics, inventory, supplier concentration risk |
| **Service Business** | Bootstrap Test + Critical Mass Test | Geographic density, quality control at scale |
| **B2B** | Dependency Test + 10x Test | Sales cycle length, integration switching cost, ICP clarity |
| **Regulated Industry** | Demand Reality Test + Dependency Test | Compliance cost, regulatory moat durability |

---

## Quy trình thực hiện

**Bước 1 — Đọc và internalize toàn bộ input.** Không bắt đầu test nào trước khi đọc xong input.

**Bước 2 — Chạy Tests 1–6 tuần tự.** Mỗi test cho ra result (PASS/CONDITIONAL/FAIL), score (2/1/0), `time_to_impact`, và reasoning.

**Bước 3 — Kiểm tra stage.** Nếu stage = Decision, chạy Test 7. Nếu không, đánh dấu `applicable: false`.

**Bước 4 — Tính tổng score.** Cộng điểm tất cả tests áp dụng.

**Bước 5 — Xác định base verdict** dựa trên score table theo stage.

**Bước 6 — Apply override rules.** Nếu override rules trigger, nâng verdict lên mức tương ứng.

**Bước 7 — Chạy Synthesis Check.** Nhìn lại toàn bộ kết quả, xác định:
  - Có cặp tests nào mà kết hợp lại nguy hiểm hơn từng test riêng lẻ không? (ví dụ: Demand CONDITIONAL + Critical Mass CONDITIONAL = combined scale failure risk)
  - Tests nào có `time_to_impact = Immediate`? List vào `immediate_risks`
  - Nếu có nhiều risks, nên xử lý theo thứ tự nào?

**Bước 8 — Xác định `confidence_overall`** theo rule-based table. Ghi rõ rule nào triggered.

**Bước 9 — List critical weaknesses** (từ các tests FAIL hoặc CONDITIONAL có impact cao), kèm `time_to_impact`.

**Bước 10 — List unvalidated assumptions** với `test_to_validate` cụ thể cho từng cái.

**Bước 11 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A1",
  "opportunity_name": "string",
  "business_type": "string",
  "stage": "Hypothesis | Intelligence | Strategy | Experiment | Decision",
  "stress_tests": {
    "demand_reality": {
      "current_workaround": "string — mô tả cụ thể workaround hiện tại",
      "workaround_pain_level": "LOW | MEDIUM | HIGH",
      "switching_cost": "LOW | MEDIUM | HIGH",
      "switch_likelihood": "string — giải thích cụ thể",
      "result": "PASS | CONDITIONAL | FAIL",
      "score": 0,
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months",
      "reasoning": "string",
      "kill_criteria": "string | null — measurable condition, null nếu PASS"
    },
    "defensibility": {
      "potential_copiers": [
        {
          "name": "string",
          "advantage": "string",
          "time_to_replicate": "string"
        }
      ],
      "our_moat": "string — mô tả moat thực sự hoặc 'NONE'",
      "defensibility_window": "string — ước tính thời gian",
      "result": "PASS | CONDITIONAL | FAIL",
      "score": 0,
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months",
      "reasoning": "string",
      "kill_criteria": "string | null"
    },
    "bootstrap": {
      "day_1_scenario": "string — mô tả trạng thái ngày 1 cụ thể",
      "first_mover": "string — ai đến trước và tại sao",
      "single_player_value": true,
      "first_30_days_plan": "string — kế hoạch cụ thể",
      "result": "PASS | CONDITIONAL | FAIL",
      "score": 0,
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months",
      "reasoning": "string",
      "kill_criteria": "string | null"
    },
    "dependency": {
      "critical_dependencies": [
        {
          "name": "string",
          "type": "Internal | External",
          "impact_if_fails": "LOW | MEDIUM | HIGH | KILL",
          "fallback": "string | null"
        }
      ],
      "single_point_of_failure": true,
      "result": "PASS | CONDITIONAL | FAIL",
      "score": 0,
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months",
      "reasoning": "string",
      "kill_criteria": "string | null"
    },
    "critical_mass": {
      "definition": "string — định nghĩa critical mass cụ thể cho business này",
      "resources_required": "string — thời gian + tiền + team",
      "resources_available": "string",
      "death_zone": "string — mô tả vùng nguy hiểm",
      "achievable": true,
      "result": "PASS | CONDITIONAL | FAIL",
      "score": 0,
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months",
      "reasoning": "string",
      "kill_criteria": "string | null"
    },
    "monetization_timing": {
      "revenue_trigger": "string — milestone nào trigger việc monetize",
      "timeline": "string — free → freemium → paid hoặc equivalent",
      "liquidity_risk": "LOW | MEDIUM | HIGH",
      "runway_sufficient": true,
      "result": "PASS | CONDITIONAL | FAIL",
      "score": 0,
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months",
      "reasoning": "string",
      "kill_criteria": "string | null"
    },
    "ten_x": {
      "applicable": true,
      "next_best_option": "string | null",
      "potential_multiple": "string | null — ví dụ: '12x ROI so với option B'",
      "comparable_data": "string | null",
      "result": "PASS | CONDITIONAL | FAIL | N/A",
      "score": 0,
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months | N/A",
      "reasoning": "string | null",
      "kill_criteria": "string | null"
    }
  },
  "scoring": {
    "tests_applied": 0,
    "max_score": 0,
    "total_score": 0,
    "score_pct": 0,
    "breakdown": {
      "demand_reality": 0,
      "defensibility": 0,
      "bootstrap": 0,
      "dependency": 0,
      "critical_mass": 0,
      "monetization_timing": 0,
      "ten_x": 0
    }
  },
  "synthesis_check": {
    "risk_interactions": [
      {
        "tests": ["string — tên test 1", "string — tên test 2"],
        "pattern": "string — mô tả pattern quan sát được",
        "amplified_severity": "HIGH | CRITICAL",
        "note": "string — tại sao combination này nguy hiểm hơn từng test riêng lẻ"
      }
    ],
    "immediate_risks": ["string — tests có time_to_impact = Immediate và result != PASS"],
    "sequencing_note": "string — nếu có nhiều risks, nên xử lý theo thứ tự nào và tại sao"
  },
  "critical_weaknesses": [
    {
      "source_test": "demand_reality | defensibility | bootstrap | dependency | critical_mass | monetization_timing | ten_x",
      "flaw": "string",
      "why_it_matters": "string",
      "severity": "CRITICAL | HIGH | MEDIUM",
      "time_to_impact": "Immediate | <3 months | 3-12 months | >12 months"
    }
  ],
  "unvalidated_assumptions": [
    {
      "assumption": "string",
      "source_test": "string",
      "if_wrong_impact": "string",
      "test_to_validate": "string — cụ thể, không để trống"
    }
  ],
  "override_rules_triggered": [
    "string — mô tả override rule nào triggered và tại sao"
  ],
  "confidence_overall": "LOW | MEDIUM | HIGH",
  "confidence_reasoning": "string — rule nào triggered confidence level này",
  "verdict": "PROCEED | PROCEED WITH CAUTION | REQUIRE MORE EVIDENCE | RECOMMEND KILL",
  "verdict_source": "score | override",
  "verdict_reasoning": "string — 2-3 câu, dựa trên evidence"
}
```

---

## Rules bắt buộc

1. **KHÔNG BAO GIỜ** skip bất kỳ stress test nào trong Tests 1–6, bất kể business type.
2. **Test 7** chỉ chạy khi `current_stage = Decision`. Các stage khác: `applicable: false`, `score: 0`.
3. Verdict **phải** dựa trên scoring matrix. Chỉ dùng override rules để nâng verdict lên, không để hạ xuống.
4. Mọi `kill_criteria` phải **measurable** — có số, có mốc thời gian, hoặc có event cụ thể. Không được abstract.
5. Mọi `unvalidated_assumption` phải có `test_to_validate` cụ thể — không để trống.
6. Mọi `critical_weakness` phải có `source_test` và `time_to_impact` — trace về test nào phát hiện ra nó.
7. **PASS chỉ được assign khi có evidence cụ thể** trong input. Nếu input không cung cấp evidence, kết quả tối đa là CONDITIONAL — không được assume PASS từ absence of information.
8. `confidence_overall` phải được xác định theo rule-based table — không dùng judgment. Ghi rõ `confidence_reasoning`.
9. `synthesis_check` bắt buộc phải chạy sau khi có kết quả tất cả tests. Nếu không phát hiện interaction nào, ghi `risk_interactions: []` — không được bỏ trống section này.
10. Skill này **không recommend giải pháp**. Nếu phát hiện vấn đề, chỉ mô tả vấn đề. Giải pháp thuộc về CVP Architect hoặc Biz Dev.
11. Khi conflict với output của role khác, áp dụng Tension Protocol: trình bày evidence → xác định assumption bất đồng → define test → chờ test result.
12. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.