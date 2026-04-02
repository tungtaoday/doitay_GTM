---
code: S4
name: Offer Design
type: reasoning
category: strategy
description: Thiết kế offer/product cụ thể — biến CVP thành thứ customer có thể mua/dùng ngay
tools_required: []
output_format: json
---

## Mục đích

Chuyển CVP (S3) thành offer cụ thể mà customer có thể hiểu, đánh giá, và quyết định mua/dùng trong vòng 30 giây. Offer design bao gồm: packaging, pricing, delivery mechanism, và first experience flow.

## Input cần có

- **CVP đã thiết kế** (output từ S3)
- **Wedge segment profile** (output từ S2)
- **Thesis & constraints** (output từ S1)
- **Business type:** Digital Product / Service / Marketplace
- **Available resources:** Tech stack, team size, budget cho MVP
- **Competitive pricing data:** Giá của alternatives hiện tại

## Quy trình thực hiện

### Bước 1 — Core Offer Definition
- Xác định "1 thing" — thứ duy nhất offer này deliver mà customer care nhất
- Viết offer headline trong 10 từ hoặc ít hơn
- Mô tả outcome customer nhận được (không phải feature)
- Test: Nếu customer chỉ đọc headline, họ hiểu được value không?

### Bước 2 — Offer Packaging
Thiết kế tối đa 3 tiers (Phase 1 khuyến khích 1-2 tiers):

**Tier cơ bản (Entry):**
- Giải quyết pain chính ở mức minimum viable
- Giá thấp nhất hoặc free — mục đích là remove barrier to entry
- Dùng để validate demand và collect feedback

**Tier chính (Core):**
- Giải quyết pain chính hoàn toàn
- Giá phản ánh value delivered
- Đây là tier mà 80% revenue nên đến từ

**Tier cao cấp (Premium) — optional Phase 1:**
- Thêm convenience, speed, hoặc exclusivity
- Giá premium justified bằng ROI rõ ràng cho customer
- Chỉ design khi có evidence demand tồn tại

### Bước 3 — Pricing Strategy

**Cost-based floor:** Chi phí deliver offer + margin tối thiểu
**Value-based ceiling:** Giá trị offer mang lại cho customer (tiết kiệm thời gian, tiền, tăng revenue)
**Competition anchor:** Giá của alternatives gần nhất
**Sweet spot:** Đủ thấp để remove hesitation, đủ cao để signal quality

Pricing models phù hợp theo business type:
- Subscription (monthly/yearly) — cho recurring value
- Per-transaction/per-use — cho variable usage
- Freemium — cho network effect products
- Take rate — cho marketplace
- Project-based — cho service

### Bước 4 — Delivery Mechanism
- Customer nhận value qua kênh nào? (app, web, email, in-person, chat)
- Time to value: Bao lâu từ lúc sign up đến lúc nhận value đầu tiên?
- Target: Time to value < 5 phút cho digital, < 24h cho service, < 48h cho marketplace
- Identify friction points trong delivery flow và cách loại bỏ

### Bước 5 — First Experience Design
Thiết kế 5 bước đầu tiên của customer journey:

1. **Discovery:** Customer tìm thấy offer ở đâu, message gì trigger curiosity?
2. **Evaluation:** Customer cần thông tin gì để quyết định? (proof, demo, trial)
3. **Activation:** Bước đầu tiên sau khi quyết định dùng — phải simple nhất có thể
4. **First Value:** Moment customer nhận được value đầu tiên — "aha moment"
5. **Habit Loop:** Trigger gì khiến customer quay lại lần 2, lần 3?

### Bước 6 — Risk Reversal
- Guarantee gì customer nhận được? (money back, free trial, satisfaction guarantee)
- Guarantee phải genuine — nếu sản phẩm tốt, guarantee cost rất thấp
- Guarantee reduces perceived risk → tăng conversion
- Không promise quá mức — trust quan trọng hơn conversion

### Bước 7 — Offer Validation Checklist
Trước khi launch, trả lời:
- [ ] Customer có thể hiểu offer trong 30 giây không?
- [ ] Pricing có evidence-based không? (không phải "cảm giác đúng giá")
- [ ] Time to first value < target threshold?
- [ ] First experience có friction point nào có thể remove?
- [ ] Risk reversal có genuine không?
- [ ] Offer có thể deliver với resources hiện có không?

## Output format

```json
{
  "core_offer": {
    "headline": "10 từ hoặc ít hơn — customer hiểu ngay value",
    "outcome": "Outcome cụ thể customer nhận được",
    "one_thing": "Thứ duy nhất quan trọng nhất mà offer deliver"
  },
  "packaging": {
    "entry_tier": {
      "name": "Tên tier",
      "includes": ["Feature/benefit #1", "Feature/benefit #2"],
      "price": "Giá hoặc Free",
      "purpose": "Remove barrier / Validate demand"
    },
    "core_tier": {
      "name": "Tên tier",
      "includes": ["Feature/benefit #1", "Feature/benefit #2", "Feature/benefit #3"],
      "price": "Giá cụ thể",
      "purpose": "Main revenue driver"
    },
    "premium_tier": {
      "name": "Tên tier hoặc N/A cho Phase 1",
      "includes": ["Feature/benefit #1", "Feature/benefit #2"],
      "price": "Giá cụ thể",
      "purpose": "Premium value"
    }
  },
  "pricing_strategy": {
    "model": "Subscription / Per-transaction / Freemium / Take rate / Project-based",
    "cost_floor": "Chi phí + margin tối thiểu",
    "value_ceiling": "Max customer willing to pay (with evidence)",
    "competition_anchor": "Giá alternatives",
    "chosen_price": "Giá final + justification"
  },
  "delivery": {
    "channel": "App / Web / Email / In-person / Chat",
    "time_to_value": "Số phút/giờ từ sign up đến first value",
    "friction_points": ["Friction #1 — cách loại bỏ", "Friction #2 — cách loại bỏ"]
  },
  "first_experience": {
    "step_1_discovery": "Customer tìm thấy offer ở đâu + trigger message",
    "step_2_evaluation": "Thông tin cần cung cấp để customer quyết định",
    "step_3_activation": "Bước đầu tiên đơn giản nhất",
    "step_4_first_value": "Aha moment cụ thể",
    "step_5_habit_loop": "Trigger quay lại lần 2, 3"
  },
  "risk_reversal": {
    "guarantee_type": "Money back / Free trial / Satisfaction guarantee",
    "terms": "Điều kiện cụ thể",
    "expected_cost": "Ước tính chi phí guarantee"
  },
  "validation_checklist": {
    "30_second_test": "PASS/FAIL",
    "evidence_based_pricing": "PASS/FAIL",
    "time_to_value": "PASS/FAIL — actual time",
    "friction_minimized": "PASS/FAIL",
    "deliverable_now": "PASS/FAIL"
  }
}
```

## Business Type Adaptations

- **Digital Product**: Entry tier thường là free trial hoặc freemium. Core focus vào "aha moment" — feature nào khiến user hiểu value ngay lần đầu dùng. Pricing benchmark với SaaS tương tự. Delivery qua web/app, time to value phải < 5 phút.
- **Service**: Entry tier thường là consultation miễn phí hoặc giá thấp cho lần đầu. Core focus vào trust building — testimonials, case studies, guarantee. Pricing benchmark với service providers hiện tại. Delivery có thể hybrid online + offline.
- **Marketplace**: Offer phải design cho CẢ 2 sides. Supply side: "List miễn phí, chỉ trả khi có giao dịch". Demand side: "Tìm [supply] trong [time frame] hoặc hoàn tiền". Take rate thường 10-20% tùy vertical. Time to value = time to first match.

## Quy tắc

- Headline phải viết bằng ngôn ngữ customer dùng hàng ngày. Test: Đọc cho 1 người không biết gì về business, họ hiểu không?
- KHÔNG design nhiều hơn 3 tiers. Phase 1 nên bắt đầu với 1-2 tiers. Complexity kills conversion.
- Pricing PHẢI có evidence: competitive analysis, customer research, hoặc cost analysis. "Cảm giác đúng giá" không phải evidence.
- Time to value là metric quan trọng nhất của offer design. Nếu customer phải đợi > 24h để nhận value → offer sẽ fail.
- Risk reversal không phải optional — đây là conversion multiplier. Offer tốt thì guarantee cost gần 0.
- First experience design phải cụ thể từng bước. "User sign up và dùng sản phẩm" là SAI. Chi tiết từng click, từng screen.
- KHÔNG bao giờ design offer mà không thể deliver với resources hiện có. Perfect offer mà không ship = zero value.
- Phase 1: Ship imperfect offer nhanh > Design perfect offer chậm. Mục đích là learn, không optimize.
