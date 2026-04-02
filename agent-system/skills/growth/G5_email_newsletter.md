---
code: G5
name: Email Newsletter
type: api
category: growth
description: Thiết kế và gửi email campaigns, newsletters để nurture subscribers và drive traffic về marketplace.
tools_required:
  - mcp__marketing-tools__send_email
output_format: json
---

## Mục đích

Tạo và gửi email campaigns bao gồm newsletters định kỳ, drip sequences, và promotional emails. Email là owned channel với ROI cao nhất (trung bình 36:1). Skill này xử lý từ content creation đến gửi email thông qua API.

## Input cần có

```yaml
campaign_type: "[newsletter / drip_sequence / promotional / transactional / re_engagement]"
marketplace_name: "[tên]"
marketplace_url: "[URL]"
subscriber_list:
  total: "[số]"
  segments:
    - name: "[segment name]"
      size: "[số]"
      tags: ["supply", "active", "VN"]
    - name: "[segment name]"
      size: "[số]"
      tags: ["demand", "new", "HCMC"]
sender_name: "[tên hiển thị]"
sender_email: "[email]"
brand_voice: "[professional / friendly / bold]"
email_content:
  subject_line: "[hoặc để AI generate]"
  preview_text: "[hoặc để AI generate]"
  body_topic: "[chủ đề chính]"
  cta_url: "[link chính]"
  cta_text: "[text nút CTA]"
schedule: "[send_now / schedule: 2026-03-23T09:00:00]"
```

## Quy trình thực hiện

### Bước 1 — Campaign Planning

Xác định loại campaign và mục tiêu:

| Type | Frequency | Goal | Key Metric |
|------|-----------|------|------------|
| Newsletter | Weekly/Bi-weekly | Engagement + brand | Open rate > 25% |
| Drip sequence | Triggered | Onboarding/activation | Click rate > 5% |
| Promotional | Monthly max | Drive transactions | Conversion rate > 2% |
| Transactional | Event-triggered | Confirm/update | Delivery rate > 99% |
| Re-engagement | Quarterly | Win back inactive | Re-activation rate > 10% |

### Bước 2 — Content Creation

**Newsletter Template Structure:**

```
SECTION 1 — Hook (2-3 câu)
  Câu hỏi hoặc insight gây tò mò liên quan đến vertical

SECTION 2 — Main Value (60% email)
  Educational content / Market insights / Tips thực tế
  Phải có giá trị độc lập ngay cả khi không click link nào

SECTION 3 — Marketplace Spotlight (25% email)
  Featured listings / Success stories / New features
  CTA rõ ràng: "Xem ngay trên [marketplace]"

SECTION 4 — Community (15% email)
  User stories / Upcoming events / Social proof
  Secondary CTA: "Follow us on Instagram/Facebook"
```

**Subject Line Framework:**

```
CURIOSITY: "Điều mà 80% [segment] không biết về [topic]"
BENEFIT: "[Kết quả cụ thể] trong [timeframe]"
URGENCY: "Chỉ còn [X] [items] — [reason why limited]"
PERSONAL: "[Name], [personalized observation]"
QUESTION: "Bạn đã thử [specific action] chưa?"
```

Luôn tạo 2-3 subject lines để A/B test.

### Bước 3 — Segmentation & Personalization

```
MERGE TAGS:
  {{first_name}} — Tên subscriber
  {{segment}} — Supply / Demand
  {{city}} — Thành phố
  {{last_action}} — Hành động cuối trên marketplace
  {{recommended_listings}} — Personalized recommendations

CONDITIONAL CONTENT:
  IF segment = "supply":
    Show supplier-specific content (new demand trends, tips)
  IF segment = "demand":
    Show buyer-specific content (new listings, deals)
  IF last_action_days > 30:
    Show re-engagement content
```

### Bước 4 — Send Email

Sử dụng `mcp__marketing-tools__send_email` để gửi:

```json
{
  "action": "send_email",
  "params": {
    "to_segment": "demand_active_hcmc",
    "from_name": "Marketplace Team",
    "from_email": "hello@marketplace.vn",
    "subject": "Subject line here",
    "preview_text": "Preview text here",
    "html_body": "<html>...</html>",
    "plain_text": "Fallback text...",
    "schedule": "2026-03-23T09:00:00+07:00",
    "track_opens": true,
    "track_clicks": true,
    "tags": ["newsletter", "weekly", "march-w4"]
  }
}
```

### Bước 5 — Post-Send Analysis

Thu thập metrics sau 48 giờ:
- Open rate (target: >25%)
- Click rate (target: >5%)
- Unsubscribe rate (alarm nếu >0.5%)
- Conversion rate (clicks -> marketplace action)
- Revenue attributed

## Output format (JSON)

```json
{
  "skill": "G5_email_newsletter",
  "campaign": {
    "type": "newsletter",
    "name": "Weekly Digest - W13 2026",
    "date": "2026-03-22",
    "segment": "all_active_subscribers",
    "segment_size": 2500
  },
  "content": {
    "subject_lines": [
      {"version": "A", "text": "..."},
      {"version": "B", "text": "..."}
    ],
    "preview_text": "...",
    "sections": [
      {"name": "hook", "word_count": 50},
      {"name": "main_value", "word_count": 200},
      {"name": "marketplace_spotlight", "word_count": 100},
      {"name": "community", "word_count": 75}
    ],
    "cta_primary": {"text": "...", "url": "..."},
    "cta_secondary": {"text": "Follow on Instagram", "url": "..."}
  },
  "send_details": {
    "status": "scheduled",
    "scheduled_time": "2026-03-23T09:00:00+07:00",
    "estimated_delivery": "2026-03-23T09:15:00+07:00"
  },
  "ab_test": {
    "variable": "subject_line",
    "split": "50/50",
    "winner_criteria": "open_rate_after_4h"
  },
  "expected_metrics": {
    "open_rate": "25-30%",
    "click_rate": "5-8%",
    "unsubscribe_rate": "<0.3%"
  }
}
```

## Platform Adaptations

- **Twitter/X**: Promote newsletter signups qua pinned tweet và threads. Cross-post newsletter highlights as threads. Link newsletter archive trong bio.
- **Instagram**: Promote newsletter qua Stories với swipe-up/link sticker. Tạo carousel post tóm tắt newsletter highlights. Bio link đến signup page. Broadcast Channel cho teaser content trước khi newsletter gửi.
- **Facebook**: Share newsletter excerpt trên Page và Groups. Facebook Lead Ads để thu email subscribers. Messenger bot để capture emails. Facebook Events integration cho event-related newsletters.
- **LinkedIn**: Newsletter feature native trên LinkedIn. Cross-post email newsletter content as LinkedIn articles. Lead Gen Forms cho B2B email capture.
- **Reddit**: KHÔNG promote email trên Reddit trực tiếp. Chỉ share valuable content và nếu ai hỏi thì mention newsletter.

## Quy tắc

1. **Value ratio 80/20** — 80% email content phải có giá trị giáo dục/thông tin. Max 20% promotional.
2. **Frequency discipline** — Newsletter không quá 2x/tuần. Promotional không quá 2x/tháng. Hơn = unsubscribe.
3. **Subject line test** — Luôn A/B test subject lines. Không bao giờ gửi 1 version cho toàn bộ list.
4. **Mobile responsive** — 70%+ mở email trên mobile. Test mọi email trên mobile trước khi gửi.
5. **Unsubscribe easy** — Link unsubscribe phải rõ ràng. Đừng giấu. Compliance bắt buộc.
6. **Instagram/Facebook cross-promote** — Mỗi newsletter phải có CTA follow Instagram/Facebook. Mỗi post trên Instagram/Facebook phải mention newsletter.
7. **Send time optimization** — VN market: Thứ 3-5, 9-10am hoặc 7-8pm. Avoid Monday morning và Friday afternoon.
8. **List hygiene** — Remove bounced emails ngay. Remove inactive (no open 90 days) hàng quý.
9. **Deliverability** — Warm up new sending domain. Authenticate SPF/DKIM/DMARC. Monitor spam score.
