---
code: S3
name: Value Proposition
type: reasoning
category: strategy
description: Thiết kế Customer Value Proposition cho cả supply và demand — ta offer gì mà đối thủ không thể
tools_required: []
output_format: json
---

## Mục đích

Thiết kế CVP (Customer Value Proposition) rõ ràng, differentiated, và believable. CVP phải trả lời: "Tại sao customer chọn ta thay vì alternative hiện tại?" cho CẢ hai phía (nếu là marketplace/platform) hoặc cho target segment chính (nếu là product/service).

## Input cần có

- **Segment profiles** (output từ S2 — wedge segment đã chọn)
- **Thesis** (output từ S1)
- **Competitive landscape:** Các alternatives hiện tại customer đang dùng
- **Business type:** Digital Product / Service / Marketplace
- **Resources & constraints:** Những gì có thể build/deliver trong 8 tuần đầu

## Quy trình thực hiện

### Bước 1 — Pain/Gain Mapping

Với mỗi side (supply + demand nếu marketplace, hoặc customer nếu product/service):

**Pain Mapping:**
- Liệt kê top 5 pains khi thực hiện job-to-be-done
- Rank theo severity (1-5) và frequency (1-5)
- Xác định pain nào là "deal-breaker" — nếu không giải quyết, customer sẽ không dùng

**Gain Mapping:**
- Liệt kê top 5 gains customer mong muốn
- Phân loại: expected gains (phải có), desired gains (muốn có), unexpected gains (wow factor)
- Xác định gain nào tạo ra strongest emotional response

### Bước 2 — Differentiation Matrix

Liệt kê top 3-5 alternatives hiện tại (bao gồm cả "không làm gì" và "DIY workaround"):

Với mỗi pain point chính:
- Alternative A giải quyết thế nào? (hoặc không giải quyết)
- Alternative B giải quyết thế nào?
- Gap còn lại là gì?

Gap = nơi CVP sống. Nếu không có gap → không có CVP → quay lại chọn segment khác.

### Bước 3 — Moat Design

Chọn moat type phù hợp nhất:

| Moat Type | Cơ chế | Khi nào dùng |
|-----------|--------|-------------|
| Network Effect | Value tăng theo số users | Cả supply và demand benefit từ scale |
| Data Moat | Matching/recommendation quality tốt hơn theo thời gian | Khi data compound value |
| Trust Moat | Verified reputation khó replicate | Khi trust là rào cản giao dịch chính |
| Supply Lock-in | Suppliers prefer platform exclusively | Khi reduce supplier cost đáng kể |
| Regulatory Moat | Compliance là feature | Khi regulation tạo entry barrier |
| Content Moat | UGC hoặc proprietary content tích lũy | Khi content là reason to visit |
| Community Moat | Relationships giữa users tạo switching cost | Khi community là giá trị chính |

Xác định:
- Moat primary và secondary
- Timeline để moat bắt đầu có effect (tuần/tháng/năm)
- Điều kiện cụ thể để moat activate

### Bước 4 — Chicken-Egg Solution (cho Marketplace/Platform)

Đánh giá 3 options:

**Option A — Supply First:**
- Rationale: Tại sao supply trước?
- Cách get 50 suppliers đầu tiên (cụ thể — tên kênh, message, incentive)
- Rủi ro: Supply không ở lại nếu không có demand

**Option B — Demand First:**
- Rationale: Tại sao demand trước?
- Cách capture demand intent (cụ thể)
- Rủi ro: Demand thất vọng nếu không có supply

**Option C — Single-player Mode:**
- Platform có value với 1 user không?
- Nếu có → bắt đầu đây, add marketplace layer sau
- Nếu không → phải chọn A hoặc B

### Bước 5 — Wedge vs Platform CVP

**Day 1 CVP (Wedge):**
- Narrow scope — giải quyết 1 pain hoàn toàn
- Có thể manual, không cần tech phức tạp
- Phải deliver value ngay lập tức, không cần "critical mass"

**Day 365 CVP (Platform):**
- Broader scope — multiple pains
- Automated, scalable
- Network effects active

**Transition Path:**
- Wedge evolve thành platform thế nào?
- Trigger nào báo hiệu đã sẵn sàng expand?

### Bước 6 — CVP Statement

Viết CVP statement theo template:
```
For [segment] who [job they want to do],
our [product/service/marketplace] provides [specific capability]
that [current alternative] cannot because [structural reason].
```

### Bước 7 — Quality Check

4 điểm bắt buộc — fail 1 thì redesign:
- [ ] Customer thực sự sẽ tin pitch này — không aspirational
- [ ] Có ít nhất 1 thứ competitors structurally không replicate được
- [ ] Chicken-egg solution cụ thể (không phải "build community")
- [ ] Moat theory có timeline, không chỉ có direction

## Output format

```json
{
  "cvp_statement": {
    "supply_side": "For [supply segment] who [job], our platform provides [capability] that [alternative] cannot because [structural reason]",
    "demand_side": "For [demand segment] who [job], our platform provides [capability] that [alternative] cannot because [structural reason]"
  },
  "pain_gain_map": {
    "supply_side": {
      "top_pains": [
        {"pain": "Mô tả pain", "severity": 0, "frequency": 0, "deal_breaker": true}
      ],
      "top_gains": [
        {"gain": "Mô tả gain", "type": "expected/desired/unexpected"}
      ]
    },
    "demand_side": {
      "top_pains": [
        {"pain": "Mô tả pain", "severity": 0, "frequency": 0, "deal_breaker": true}
      ],
      "top_gains": [
        {"gain": "Mô tả gain", "type": "expected/desired/unexpected"}
      ]
    }
  },
  "differentiation_matrix": [
    {
      "pain_point": "Pain cụ thể",
      "alternative_a": {"name": "Tên", "solution": "Cách giải quyết"},
      "alternative_b": {"name": "Tên", "solution": "Cách giải quyết"},
      "gap": "Gap còn lại — nơi CVP sống"
    }
  ],
  "moat_design": {
    "primary_moat": {
      "type": "Loại moat",
      "mechanism": "Cơ chế hoạt động cụ thể",
      "activation_timeline": "Khi nào bắt đầu có effect",
      "activation_condition": "Điều kiện cụ thể"
    },
    "secondary_moat": {
      "type": "Loại moat",
      "mechanism": "Cơ chế"
    }
  },
  "chicken_egg_solution": {
    "chosen_approach": "Supply First / Demand First / Single-player",
    "rationale": "Lý do chọn approach này",
    "first_50_plan": "Cách get 50 users đầu tiên — cụ thể",
    "risk_mitigation": "Cách giảm rủi ro của approach"
  },
  "wedge_vs_platform": {
    "day_1_cvp": "Narrow, manual, 1 pain — mô tả cụ thể",
    "day_365_cvp": "Broader, automated, network effects — mô tả cụ thể",
    "transition_trigger": "Điều kiện cụ thể để expand từ wedge sang platform"
  },
  "quality_check": {
    "believable": "PASS/FAIL — customer sẽ tin không?",
    "defensible": "PASS/FAIL — competitors không replicate được gì?",
    "chicken_egg_solved": "PASS/FAIL — plan cụ thể?",
    "moat_timeline": "PASS/FAIL — có timeline rõ?"
  }
}
```

## Business Type Adaptations

- **Digital Product**: Không cần chicken-egg solution. Focus vào differentiation matrix và moat design. Day 1 CVP thường là "1 feature làm tốt hơn 10x so với alternative". Moat thường là data moat hoặc content moat.
- **Service**: CVP focus vào trust và consistency. Moat thường là trust moat hoặc supply lock-in (best providers chỉ làm việc qua platform). Day 1 CVP thường là "guaranteed quality + convenience" trong 1 category nhỏ.
- **Marketplace**: Phải có CVP cho CẢ 2 sides. Chicken-egg solution là bắt buộc. Moat thường là network effect + data moat. Day 1 CVP thường rất narrow — 1 category, 1 geography, solve 1 pain completely.

## Quy tắc

- CVP statement phải viết bằng ngôn ngữ customer hiểu — không jargon, không buzzwords.
- "Because [structural reason]" phải là LÝ DO CẤU TRÚC, không phải "vì team giỏi" hay "vì UX đẹp". Structural = liên quan đến business model, data, network, regulation.
- Differentiation matrix PHẢI bao gồm "không làm gì" và "DIY workaround" như alternatives. Đây thường là competitor lớn nhất.
- Moat phải có TIMELINE cụ thể. "Network effect sẽ kick in" là SAI. "Network effect bắt đầu có effect khi có 200+ active suppliers trong 1 quận" là ĐÚNG.
- Quality check là gate bắt buộc. Fail 1/4 → quay lại redesign, không được proceed.
- Phase 1: Day 1 CVP phải deliverable NGAY với resources hiện có. Không plan cho tech chưa build.
- KHÔNG BAO GIỜ viết CVP mà không có segment profile (S2 output) trước. CVP without segment = guessing.
