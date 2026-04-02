---
code: G7
name: Outbound Sales
type: api
category: growth
description: Gửi DM outreach tự động và có cá nhân hóa đến potential supply/demand cho marketplace.
tools_required:
  - mcp__marketing-tools__send_dm
output_format: json
---

## Mục đích

Thực hiện outbound DM outreach đến potential suppliers hoặc buyers cho marketplace. Focus vào personalized messages ở quy mô lớn, quản lý pipeline từ first touch đến conversion. Đặc biệt quan trọng cho cold start phase khi marketplace cần seed supply hoặc demand.

## Input cần có

```yaml
outreach_target: "[supply / demand]"
marketplace_name: "[tên]"
marketplace_url: "[URL]"
value_proposition_for_target: "[CVP 1 câu cho đối tượng outreach]"
target_profile:
  behavioral_description: "[mô tả behavioral, không demographics]"
  where_to_find: "[platforms và locations cụ thể]"
  estimated_list_size: "[số prospects]"
platforms:
  - instagram_dm
  - facebook_messenger
  - linkedin_dm
daily_outreach_limit: "[số DMs/ngày/platform]"
personalization_data:
  - "[data point 1 dùng để personalize: tên shop, sản phẩm, etc.]"
  - "[data point 2]"
follow_up_sequence_length: "[số messages trong sequence]"
campaign_duration_weeks: "[số tuần]"
```

## Quy trình thực hiện

### Bước 1 — Prospect List Building

```
SOURCE 1: Instagram hashtag/location search
  - Search hashtags liên quan đến vertical
  - Filter: active posting (>1 post/tuần), engagement rate >2%
  - Extract: username, bio, recent content themes

SOURCE 2: Facebook Groups
  - Join groups liên quan đến vertical
  - Identify active members (frequent posters, commenters)
  - Extract: name, profile, posted content

SOURCE 3: LinkedIn Search
  - Search by job title, industry, location
  - Filter: active on LinkedIn (recent posts/engagement)
  - Extract: name, headline, company, mutual connections

SOURCE 4: Existing marketplace data
  - Users who signed up but never transacted
  - Users who visited but didn't sign up

QUALIFICATION CRITERIA:
  Score = Relevance (1-5) × Activity (1-5) × Reachability (1-5)
  Only outreach if score >= 50
```

### Bước 2 — Message Template Design

**First Touch (Day 1):**

```
Template A (Compliment + Value):
"Chào [name], mình vừa xem [specific content/product/post] của bạn
và rất ấn tượng với [specific detail]. Mình đang xây [marketplace name]
chuyên về [vertical] và nghĩ bạn sẽ phù hợp. Bạn có muốn tìm hiểu thêm không?"

Template B (Problem + Solution):
"Chào [name], mình thấy bạn đang [specific activity].
Nhiều [similar people] gặp khó khăn với [specific pain point].
[Marketplace name] giúp giải quyết bằng [specific mechanism].
Bạn có đang gặp vấn đề tương tự không?"

Template C (Social Proof):
"Chào [name], [X] [similar people] đã tham gia [marketplace name]
trong tháng qua. [Specific result họ đạt được].
Mình nghĩ bạn cũng có thể benefit. Quan tâm không?"
```

**Follow-up 1 (Day 3, nếu chưa reply):**

```
"Hey [name], mình hiểu bạn bận. Chỉ muốn share nhanh:
[1 specific benefit/data point]. Nếu không phù hợp thì
hoàn toàn ok. Chúc bạn ngày tốt lành!"
```

**Follow-up 2 (Day 7, nếu vẫn chưa reply):**

```
"[Name], last message từ mình. Nếu bao giờ cần [solution],
[marketplace name] luôn open. Link: [URL]. Chúc buôn bán đắt hàng!"
→ STOP after this. No more follow-ups.
```

**Reply Handlers:**

```
IF positive_reply:
  → Schedule call/demo hoặc gửi onboarding link
  → "Tuyệt vời! Để mình gửi bạn link đăng ký: [URL].
     Nếu cần hỗ trợ gì, cứ nhắn mình nhé."

IF question:
  → Answer specifically, then soft CTA
  → "[Answer]. Bạn có thể thử trực tiếp tại [URL]
     để thấy rõ hơn."

IF negative_reply:
  → Thank and stop immediately
  → "Cảm ơn bạn đã phản hồi. Chúc bạn mọi điều tốt đẹp!"
  → Tag as "not_interested", never contact again.

IF "later/not now":
  → Set reminder for 30 days
  → "Hoàn toàn, mình sẽ follow up sau nếu bạn ok.
     Chúc bạn ngày tốt lành!"
```

### Bước 3 — Send DMs

Sử dụng `mcp__marketing-tools__send_dm` để gửi:

```json
{
  "action": "send_dm",
  "params": {
    "platform": "instagram",
    "recipient_id": "user_abc123",
    "recipient_name": "Nguyen Van A",
    "message": "Chào Nguyễn Văn A, mình vừa xem shop handmade của bạn...",
    "personalization_tokens": {
      "name": "Nguyễn Văn A",
      "specific_content": "bộ sưu tập gốm sứ mới",
      "specific_detail": "kỹ thuật men rạn rất đẹp"
    },
    "sequence_step": 1,
    "campaign_id": "outbound_supply_march_2026",
    "schedule": "2026-03-23T10:00:00+07:00"
  }
}
```

### Bước 4 — Pipeline Management

```
STAGES:
  PROSPECTED → DM_SENT → REPLIED → INTERESTED → ONBOARDING → ACTIVE

Track cho mỗi prospect:
  - Platform
  - DM sent date
  - Current sequence step
  - Reply status
  - Sentiment
  - Next action date
  - Conversion status
```

### Bước 5 — Performance Analysis

```
DAILY: DMs sent, replies received, reply rate
WEEKLY: Conversion rate per template, per platform
MONTHLY: Full pipeline review, CAC per channel, time-to-conversion
```

## Output format (JSON)

```json
{
  "skill": "G7_outbound_sales",
  "campaign": {
    "name": "Supply Acquisition - Handmade March 2026",
    "target": "supply",
    "start_date": "2026-03-22",
    "duration_weeks": 4
  },
  "prospect_list": {
    "total_prospects": 200,
    "sources": {
      "instagram_hashtag": 80,
      "facebook_groups": 60,
      "linkedin_search": 30,
      "existing_signups": 30
    },
    "avg_qualification_score": 85
  },
  "outreach_execution": {
    "day_summary": {
      "date": "2026-03-22",
      "dms_sent": {
        "instagram": 15,
        "facebook": 10,
        "linkedin": 5
      },
      "templates_used": {
        "compliment_value": 15,
        "problem_solution": 10,
        "social_proof": 5
      }
    }
  },
  "pipeline": {
    "prospected": 200,
    "dm_sent": 30,
    "replied": 8,
    "interested": 5,
    "onboarding": 3,
    "active": 0
  },
  "reply_analysis": {
    "positive": 5,
    "question": 2,
    "negative": 1,
    "no_reply": 22,
    "reply_rate": "26.7%"
  },
  "performance": {
    "best_template": "compliment_value",
    "best_platform": "instagram",
    "avg_time_to_reply": "4.5 hours",
    "conversion_rate_to_interested": "16.7%"
  },
  "next_actions": [
    {"prospect": "user_abc", "action": "follow_up_1", "date": "2026-03-25"},
    {"prospect": "user_def", "action": "send_onboarding_link", "date": "2026-03-22"}
  ]
}
```

## Platform Adaptations

- **Twitter/X**: DM chỉ khả thi nếu họ follow bạn hoặc mở DM settings. Alternative: Reply to tweets trước để warm up, sau đó DM. Hạn chế DM limit nghiêm ngặt.
- **Instagram**: DM outreach hiệu quả nhất cho B2C. Warm up bằng like/comment 2-3 posts trước khi DM. Voice DM tạo personal touch (reply rate +30%). Story reply là warm intro tự nhiên. Message Requests box = cần approve, subject line quan trọng.
- **Facebook**: Messenger outreach cho businesses (Pages). Tham gia Groups trước, engage, sau mới DM members. Personal profile DM cho warm contacts. Business Page Messenger cho formal outreach.
- **LinkedIn**: InMail cho premium users (limited credits). Connection request + note cho free outreach. Engage với content trước 1 tuần, sau đó connect + DM. Sales Navigator cho advanced prospecting.
- **Zalo**: OA message cho opted-in users. Personal Zalo cho warm contacts. Phổ biến nhất cho VN local businesses.

## Quy tắc

1. **Warm up trước khi DM** — Like/comment 2-3 posts trên Instagram/Facebook trước khi gửi DM. Không cold DM ngay.
2. **Max 3 messages per prospect** — First touch + 2 follow-ups. Sau đó dừng. Không stalk.
3. **Personalization bắt buộc** — Mỗi DM phải reference ít nhất 1 thông tin cụ thể về prospect. Copy-paste = spam.
4. **Rate limiting nghiêm ngặt** — Instagram: max 20 DMs/ngày. Facebook: max 15/ngày. LinkedIn: max 10/ngày. Vượt = bị ban.
5. **Timing** — Gửi DM 9-11am hoặc 7-9pm. Không gửi nửa đêm. Không gửi chủ nhật.
6. **Instagram và Facebook là primary channels** — Ưu tiên 2 platform này cho outreach. LinkedIn chỉ cho B2B.
7. **Track mọi thứ** — Mỗi DM có campaign_id và tracking. Report weekly conversion funnel.
8. **Negative reply = permanent stop** — Không bao giờ contact lại người đã nói "không".
9. **Compliance** — Respect platform ToS. Không dùng automation tools bị cấm. Manual personalization always.
10. **Escalation** — Nếu prospect là high-value (influencer, lớn), flag cho CEO/founder personal outreach.
