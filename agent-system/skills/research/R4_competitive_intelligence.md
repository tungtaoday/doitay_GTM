---
code: R4
name: Competitive Intelligence
type: api
category: research
description: "Thu thập và phân tích thông tin đối thủ cạnh tranh trên mọi kênh để xác định gaps và cơ hội khác biệt hóa"
tools_required:
  - mcp__marketing-tools__analyze_competitor
  - mcp__marketing-tools__track_competitor_content
  - mcp__marketing-tools__compare_metrics
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

Thu thập, tổng hợp và phân tích hoạt động của đối thủ cạnh tranh trên 6 nền tảng social media (Twitter, Instagram, Facebook, LinkedIn, Reddit, YouTube) và các kênh digital khác. Xác định strategy, strengths, weaknesses, và gaps của competitors để feed vào CVP Architect (Differentiation Matrix) và Devil's Advocate (Copy Test). Skill này cung cấp dữ liệu thực tế để trả lời: "Ai đang làm gì, và họ đang bỏ lỡ điều gì?"

## Input cần có

- **vertical**: Ngành/lĩnh vực cần phân tích
- **competitors**: Danh sách đối thủ cần track (tối thiểu 3, tối đa 10)
  - Mỗi competitor: tên, website, social handles (nếu biết)
- **competitor_types**: Phân loại đối thủ
  - Direct: cùng model, cùng segment
  - Indirect: khác model, cùng customer need
  - Substitute: giải pháp thay thế (kể cả non-digital)
- **analysis_depth**: "quick" (7 ngày) hoặc "deep" (30-90 ngày)
- **focus_areas**: Khía cạnh ưu tiên phân tích (content strategy, pricing, community, product features)

## Quy trình thực hiện

1. **Profile Collection - Thu thập hồ sơ đối thủ**
   - Twitter: Bio, follower count, tweet frequency, engagement rates, pinned tweets, Twitter Spaces activity
   - Instagram: Bio, follower growth, content mix (posts/Reels/Stories), hashtag strategy, visual branding
   - Facebook: Page info, Group size, posting patterns, ad library analysis, Marketplace presence
   - LinkedIn: Company page, employee count/growth, content strategy, job postings (hiring = expanding)
   - Reddit: Brand mentions, official accounts, community engagement, complaints
   - YouTube: Channel stats, video strategy, subscriber growth, comment sentiment

2. **Content Strategy Analysis**
   - Map content pillars của mỗi competitor (họ nói về gì?)
   - Phân tích content format mix (text, image, video, live, stories)
   - Xác định posting frequency và optimal timing
   - Track top-performing content (engagement anomalies)
   - Phân tích hashtag và SEO strategy

3. **Engagement và Community Analysis**
   - So sánh engagement rates across platforms
   - Phân tích comment sentiment trên content của competitor
   - Đánh giá community building efforts (Groups, Discord, Telegram)
   - Track response time và customer service quality trên social

4. **Product và Feature Tracking**
   - Monitor product launches và feature announcements
   - Track pricing changes (từ website + social announcements)
   - Phân tích user reviews và feedback về product
   - Map feature matrix: competitor A có gì, B có gì, gaps ở đâu

5. **Gap Analysis**
   - Xác định customer complaints mà competitors chưa address
   - Tìm segments mà competitors đang ignore hoặc underserve
   - Phát hiện platforms mà competitors absent hoặc weak
   - Map unmet needs từ competitor's user feedback

6. **Threat Assessment**
   - Đánh giá khả năng copy: competitors có thể replicate ta trong bao lâu?
   - Track fundraising và hiring signals (expansion plans)
   - Monitor partnership và M&A signals
   - Assess regulatory positioning

## Output format

```json
{
  "analysis_id": "R4-2026-03-22-001",
  "vertical": "string",
  "analysis_period": "2026-02-22 to 2026-03-22",
  "competitors_analyzed": 5,
  "competitor_profiles": [
    {
      "competitor_id": "COMP-001",
      "name": "Tên đối thủ",
      "type": "direct | indirect | substitute",
      "website": "url",
      "platform_presence": {
        "twitter": {
          "handle": "@handle",
          "followers": 25000,
          "engagement_rate": 2.1,
          "posting_freq": "3 tweets/day",
          "top_content_themes": ["theme1", "theme2"],
          "sentiment_in_replies": "mixed",
          "growth_trend": "+5% monthly"
        },
        "instagram": {
          "handle": "@handle",
          "followers": 45000,
          "engagement_rate": 3.8,
          "content_mix": { "photos": 40, "reels": 35, "stories": 25 },
          "hashtag_strategy": ["#tag1", "#tag2"],
          "growth_trend": "+8% monthly"
        },
        "facebook": {
          "page_followers": 30000,
          "group_members": 12000,
          "posting_freq": "2 posts/day",
          "ad_activity": "active, running 5+ ads",
          "marketplace_presence": true
        },
        "linkedin": {
          "followers": 8000,
          "employee_count": 45,
          "hiring": true,
          "open_positions": ["Product Manager", "Growth Lead"],
          "content_focus": "thought leadership"
        },
        "reddit": {
          "mentioned_in_subreddits": ["r/sub1", "r/sub2"],
          "sentiment": "mixed - praised for X, criticized for Y",
          "official_presence": false
        },
        "youtube": {
          "subscribers": 5000,
          "avg_views": 2000,
          "content_type": "tutorials, product demos",
          "posting_freq": "2 videos/month"
        }
      },
      "content_strategy_summary": "Mô tả strategy tổng thể của competitor",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "recent_moves": [
        {
          "date": "2026-03-15",
          "action": "Launched new feature X",
          "platform": "Twitter announcement + YouTube demo",
          "market_reaction": "Positive, 500+ engagements"
        }
      ],
      "estimated_monthly_budget": {
        "content_production": "$2000-5000",
        "paid_ads": "$5000-10000",
        "influencer": "$1000-3000"
      }
    }
  ],
  "comparative_matrix": {
    "metrics": {
      "total_social_following": { "COMP-001": 113000, "COMP-002": 85000, "COMP-003": 45000 },
      "avg_engagement_rate": { "COMP-001": 2.8, "COMP-002": 4.1, "COMP-003": 5.5 },
      "platform_coverage": { "COMP-001": 6, "COMP-002": 4, "COMP-003": 3 },
      "community_size": { "COMP-001": 12000, "COMP-002": 0, "COMP-003": 3500 }
    },
    "feature_comparison": {
      "feature_a": { "COMP-001": true, "COMP-002": true, "COMP-003": false },
      "feature_b": { "COMP-001": false, "COMP-002": true, "COMP-003": false }
    }
  },
  "gaps_identified": [
    {
      "gap": "Mô tả gap cụ thể",
      "evidence": "Dữ liệu chứng minh gap tồn tại",
      "affected_segment": "Segment bị ảnh hưởng",
      "opportunity_level": "high | medium | low",
      "exploitability": "Khả năng khai thác gap này"
    }
  ],
  "threat_assessment": {
    "copy_risk": {
      "level": "high | medium | low",
      "fastest_copier": "COMP-002",
      "estimated_copy_time": "3-6 months",
      "what_they_cant_copy": "Yếu tố structural không thể replicate"
    },
    "expansion_signals": [
      "COMP-001 đang tuyển Growth Lead - có thể mở rộng segment mới"
    ],
    "partnership_signals": [
      "COMP-003 vừa partner với Platform X"
    ]
  },
  "recommendations_for_differentiation": [
    "Gap 1 có thể khai thác bằng cách...",
    "Platform Y là nơi tất cả competitors yếu, cơ hội để dominate"
  ]
}
```

## Business Type Adaptations

- **Digital Product**: Tập trung vào feature comparison và product roadmap tracking. Monitor Twitter cho product announcements, LinkedIn cho hiring signals (đội ngũ đang build gì?), YouTube cho product demos. Track Product Hunt launches và GitHub activity nếu là open-source. Reddit threads thường chứa honest comparisons giữa các tools.
- **Service**: Phân tích Google Reviews và Facebook Reviews là critical. Track Instagram portfolio posts của service competitors. Facebook Groups là nơi competitors interact trực tiếp với customers. Monitor pricing changes qua website tracking. LinkedIn cho B2B service competitors.
- **Physical Product**: Instagram và YouTube là battlefield chính. Track visual branding strategy, unboxing content, và influencer partnerships. Facebook Marketplace pricing analysis. Monitor Amazon/Shopee/Tiki listings nếu applicable. Reddit cho honest product comparisons.
- **Marketplace**: Phân tích cách competitors giải quyết chicken-egg problem. Track supply side acquisition tactics (Facebook Groups, LinkedIn outreach). Analyze demand side content strategy (Instagram, YouTube). Monitor take rate và pricing model changes. Reddit và Twitter cho user complaints về marketplace experience.

## Quy tắc

- Competitive Intelligence chỉ THU THẬP VÀ SO SÁNH dữ liệu. Recommendations phải dựa trên gaps có evidence, không phải opinion.
- Luôn phân loại competitors thành 3 nhóm (direct, indirect, substitute). Không bỏ qua substitutes.
- Không sử dụng phương pháp bất hợp pháp hoặc vi phạm đạo đức để thu thập thông tin (no scraping private data, no fake accounts).
- Mỗi strength/weakness phải có evidence cụ thể, không phải assumption.
- Update competitive landscape ít nhất 2 lần/tháng. Competitors thay đổi nhanh.
- Track cả "non-competitors" đang adjacent có thể enter market (Google, Facebook, big platforms).
- Hiring signals là leading indicators quan trọng. Competitor tuyển Growth Lead = sắp expand.
- Ads Library (Facebook, LinkedIn) là nguồn intelligence công khai cực kỳ giá trị. Luôn check.
- Copy Test output phải được cross-validate với Devil's Advocate trước khi kết luận.
- Không bao giờ underestimate substitutes. Workaround hiện tại của customer (Excel, Zalo group, gọi điện) là competitor nguy hiểm nhất.
