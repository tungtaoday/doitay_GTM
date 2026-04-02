---
code: S8
name: Go To Market
type: reasoning
category: strategy
description: Thiết kế chiến lược Go-to-Market — từ experiment thành công đến scale có kiểm soát
tools_required: []
output_format: json
---

## Mục đích

Thiết kế chiến lược Go-to-Market (GTM) hoàn chỉnh sau khi experiment (S7) đã validate hypothesis. GTM là bản kế hoạch chuyển từ "ta biết nó work" sang "ta scale nó có kiểm soát". GTM không phải launch plan — đây là operating system cho growth.

## Input cần có

- **Validated experiment results** (output từ S7 — phải VALIDATED, không phải INCONCLUSIVE)
- **Thesis** (output từ S1)
- **Wedge segment** (output từ S2)
- **CVP** (output từ S3)
- **Offer** (output từ S4)
- **Content pillars** (output từ S5)
- **Channel strategy** (output từ S6)
- **Business type:** Digital Product / Service / Marketplace
- **Growth budget:** Ngân sách cho 90 ngày GTM đầu tiên
- **Pattern Library learnings:** Gì đã learn từ experiment

## Quy trình thực hiện

### Bước 1 — Experiment-to-GTM Bridge

Trước khi design GTM, confirm:
- Hypothesis nào đã validated? (statement cụ thể)
- Primary metric đạt bao nhiêu vs threshold?
- Gì đã work trong experiment? (cụ thể — channel, message, offer tier)
- Gì cần thay đổi khi scale? (friction points, bottlenecks)
- Organic/repeat behavior có xuất hiện không? (evidence)

Nếu experiment chỉ INCONCLUSIVE → KHÔNG proceed to GTM. Quay lại S7.

### Bước 2 — GTM Positioning

**Positioning Statement:**
```
Cho [target segment],
[product/service/marketplace name] là [category]
mà [key differentiator].
Không giống [primary alternative],
ta [unique value] vì [structural reason].
```

**Messaging Hierarchy:**
- **Level 1 — Tagline (5-7 từ):** Capture essence, memorable
- **Level 2 — Elevator pitch (30 giây):** Problem + solution + why us
- **Level 3 — Full narrative (2 phút):** Story format — before/after/bridge

**Proof Points:**
- 3-5 evidence points từ experiment: metrics, customer quotes, case studies
- Social proof strategy: testimonials, reviews, numbers, logos

### Bước 3 — GTM Phasing (90-Day Plan)

#### Phase 1: Foundation (Ngày 1-30)
**Mục tiêu:** Solidify what worked in experiment, prepare for scale

- Finalize offer packaging và pricing (based on experiment learnings)
- Build/improve core infrastructure (website, payment, onboarding flow)
- Create content backlog (2 tuần content sẵn sàng)
- Set up analytics và tracking stack
- Collect và package social proof (testimonials, case studies)
- Define operational processes cho delivery at 3-5x current volume

**KPIs Phase 1:**
- Infrastructure ready (Yes/No)
- Content backlog size
- Operational capacity vs target

#### Phase 2: Traction (Ngày 31-60)
**Mục tiêu:** Scale channels đã proven, test 1 new channel

- Scale PRIMARY channels (from S6) — increase frequency và reach
- Launch paid acquisition (nếu organic đã proven) với small budget test
- Activate SECONDARY channel với adapted content
- Implement referral/viral mechanism
- Optimize conversion funnel based on data
- Build partnerships pipeline (3-5 potential partners identified)

**KPIs Phase 2:**
- Customer acquisition rate (weekly)
- CAC by channel
- Conversion rate funnel steps
- Referral rate

#### Phase 3: Acceleration (Ngày 61-90)
**Mục tiêu:** Double down trên top channels, cut underperformers

- Analyze 60-day data: which channels, messages, offers perform best?
- Cut bottom 50% performing activities
- Double resources on top 50%
- Activate 1 partnership
- Test expansion: adjacent segment hoặc adjacent geography
- Prepare scale plan cho Q+1

**KPIs Phase 3:**
- Revenue/GMV growth rate (week-over-week)
- Unit economics (LTV/CAC ratio)
- Organic vs paid ratio
- Repeat/retention rate

### Bước 4 — Distribution Engine Design

**Owned Channels:**
- Channels ta control hoàn toàn: email list, website, app, community
- Content strategy cho mỗi owned channel (from S5 + S6)
- Email automation sequences: welcome, nurture, conversion, retention

**Earned Channels:**
- PR/media strategy: story angles, target publications, journalist contacts
- SEO strategy: target keywords, content plan, technical SEO basics
- Word-of-mouth: referral program design, shareable moments in product
- Community: user groups, forums, events

**Paid Channels:**
- Budget allocation by channel (Facebook Ads, Instagram Ads, Google Ads, etc.)
- Target CAC by channel
- Creative strategy: ad formats, messaging, targeting
- Test plan: how many creatives, audiences, budgets to test
- Scale criteria: when to increase budget (ROAS > [threshold])

**Partnership Channels:**
- Partner types: complementary products, influencers, industry associations
- Value exchange: what ta offer vs what partner offers
- Top 5 target partners với approach strategy
- Revenue share/affiliate model nếu applicable

### Bước 5 — Pricing & Revenue Strategy

**Pricing finalization:**
- Entry price point (based on experiment conversion data)
- Core price point (based on willingness-to-pay evidence)
- Upsell/cross-sell path
- Annual/bulk discount strategy

**Revenue targets:**
- Monthly revenue target cho 90 ngày: Month 1 → Month 2 → Month 3
- Revenue breakdown by offer tier
- Revenue breakdown by channel

**Unit Economics Health Check:**
- CAC: Chi phí acquire 1 customer
- LTV: Lifetime value per customer
- LTV/CAC ratio: Target > 3x
- Payback period: Bao lâu để recoup CAC
- Gross margin: Revenue - COGS

### Bước 6 — Operations & Scale Readiness

**Operational checklist:**
- Delivery capacity: Serve được bao nhiêu customers/tuần hiện tại?
- Scale bottleneck: Gì break first khi volume 3x?
- Quality control: Cách maintain quality khi scale?
- Customer support: Kênh nào, response time target?
- Feedback loop: Cách collect và act on customer feedback?

**Tech stack:**
- Tools cho marketing, sales, operations, analytics
- Automation opportunities: gì có thể automate ngay?
- Build vs buy decisions cho tools

**Team needs:**
- Ai cần hire/contract trong 90 ngày?
- Role nào critical nhất?
- Budget cho hiring

### Bước 7 — Risk & Contingency

**3 scenarios:**
- **Bull case:** Traction vượt expectation → plan để scale nhanh hơn
- **Base case:** Traction đúng expectation → tiếp tục plan
- **Bear case:** Traction dưới expectation → pivot points cụ thể

**Contingency triggers:**
- Nếu CAC > [threshold] → reduce paid, increase organic
- Nếu retention < [threshold] → pause acquisition, fix product
- Nếu competition enters → [response plan]

## Output format

```json
{
  "gtm_overview": {
    "validated_hypothesis": "Hypothesis đã proven trong experiment",
    "experiment_result": "Primary metric: [số] vs threshold [số]",
    "gtm_objective": "Mục tiêu 90 ngày — 1 câu cụ thể",
    "business_type": "Digital Product / Service / Marketplace"
  },
  "positioning": {
    "statement": "Positioning statement hoàn chỉnh",
    "tagline": "5-7 từ",
    "elevator_pitch": "30 giây pitch",
    "proof_points": [
      "Evidence #1 từ experiment",
      "Evidence #2 từ experiment",
      "Evidence #3 từ experiment"
    ]
  },
  "ninety_day_plan": {
    "phase_1_foundation": {
      "days": "1-30",
      "objective": "Mục tiêu cụ thể",
      "key_activities": ["Activity #1", "Activity #2", "Activity #3"],
      "kpis": [{"metric": "Tên", "target": "Số"}],
      "budget": "Chi phí phase này"
    },
    "phase_2_traction": {
      "days": "31-60",
      "objective": "Mục tiêu cụ thể",
      "key_activities": ["Activity #1", "Activity #2", "Activity #3"],
      "kpis": [{"metric": "Tên", "target": "Số"}],
      "budget": "Chi phí phase này"
    },
    "phase_3_acceleration": {
      "days": "61-90",
      "objective": "Mục tiêu cụ thể",
      "key_activities": ["Activity #1", "Activity #2", "Activity #3"],
      "kpis": [{"metric": "Tên", "target": "Số"}],
      "budget": "Chi phí phase này"
    }
  },
  "distribution_engine": {
    "owned_channels": {
      "channels": ["Kênh #1", "Kênh #2"],
      "email_sequences": ["Welcome", "Nurture", "Conversion", "Retention"],
      "content_cadence": "Tần suất content trên owned channels"
    },
    "earned_channels": {
      "seo_strategy": "Keywords target + content plan",
      "referral_program": "Cơ chế referral cụ thể",
      "pr_angles": ["Angle #1", "Angle #2"],
      "community_plan": "Cách build/leverage community"
    },
    "paid_channels": {
      "total_budget_monthly": "Số tiền",
      "by_channel": [
        {
          "channel": "Facebook/Instagram Ads",
          "budget": "Số tiền",
          "target_cac": "Số",
          "creative_strategy": "Mô tả approach",
          "scale_criteria": "ROAS > [số] → tăng budget"
        }
      ]
    },
    "partnerships": {
      "partner_types": ["Loại #1", "Loại #2"],
      "top_5_targets": ["Partner #1", "Partner #2", "Partner #3", "Partner #4", "Partner #5"],
      "value_exchange": "Ta offer gì ↔ Partner offer gì"
    }
  },
  "revenue_strategy": {
    "pricing": {
      "entry_tier": "Giá",
      "core_tier": "Giá",
      "premium_tier": "Giá"
    },
    "revenue_targets": {
      "month_1": "Số",
      "month_2": "Số",
      "month_3": "Số"
    },
    "unit_economics": {
      "cac": "Số",
      "ltv": "Số",
      "ltv_cac_ratio": "Số (target >3x)",
      "payback_period_months": "Số",
      "gross_margin_percent": "Số"
    }
  },
  "operations": {
    "current_capacity": "Serve [số] customers/tuần",
    "scale_bottleneck": "Gì break first khi 3x",
    "quality_control": "Process cụ thể",
    "support_channels": "Kênh + response time target",
    "tech_stack": ["Tool #1 — purpose", "Tool #2 — purpose"],
    "hiring_needs": [
      {"role": "Vai trò", "timeline": "Khi nào", "budget": "Số"}
    ]
  },
  "risk_contingency": {
    "bull_case": {
      "scenario": "Mô tả",
      "response": "Action plan"
    },
    "base_case": {
      "scenario": "Mô tả",
      "response": "Continue as planned"
    },
    "bear_case": {
      "scenario": "Mô tả",
      "response": "Pivot plan cụ thể"
    },
    "contingency_triggers": [
      {"trigger": "Nếu [condition]", "action": "Thì [response]"}
    ]
  }
}
```

## Business Type Adaptations

- **Digital Product**: GTM focus vào product-led growth: free trial → activation → conversion → expansion. Distribution engine heavy về content marketing (SEO, social) + product virality (sharing, invite). Paid channels = Facebook/Instagram Ads cho B2C, LinkedIn Ads cho B2B. Operations focus: server capacity, onboarding UX, self-serve support.
- **Service**: GTM focus vào trust building: case studies → consultation → delivery → referral. Distribution heavy về referral program + local SEO + Facebook/Instagram showcase. Paid channels = Facebook local ads + Google search ads. Operations focus: service quality consistency, provider training, booking/scheduling system. Scale bottleneck thường là supply (providers).
- **Marketplace**: GTM focus riêng cho mỗi side. Supply GTM: outbound outreach + industry partnerships + provider benefits. Demand GTM: content marketing + paid acquisition + SEO. Distribution engine phải track supply/demand balance. Operations focus: matching quality, dispute resolution, payment processing. Scale bottleneck thường là maintaining liquidity khi expand geography/category.

## Quy tắc

- GTM CHỈ design sau khi experiment VALIDATED. Không có exception. INCONCLUSIVE = quay lại experiment.
- 90 ngày là planning horizon. Không plan chi tiết hơn 90 ngày — thị trường thay đổi nhanh hơn plan.
- Phase 1 (ngày 1-30) là FOUNDATION, không phải growth. Rush to grow trên nền yếu = collapse.
- Unit economics phải HEALTHY trước khi scale paid acquisition. LTV/CAC < 3x → fix product/pricing trước khi spend money.
- Cut underperformers RUTHLESSLY ở Phase 3. Bottom 50% activities phải bị cắt, không phải "theo dõi thêm".
- Paid acquisition là AMPLIFIER, không phải foundation. Nếu organic không work → paid sẽ chỉ burn money nhanh hơn.
- Revenue targets phải realistic — based on experiment data extrapolation, không phải ambition.
- Mỗi partnership phải có clear value exchange. "Hợp tác cùng phát triển" là SAI. "Ta cung cấp X, partner cung cấp Y, cả hai benefit Z" là ĐÚNG.
- Operations scale plan là phần QUAN TRỌNG NHẤT mà startup hay bỏ qua. Growth without operations = broken promises to customers.
- Bear case contingency phải CỤ THỂ: trigger condition + exact response. "Pivot nếu không work" là SAI.
- Phase 1 system: GTM cho 1 marketplace/product tại 1 geography. Không expand scope khi chưa prove.
- Update Pattern Library sau 90 ngày GTM với comprehensive learnings.
