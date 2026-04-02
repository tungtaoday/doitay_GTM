---
code: G10
name: Trend Riding
type: api
category: growth
description: Quét và phân tích trending topics trên các nền tảng để tạo content kịp thời, tận dụng sóng viral cho marketplace visibility.
tools_required:
  - mcp__marketing-tools__scan_trends
output_format: json
---

## Mục đích

Liên tục scan trending topics, hashtags, sounds, và conversations trên tất cả các nền tảng social media. Đánh giá relevance với marketplace vertical và đề xuất cách "ride the trend" để tăng organic reach. Speed là yếu tố quyết định — trend window thường chỉ 24-72 giờ.

## Input cần có

```yaml
marketplace_vertical: "[vertical]"
marketplace_name: "[tên]"
brand_voice: "[professional / playful / bold / expert]"
content_capabilities:
  can_produce_video: "[yes/no]"
  turnaround_time_hours: "[số giờ từ idea đến publish]"
  team_available: "[who can create content quickly]"
platforms_to_scan:
  - instagram
  - facebook
  - twitter
  - tiktok
  - google_trends
  - reddit
scan_keywords:
  primary: ["[keywords trực tiếp liên quan vertical]"]
  adjacent: ["[keywords liên quan gián tiếp]"]
  cultural: ["[keywords văn hóa VN, memes, events]"]
risk_tolerance: "[conservative / moderate / aggressive]"
scan_frequency: "[hourly / every_4h / daily]"
```

## Quy trình thực hiện

### Bước 1 — Trend Scanning

Sử dụng `mcp__marketing-tools__scan_trends` để quét:

```json
{
  "action": "scan_trends",
  "params": {
    "platforms": ["instagram", "facebook", "twitter", "tiktok", "google_trends"],
    "regions": ["VN", "global"],
    "categories": ["all", "vertical_specific"],
    "keywords_filter": ["handmade", "craft", "DIY"],
    "min_velocity": "rising",
    "time_range": "24h",
    "include_hashtags": true,
    "include_sounds": true,
    "include_formats": true
  }
}
```

### Bước 2 — Trend Classification

Phân loại mỗi trend detected:

```
TYPE A — VERTICAL TREND (Trực tiếp liên quan đến marketplace vertical)
  Ví dụ: Nếu marketplace handmade → trending topic về "mua hàng Việt"
  Urgency: NGAY LẬP TỨC (< 4 giờ)
  Effort: High quality content

TYPE B — CULTURAL TREND (Có thể liên kết với marketplace)
  Ví dụ: Meme viral → twist cho marketplace context
  Urgency: NHANH (< 12 giờ)
  Effort: Medium — creative twist cần thiết

TYPE C — FORMAT TREND (Trending content format/template)
  Ví dụ: New Instagram Reel format, TikTok challenge
  Urgency: 24-48 giờ
  Effort: Medium — adapt format cho marketplace content

TYPE D — NEWSJACKING (Breaking news có thể liên quan)
  Ví dụ: Regulation mới ảnh hưởng vertical
  Urgency: < 2 giờ nếu relevant
  Effort: Low-medium — commentary/analysis
  Caution: HIGH RISK nếu sensitive topic
```

### Bước 3 — Relevance & Risk Assessment

**Trend Score:**
```
Trend Score = Relevance (1-5) × Velocity (1-5) × Brand Fit (1-5) × Timeliness (1-5)

≥ 200: RIDE IT — Drop everything, create content NOW
100-199: CONSIDER — Create content if capacity allows
< 100: SKIP — Not worth the effort
```

**Risk Assessment:**

```
LOW RISK: Evergreen trends, positive topics, industry trends
MEDIUM RISK: Cultural memes, pop culture references
HIGH RISK: Political topics, controversial figures, sensitive events
BLOCK: Natural disasters, tragedies, religious/ethnic topics

Rule: If risk_tolerance = "conservative", only ride LOW RISK trends.
```

### Bước 4 — Content Ideation (per trend)

```
TREND: [trend name]
ANGLE: [how to connect trend to marketplace]
CONTENT FORMAT: [reel / post / story / thread / carousel]
PLATFORM PRIORITY: [which platform first — where trend is hottest]
HOOK: [first 3 seconds / first line]
CTA: [what we want viewer to do]
PRODUCTION TIME: [estimated hours]
PUBLISH DEADLINE: [timestamp — after this, trend is dead]
```

### Bước 5 — Rapid Content Production & Scheduling

Nếu trend score >= 200, trigger ngay:
1. Content brief → creative team (hoặc AI generation)
2. Review trong 30 phút (không perfectionism)
3. Schedule qua G9 hoặc publish immediately
4. Cross-post adapted versions to other platforms within 2 giờ

### Bước 6 — Trend Performance Tracking

Sau 48 giờ, measure:
```
  - Reach vs average post reach (target: >3x average)
  - Engagement rate vs average (target: >2x average)
  - Profile visits spike
  - Follower growth attributed
  - Marketplace traffic from trend content
```

## Output format (JSON)

```json
{
  "skill": "G10_trend_riding",
  "scan_timestamp": "2026-03-22T10:00:00+07:00",
  "trends_detected": [
    {
      "trend_id": "trend_001",
      "trend_name": "#MuaHangViet movement",
      "type": "A_vertical",
      "platforms_trending": ["facebook", "instagram", "tiktok"],
      "velocity": "rising_fast",
      "estimated_peak": "2026-03-23",
      "relevance_score": 5,
      "velocity_score": 4,
      "brand_fit_score": 5,
      "timeliness_score": 4,
      "trend_score": 400,
      "risk_level": "low",
      "recommendation": "RIDE_IT",
      "content_idea": {
        "angle": "Showcase local artisans on marketplace as part of #MuaHangViet",
        "format": "instagram_reel_and_facebook_reel",
        "hook": "Bạn có biết thợ handmade VN giỏi thế nào?",
        "cta": "Khám phá tại [marketplace link]",
        "production_time_hours": 3,
        "publish_deadline": "2026-03-22T18:00:00+07:00"
      }
    },
    {
      "trend_id": "trend_002",
      "trend_name": "Capybara meme format",
      "type": "B_cultural",
      "platforms_trending": ["instagram", "tiktok"],
      "velocity": "peaking",
      "trend_score": 150,
      "risk_level": "low",
      "recommendation": "CONSIDER",
      "content_idea": {
        "angle": "Capybara chill = cảm giác khi tìm được thợ handmade perfect",
        "format": "instagram_reel",
        "production_time_hours": 1
      }
    },
    {
      "trend_id": "trend_003",
      "trend_name": "Political controversy XYZ",
      "type": "D_newsjacking",
      "trend_score": 95,
      "risk_level": "high",
      "recommendation": "SKIP",
      "skip_reason": "High risk, low brand relevance"
    }
  ],
  "action_plan": [
    {
      "priority": 1,
      "trend_id": "trend_001",
      "action": "Create Reel within 3 hours",
      "assigned_to": "content_team",
      "deadline": "2026-03-22T13:00:00+07:00",
      "platforms": ["instagram", "facebook", "tiktok"]
    },
    {
      "priority": 2,
      "trend_id": "trend_002",
      "action": "Create quick meme post if capacity",
      "deadline": "2026-03-22T20:00:00+07:00",
      "platforms": ["instagram"]
    }
  ],
  "trends_skipped": 1,
  "next_scan": "2026-03-22T14:00:00+07:00",
  "weekly_trend_performance": {
    "trends_ridden": 5,
    "avg_reach_multiplier": "3.2x",
    "best_performing_trend": "trend_001",
    "follower_growth_from_trends": 120,
    "marketplace_traffic_from_trends": 340
  }
}
```

## Platform Adaptations

- **Twitter/X**: Trending Topics tab là signal mạnh nhất. Twitter Moments cho breaking trends. Hashtag trending velocity measurable. Newsjacking works best on Twitter — quick commentary. Threads cho deep-dive trend analysis.
- **Instagram**: Explore page trends. Reels trending audio/effects là key signal. Hashtag trending detection. Instagram's algorithm boosts Reels that use trending audio sớm. Story trends (templates, challenges). Collab Reels để ride trend cùng influencer. Broadcast Channel cho trend alerts đến followers.
- **Facebook**: Facebook Watch trending videos. Facebook Reels trending sounds (shared with Instagram). Group trending discussions. News Feed trending topics. Facebook Live cho real-time trend commentary. Reels cross-posted từ Instagram có thể leverage cùng trending sound.
- **LinkedIn**: Trending articles và hashtags. Niche professional trends. Industry news cycle. LinkedIn News curated trends. Thought leadership response to trends performs well.
- **TikTok**: Discover page = trend epicenter. Trending sounds, effects, hashtags change daily. TikTok trends often originate here before spreading to Instagram/Facebook. Creative Center cho trend data.
- **Google Trends**: Search interest trends. Seasonal patterns. Regional breakouts. Useful for content planning, not real-time.
- **Reddit**: Subreddit-specific trending. r/all for viral content detection. Comments reveal sentiment. Trends often start on Reddit before mainstream.

## Quy tắc

1. **Speed > perfection** — Trend content 80% quality nhưng đăng kịp thời >> 100% quality nhưng trễ 2 ngày. Trend chết nhanh.
2. **Instagram và Facebook Reels là priority format** — Reels format được boost bởi cả Instagram và Facebook algorithm. Nếu chỉ kịp làm 1 content, làm Reel cho cả 2 platform.
3. **Always connect to marketplace** — Trend content không phải entertainment thuần. Phải có bridge về marketplace, dù subtle.
4. **Risk before speed** — Dù cần nhanh, vẫn phải check risk assessment. 1 bad take có thể destroy trust built over months.
5. **Don't force it** — Nếu trend không naturally connect được với marketplace, SKIP. Forced connection trông cringe.
6. **Scan ít nhất 2x/ngày** — Morning scan (8am) và afternoon scan (2pm). Trend window ngắn.
7. **Track trend ROI** — Trend content phải measure riêng. Nếu trend riding không tạo follower growth hoặc traffic, adjust strategy.
8. **Learn from misses** — Weekly review: Trends nào mình bỏ lỡ? Tại sao? Improve scanning coverage.
9. **Credit original creators** — Nếu dùng trend format/idea từ creator khác, credit họ. Community respects this.
10. **Evergreen > trend for base content** — Trend riding supplement, không thay thế. 70% content nên evergreen, 30% trend-based.
