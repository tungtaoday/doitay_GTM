---
code: C7
name: cta-conversion-copy
description: >
  Viết CTA và conversion copy được thiết kế để chuyển đổi: từ awareness sang action.
  Bao gồm: CTA cho social post, landing page copy, DM script, email sequence, comment
  trigger. Dùng skill này bất cứ khi nào user muốn: viết CTA, tăng conversion, viết
  landing page, viết email bán hàng, viết DM script, kết bài bằng call-to-action —
  kể cả khi user chỉ nói "thêm CTA cho bài này" hoặc "viết đoạn kêu gọi hành động"
  mà không dùng từ "conversion copy".
---

## Mục đích

Viết copy được thiết kế để chuyển đổi — từ awareness sang action. CTA yếu = content hay nhưng không ai làm gì. Mỗi piece of conversion copy cần 1 action rõ ràng, 1 reason to act now, và 0 friction không cần thiết.

## Input cần có

```json
{
  "offer": "Thứ bạn muốn người đọc làm hoặc nhận",
  "platform": "twitter | instagram | facebook | linkedin | email | landing_page | dm",
  "content_context": "Bài đăng / email / page mà CTA này sẽ xuất hiện",
  "target_audience": "Đối tượng mục tiêu (behavior-based)",
  "awareness_level": "cold | warm | hot",
  "cta_type": "soft | medium | hard",
  "desired_action": "follow | save | comment | dm | click | sign_up | book | buy",
  "urgency_lever": "Yếu tố tạo urgency nếu có: deadline, scarcity, social proof (optional)",
  "tone": "casual | professional | urgent | friendly | authoritative"
}
```

> Nếu `cta_type` không có, infer từ `awareness_level` — cold audience → soft, warm → medium, hot → hard. Nếu `urgency_lever` thiếu, tạo urgency từ opportunity cost thay vì deadline giả.

## CTA Types và Khi Nào Dùng

| Type | Mô tả | Dùng khi | Ví dụ |
|------|--------|----------|-------|
| **Soft** | Friction thấp, không đòi hỏi gì lớn | Audience cold, chưa trust | "Save bài này", "Follow để không bỏ lỡ" |
| **Medium** | Có engagement nhỏ, qualify leads | Audience warm, đã biết bạn | "DM mình từ [keyword]", "Comment [X] để nhận" |
| **Hard** | Direct conversion ask | Audience hot, đã sẵn sàng | "Đặt lịch ngay", "Mua hôm nay", "Sign up" |

## Conversion Copy Frameworks

### PAS — Pain → Agitate → Solution
Dùng cho: Social post body, email opening, product description
```
PAIN:     Nêu vấn đề rõ ràng, bằng ngôn ngữ của audience
AGITATE:  Đẩy cost of inaction — điều gì xảy ra nếu không giải quyết?
SOLUTION: Present offer như bridge duy nhất
CTA:      1 action cụ thể
```

### AIDA — Attention → Interest → Desire → Action
Dùng cho: Landing page, email sequence, long-form post
```
ATTENTION: Hook dừng scroll / dừng delete email
INTEREST:  Relevance — tại sao audience nên tiếp tục đọc?
DESIRE:    Benefits (không phải features) — cuộc sống họ thay đổi thế nào?
ACTION:    1 CTA rõ ràng, loại bỏ friction
```

### BAB — Before → After → Bridge
Dùng cho: Testimonial format, transformation story, product launch
```
BEFORE: Mô tả painful state hiện tại của audience
AFTER:  Mô tả desired state sau khi có solution
BRIDGE: Product/service là cầu nối duy nhất giữa 2 trạng thái đó
CTA:    Step đầu tiên để cross the bridge
```

### FAB — Feature → Advantage → Benefit
Dùng cho: Product description, comparison post, objection handling
```
FEATURE:   Tính năng cụ thể
ADVANTAGE: Tại sao feature đó tốt hơn alternative
BENEFIT:   Điều đó có nghĩa gì với cuộc sống của họ
CTA:       Action ngay khi benefit vừa được cảm nhận
```

## Quy trình thực hiện

### Bước 1 — Xác định awareness level và friction cần vượt

| Awareness Level | Họ biết gì | Friction chính | Approach |
|-----------------|-----------|---------------|----------|
| **Cold** | Chưa biết bạn hoặc problem | "Ai vậy?" | Build credibility trước, soft CTA |
| **Warm** | Biết problem, chưa biết solution của bạn | "Tại sao tôi nên tin?" | Proof + medium CTA |
| **Hot** | Biết bạn, đang cân nhắc | "Có xứng đáng không?" | Remove objections + hard CTA |

### Bước 2 — Chọn framework phù hợp
- **Cold audience + short format** → PAS (hook ngay vào pain)
- **Warm audience + long format** → AIDA (nurture trước khi ask)
- **Hot audience + product focus** → BAB hoặc FAB

### Bước 3 — Viết copy theo framework
- Dùng ngôn ngữ của audience, không dùng jargon của bạn
- Benefits trước features — "tiết kiệm 2 giờ/ngày" > "automated scheduling"
- Số cụ thể > tính từ chung — "47 khách hàng" > "nhiều khách hàng"
- 1 email = 1 action. 1 post = 1 CTA. Không split focus.

### Bước 4 — Platform-specific CTA format

| Platform | CTA Format | Best Practice |
|----------|-----------|--------------|
| Twitter/X | "DM mình từ [keyword]" / "Bookmark thread này" | Keyword DM qualify leads tự động |
| Instagram | "Link in bio" / "DM mình [keyword]" / "Save để xem lại" | Link in bio + story swipe up nếu có |
| Facebook | "Comment [từ] dưới đây" / "Share cho ai cần" | Comment trigger boost algorithm reach |
| LinkedIn | "Repost nếu thấy hữu ích" / "Comment góc nhìn của bạn" | Repost > Like về reach |
| Email | Button CTA duy nhất, above fold + cuối email | Repeat CTA 2 lần, same action |
| Landing page | Hero CTA + secondary CTA ở fold tiếp theo | Hero: primary action. Secondary: lower commitment |
| DM / Chat | Conversational, câu hỏi mở, không pitch ngay | Qualify trước, pitch sau |

### Bước 5 — Objection handling inline
Với medium/hard CTA, anticipate top 2 objections và address trong copy:

```
CTA: "Đặt lịch tư vấn miễn phí ngay hôm nay"
Objection 1: "Mất thời gian" → "Chỉ 15 phút — nếu không phù hợp, tôi nói thẳng"
Objection 2: "Sẽ bị bán hàng" → "Không commitment. Không pressure."
```

### Bước 6 — Viết A/B variant
Luôn output 2 versions với 1 biến số khác nhau:
- Version A: urgency-based ("Hôm nay cuối cùng...")
- Version B: benefit-based ("Nhận ngay [specific benefit]...")

## DM Script Template

```
[OPENER — không pitch ngay]
"Chào [tên], mình thấy bạn comment về [X]..."

[QUALIFY]
"Bạn đang gặp vấn đề với [Y] không?"

[BRIDGE]
"Mình có [giải pháp Z] — đã giúp [social proof ngắn]."

[SOFT ASK]
"Bạn có muốn mình share thêm không? Chỉ 2 phút."

[FOLLOW UP — nếu không reply sau 48h]
"Hỏi thăm bạn — vẫn đang tìm cách giải quyết [X] không?"
```

## Email Sequence Structure

```
Email 1 (Ngày 0): Welcome — deliver lead magnet, set expectation
Email 2 (Ngày 2): Value — teach 1 thing, no ask
Email 3 (Ngày 4): Story — case study hoặc personal story, soft CTA
Email 4 (Ngày 6): Objection — address top concern, medium CTA
Email 5 (Ngày 8): Offer — full pitch, hard CTA, urgency
Email 6 (Ngày 9): Last chance — urgency, testimonial, repeat CTA
```

## Output format (JSON)

```json
{
  "skill": "cta-conversion-copy",
  "platform": "...",
  "cta_type": "soft | medium | hard",
  "framework_used": "PAS | AIDA | BAB | FAB",
  "awareness_level": "cold | warm | hot",
  "main_version": {
    "copy": "Full copy đã viết",
    "cta_line": "Câu CTA cụ thể",
    "urgency_mechanism": "Cách tạo urgency",
    "objections_addressed": ["Objection 1 và cách xử lý", "Objection 2 và cách xử lý"]
  },
  "ab_variant": {
    "copy": "Bản A/B với biến số khác",
    "cta_line": "...",
    "key_difference": "Điểm khác so với main version và hypothesis"
  },
  "dm_script": {
    "opener": "...",
    "qualify": "...",
    "bridge": "...",
    "soft_ask": "...",
    "follow_up": "..."
  },
  "friction_analysis": {
    "top_objections": ["...", "..."],
    "friction_removed": "Những friction nào đã được loại bỏ trong copy"
  },
  "expected_conversion": "Dự đoán performance và lý do"
}
```

## Quy tắc

1. **1 CTA per piece** — 2 CTAs = 0 conversions. Audience confused → audience leaves.
2. **Benefits trước, features sau** — Người mua muốn biết cuộc sống họ thay đổi thế nào, không phải product hoạt động ra sao.
3. **Urgency phải thật** — Fake deadline ("Offer kết thúc lúc nửa đêm" mọi ngày) phá trust. Dùng opportunity cost hoặc limited availability thật.
4. **Friction audit** — Với mỗi CTA, hỏi: có bước nào có thể bỏ không? Mỗi step bỏ được = conversion tăng.
5. **Match awareness level** — Hard CTA với cold audience = unsubscribe/unfollow. Luôn match ask với level of trust đã có.
6. **Social proof inline** — Đặt proof ngay trước CTA, không để ở đầu bài. "23 người đã đặt tuần này → Đặt lịch ngay."
7. **Test trước khi scale** — Không bao giờ declare winner chỉ dựa trên feel. A/B test, đợi đủ sample size, data quyết định.
8. **CTA flow từ content** — CTA không thể xuất hiện đột ngột. Cả bài phải lead tự nhiên đến action. Nếu CTA feel forced → rewrite transition.