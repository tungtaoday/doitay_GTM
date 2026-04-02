---
code: R3
name: Influencer Mapping
type: api
category: research
description: "Xác định và phân loại influencers theo ngành dọc, đánh giá mức độ ảnh hưởng thực tế trên từng nền tảng"
tools_required:
  - mcp__marketing-tools__find_influencers
  - mcp__marketing-tools__analyze_profile
  - mcp__marketing-tools__measure_influence
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

Xây dựng bản đồ influencer toàn diện trong một vertical cụ thể trên 6 nền tảng (Twitter, Instagram, Facebook, LinkedIn, Reddit, YouTube). Phân loại influencers theo tier, đánh giá mức độ ảnh hưởng thực tế (không chỉ follower count), và xác định những người có khả năng tác động đến quyết định mua/bán của supply và demand side. Kết quả phục vụ cho Distribution Engine và Cold Start Plan.

## Input cần có

- **vertical**: Ngành/lĩnh vực cần mapping (ví dụ: "thủ công mỹ nghệ", "food delivery")
- **geography**: Khu vực địa lý mục tiêu
- **target_audience**: Mô tả audience mà influencer cần reach (supply side, demand side, hoặc cả hai)
- **platforms_priority**: Thứ tự ưu tiên nền tảng (ví dụ: ["Instagram", "YouTube", "Facebook"])
- **budget_range**: Ngân sách dự kiến cho influencer marketing (nếu có)
- **content_themes**: Chủ đề nội dung liên quan (3-5 themes)
- **exclude_list**: Influencers đã biết cần loại trừ (nếu có)

## Quy trình thực hiện

1. **Discovery - Tìm kiếm ứng viên**
   - Twitter: Tìm accounts có authority cao trong vertical qua tweet engagement, list memberships, và retweet networks
   - Instagram: Scan hashtags liên quan, explore page, và tagged posts để tìm creators có engagement thực
   - Facebook: Xác định Group admins có ảnh hưởng, Page owners với organic reach cao, và Live streamers trong vertical
   - LinkedIn: Tìm thought leaders qua article engagement, connection networks, và industry group activity
   - Reddit: Xác định power users và moderators trong relevant subreddits
   - YouTube: Tìm creators qua search rankings, subscriber growth rate, và comment engagement

2. **Profiling - Xây dựng hồ sơ chi tiết**
   - Thu thập metrics: followers, engagement rate, posting frequency, content themes
   - Phân tích audience demographics và overlap với target segment
   - Kiểm tra authenticity: bot followers, fake engagement, bought comments
   - Map cross-platform presence (cùng influencer trên nhiều nền tảng)

3. **Tiering - Phân loại theo mức ảnh hưởng**
   - Tier 1 - Mega (>500K followers): Brand awareness, khó tiếp cận, chi phí cao
   - Tier 2 - Macro (100K-500K): Balance giữa reach và engagement
   - Tier 3 - Micro (10K-100K): Engagement cao, trust cao, chi phí hợp lý
   - Tier 4 - Nano (1K-10K): Hyper-targeted, authentic, phù hợp cold start
   - Tier 5 - Community Leaders: Admins, moderators, power users (không cần follower count cao)

4. **Influence Scoring**
   - Tính Influence Score = Reach (1-5) x Engagement Quality (1-5) x Audience Fit (1-5) x Content Relevance (1-5)
   - Điều chỉnh theo platform-specific metrics

5. **Network Mapping**
   - Vẽ quan hệ giữa các influencers (ai follow ai, ai collab với ai)
   - Xác định clusters và gatekeepers
   - Tìm "bridge influencers" kết nối nhiều communities

6. **Opportunity Assessment**
   - Đánh giá khả năng tiếp cận và hợp tác
   - Ước tính chi phí theo tier và platform
   - Xác định influencers phù hợp nhất cho từng giai đoạn (cold start vs scale)

## Output format

```json
{
  "mapping_id": "R3-2026-03-22-001",
  "vertical": "string",
  "geography": "string",
  "total_influencers_mapped": 85,
  "tier_breakdown": {
    "mega": 3,
    "macro": 8,
    "micro": 25,
    "nano": 35,
    "community_leaders": 14
  },
  "influencers": [
    {
      "influencer_id": "INF-001",
      "name": "Display name",
      "platforms": [
        {
          "platform": "Instagram",
          "handle": "@handle",
          "followers": 45000,
          "engagement_rate": 4.2,
          "avg_likes": 1890,
          "avg_comments": 120,
          "posting_frequency": "5 posts/week",
          "top_content_themes": ["theme1", "theme2"],
          "audience_location_match": 78
        }
      ],
      "tier": "micro",
      "influence_score": {
        "reach": 3,
        "engagement_quality": 5,
        "audience_fit": 4,
        "content_relevance": 4,
        "total": 240
      },
      "authenticity_check": {
        "fake_follower_percentage": 8,
        "engagement_authenticity": "high",
        "verified": false
      },
      "audience_overlap_with_target": 72,
      "cross_platform_presence": ["Instagram", "YouTube", "Facebook"],
      "network_connections": ["INF-003", "INF-015"],
      "collaboration_history": ["Brand A", "Brand B"],
      "estimated_cost_per_post": "$200-400",
      "best_use_case": "cold_start | awareness | conversion | community_building",
      "contact_channel": "DM Instagram hoặc email qua bio",
      "notes": "Ghi chú đặc biệt về influencer này"
    }
  ],
  "network_clusters": [
    {
      "cluster_name": "Tên nhóm/cộng đồng",
      "members": ["INF-001", "INF-003", "INF-007"],
      "gatekeeper": "INF-003",
      "primary_platform": "Instagram",
      "cluster_reach": 250000,
      "theme": "Chủ đề chính của cluster"
    }
  ],
  "recommended_strategy": {
    "cold_start_phase": {
      "target_influencers": ["INF-012", "INF-025", "INF-033"],
      "rationale": "Nano và micro influencers có engagement cao nhất trong target segment",
      "estimated_budget": "$500-1000",
      "expected_reach": 15000
    },
    "growth_phase": {
      "target_influencers": ["INF-005", "INF-008"],
      "rationale": "Macro influencers để mở rộng awareness sau khi có traction",
      "estimated_budget": "$2000-5000",
      "expected_reach": 200000
    }
  },
  "gaps_identified": [
    "Không có influencer mạnh trên LinkedIn cho vertical này",
    "Supply side thiếu representation trong influencer landscape"
  ]
}
```

## Business Type Adaptations

- **Digital Product**: Ưu tiên YouTube reviewers và Twitter tech influencers. Tìm developers/creators trên GitHub và Product Hunt có social following. LinkedIn thought leaders cho B2B SaaS. Reddit power users trong tech subreddits thường có ảnh hưởng không tỷ lệ với follower count.
- **Service**: Tập trung vào Facebook Group admins và Instagram local influencers. Micro và nano influencers thường hiệu quả nhất vì services là local. YouTube "how-to" creators giúp build trust. Tìm community leaders offline đang có online presence (hội nhóm nghề nghiệp).
- **Physical Product**: Instagram và YouTube là hai nền tảng quan trọng nhất. Tìm unboxing/review creators trên YouTube, lifestyle influencers trên Instagram. Facebook Live sellers có thể vừa là influencer vừa là potential supply. Chú ý đến influencers có shoppable content.
- **Marketplace**: Map riêng influencers cho supply side và demand side. Community leaders (Facebook Group admins, Reddit mods) thường là "bridge" giữa hai sides. Nano influencers phù hợp nhất cho cold start vì có trust cao trong niche communities. Tìm influencers đang tự làm marketplace thủ công (bán hàng qua DM, group).

## Quy tắc

- Influence Score phải dựa trên engagement thực tế, KHÔNG dựa trên follower count đơn thuần.
- Bắt buộc chạy authenticity check trước khi đưa influencer vào danh sách recommend. Fake follower > 25% = loại.
- Không bao giờ recommend influencer chỉ dựa trên 1 nền tảng. Phải check cross-platform presence.
- Phân biệt rõ influencers cho supply side acquisition và demand side acquisition.
- Cập nhật bản đồ influencer mỗi tháng vì landscape thay đổi nhanh.
- Ước tính chi phí phải dựa trên market rates thực tế, không phải rate card chính thức.
- Community leaders (Group admins, mods) có giá trị đặc biệt cho marketplace cold start. Không bỏ qua chỉ vì follower count thấp.
- Ghi nhận influencers đã từng promote competitors. Họ có thể là cơ hội hoặc rủi ro.
- Respect privacy: không thu thập thông tin cá nhân ngoài những gì public trên profile.
