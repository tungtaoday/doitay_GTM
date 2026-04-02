---
code: G1
name: Strategic Engagement
type: api
category: growth
description: Tìm và tương tác với các bài viết liên quan trên mạng xã hội để tăng visibility và thu hút đúng đối tượng mục tiêu.
tools_required:
  - mcp__marketing-tools__search_posts
  - mcp__marketing-tools__reply_post
output_format: json
---

## Mục đích

Tự động tìm kiếm các bài viết, bình luận và thảo luận liên quan đến vertical/niche của marketplace, sau đó tương tác một cách có giá trị để xây dựng authority và thu hút traffic organic. Engagement phải tạo giá trị thực cho người đọc, không spam.

## Input cần có

```yaml
target_keywords:
  - "[từ khóa chính liên quan đến marketplace]"
  - "[từ khóa phụ]"
  - "[pain point keywords]"
platforms:
  - twitter
  - instagram
  - facebook
  - linkedin
  - reddit
brand_voice: "[mô tả tone: chuyên gia / thân thiện / provocative]"
marketplace_url: "[link marketplace]"
value_proposition: "[1 câu mô tả giá trị cốt lõi]"
max_engagements_per_day: 20
engagement_window_hours: "[giờ bắt đầu]-[giờ kết thúc]"
target_segments:
  - "[segment 1 - behavioral description]"
  - "[segment 2 - behavioral description]"
```

## Quy trình thực hiện

### Bước 1 — Scan bài viết liên quan

Sử dụng `mcp__marketing-tools__search_posts` để tìm bài viết:

```json
{
  "action": "search_posts",
  "params": {
    "keywords": ["keyword1", "keyword2"],
    "platforms": ["twitter", "instagram", "facebook", "linkedin", "reddit"],
    "recency": "24h",
    "min_engagement": 10,
    "language": "vi",
    "exclude_own_posts": true
  }
}
```

### Bước 2 — Phân loại và ưu tiên

Scoring mỗi bài viết:
- **Relevance** (1-5): Bài viết liên quan đến vertical thế nào?
- **Engagement potential** (1-5): Comment có tạo được visibility không?
- **Author influence** (1-5): Tác giả có followers/authority không?
- **Recency** (1-5): Bài mới hơn ưu tiên hơn.

Priority Score = Relevance x Engagement Potential x Author Influence x Recency

Chỉ engage bài có Priority Score >= 100.

### Bước 3 — Soạn reply có giá trị

Mỗi reply phải:
1. Acknowledge quan điểm của tác giả
2. Thêm insight/data/kinh nghiệm thực tế
3. Nếu phù hợp tự nhiên, mention marketplace (không quá 20% replies)
4. Kết thúc bằng câu hỏi hoặc mời thảo luận tiếp

### Bước 4 — Gửi reply

Sử dụng `mcp__marketing-tools__reply_post` để gửi:

```json
{
  "action": "reply_post",
  "params": {
    "post_id": "post_abc123",
    "platform": "twitter",
    "content": "Đúng rồi, [insight cụ thể]. Mình cũng gặp case tương tự khi...",
    "include_link": false,
    "tag_author": false
  }
}
```

### Bước 5 — Theo dõi và phản hồi tiếp

Nếu reply nhận được phản hồi, tiếp tục cuộc trò chuyện trong vòng 2 giờ.

## Output format (JSON)

```json
{
  "skill": "G1_strategic_engagement",
  "execution_date": "2026-03-22",
  "platform_summary": {
    "twitter": {
      "posts_scanned": 45,
      "posts_engaged": 8,
      "avg_priority_score": 210
    },
    "instagram": {
      "posts_scanned": 30,
      "posts_engaged": 5,
      "avg_priority_score": 185
    },
    "facebook": {
      "posts_scanned": 25,
      "posts_engaged": 4,
      "avg_priority_score": 195
    },
    "linkedin": {
      "posts_scanned": 20,
      "posts_engaged": 3,
      "avg_priority_score": 175
    },
    "reddit": {
      "posts_scanned": 15,
      "posts_engaged": 2,
      "avg_priority_score": 160
    }
  },
  "engagements": [
    {
      "post_id": "post_abc123",
      "platform": "twitter",
      "post_author": "@username",
      "post_topic": "pain point discussion",
      "priority_score": 250,
      "reply_content": "...",
      "included_marketplace_link": false,
      "reply_status": "sent",
      "follow_up_needed": true
    }
  ],
  "total_engagements": 22,
  "link_mentions": 4,
  "follow_ups_pending": 6,
  "next_scan_scheduled": "2026-03-23T09:00:00"
}
```

## Platform Adaptations

- **Twitter/X**: Reply to tweets trong niche. Tìm threads dài có nhiều engagement. Quote tweet với thêm insight. Tham gia Twitter Spaces liên quan.
- **Instagram**: Comment trên posts của influencers trong vertical. Reply to stories với câu hỏi. Engage với Reels comments. Tương tác trên Instagram Threads.
- **Facebook**: Comment trên group posts liên quan. React và reply trong các Facebook Groups chuyên ngành. Engage với Facebook Reels và posts trên Pages.
- **LinkedIn**: Comment trên posts của thought leaders. Engage với articles và newsletters. Tham gia LinkedIn Groups discussions.
- **Reddit**: Comment trên threads trong subreddits liên quan. Trả lời câu hỏi trong AMA hoặc help threads. Cung cấp giá trị thực trước khi mention bất kỳ link nào.

## Quy tắc

1. **Không spam** — Mỗi reply phải tạo giá trị thực. Nếu không có gì hay để nói, không reply.
2. **Tỷ lệ 80/20** — 80% replies thuần value, 20% có thể mention marketplace nếu tự nhiên.
3. **Không copy-paste** — Mỗi reply phải unique và contextual cho bài viết cụ thể.
4. **Respect platform culture** — Reddit ghét marketing. LinkedIn chấp nhận professional promotion. Twitter cần witty. Instagram cần visual context. Facebook cần conversational tone.
5. **Rate limiting** — Không quá 20 engagements/ngày/platform để tránh bị flag.
6. **Timing** — Engage trong giờ cao điểm của mỗi platform (Instagram: 11am-1pm, 7-9pm; Facebook: 1-4pm; LinkedIn: 7-8am, 5-6pm).
7. **Track ROI** — Mỗi engagement được track để đo lường clicks và conversions về marketplace.
8. **Escalation** — Nếu phát hiện opportunity lớn (influencer hỏi về vấn đề marketplace giải quyết), flag cho CEO review trước khi engage.
