---
code: G3
name: Profile Optimization
type: reasoning
category: growth
description: Tối ưu hóa bio, profile, link và thông tin hiển thị trên tất cả các nền tảng để tăng conversion từ visitor thành follower/user.
tools_required: []
output_format: json
---

## Mục đích

Phân tích và đề xuất tối ưu hóa profile trên mọi nền tảng social media và marketplace. Profile là "landing page" đầu tiên mà potential users thấy. Một profile tối ưu tăng follow rate 2-5x và click-through rate đến marketplace 3-10x.

## Input cần có

```yaml
brand_name: "[tên thương hiệu/marketplace]"
marketplace_url: "[URL chính]"
value_proposition: "[1 câu CVP]"
target_segments:
  - "[segment 1 - behavioral description]"
  - "[segment 2 - behavioral description]"
tone_of_voice: "[professional / friendly / bold / expert]"
platforms:
  - platform: instagram
    current_bio: "[bio hiện tại]"
    current_link: "[link hiện tại]"
    profile_image: "[mô tả]"
  - platform: facebook
    current_bio: "[bio hiện tại]"
    current_link: "[link hiện tại]"
    cover_image: "[mô tả]"
  - platform: twitter
    current_bio: "[bio hiện tại]"
  - platform: linkedin
    current_headline: "[headline hiện tại]"
    current_summary: "[summary hiện tại]"
  - platform: tiktok
    current_bio: "[bio hiện tại]"
unique_selling_points:
  - "[USP 1]"
  - "[USP 2]"
  - "[USP 3]"
```

## Quy trình thực hiện

### Bước 1 — Profile Audit

Đánh giá mỗi platform profile theo 5 tiêu chí:

| Tiêu chí | Mô tả | Score (1-5) |
|-----------|--------|-------------|
| Clarity | Visitor hiểu ngay bạn làm gì trong 3 giây? | |
| Relevance | Profile nói đúng language của target segment? | |
| CTA | Có call-to-action rõ ràng không? | |
| Trust signals | Có social proof, credentials, verify? | |
| Visual consistency | Avatar, cover, color scheme nhất quán? | |

Profile Score = Tổng / 25 x 100

### Bước 2 — Bio Framework

Mỗi bio phải chứa 4 elements (thứ tự này):

```
Line 1: WHAT — Bạn làm gì / marketplace giải quyết vấn đề gì
Line 2: WHO — Cho ai (target segment bằng behavioral language)
Line 3: PROOF — Social proof hoặc unique differentiator
Line 4: CTA — Hành động tiếp theo (click link, DM, etc.)
```

Ví dụ:
```
Kết nối thợ handmade với người mua yêu đồ thủ công
Cho những ai muốn sản phẩm unique, không đại trà
500+ thợ | 2000+ sản phẩm | Ship toàn quốc
Khám phá ngay (link below)
```

### Bước 3 — Link Strategy

```
OPTION A — Link-in-bio tool (Linktree, Beacons, Stan Store):
  Pro: Nhiều destinations
  Con: Extra click, lower conversion
  Khi nào: Nhiều campaigns chạy song song

OPTION B — Direct marketplace link:
  Pro: Fastest path to conversion
  Con: Chỉ 1 destination
  Khi nào: Focus vào 1 action duy nhất

OPTION C — Custom landing page:
  Pro: Full control, tracking
  Con: Cần build và maintain
  Khi nào: Serious about conversion optimization

RECOMMENDATION: Phase 1 dùng Option B. Phase 2+ dùng Option C.
```

### Bước 4 — Visual Identity Checklist

```
[ ] Avatar: Logo hoặc founder face (face converts 20% better)
[ ] Cover/Banner: CVP + visual của marketplace
[ ] Highlight covers (Instagram): Consistent color scheme
[ ] Color palette: Max 3 colors, consistent across platforms
[ ] Profile image: Minimum 400x400px, clear on mobile
[ ] Cover image specs: Facebook 820x312, LinkedIn 1128x191, Twitter 1500x500
```

### Bước 5 — Platform-Specific Optimization

Tối ưu từng platform theo đặc thù riêng (xem Platform Adaptations).

### Bước 6 — A/B Testing Plan

```
Week 1-2: Bio version A vs B (thay đổi CTA)
Week 3-4: Profile image test (logo vs face)
Week 5-6: Link strategy test (direct vs link-in-bio)
Metric: Profile visit -> follow rate, Profile visit -> link click rate
```

## Output format (JSON)

```json
{
  "skill": "G3_profile_optimization",
  "audit_date": "2026-03-22",
  "platform_audits": [
    {
      "platform": "instagram",
      "current_score": 56,
      "optimized_bio": "Line 1: ...\nLine 2: ...\nLine 3: ...\nLine 4: ...",
      "link_recommendation": "direct_marketplace_link",
      "visual_changes": [
        "Update avatar to founder photo",
        "Create 5 highlight covers with brand colors",
        "Add marketplace preview to Stories highlights"
      ],
      "expected_improvement": "+40% follow rate"
    },
    {
      "platform": "facebook",
      "current_score": 48,
      "optimized_bio": "...",
      "cover_image_recommendation": "...",
      "cta_button": "Shop Now -> marketplace URL",
      "expected_improvement": "+35% page engagement"
    }
  ],
  "cross_platform_consistency": {
    "avatar": "consistent",
    "bio_message": "needs_alignment",
    "color_scheme": "inconsistent",
    "recommendations": ["..."]
  },
  "ab_test_plan": [
    {
      "test": "Bio CTA variation",
      "duration": "2 weeks",
      "metric": "profile_visit_to_follow_rate"
    }
  ],
  "priority_actions": [
    {"action": "...", "platform": "instagram", "impact": "high", "effort": "low"},
    {"action": "...", "platform": "facebook", "impact": "high", "effort": "low"}
  ]
}
```

## Platform Adaptations

- **Twitter/X**: Bio 160 ký tự. Dùng keywords searchable. Pinned tweet = extended bio. Header image = CVP visual. Location field = marketplace geography.
- **Instagram**: Bio 150 ký tự. Tận dụng name field cho searchable keywords (không chỉ brand name). Story Highlights = category showcase. Link in bio critical. Business account cho analytics và CTA buttons. Reels pinned = best content showcase.
- **Facebook**: Page bio dài hơn, tận dụng About section đầy đủ. Cover photo = CVP rõ ràng. CTA button (Shop Now / Sign Up / Learn More) phải set đúng. Tối ưu Page Info cho Facebook Search. Pinned post = latest campaign hoặc intro.
- **LinkedIn**: Headline 220 ký tự = quan trọng nhất. Summary section = storytelling space. Featured section = showcase marketplace. Banner = professional CVP.
- **TikTok**: Bio 80 ký tự, cực ngắn. Link chỉ available khi 1000+ followers. Pinned videos = demo marketplace. Username searchable.

## Quy tắc

1. **3-second rule** — Visitor phải hiểu bạn làm gì trong 3 giây đầu tiên khi vào profile.
2. **Mobile-first** — 90%+ users xem profile trên mobile. Preview mọi thay đổi trên mobile trước.
3. **Consistency across platforms** — Cùng avatar, cùng core message, cùng color scheme. Khác format nhưng cùng identity.
4. **Instagram và Facebook là ưu tiên số 1** — Tối ưu 2 platform này trước, sau đó mới đến platform khác.
5. **Update quarterly** — Profile không phải set-and-forget. Review và update mỗi quý theo marketplace stage.
6. **No jargon** — Dùng ngôn ngữ của customer, không dùng ngôn ngữ nội bộ.
7. **Social proof > claims** — "500+ thợ đã tham gia" mạnh hơn "Nền tảng handmade tốt nhất".
8. **Track profile metrics** — Profile visits, follow rate, link clicks. Nếu không measure, không improve.
