---
code: G6
name: Paid Acquisition
type: reasoning
category: growth
description: Chiến lược chạy quảng cáo trả phí trên Facebook/Instagram Ads Manager và LinkedIn Ads để acquire users cho marketplace.
tools_required: []
output_format: json
---

## Mục đích

Thiết kế chiến lược paid acquisition tập trung vào Facebook/Instagram Ads Manager (Meta Ads) và LinkedIn Ads. Bao gồm audience targeting, ad creative strategy, budget allocation, và optimization framework. Skill này reasoning chiến lược quảng cáo, không trực tiếp tạo ads.

## Input cần có

```yaml
marketplace_name: "[tên]"
marketplace_url: "[URL]"
marketplace_vertical: "[vertical]"
target_segments:
  - name: "[segment - behavioral]"
    platform_presence: "[Facebook / Instagram / LinkedIn / cả hai]"
    estimated_audience_size: "[số]"
supply_or_demand_acquisition: "[acquire supply / demand / both]"
monthly_budget: "[VND hoặc USD]"
current_metrics:
  organic_cac: "[cost nếu biết]"
  current_traffic: "[monthly visits]"
  conversion_rate: "[visitor -> user %]"
  ltv_estimate: "[LTV per user]"
campaign_objective: "[awareness / traffic / leads / conversions / app_installs]"
landing_page_url: "[URL landing page]"
existing_assets:
  pixel_installed: "[yes/no]"
  custom_audiences: "[list nếu có]"
  lookalike_audiences: "[list nếu có]"
  email_list_size: "[số]"
```

## Quy trình thực hiện

### Bước 1 — Platform Strategy

**Meta Ads (Facebook + Instagram) — Primary Channel:**

```
WHY META:
- 70M+ users VN trên Facebook, 40M+ trên Instagram
- Advanced targeting: behavior, interest, lookalike
- Visual format phù hợp marketplace (show products/services)
- Retargeting pixel mạnh
- Unified Ads Manager cho cả Facebook và Instagram

BUDGET SPLIT (khuyến nghị):
- Facebook: 50-60% (broader reach, lower CPM)
- Instagram: 30-40% (higher engagement, younger demo)
- Audience Network: 0-10% (test cautiously)
```

**LinkedIn Ads — Secondary Channel (B2B verticals):**

```
WHY LINKEDIN:
- Best cho B2B marketplace verticals
- Targeting by job title, company size, industry
- Higher CPM nhưng higher intent
- InMail ads cho direct outreach

BUDGET SPLIT:
- Sponsored Content: 60%
- InMail: 25%
- Text Ads: 15%
```

### Bước 2 — Campaign Architecture (Meta Ads)

```
CAMPAIGN LEVEL (Objective):
├── Campaign 1: AWARENESS (Top of Funnel)
│   ├── Ad Set 1: Interest-based targeting
│   │   ├── Ad 1: Video (product demo)
│   │   ├── Ad 2: Carousel (multiple listings)
│   │   └── Ad 3: Image (hero shot)
│   └── Ad Set 2: Lookalike audience (1%)
│       ├── Ad 1: Video
│       └── Ad 2: Carousel
│
├── Campaign 2: CONSIDERATION (Middle of Funnel)
│   ├── Ad Set 1: Retargeting (visited site, no signup)
│   │   ├── Ad 1: Testimonial video
│   │   └── Ad 2: Specific listing carousel
│   └── Ad Set 2: Engaged audience (IG/FB engagement)
│       └── Ad 1: Value proposition focused
│
└── Campaign 3: CONVERSION (Bottom of Funnel)
    ├── Ad Set 1: Retargeting (signed up, no transaction)
    │   ├── Ad 1: Urgency/scarcity
    │   └── Ad 2: Social proof
    └── Ad Set 2: Lookalike of existing transactors
        └── Ad 1: Direct CTA
```

### Bước 3 — Audience Targeting Framework

**Meta Ads Audiences:**

```
COLD AUDIENCES:
  - Interest targeting: [interests related to vertical]
  - Behavior targeting: [online shoppers, business page admins, etc.]
  - Lookalike 1% of: existing customers / email list / website visitors
  - Broad targeting: (let algorithm optimize with Advantage+)

WARM AUDIENCES:
  - Custom Audience: Website visitors (30 days)
  - Custom Audience: Instagram/Facebook engagers (90 days)
  - Custom Audience: Video viewers (50%+ watched)
  - Custom Audience: Email subscribers (uploaded list)

HOT AUDIENCES:
  - Custom Audience: Add to cart / signup but no transaction
  - Custom Audience: Previous customers (cross-sell/upsell)
  - Lookalike 1% of highest-value customers
```

**LinkedIn Ads Audiences:**

```
  - Job Title targeting: [relevant titles for B2B]
  - Company Size: [target range]
  - Industry: [relevant industries]
  - Seniority: [decision makers]
  - Matched Audiences: website retargeting, email list
```

### Bước 4 — Creative Strategy

**Facebook Creative Formats (ranked by performance):**

```
1. SHORT VIDEO (15-30s) — Highest engagement
   Hook in first 3 seconds. Show problem -> solution.
   Square (1:1) cho Feed. Vertical (9:16) cho Stories/Reels.

2. CAROUSEL — Best for marketplace (show multiple listings)
   5-10 cards. Each card = 1 listing/feature.
   Last card = CTA.

3. SINGLE IMAGE — Simple, fast to produce
   Lifestyle shot > product shot.
   Text overlay < 20% image area.

4. COLLECTION ADS — Best for mobile marketplace
   Hero image/video + product grid below.
   Instant Experience for immersive browsing.
```

**Instagram-Specific Formats:**

```
1. REELS ADS (9:16) — Highest reach, lowest CPM
   Native-looking content. Không quá "quảng cáo".
   Music + text overlay + authentic feel.

2. STORIES ADS (9:16) — High intent, swipe-up CTA
   3-5 story cards sequence. Interactive stickers.

3. EXPLORE ADS — Reach new audiences trong discovery mode
   Visual-first. Lifestyle imagery.

4. SHOPPING ADS — Direct product tags
   Connect product catalog. Tag items trong ads.
```

**LinkedIn Creative Formats:**

```
1. SINGLE IMAGE — Professional, clean design
2. VIDEO — Thought leadership, customer stories
3. CAROUSEL — Multi-point value proposition
4. DOCUMENT ADS — Share PDF/slides as ads
5. INMAIL — Personalized direct message ads
```

### Bước 5 — Budget Allocation Framework

```
TOTAL MONTHLY BUDGET: X

PHASE 1 (Month 1-2) — LEARNING:
  Testing budget: 70%
  Scaling budget: 30%
  Split: Meta 80% / LinkedIn 20% (if B2B)

PHASE 2 (Month 3-4) — OPTIMIZING:
  Testing budget: 40%
  Scaling budget: 60%
  Kill underperformers. Double winners.

PHASE 3 (Month 5+) — SCALING:
  Testing budget: 20%
  Scaling budget: 80%
  Focus on proven audiences and creatives.

DAILY BUDGET RULES:
  - Minimum per ad set: 200,000 VND/day (Meta)
  - Minimum per campaign: 500,000 VND/day (LinkedIn)
  - Never change budget by more than 20%/day (avoid re-learning)
```

### Bước 6 — Optimization & Measurement

**Key Metrics by Funnel Stage:**

```
AWARENESS:
  - CPM (Cost per 1000 impressions): target < 50,000 VND
  - Reach: target > 50% of audience
  - Video View rate: target > 15%

CONSIDERATION:
  - CPC (Cost per click): target < 5,000 VND (Meta), < 30,000 VND (LinkedIn)
  - CTR: target > 1.5% (Meta), > 0.5% (LinkedIn)
  - Landing page view rate: > 70% of clicks

CONVERSION:
  - CPA (Cost per acquisition): target < 1/3 of LTV
  - ROAS (Return on Ad Spend): target > 3x
  - Conversion rate: > 2% from landing page
```

**Optimization Cadence:**

```
DAILY: Check spend pacing, pause overspending ad sets
EVERY 3 DAYS: Review ad-level performance, pause CTR < 1%
WEEKLY: Review audience performance, adjust budgets
BI-WEEKLY: Refresh creatives (ad fatigue after 2 weeks)
MONTHLY: Full funnel analysis, budget reallocation
```

## Output format (JSON)

```json
{
  "skill": "G6_paid_acquisition",
  "strategy_date": "2026-03-22",
  "platform_strategy": {
    "meta_ads": {
      "budget_percentage": 80,
      "facebook_split": 55,
      "instagram_split": 45,
      "campaign_objectives": ["awareness", "traffic", "conversions"]
    },
    "linkedin_ads": {
      "budget_percentage": 20,
      "campaign_objectives": ["lead_generation"]
    }
  },
  "campaigns": [
    {
      "name": "TOF - Awareness",
      "platform": "meta",
      "objective": "awareness",
      "budget_percentage": 30,
      "audiences": [
        {"type": "interest", "description": "...", "est_size": 500000},
        {"type": "lookalike", "source": "email_list", "percentage": 1}
      ],
      "ad_formats": ["video_15s", "carousel"],
      "placements": ["facebook_feed", "instagram_feed", "instagram_reels", "stories"]
    },
    {
      "name": "MOF - Consideration",
      "platform": "meta",
      "objective": "traffic",
      "budget_percentage": 30,
      "audiences": [
        {"type": "retargeting", "description": "site_visitors_30d"},
        {"type": "custom", "description": "ig_fb_engagers_90d"}
      ],
      "ad_formats": ["carousel", "collection"],
      "placements": ["facebook_feed", "instagram_feed", "instagram_explore"]
    },
    {
      "name": "BOF - Conversion",
      "platform": "meta",
      "objective": "conversions",
      "budget_percentage": 20,
      "audiences": [
        {"type": "retargeting", "description": "signup_no_transaction"},
        {"type": "lookalike", "source": "transactors", "percentage": 1}
      ],
      "ad_formats": ["single_image", "video_testimonial"],
      "placements": ["facebook_feed", "instagram_feed"]
    },
    {
      "name": "LinkedIn B2B",
      "platform": "linkedin",
      "objective": "lead_generation",
      "budget_percentage": 20,
      "audiences": [
        {"type": "job_title", "titles": ["..."]},
        {"type": "matched", "source": "website_retargeting"}
      ],
      "ad_formats": ["sponsored_content", "inmail"],
      "placements": ["linkedin_feed", "linkedin_inmail"]
    }
  ],
  "budget": {
    "monthly_total": "...",
    "testing_percentage": 40,
    "scaling_percentage": 60
  },
  "target_metrics": {
    "meta_cpc": "<5000 VND",
    "meta_ctr": ">1.5%",
    "linkedin_cpc": "<30000 VND",
    "blended_cpa": "...",
    "target_roas": "3x"
  },
  "optimization_schedule": {
    "daily": "spend_pacing_check",
    "3_day": "ad_level_performance_review",
    "weekly": "audience_budget_adjustment",
    "biweekly": "creative_refresh",
    "monthly": "full_funnel_analysis"
  },
  "kill_criteria": {
    "ad_level": "CTR < 0.8% after 5000 impressions",
    "ad_set_level": "CPA > 2x target after 7 days",
    "campaign_level": "ROAS < 1x after 14 days"
  }
}
```

## Platform Adaptations

- **Twitter/X**: Promoted Tweets và Twitter Ads có thể supplement nhưng không primary. Best cho brand awareness campaigns. Conversation ads cho engagement.
- **Instagram**: Chạy qua Meta Ads Manager. Reels Ads là format hiệu quả nhất hiện tại (lowest CPM, highest reach). Stories Ads cho retargeting. Shopping Ads nếu có product catalog. Explore Ads cho discovery. Tận dụng Instagram-specific placements thay vì Automatic.
- **Facebook**: Chạy qua Meta Ads Manager. Feed Ads vẫn là backbone. Marketplace Ads nếu vertical phù hợp. Lead Ads cho email capture. Collection Ads cho mobile browsing experience. Advantage+ Shopping Campaigns cho e-commerce verticals.
- **LinkedIn**: LinkedIn Campaign Manager riêng. Sponsored Content cho thought leadership. InMail cho direct B2B outreach. Lead Gen Forms (no landing page needed, higher conversion). Document Ads cho content marketing. Best cho B2B marketplace verticals (hiring, SaaS, professional services).
- **Reddit**: Reddit Ads là supplementary. Promoted posts trong relevant subreddits. Rất niche nhưng high intent nếu đúng community.

## Quy tắc

1. **Facebook/Instagram Ads Manager là primary platform** — Ít nhất 70% budget dành cho Meta Ads. Đây là nơi có audience lớn nhất VN.
2. **LinkedIn Ads chỉ cho B2B verticals** — Nếu marketplace là B2C, LinkedIn budget chuyển sang Meta.
3. **LTV > 3x CAC** — Không scale nếu unit economics chưa work. Kill nhanh nếu CPA > LTV/3.
4. **Creative is king** — 80% performance variation đến từ creative, không phải targeting. Refresh mỗi 2 tuần.
5. **Pixel bắt buộc** — Cài Meta Pixel và LinkedIn Insight Tag trước khi chạy bất kỳ ads nào. Không có pixel = đốt tiền.
6. **Test before scale** — Không bao giờ dump toàn bộ budget vào 1 audience/creative. Test 3+ variations.
7. **Separate supply và demand campaigns** — Supply acquisition và demand acquisition là 2 campaigns khác nhau hoàn toàn.
8. **Retargeting là ROI cao nhất** — Luôn dành 20-30% budget cho retargeting audiences.
9. **Không chạy ads đến homepage** — Tạo landing page riêng cho mỗi campaign/audience.
10. **Attribution window** — Meta default 7-day click, 1-day view. LinkedIn default 30-day click. Set consistent và hiểu rõ trước khi so sánh.
