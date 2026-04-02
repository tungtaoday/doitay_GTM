---
code: G2
name: Community Building
type: reasoning
category: growth
description: Xây dựng chiến lược cộng đồng xung quanh marketplace để tạo organic engagement, trust và network effects.
tools_required: []
output_format: json
---

## Mục đích

Thiết kế và lên kế hoạch xây dựng cộng đồng (community) xung quanh marketplace vertical. Community là moat mạnh nhất cho marketplace vì nó tạo switching cost cao và organic demand generation. Skill này reasoning chiến lược, không thực thi trực tiếp.

## Input cần có

```yaml
marketplace_vertical: "[vertical cụ thể]"
target_segments:
  - name: "[segment name - behavioral]"
    jobs_to_be_done: "[JTBD]"
    current_communities: "[họ đang tụ tập ở đâu]"
supply_or_demand_focus: "[bắt đầu xây community cho bên nào]"
available_platforms:
  - facebook_group
  - instagram
  - discord
  - telegram
  - zalo_group
  - offline_meetup
budget_monthly: "[VND]"
team_hours_per_week: "[số giờ]"
marketplace_stage: "[Signal / Hypothesis / Intelligence / Strategy / Experiment / Decision]"
```

## Quy trình thực hiện

### Bước 1 — Community Audit

Phân tích cộng đồng hiện tại trong vertical:
- Họ đang tụ tập ở đâu? (Facebook Groups, Zalo, Discord, offline...)
- Ai là key opinion leaders?
- Content nào tạo engagement cao nhất?
- Pain points nào được thảo luận nhiều nhất?
- Gaps: Cái gì họ muốn nhưng community hiện tại không cung cấp?

### Bước 2 — Community Strategy Canvas

```
PURPOSE: Tại sao ai đó join community này thay vì 10 cái khác?
UNIQUE VALUE: Cái gì chỉ community này có?
ANCHOR CONTENT: Content type nào tạo lý do quay lại hàng tuần?
RITUALS: Hoạt động định kỳ nào tạo habit? (weekly AMA, monthly meetup...)
GROWTH LOOP: Member mới đến từ đâu? Member cũ mời member mới vì sao?
BRIDGE TO MARKETPLACE: Community member chuyển thành marketplace user thế nào?
```

### Bước 3 — Platform Selection Matrix

| Platform | Reach | Engagement Depth | Content Type | Cost | Best For |
|----------|-------|-----------------|-------------|------|----------|
| Facebook Group | Cao | Trung bình | Text, polls, video | Thấp | Mass community VN |
| Instagram | Cao | Trung bình | Visual, Reels, Stories | Trung bình | Brand building, visual vertical |
| Discord | Thấp-TB | Cao | Real-time chat | Thấp | Tech-savvy, niche |
| Telegram | Trung bình | Trung bình | Quick updates | Thấp | Fast communication |
| Zalo Group | Cao (VN) | Trung bình | Chat, files | Thấp | VN mass market |
| Offline | Thấp | Rất cao | Face-to-face | Cao | Trust building |

Chọn 1-2 platform chính dựa trên nơi target segment đã có mặt.

### Bước 4 — Content Pillar Design

Mỗi community cần 4 content pillars:

1. **Educational** (40%) — Dạy skill/knowledge liên quan đến vertical
2. **Connection** (25%) — Kết nối members với nhau (introductions, collabs)
3. **Entertainment** (20%) — Memes, stories, behind-the-scenes
4. **Promotional** (15%) — Marketplace features, success stories, offers

### Bước 5 — Growth Milestones

```
0-100 members: Founder-led. Mời từng người. Quality > quantity.
100-500: Content engine chạy. Weekly rituals established.
500-2000: Member-generated content xuất hiện. Ambassadors emerge.
2000-10000: Self-sustaining. Community tự grow. Focus moderate và quality.
10000+: Sub-communities hình thành. Platform effect.
```

### Bước 6 — Community-to-Marketplace Bridge

```
SOFT BRIDGE: Share marketplace listings trong community khi relevant
HARD BRIDGE: Exclusive deals cho community members
EVENT BRIDGE: Offline meetup tại marketplace locations
CONTENT BRIDGE: Success stories của members dùng marketplace
FEEDBACK BRIDGE: Community = beta testers và product advisors
```

## Output format (JSON)

```json
{
  "skill": "G2_community_building",
  "strategy": {
    "community_purpose": "...",
    "unique_value": "...",
    "primary_platform": "facebook_group",
    "secondary_platform": "instagram",
    "target_segment": "...",
    "supply_or_demand": "supply"
  },
  "content_pillars": [
    {
      "pillar": "Educational",
      "percentage": 40,
      "content_examples": ["...", "...", "..."]
    },
    {
      "pillar": "Connection",
      "percentage": 25,
      "content_examples": ["...", "...", "..."]
    },
    {
      "pillar": "Entertainment",
      "percentage": 20,
      "content_examples": ["...", "...", "..."]
    },
    {
      "pillar": "Promotional",
      "percentage": 15,
      "content_examples": ["...", "...", "..."]
    }
  ],
  "rituals": [
    {
      "name": "Weekly AMA",
      "frequency": "weekly",
      "platform": "facebook_group",
      "description": "..."
    }
  ],
  "growth_plan": {
    "month_1_target": 100,
    "month_3_target": 500,
    "month_6_target": 2000,
    "acquisition_channels": ["...", "..."],
    "growth_loop": "..."
  },
  "marketplace_bridge": {
    "soft_bridges": ["..."],
    "hard_bridges": ["..."],
    "conversion_target": "5% community -> marketplace user/month"
  },
  "budget_allocation": {
    "content_creation": "40%",
    "paid_promotion": "30%",
    "events": "20%",
    "tools": "10%"
  },
  "kpis": [
    {"metric": "active_members_weekly", "target": "30% of total"},
    {"metric": "posts_per_week", "target": 15},
    {"metric": "member_to_marketplace_conversion", "target": "5%"}
  ]
}
```

## Platform Adaptations

- **Twitter/X**: Xây dựng community thông qua consistent posting, Twitter Spaces hàng tuần, và tạo hashtag riêng cho community. Thread culture phù hợp cho educational content.
- **Instagram**: Tạo community feel qua Instagram Stories polls, Q&A stickers, và Broadcast Channels. Reels để reach new members. Close Friends list cho exclusive content. Collab posts với members.
- **Facebook**: Facebook Groups là nền tảng community mạnh nhất tại VN. Tận dụng Group features: polls, events, units, guides. Facebook Live cho AMA sessions. Reels để attract new members vào Group.
- **LinkedIn**: Professional communities qua LinkedIn Groups, newsletters, và events. Phù hợp cho B2B marketplace verticals.
- **Reddit**: Tạo subreddit riêng hoặc moderate existing ones. AMA format rất mạnh. Cần organic approach, không promotional.

## Quy tắc

1. **Community first, marketplace second** — Community phải có giá trị độc lập ngay cả khi marketplace chưa launch.
2. **Quality over quantity** — 100 active members tốt hơn 10,000 ghosts. Track weekly active, không total members.
3. **Founder presence bắt buộc** trong 6 tháng đầu — CEO/founder phải active trong community ít nhất 3 lần/tuần.
4. **Không bán hàng trong 30 ngày đầu** — Chỉ tạo giá trị. Marketplace mention chỉ khi member hỏi.
5. **Listen more than broadcast** — Tỷ lệ: 60% listen/respond, 40% broadcast content.
6. **Instagram và Facebook là kênh bắt buộc** cho thị trường VN — Không skip hai platform này.
7. **Measure engagement rate, không vanity metrics** — Likes không quan trọng bằng comments và shares.
8. **Kill community nếu** weekly active rate < 10% sau 3 tháng liên tục.
