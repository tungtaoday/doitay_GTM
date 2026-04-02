---
code: G4
name: Audience Nurturing
type: reasoning
category: growth
description: Thiết kế chuỗi DM, follow-up sequences và nurturing workflows để chuyển đổi followers thành active marketplace users.
tools_required: []
output_format: json
---

## Mục đích

Xây dựng chiến lược nurturing audience từ lúc họ biết đến marketplace (awareness) cho đến khi trở thành active user và advocate. Focus vào DM sequences, follow-up workflows, và personalized touchpoints trên mọi channel. Skill này thiết kế strategy, không thực thi gửi tin nhắn.

## Input cần có

```yaml
marketplace_name: "[tên]"
marketplace_url: "[URL]"
target_segments:
  - name: "[segment - behavioral]"
    awareness_level: "[unaware / problem-aware / solution-aware / product-aware]"
    preferred_channel: "[DM platform / email / zalo / etc.]"
supply_or_demand: "[nurture supply side hay demand side]"
current_funnel:
  followers: "[số]"
  engaged_followers: "[số - like/comment regularly]"
  marketplace_visitors: "[số]"
  active_users: "[số - đã transact]"
conversion_goal: "[follower -> user conversion target %]"
available_channels:
  - instagram_dm
  - facebook_messenger
  - zalo
  - email
  - linkedin_dm
tone: "[professional / friendly / casual]"
```

## Quy trình thực hiện

### Bước 1 — Audience Segmentation by Temperature

```
COLD (followers mới, chưa engage):
  Goal: First meaningful interaction
  Channel: Public content + Stories

WARM (engaged followers, đã like/comment):
  Goal: Start 1:1 conversation
  Channel: DM welcome + value-first message

HOT (đã visit marketplace hoặc hỏi về sản phẩm):
  Goal: First transaction
  Channel: Personalized DM + specific recommendation

ACTIVE (đã transact ít nhất 1 lần):
  Goal: Repeat transaction + referral
  Channel: DM check-in + exclusive offers

ADVOCATE (repeat user, đã refer others):
  Goal: Amplify their voice
  Channel: VIP DM group + co-creation opportunities
```

### Bước 2 — DM Sequence Design

**Welcome Sequence (COLD -> WARM):**

```
DM 1 (Trigger: New follower + engaged with 2+ posts)
"Chào [name], cảm ơn bạn đã follow! Mình thấy bạn quan tâm đến [topic].
Bạn đang tìm [specific solution] hay đang explore thôi?"
→ Wait for reply. KHÔNG gửi DM 2 nếu chưa reply.

DM 2 (Trigger: Replied to DM 1, +1 day)
"[Personalized based on their reply]. Nhiều người trong community mình
cũng gặp [pain point]. Bạn muốn mình share [specific resource] không?"
→ Provide genuine value. NO selling yet.

DM 3 (Trigger: Engaged with value from DM 2, +3 days)
"Btw, nếu bạn đang tìm [specific solution], trên [marketplace] có
[specific listing/supplier] mà mình thấy phù hợp với bạn.
Link: [personalized link with tracking]"
→ First soft marketplace mention.
```

**Activation Sequence (WARM -> HOT):**

```
DM 4 (Trigger: Clicked marketplace link but didn't transact, +2 days)
"Hey [name], mình thấy bạn xem [listing]. Có câu hỏi gì không?
[Supplier name] rất responsive, bạn có thể hỏi trực tiếp."

DM 5 (Trigger: Still no transaction, +5 days)
"[Name], mình vừa thấy [new listing relevant to their interest].
Nghĩ ngay đến bạn vì bạn có mention [their stated need]."
```

**Retention Sequence (HOT -> ACTIVE -> ADVOCATE):**

```
Post-transaction DM (+1 day):
"[Name], trải nghiệm [transaction] thế nào? Feedback thật nhé,
mình muốn cải thiện."

Repeat trigger DM (+14 days):
"[Name], có [new relevant listings] phù hợp với style/nhu cầu
bạn đã mua lần trước. Xem thử?"

Referral ask (+30 days, only if positive feedback):
"[Name], nếu bạn biết ai cũng cần [solution], giới thiệu giúp mình nhé.
[Referral link with tracking]"
```

### Bước 3 — Follow-up Rules Engine

```yaml
rules:
  - trigger: "no_reply_after_48h"
    action: "stop_sequence"
    reason: "Respect their time. Move to content nurture only."

  - trigger: "negative_reply"
    action: "apologize_and_stop"
    reason: "Never argue. Thank them and stop."

  - trigger: "question_about_marketplace"
    action: "fast_reply_within_1h"
    reason: "Hot lead. Prioritize."

  - trigger: "referred_someone"
    action: "thank_and_vip_access"
    reason: "Advocates are gold. Treat them accordingly."

  - trigger: "inactive_30_days"
    action: "re_engagement_dm"
    reason: "One gentle ping. If no response, archive."
```

### Bước 4 — Channel Selection Matrix

| Audience Temperature | Instagram DM | Facebook Messenger | Zalo | Email | LinkedIn DM |
|---------------------|-------------|-------------------|------|-------|-------------|
| Cold | Content only | Content only | N/A | Newsletter | Content only |
| Warm | Welcome DM | Welcome DM | If opted in | Value email | Connection msg |
| Hot | Activation DM | Activation DM | Direct msg | Offer email | InMail |
| Active | Check-in | Check-in | Group add | Retention email | Updates |
| Advocate | VIP group | VIP group | VIP group | VIP newsletter | Feature |

### Bước 5 — Personalization Framework

```
LEVEL 1 (Basic): Dùng tên + platform cụ thể
LEVEL 2 (Behavioral): Reference content họ đã engage
LEVEL 3 (Contextual): Reference pain point họ đã mention
LEVEL 4 (Predictive): Suggest dựa trên similar user behavior
```

## Output format (JSON)

```json
{
  "skill": "G4_audience_nurturing",
  "strategy_date": "2026-03-22",
  "audience_breakdown": {
    "cold": 5000,
    "warm": 800,
    "hot": 150,
    "active": 45,
    "advocate": 10
  },
  "dm_sequences": [
    {
      "name": "Welcome Sequence",
      "target": "cold_to_warm",
      "messages": 3,
      "channels": ["instagram_dm", "facebook_messenger"],
      "trigger": "new_follower_engaged_2plus_posts",
      "expected_reply_rate": "25-35%",
      "sequence_detail": ["...", "...", "..."]
    },
    {
      "name": "Activation Sequence",
      "target": "warm_to_hot",
      "messages": 2,
      "channels": ["instagram_dm", "facebook_messenger", "zalo"],
      "trigger": "clicked_marketplace_link",
      "expected_conversion": "10-15%"
    },
    {
      "name": "Retention Sequence",
      "target": "hot_to_advocate",
      "messages": 3,
      "channels": ["instagram_dm", "facebook_messenger", "zalo", "email"],
      "trigger": "first_transaction_completed",
      "expected_repeat_rate": "30-40%"
    }
  ],
  "follow_up_rules": [
    {"trigger": "no_reply_48h", "action": "stop_sequence"},
    {"trigger": "negative_reply", "action": "apologize_stop"},
    {"trigger": "question_asked", "action": "fast_reply_1h"},
    {"trigger": "referral_made", "action": "vip_upgrade"},
    {"trigger": "inactive_30d", "action": "re_engagement_ping"}
  ],
  "monthly_targets": {
    "cold_to_warm": "15%",
    "warm_to_hot": "10%",
    "hot_to_active": "20%",
    "active_to_advocate": "10%"
  },
  "kpis": [
    {"metric": "dm_reply_rate", "target": ">25%"},
    {"metric": "follower_to_user_conversion", "target": "3-5%"},
    {"metric": "time_to_first_transaction", "target": "<14 days from first DM"},
    {"metric": "advocate_referral_rate", "target": "1 referral per advocate per month"}
  ]
}
```

## Platform Adaptations

- **Twitter/X**: DM chỉ khi họ follow back. Nurture chủ yếu qua public replies và quote tweets. Thread replies tạo relationship. Không mass DM, Twitter rất strict.
- **Instagram**: DM là channel nurturing mạnh nhất. Story replies tạo warm leads tự nhiên. Voice messages tạo personal touch. Quick replies và saved replies để scale. Broadcast Channels cho mass updates. Tận dụng Notes feature cho micro-updates.
- **Facebook**: Messenger sequences mạnh cho nurturing. Chatbot cho initial qualification. Facebook Groups cho community nurturing. Page inbox cho business inquiries. Messenger Rooms cho group conversations.
- **LinkedIn**: InMail cho cold outreach (tốn credits). Connection request + follow-up message cho warm. LinkedIn Events invitations cho engagement. Rất hiệu quả cho B2B marketplace.
- **Zalo**: OA (Official Account) cho broadcast. Zalo chat cho 1:1. Zalo Groups cho community. Phổ biến nhất VN cho direct communication.

## Quy tắc

1. **Permission first** — Không DM người chưa interact với content. Phải có signal (like, comment, follow) trước.
2. **Value before ask** — Ít nhất 2 tin nhắn giá trị trước khi mention marketplace.
3. **No reply = stop** — Nếu không reply sau 48h, dừng sequence. Không gửi thêm.
4. **Personalize or don't send** — Generic mass DM = spam. Mỗi DM phải reference cái gì đó cụ thể.
5. **Instagram và Facebook Messenger là primary channels** — Đây là 2 kênh nurturing bắt buộc cho thị trường VN.
6. **Respect timing** — Không gửi DM ngoài giờ 8am-9pm. Không gửi cuối tuần trừ khi họ active.
7. **Track everything** — Mỗi DM sequence phải có UTM tracking cho marketplace links.
8. **Human handoff** — Nếu conversation trở nên complex, handoff cho người thật. AI nurture cho top-of-funnel, human cho bottom.
9. **GDPR/privacy** — Tôn trọng opt-out. Một lần nói "không quan tâm" = permanent stop.
