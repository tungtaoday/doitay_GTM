---
code: R5
name: Content Benchmarking
type: api
category: research
description: "Đánh giá hiệu suất nội dung trong ngành để xác định content gaps, best practices, và cơ hội nội dung chưa được khai thác"
tools_required:
  - mcp__marketing-tools__benchmark_content
  - mcp__marketing-tools__analyze_top_content
  - mcp__marketing-tools__content_gap_analysis
output_format: json
platforms:
  - Twitter
  - Instagram
  - Facebook
  - LinkedIn
  - Reddit
  - YouTube
---

## Mục đích

Phân tích và đo lường hiệu suất nội dung trong một vertical cụ thể trên 6 nền tảng (Twitter, Instagram, Facebook, LinkedIn, Reddit, YouTube). Xác định content formats, topics, và strategies nào đang hoạt động tốt nhất, tìm ra content gaps chưa được khai thác, và thiết lập benchmarks để đo lường hiệu suất nội dung của mình. Skill này phục vụ trực tiếp cho Distribution Engine và CVP communication strategy.

## Input cần có

- **vertical**: Ngành/lĩnh vực cần benchmark
- **geography**: Khu vực địa lý mục tiêu
- **benchmark_accounts**: Danh sách 10-20 accounts cần benchmark (competitors + industry leaders + adjacent verticals)
- **platforms**: Nền tảng cần phân tích (mặc định: tất cả 6)
- **time_range**: Khoảng thời gian phân tích (mặc định: "30d", tùy chọn: "7d", "90d")
- **content_types**: Loại nội dung cần focus (all, video, image, text, stories, live)
- **own_accounts**: Accounts của mình để so sánh (nếu có)

## Quy trình thực hiện

1. **Data Collection - Thu thập dữ liệu nội dung**
   - Twitter: Collect tweets, threads, polls, Spaces recordings. Track impressions, likes, retweets, replies, quote tweets, bookmark estimates.
   - Instagram: Thu thập Posts, Reels, Stories (nếu public), Guides. Track likes, comments, saves, shares, Reel views.
   - Facebook: Collect Page posts, Group posts, Lives, Reels. Track reactions, comments, shares, video views.
   - LinkedIn: Thu thập articles, posts, documents, newsletters. Track likes, comments, reposts, impression estimates.
   - Reddit: Collect posts và comments trong relevant subreddits. Track upvotes, comment count, awards, cross-posts.
   - YouTube: Thu thập videos, Shorts, Community posts. Track views, likes, comments, watch time estimate, subscriber gain per video.

2. **Content Categorization**
   - Phân loại theo format: text, image, carousel, video short (<60s), video long (>60s), live, stories, thread, poll
   - Phân loại theo topic/theme: educational, promotional, community, behind-the-scenes, user-generated, news
   - Phân loại theo intent: awareness, engagement, conversion, retention
   - Gắn tag call-to-action type: link click, comment, share, save, follow, purchase

3. **Performance Analysis**
   - Tính engagement rate trung bình theo format, topic, và platform
   - Xác định top 10% performing content (outliers) và phân tích tại sao
   - Xác định bottom 10% và phân tích tại sao fail
   - Tính benchmark metrics cho mỗi platform

4. **Pattern Recognition**
   - Xác định posting time/day patterns của top performers
   - Phân tích content length patterns (caption length, video duration)
   - Tìm visual patterns (color, style, thumbnail)
   - Map content series và recurring formats thành công

5. **Gap Analysis**
   - So sánh topics được cover vs topics có demand (từ search data và questions)
   - Xác định formats chưa ai dùng trong vertical
   - Tìm platforms có demand nhưng thiếu quality content
   - Phát hiện audience questions chưa được answered bởi bất kỳ competitor nào

6. **Benchmark Setting**
   - Thiết lập benchmarks cho mỗi metric theo platform
   - Phân tích khoảng cách giữa accounts của mình và industry benchmarks
   - Đề xuất targets thực tế dựa trên data

## Output format

```json
{
  "benchmark_id": "R5-2026-03-22-001",
  "vertical": "string",
  "period": "2026-02-22 to 2026-03-22",
  "accounts_analyzed": 15,
  "total_content_pieces_analyzed": 2500,
  "platform_benchmarks": {
    "twitter": {
      "avg_engagement_rate": 2.3,
      "median_likes": 45,
      "median_retweets": 12,
      "median_replies": 8,
      "top_format": "thread",
      "optimal_posting_time": "8-9 AM, 6-7 PM",
      "optimal_frequency": "2-3 tweets/day",
      "avg_thread_length": 5
    },
    "instagram": {
      "avg_engagement_rate": 4.1,
      "median_likes": 320,
      "median_comments": 25,
      "median_saves": 40,
      "top_format": "reels",
      "optimal_posting_time": "11 AM-1 PM, 7-9 PM",
      "optimal_frequency": "1 post/day + 3-5 stories",
      "reels_avg_views": 5000,
      "carousel_avg_saves": 85
    },
    "facebook": {
      "avg_engagement_rate": 1.8,
      "median_reactions": 55,
      "median_comments": 18,
      "median_shares": 8,
      "top_format": "video",
      "optimal_posting_time": "9-11 AM, 1-3 PM",
      "group_vs_page_engagement": "Groups 3.5x higher"
    },
    "linkedin": {
      "avg_engagement_rate": 3.2,
      "median_likes": 85,
      "median_comments": 15,
      "top_format": "document_carousel",
      "optimal_posting_time": "7-8 AM, 12-1 PM",
      "optimal_frequency": "3-5 posts/week"
    },
    "reddit": {
      "avg_upvote_ratio": 0.82,
      "median_upvotes": 120,
      "median_comments": 35,
      "top_content_type": "detailed_text_post",
      "best_subreddits": ["r/sub1", "r/sub2"],
      "posting_rules_summary": "Mỗi subreddit có rules riêng"
    },
    "youtube": {
      "avg_view_rate": 15,
      "median_views": 3000,
      "median_likes": 150,
      "avg_watch_time_retention": "45%",
      "top_format": "how_to_tutorial",
      "optimal_video_length": "8-12 minutes",
      "shorts_avg_views": 8000,
      "optimal_posting_freq": "2 videos/week"
    }
  },
  "top_performing_content": [
    {
      "rank": 1,
      "platform": "Instagram",
      "account": "@account",
      "content_type": "reels",
      "topic": "Chủ đề",
      "engagement_rate": 12.5,
      "metrics": { "views": 50000, "likes": 3200, "comments": 450, "saves": 800 },
      "why_it_worked": "Phân tích tại sao content này outperform",
      "replicable_elements": ["hook trong 3 giây đầu", "CTA rõ ràng", "trending audio"],
      "url": "link"
    }
  ],
  "content_gaps": [
    {
      "gap": "Mô tả gap cụ thể",
      "evidence": "Có demand (search volume, questions) nhưng không ai đang produce",
      "platforms_affected": ["YouTube", "Instagram"],
      "opportunity_size": "high | medium | low",
      "suggested_format": "Format phù hợp nhất để fill gap",
      "difficulty": "easy | medium | hard"
    }
  ],
  "format_effectiveness_ranking": {
    "twitter": ["thread", "image_with_insight", "poll", "plain_text"],
    "instagram": ["reels", "carousel", "single_image", "stories"],
    "facebook": ["native_video", "link_post_with_commentary", "live", "photo"],
    "linkedin": ["document_carousel", "personal_story", "data_insight", "article"],
    "reddit": ["detailed_text", "image_with_context", "link_with_summary", "AMA"],
    "youtube": ["tutorial", "comparison", "behind_scenes", "shorts"]
  },
  "own_performance_vs_benchmark": {
    "twitter": { "our_engagement": 1.5, "benchmark": 2.3, "gap": "-35%", "priority_action": "Chuyển sang threads thay vì tweets đơn" },
    "instagram": { "our_engagement": 3.0, "benchmark": 4.1, "gap": "-27%", "priority_action": "Tăng Reels frequency, giảm static posts" }
  },
  "actionable_insights": [
    "Threads trên Twitter outperform tweets đơn 3.5x trong vertical này",
    "Instagram Reels dưới 30 giây có engagement gấp đôi Reels dài hơn",
    "Facebook Groups posts có engagement gấp 3.5x so với Page posts",
    "LinkedIn document carousels outperform tất cả format khác 2x"
  ]
}
```

## Business Type Adaptations

- **Digital Product**: Benchmark tutorials và product demos trên YouTube. Twitter threads giải thích features có engagement cao trong tech. LinkedIn document carousels cho B2B. Reddit AMAs và detailed posts build credibility. Instagram Reels cho quick tips/hacks. Focus vào educational content metrics.
- **Service**: Instagram before/after content và portfolio Reels. Facebook Group engagement metrics cho community building. YouTube case studies và testimonials. LinkedIn thought leadership cho B2B services. Benchmark customer success stories across platforms. UGC (user-generated content) là format mạnh nhất.
- **Physical Product**: Instagram aesthetic benchmarks (feed cohesion, Reels product showcase). YouTube unboxing và comparison videos. Facebook Live selling metrics. Pinterest benchmarks nếu relevant. Benchmark shoppable content performance. Carousel posts cho product features outperform trên Instagram.
- **Marketplace**: Benchmark content cho CẢ HAI sides (supply education + demand engagement). Facebook Groups content strategy cho community building. YouTube success stories từ cả supplier và buyer. Instagram showcasing supply quality. LinkedIn cho B2B marketplace credibility. Reddit authentic discussions build trust.

## Quy tắc

- Content Benchmarking là DATA-DRIVEN. Mọi insight phải có số liệu chứng minh, không phải cảm tính.
- Benchmark phải so sánh cùng vertical, cùng geography, cùng account size tier. So sánh account 5K followers với account 500K là vô nghĩa.
- Outlier content (viral) phải được phân tích riêng. Không dùng viral metrics làm benchmark vì không reproducible.
- Engagement rate phải tính theo cùng công thức nhất quán trên mỗi platform.
- Content gaps có giá trị cao nhất khi có evidence từ search data hoặc audience questions. Gap không có demand evidence = assumption.
- Phân biệt vanity metrics (likes) và meaningful metrics (saves, shares, comments, click-throughs). Ưu tiên meaningful metrics trong benchmark.
- Cập nhật benchmarks hàng tháng. Social media algorithms thay đổi liên tục, benchmarks cũ 3 tháng có thể đã outdated.
- Không copy content strategy của competitor top 1. Tìm gaps và whitespace thay vì chạy theo.
- Platform-specific rules phải được respect. Nội dung work trên Instagram không tự động work trên LinkedIn.
