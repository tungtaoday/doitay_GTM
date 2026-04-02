---
code: G8
name: Referral & Partnership
type: reasoning
category: growth
description: Thiết kế chiến lược referral program và partnership để tăng trưởng organic thông qua word-of-mouth và đối tác chiến lược.
tools_required: []
output_format: json
---

## Mục đích

Xây dựng chiến lược referral program cho existing users và partnership strategy với các đối tác có sẵn audience/supply/demand mà marketplace cần. Referral là kênh acquisition có CAC thấp nhất và trust cao nhất. Partnership là cách cold start nhanh nhất khi marketplace chưa có liquidity.

## Input cần có

```yaml
marketplace_name: "[tên]"
marketplace_vertical: "[vertical]"
marketplace_stage: "[Signal / Hypothesis / Experiment / etc.]"
current_metrics:
  active_users: "[số]"
  monthly_transactions: "[số]"
  nps_score: "[nếu biết]"
  organic_referral_rate: "[% users đến từ referral hiện tại]"
supply_side:
  who: "[mô tả behavioral]"
  current_count: "[số]"
  acquisition_channel: "[kênh chính hiện tại]"
demand_side:
  who: "[mô tả behavioral]"
  current_count: "[số]"
  acquisition_channel: "[kênh chính hiện tại]"
potential_partners:
  - name: "[tên/loại đối tác]"
    what_they_have: "[audience / supply / demand / distribution]"
    what_they_need: "[cái gì marketplace có thể offer]"
budget_for_incentives: "[VND/tháng]"
```

## Quy trình thực hiện

### Bước 1 — Referral Program Design

**Referral Loop Architecture:**

```
TRIGGER → ACTION → REWARD → AMPLIFY

TRIGGER: Khi nào user có motivation cao nhất để refer?
  - Ngay sau first successful transaction
  - Sau positive review/feedback
  - Khi đạt milestone (5th purchase, 10th sale)

ACTION: Refer dễ thế nào?
  - 1-click share qua Instagram Story, Facebook post
  - Unique referral link với tracking
  - QR code cho offline sharing

REWARD: Incentive gì?
  - Hai chiều: Người giới thiệu VÀ người được giới thiệu đều nhận
  - Tiền / Credit / Exclusive access / Status

AMPLIFY: Làm sao để loop tự lớn?
  - Leaderboard (top referrers)
  - Milestone rewards (refer 5 → unlock tier 2 rewards)
  - Social proof ("X người đã refer thành công")
```

**Referral Incentive Models:**

| Model | Mô tả | Best For |
|-------|--------|----------|
| Cash/Credit | Cả hai bên nhận credit | High-frequency transactions |
| Double-sided discount | Người refer giảm giá, người mới giảm giá | E-commerce marketplace |
| Tier system | Refer nhiều hơn → reward lớn hơn | Community-driven |
| Exclusive access | Early access cho features/products mới | Premium/niche marketplace |
| Status/Badge | "Ambassador" title, verified badge | Status-driven verticals |

**Recommended cho Phase 1:**

```
Simple double-sided credit:
  Referrer gets: [X VND credit] khi referee hoàn thành first transaction
  Referee gets: [Y VND discount] cho first transaction
  Cap: Max [Z] referrals per user per month
  Tracking: Unique link + UTM
```

### Bước 2 — Partnership Strategy

**Partnership Types:**

```
TYPE 1 — SUPPLY PARTNERSHIP
  Đối tác có supply marketplace cần.
  Ví dụ: Hiệp hội ngành nghề, cộng đồng thợ, wholesale suppliers.
  Offer: Free listing, priority placement, marketing support.
  Ask: Onboard members lên marketplace.

TYPE 2 — DEMAND PARTNERSHIP
  Đối tác có audience là potential buyers.
  Ví dụ: Influencers, media, complementary platforms.
  Offer: Revenue share, co-branded content, exclusive deals.
  Ask: Promote marketplace đến audience.

TYPE 3 — DISTRIBUTION PARTNERSHIP
  Đối tác có kênh phân phối.
  Ví dụ: Facebook Groups lớn, Instagram accounts, newsletters.
  Offer: Content collaboration, cross-promotion, affiliate commission.
  Ask: Feature marketplace trong content/channel.

TYPE 4 — INFRASTRUCTURE PARTNERSHIP
  Đối tác có tech/logistics marketplace cần.
  Ví dụ: Payment providers, shipping, verification services.
  Offer: Volume, co-marketing, integration.
  Ask: Better rates, priority support, co-branded experience.
```

### Bước 3 — Partner Evaluation Framework

```
PARTNER SCORE = Audience Fit (1-5) × Reach (1-5) × Willingness (1-5) × Brand Alignment (1-5)

≥ 300: Priority partner → CEO personal outreach
150-299: Good fit → structured proposal
< 150: Nice-to-have → defer to Phase 2+
```

### Bước 4 — Partnership Pitch Framework

```
STRUCTURE:
1. CONTEXT: "Thị trường [vertical] đang có [problem]"
2. SYNERGY: "[Partner] có [X], chúng tôi có [Y], cùng nhau tạo [Z]"
3. SPECIFIC ASK: "[1 hành động cụ thể partner cần làm]"
4. SPECIFIC OFFER: "[1 giá trị cụ thể partner nhận được]"
5. PROOF: "[Evidence hoặc social proof]"
6. NEXT STEP: "[1 action duy nhất: 15-min call, trial period, etc.]"
```

### Bước 5 — Referral/Partnership Metrics

```
REFERRAL METRICS:
  - Referral rate: % active users who refer (target: >10%)
  - Viral coefficient: avg referrals per user (target: >1.0 for viral)
  - Referral conversion rate: % referred who become active (target: >25%)
  - Time to refer: days from first transaction to first referral
  - Referral CAC vs paid CAC comparison

PARTNERSHIP METRICS:
  - Partners onboarded per quarter
  - Users/supply acquired per partner
  - Revenue attributed to partnerships
  - Partnership ROI: value generated / resources invested
  - Partner satisfaction score
```

## Output format (JSON)

```json
{
  "skill": "G8_referral_partnership",
  "strategy_date": "2026-03-22",
  "referral_program": {
    "name": "[Program name]",
    "type": "double_sided_credit",
    "incentive_referrer": "50,000 VND credit",
    "incentive_referee": "30,000 VND discount on first transaction",
    "trigger_moment": "after_first_successful_transaction",
    "sharing_channels": ["instagram_story", "facebook_share", "unique_link", "qr_code"],
    "cap": "10 referrals/user/month",
    "estimated_viral_coefficient": 0.3,
    "budget_monthly": "5,000,000 VND",
    "launch_date": "2026-04-01"
  },
  "partnerships": [
    {
      "partner_type": "supply_partnership",
      "partner_name": "[Name / Category]",
      "partner_score": 280,
      "what_they_have": "500+ thợ handmade trong community",
      "what_we_offer": "Free listing + marketing support",
      "what_we_ask": "Announce marketplace to members",
      "expected_outcome": "100+ new suppliers in 30 days",
      "outreach_method": "CEO personal email + LinkedIn DM",
      "status": "identified",
      "priority": "high"
    },
    {
      "partner_type": "demand_partnership",
      "partner_name": "[Influencer / Media]",
      "partner_score": 350,
      "what_they_have": "50K Instagram followers in target demo",
      "what_we_offer": "10% affiliate commission + exclusive content",
      "what_we_ask": "3 Instagram posts + Stories per month",
      "expected_outcome": "500+ marketplace visits per month",
      "outreach_method": "Instagram DM + email proposal",
      "status": "identified",
      "priority": "high"
    }
  ],
  "cross_platform_plan": {
    "instagram": "Referral link in bio, Story templates for sharing, Collab posts with partners",
    "facebook": "Share referral program in Groups, Partner co-hosted Events, Referral leaderboard posts",
    "linkedin": "Partnership announcements, B2B partner outreach",
    "email": "Referral program announcement to existing subscribers"
  },
  "milestones": [
    {"milestone": "Referral program live", "target_date": "2026-04-01"},
    {"milestone": "First 3 partners signed", "target_date": "2026-04-15"},
    {"milestone": "Viral coefficient > 0.3", "target_date": "2026-05-01"},
    {"milestone": "20% of new users from referral/partnership", "target_date": "2026-06-01"}
  ],
  "kpis": [
    {"metric": "referral_rate", "target": ">10% of active users"},
    {"metric": "referral_conversion", "target": ">25%"},
    {"metric": "partners_onboarded", "target": "5 per quarter"},
    {"metric": "partnership_attributed_users", "target": "30% of new users"}
  ]
}
```

## Platform Adaptations

- **Twitter/X**: Referral program announcement threads. Partner co-tweets. Quote tweet partner content. Hashtag campaigns cho referral challenges.
- **Instagram**: Story templates cho referral sharing (swipe-up link). Collab posts với partners. Reels showcasing referral rewards. Highlight "Referral" trên profile. Instagram Live với partners. Affiliate links trong partner bios.
- **Facebook**: Share referral program trong Groups liên quan. Facebook Events cho partner co-hosted activities. Referral leaderboard posts. Partner Page cross-promotion. Facebook Live co-streams với partners.
- **LinkedIn**: Partnership announcement posts. B2B partner outreach qua InMail. Co-authored articles với partners. Event co-hosting cho professional verticals.
- **Reddit**: Community-driven referral (organic only). Partner AMAs trong relevant subreddits. Không paid referral promotion trên Reddit.

## Quy tắc

1. **Referral chỉ launch khi NPS > 7** — Nếu users chưa happy, referral sẽ backfire. Fix product trước.
2. **Double-sided incentive bắt buộc** — Single-sided referral convert kém 50%. Cả hai bên phải benefit.
3. **Instagram và Facebook là primary referral channels** — Design sharing experience tối ưu cho 2 platform này trước.
4. **1 partnership = 1 clear exchange** — Mỗi partnership phải có 1 specific ask và 1 specific offer. Không vague "hợp tác cùng phát triển".
5. **Start with 3 partners, not 30** — Quality partnerships > quantity. Deep integration > surface-level.
6. **CEO personal outreach cho top partners** — Không delegate high-value partnerships. Founder touch matters.
7. **Track attribution rigorously** — Mỗi referral/partner có unique tracking. Nếu không measure, không scale.
8. **Review partners quarterly** — Kill partnerships không deliver. Double down on ones that work.
9. **Referral fraud prevention** — Set caps, monitor patterns, verify transactions are genuine.
10. **Legal compliance** — Referral terms clear. Partner agreements written. Affiliate disclosure khi required.
