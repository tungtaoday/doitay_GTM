---
code: G9
name: Scheduling Ops
type: api
category: growth
description: Lên lịch đăng bài tự động trên nhiều nền tảng social media để duy trì sự hiện diện nhất quán và tối ưu thời gian đăng.
tools_required:
  - mcp__marketing-tools__schedule_content
output_format: json
---

## Mục đích

Quản lý và tự động hóa việc lên lịch đăng bài trên tất cả các nền tảng social media. Đảm bảo content được đăng đúng thời điểm tối ưu, duy trì frequency nhất quán, và không bị gap trong content calendar. Skill này thực thi scheduling qua API.

## Input cần có

```yaml
content_items:
  - id: "[content ID]"
    type: "[post / reel / story / carousel / article / thread]"
    platforms: ["instagram", "facebook", "twitter", "linkedin", "tiktok"]
    caption: "[nội dung text]"
    media_urls: ["[link media]"]
    hashtags: ["#tag1", "#tag2"]
    cta: "[call to action]"
    category: "[educational / promotional / entertainment / community]"
scheduling_preferences:
  timezone: "Asia/Ho_Chi_Minh"
  posting_windows:
    instagram: ["11:00-13:00", "19:00-21:00"]
    facebook: ["12:00-14:00", "19:00-21:00"]
    twitter: ["08:00-09:00", "12:00-13:00", "18:00-19:00"]
    linkedin: ["07:00-08:00", "17:00-18:00"]
    tiktok: ["12:00-13:00", "19:00-22:00"]
  frequency:
    instagram: "[số posts/tuần]"
    facebook: "[số posts/tuần]"
    twitter: "[số tweets/ngày]"
    linkedin: "[số posts/tuần]"
    tiktok: "[số videos/tuần]"
  avoid_dates: ["2026-04-01", "..."]
content_calendar_week: "[tuần cần schedule]"
```

## Quy trình thực hiện

### Bước 1 — Content Calendar Mapping

Phân bổ content theo content pillar framework:

```
MONDAY:    Educational content (Instagram carousel + Facebook post + LinkedIn article)
TUESDAY:   Behind-the-scenes (Instagram Story + Facebook Story + TikTok)
WEDNESDAY: User spotlight / Success story (All platforms)
THURSDAY:  Industry insight / Tips (Instagram Reel + Twitter thread + LinkedIn post)
FRIDAY:    Community engagement (Instagram poll/quiz + Facebook Group post)
SATURDAY:  Entertainment / Lifestyle (Instagram Reel + TikTok + Facebook Reel)
SUNDAY:    Week preview / Inspiration (Instagram Story + light Facebook post)
```

### Bước 2 — Optimal Timing Analysis

**Vietnam Market Peak Times:**

| Platform | Peak Time 1 | Peak Time 2 | Worst Time |
|----------|-------------|-------------|------------|
| Instagram | 11:00-13:00 | 19:00-21:00 | 02:00-06:00 |
| Facebook | 12:00-14:00 | 19:00-21:00 | 01:00-06:00 |
| Twitter/X | 08:00-09:00 | 12:00-13:00 | 00:00-07:00 |
| LinkedIn | 07:00-08:00 | 17:00-18:00 | 22:00-06:00 |
| TikTok | 12:00-13:00 | 19:00-22:00 | 03:00-07:00 |

**Staggering Rule:** Không đăng cùng content trên 2 platforms cùng lúc. Stagger ít nhất 2 giờ.

### Bước 3 — Platform-Specific Content Adaptation

Trước khi schedule, adapt content cho từng platform:

```
ORIGINAL POST: "5 cách tăng doanh số cho shop handmade online"

INSTAGRAM: Carousel 5 slides + detailed caption + 15 hashtags + CTA in bio
FACEBOOK: Shorter text + 1 hero image + link in comment + tag relevant Groups
TWITTER: Thread 5 tweets, each = 1 tip + hook tweet + quote tweet later
LINKEDIN: Professional tone + 1-2 paragraphs + industry context + no hashtags
TIKTOK: 30-60s video version + trending sound + text overlay + hooks
```

### Bước 4 — Schedule Content

Sử dụng `mcp__marketing-tools__schedule_content` để đặt lịch:

```json
{
  "action": "schedule_content",
  "params": {
    "content_id": "content_001",
    "platform": "instagram",
    "post_type": "carousel",
    "caption": "5 cách tăng doanh số cho shop handmade online...",
    "media_urls": [
      "https://cdn.example.com/slide1.jpg",
      "https://cdn.example.com/slide2.jpg"
    ],
    "hashtags": ["#handmade", "#doitay", "#shophandmade"],
    "scheduled_time": "2026-03-23T11:30:00+07:00",
    "first_comment": "Link shop: marketplace.vn",
    "location_tag": "Ho Chi Minh City",
    "cross_post": false
  }
}
```

Lặp lại cho mỗi platform với adapted content:

```json
{
  "action": "schedule_content",
  "params": {
    "content_id": "content_001_fb",
    "platform": "facebook",
    "post_type": "image_post",
    "caption": "Shop handmade muốn tăng doanh số?...",
    "media_urls": ["https://cdn.example.com/hero.jpg"],
    "scheduled_time": "2026-03-23T13:00:00+07:00",
    "target_audience": "page_followers",
    "boost_eligible": true
  }
}
```

### Bước 5 — Queue Management

```
QUEUE RULES:
  - Minimum gap giữa 2 posts trên cùng platform: 4 giờ
  - Maximum posts per day: Instagram 2, Facebook 2, Twitter 5, LinkedIn 1, TikTok 2
  - Never schedule during "avoid_dates" (holidays, sensitive events)
  - Auto-reschedule nếu conflict detected
  - Buffer time: Schedule ít nhất 1 giờ trước posting time

PRIORITY SYSTEM:
  P1: Time-sensitive (event, sale, trending topic) → override existing schedule
  P2: Planned calendar content → default scheduling
  P3: Evergreen content → fill gaps when no P1/P2
```

### Bước 6 — Post-Publish Monitoring

Sau khi post được publish:
- Verify post went live successfully
- Monitor first 30 minutes engagement
- Reply to early comments within 1 hour
- Flag posts with unusually low/high engagement

## Output format (JSON)

```json
{
  "skill": "G9_scheduling_ops",
  "calendar_week": "2026-W13",
  "total_posts_scheduled": 18,
  "platform_breakdown": {
    "instagram": {
      "posts_scheduled": 5,
      "types": {"carousel": 2, "reel": 2, "story": 1},
      "times": ["2026-03-23T11:30", "2026-03-24T19:00", "..."]
    },
    "facebook": {
      "posts_scheduled": 4,
      "types": {"image_post": 2, "video": 1, "reel": 1},
      "times": ["2026-03-23T13:00", "2026-03-25T12:30", "..."]
    },
    "twitter": {
      "posts_scheduled": 5,
      "types": {"tweet": 3, "thread": 2},
      "times": ["2026-03-23T08:30", "2026-03-23T12:00", "..."]
    },
    "linkedin": {
      "posts_scheduled": 2,
      "types": {"post": 1, "article": 1},
      "times": ["2026-03-24T07:30", "2026-03-26T17:00"]
    },
    "tiktok": {
      "posts_scheduled": 2,
      "types": {"video": 2},
      "times": ["2026-03-25T19:30", "2026-03-27T12:00"]
    }
  },
  "content_mix": {
    "educational": 6,
    "promotional": 3,
    "entertainment": 5,
    "community": 4
  },
  "schedule_status": [
    {
      "content_id": "content_001",
      "platform": "instagram",
      "scheduled_time": "2026-03-23T11:30:00+07:00",
      "status": "scheduled",
      "post_type": "carousel"
    }
  ],
  "conflicts_resolved": [],
  "gaps_identified": [
    {"platform": "instagram", "date": "2026-03-28", "recommendation": "Add evergreen content"}
  ],
  "next_week_prep": {
    "content_needed": 18,
    "content_ready": 12,
    "content_to_create": 6
  }
}
```

## Platform Adaptations

- **Twitter/X**: Schedule tweets và threads. Optimal frequency: 3-5 tweets/ngày. Retweet/quote tweet cũ có thể schedule. Thread scheduling cần post tweet 1 trước, replies sau. Pin important tweets manually.
- **Instagram**: Schedule Feed posts, Reels, và Stories (Stories through Meta Business Suite). Carousel = schedule all slides together. Reels = upload video + caption + cover image. First comment scheduling cho hashtags. Instagram Shopping tags nếu applicable.
- **Facebook**: Schedule Page posts, Reels, Stories, và Group posts (admin only). Event posts scheduling. Boost scheduling cho promoted content. Cross-post to Instagram có thể nhưng recommended schedule riêng để optimize per platform. Live scheduling cho pre-promotion.
- **LinkedIn**: Schedule posts và articles. Company page vs personal profile scheduling. Event scheduling. Newsletter scheduling. Document/carousel post scheduling.
- **TikTok**: Schedule videos qua TikTok Creator Tools. Trending sound cần check validity tại thời điểm posting. Duet/Stitch scheduling limited.

## Quy tắc

1. **Consistency > perfection** — Đăng đều đặn theo schedule quan trọng hơn chờ content hoàn hảo. Gaps trong schedule mất algorithm favor.
2. **Instagram và Facebook là priority** — Schedule 2 platform này trước. Nếu thiếu content, các platform khác có thể skip, 2 này không skip.
3. **Never post same content same time** — Stagger ít nhất 2 giờ giữa platforms. Mỗi platform nhận adapted version.
4. **Respect platform frequency limits** — Over-posting bị penalize. Under-posting bị quên. Theo đúng frequency targets.
5. **Buffer time** — Schedule ít nhất 24 giờ trước. Để thời gian review và adjust.
6. **Holiday awareness** — Không schedule promotional content vào ngày lễ nhạy cảm. Có content phù hợp cho ngày lễ.
7. **Analytics-driven timing** — Sau 4 tuần, chuyển từ generic peak times sang data-driven optimal times từ platform analytics.
8. **Content queue never empty** — Luôn có ít nhất 3 ngày content trong queue. Alert khi queue < 2 ngày.
9. **Emergency override protocol** — Nếu có crisis/trending topic, có thể cancel scheduled posts và thay bằng relevant content.
10. **Cross-reference với G1 (Engagement)** — Sau khi post publish, trigger G1 để engage với early comments.
