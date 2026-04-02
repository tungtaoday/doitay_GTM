# Skills Architecture — Universal Product Growth System
> Cấu trúc kỹ năng tổng quát cho mọi loại sản phẩm: số hóa, dịch vụ, vật lý, marketplace, hybrid

---

## Mục lục

1. [Business Types & Tại sao cần kiến trúc chung](#1-business-types--tại-sao-cần-kiến-trúc-chung)
2. [Universal Pipeline — Luồng chung cho mọi sản phẩm](#2-universal-pipeline--luồng-chung-cho-mọi-sản-phẩm)
3. [6 Skill Categories — Nhóm kỹ năng gốc](#3-6-skill-categories--nhóm-kỹ-năng-gốc)
4. [44 Universal Skills — Chi tiết](#4-44-universal-skills--chi-tiết)
5. [10 Roles — Ai sở hữu skill nào](#5-10-roles--ai-sở-hữu-skill-nào)
6. [Business Type Adaptations — Skill thay đổi theo loại sản phẩm](#6-business-type-adaptations--skill-thay-đổi-theo-loại-sản-phẩm)
7. [Skill Dependencies — Cái gì cần trước cái gì](#7-skill-dependencies--cái-gì-cần-trước-cái-gì)
8. [Skill Progression — Phase 1 → 2 → 3](#8-skill-progression--phase-1--2--3)
9. [Compound Skills — Tổ hợp tạo lợi thế cạnh tranh](#9-compound-skills--tổ-hợp-tạo-lợi-thế-cạnh-tranh)
10. [Traction Score — Metric thống nhất thay Liquidity Score](#10-traction-score--metric-thống-nhất)
11. [Skill Matrix tổng hợp](#11-skill-matrix-tổng-hợp)
12. [Quick Reference](#12-quick-reference)

---

## 1. Business Types & Tại sao cần kiến trúc chung

### 6 loại sản phẩm hệ thống phải cover

```
TYPE 1: DIGITAL PRODUCT (Sản phẩm số)
  Ví dụ: SaaS, mobile app, course, template, plugin, AI tool
  Đặc điểm: Build once → sell many, marginal cost ~0, scale nhanh
  Revenue: Subscription, one-time, freemium, usage-based
  Key challenge: Distribution + retention

TYPE 2: SERVICE (Dịch vụ)
  Ví dụ: Consulting, agency, coaching, freelance, done-for-you
  Đặc điểm: Trade time for money (until systemized), high trust needed
  Revenue: Project-based, retainer, hourly, package
  Key challenge: Trust + capacity constraint

TYPE 3: PHYSICAL PRODUCT (Sản phẩm vật lý)
  Ví dụ: D2C brand, e-commerce, handmade goods, hardware
  Đặc điểm: Inventory, logistics, margin pressure, tangible experience
  Revenue: Unit sales, subscription box, wholesale
  Key challenge: Unit economics + logistics + differentiation

TYPE 4: MARKETPLACE (Sàn giao dịch)
  Ví dụ: Matching supply ↔ demand, platform, exchange
  Đặc điểm: Chicken-egg, network effects, trust both sides
  Revenue: Commission, take rate, listing fee, subscription
  Key challenge: Cold start + liquidity

TYPE 5: CONTENT / MEDIA (Nội dung)
  Ví dụ: Newsletter, podcast, YouTube, community, media brand
  Đặc điểm: Audience = asset, monetize attention
  Revenue: Sponsorship, affiliate, community, events
  Key challenge: Audience building + monetization timing

TYPE 6: HYBRID
  Ví dụ: SaaS + marketplace, content + course, service → product
  Đặc điểm: Kết hợp 2+ types, thường evolve theo thời gian
  Revenue: Mixed
  Key challenge: Focus — biết mình đang ở type nào tại thời điểm nào
```

### Tại sao cần kiến trúc chung

```
THỰC TẾ:
  Hầu hết founders KHÔNG biết chính xác type nào khi bắt đầu.
  Service → SaaS (productize). Content → Course (monetize).
  Marketplace → SaaS tool (pivot). Physical → D2C + content (expand).

  → Skills phải PORTABLE giữa các types.
  → Pipeline phải CHUNG — chỉ adapt metrics và tactics.
  → Roles phải UNIVERSAL — chỉ thay đổi focus area.

NGUYÊN TẮC:
  1. 80% skills giống nhau giữa mọi business type
  2. 20% khác biệt nằm ở: metrics, conversion path, content angle
  3. Kiến trúc build cho 80% chung, adapt 20% theo type
```

---

## 2. Universal Pipeline — Luồng chung cho mọi sản phẩm

### Pipeline hiện tại (marketplace-specific) vs Pipeline mới (universal)

```
CŨ (marketplace only):
  Signals → Hypothesis → Intelligence → Strategy
  → Content Engine → Experiment → Decision → Patterns

MỚI (universal — mọi loại sản phẩm):

  ┌─────────────────────────────────────────────────────────────┐
  │                    DISCOVER                                 │
  │  Signal Scanning → Problem Validation → Audience Intel     │
  └───────────────────────────┬─────────────────────────────────┘
                              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                    DEFINE                                   │
  │  Segment → Value Prop → Offer Design → Channel Strategy    │
  └───────────────────────────┬─────────────────────────────────┘
                              ↓
                    [CEO Checkpoint — 30 phút]
                              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                    BUILD + TEST (song song, 8 tuần)         │
  │                                                             │
  │  CONTENT ENGINE          PRODUCT/SERVICE BUILD              │
  │  Listen → Design         MVP → Iterate                     │
  │  → Engage → Flywheel     → Launch → Measure                │
  │  → Convert               → Optimize                        │
  │                                                             │
  │           ↓ Content-Market Fit    ↓ Traction Score          │
  └───────────────────────────┬─────────────────────────────────┘
                              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                    DECIDE                                   │
  │  Kill / Pivot / Continue / Scale                            │
  └───────────────────────────┬─────────────────────────────────┘
                              ↓
  ┌─────────────────────────────────────────────────────────────┐
  │                    EXTRACT                                  │
  │  Pattern Library (content + product + market patterns)      │
  └─────────────────────────────────────────────────────────────┘
                              ↓
              Feed back vào DISCOVER cho product tiếp theo
```

### Pipeline áp dụng cho mỗi business type

```
                  DISCOVER    DEFINE      BUILD+TEST     DECIDE
                  ────────    ──────      ──────────     ──────
Digital Product   Market gap  CVP+Pricing MVP+Landing    MRR growth?
                  Pain scan   Feature set Content+Ads    Retention?

Service           Client pain Offer+Price Portfolio site  Repeat rate?
                  Demand scan Scope       Content+Refer   Margin?

Physical          Trend scan  Product fit Prototype+DTC   Unit econ?
                  Gap in mkt  Pricing     Content+Sample  Reorder?

Marketplace       Supply gap  2-side CVP  Supply+Demand   Liquidity?
                  Demand gap  Chicken-egg Content+Ops     Match rate?

Content/Media     Audience    Niche+Voice Build audience  Growth rate?
                  Topic gap   Format      Consistency     Monetizable?

INSIGHT: Pipeline GIỐNG NHAU. Chỉ METRICS và TACTICS khác.
```

---

## 3. 6 Skill Categories — Nhóm kỹ năng gốc

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   RESEARCH        "Thế giới thực đang diễn ra gì?"          │
│   (Thu thập)       Facts only. Không interpret.              │
│                                                              │
│   STRATEGY        "Ta nên đi hướng nào?"                     │
│   (Định hướng)    Direction + constraints + thesis.           │
│                                                              │
│   CREATION        "Tạo ra cái gì để đưa ra thế giới?"       │
│   (Tạo ra)        Content + Product + Offer design.          │
│                                                              │
│   GROWTH          "Làm sao để nhiều người biết + mua?"       │
│   (Phát triển)    Audience + Channel + Conversion.           │
│                                                              │
│   ANALYSIS        "Data nói gì? Patterns nào?"               │
│   (Phân tích)     Metrics + Scoring + Pattern extraction.    │
│                                                              │
│   DECISION        "Ta làm gì tiếp?"                          │
│   (Quyết định)    Kill/scale + Allocate + Transition.        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Thay đổi so với phiên bản cũ

```
CŨ: CONTENT (8 skills) — chỉ content marketing
MỚI: CREATION (10 skills) — content + product/offer creation

CŨ: GROWTH (8 skills) — chỉ organic social
MỚI: GROWTH (10 skills) — organic + paid + referral + partnership + sales

CŨ: ANALYSIS (9 skills) — marketplace-focused metrics
MỚI: ANALYSIS (9 skills) — universal metrics (Traction Score thay Liquidity Score)

RESEARCH, STRATEGY, DECISION: mở rộng nhẹ, giữ nguyên logic
```

---

## 4. 44 Universal Skills — Chi tiết

### CATEGORY 1: RESEARCH (7 skills) — Thu thập

```
R1 — MARKET SCANNING
  Scan tín hiệu: gaps, shifts, pain points, trends trong vertical
  Input:  Vertical + geography + business type
  Output: Signal report với Signal Strength Score
  Áp dụng: Mọi type. Marketplace scan supply/demand gap.
           Digital product scan feature gap. Service scan unmet demand.

R2 — SOCIAL LISTENING
  Thu thập conversations, ngôn ngữ, pain points từ platforms
  Input:  Target segment + platform list
  Output: Audience Intel (phrases, questions, language patterns)
  Áp dụng: Mọi type. Core skill — audience language = messaging foundation.

R3 — INFLUENCER & COMMUNITY MAPPING
  Xác định ai ảnh hưởng audience, communities nào quan trọng
  Input:  Target segment
  Output: Account list + community list + watering holes
  Áp dụng: Mọi type. Service → find where clients hang out.
           Physical → find reviewers/KOLs. Digital → find power users.

R4 — COMPETITIVE INTELLIGENCE
  Phân tích đối thủ, alternatives, substitutes
  Input:  Vertical + identified competitors
  Output: Differentiation matrix, competitor strengths/weaknesses,
          pricing landscape, positioning map
  Áp dụng: Mọi type. Biết đối thủ = biết gap.

R5 — CONTENT & CHANNEL BENCHMARKING
  Phân tích content/channel nào đang work trong vertical
  Input:  Vertical + platform + timeframe
  Output: Top performing content + channel effectiveness + gaps
  Áp dụng: Mọi type. Cho Growth Marketer biết đánh ở đâu.

R6 — CUSTOMER RESEARCH
  Thu thập insights trực tiếp từ target customers (interview, survey, observation)
  Input:  Target segment + specific questions
  Output: Customer quotes, behavior patterns, jobs-to-be-done
  Áp dụng: Mọi type. Đặc biệt quan trọng cho Service (client pain)
           và Physical (usage context).

R7 — PRICING RESEARCH
  Thu thập data về willingness-to-pay, price sensitivity, competitor pricing
  Input:  Segment + competitive landscape + value delivered
  Output: Price range, anchor points, packaging options
  Áp dụng: Mọi type. Digital = tricky (0 marginal cost).
           Physical = constrained by COGS. Service = value-based.
```

### CATEGORY 2: STRATEGY (8 skills) — Định hướng

```
S1 — THESIS FORMATION
  Tạo thesis: điều ta tin về thị trường mà người khác không tin
  Input:  Market signals + intelligence
  Output: Thesis + playing field + constraints + NOT DOING list
  Áp dụng: Mọi type. Thesis quyết định mọi thứ phía sau.

S2 — SEGMENTATION
  Chia market thành non-overlapping segments theo jobs-to-be-done
  Input:  Market data + customer research
  Output: Ranked segments + Underservice Score + Platform Behavior Map
  Áp dụng: Mọi type. Service: "who needs this most?"
           Physical: "who will buy first?" Digital: "who will adopt first?"

S3 — VALUE PROPOSITION DESIGN
  Thiết kế value prop differentiated cho target segment
  Input:  Segment profile + competitive intel
  Output: Value prop statement + differentiation + moat theory
  Áp dụng: Mọi type.
    Marketplace: supply-side + demand-side CVP
    Digital: feature differentiation + UX advantage
    Service: expertise + process + outcome guarantee
    Physical: quality + design + brand story

S4 — OFFER DESIGN
  Thiết kế cách đóng gói value prop thành offer cụ thể (price, scope, tiers)
  Input:  Value prop + pricing research + segment willingness-to-pay
  Output: Offer structure (tiers/packages), pricing, guarantee, bonuses
  Áp dụng:
    Digital: Free/Pro/Enterprise tiers, freemium model
    Service: Packages (basic/standard/premium), retainer vs project
    Physical: SKUs, bundles, subscription box
    Marketplace: Commission structure, listing tiers
    Content: Free/Paid/Premium community

S5 — CONTENT PILLAR DESIGN
  Translate value prop thành content themes + voice + messaging
  Input:  Value prop + audience intel + segment language
  Output: Content pillars + voice guide + hook bank + content mix
  Áp dụng: Mọi type. Content là distribution cho TẤT CẢ business types.

S6 — CHANNEL STRATEGY
  Chọn và thiết kế approach cho mỗi growth channel
  Input:  Segment platform map + resource constraints + benchmarks
  Output: Primary channel + tactics + budget allocation
  Áp dụng: Mọi type. Nhưng channel mix KHÁC:
    Digital: Content + SEO + Product-led growth + Paid
    Service: Content + Referral + DM outreach + Speaking
    Physical: Content + Paid ads + Retail + Influencer
    Marketplace: Content + Community + Supply outreach + PR
    Content: Content + Cross-promotion + Collaborations

S7 — EXPERIMENT DESIGN
  Thiết kế experiment với hypothesis, metrics, kill criteria
  Input:  Strategy outputs + channel strategy
  Output: Experiment brief (hypothesis, metric, timeline, kill signal)
  Áp dụng: Mọi type. Format giống nhau, metrics khác.

S8 — GO-TO-MARKET DESIGN
  Thiết kế cách đưa product/service ra thị trường lần đầu
  Input:  Offer + channel strategy + segment + timing
  Output: Launch plan (pre-launch → launch → post-launch)
  Áp dụng:
    Digital: Beta → waitlist → launch → Product Hunt / social push
    Service: Portfolio → first 3 clients → case study → scale
    Physical: Sample → pre-order → launch → retail
    Marketplace: Seed supply → invite demand → first match
    Content: Consistency → milestone → monetize
```

### CATEGORY 3: CREATION (10 skills) — Tạo ra

```
── CONTENT CREATION ──

C1 — HOOK WRITING
  Viết câu mở đầu stop-scroll, tạo curiosity
  Input:  Content pillar + audience language + hook template
  Output: Hook < 280 chars với clear promise
  Áp dụng: Mọi type. Hook = cửa vào tất cả content.

C2 — LONG-FORM WRITING
  Viết threads, articles, newsletters, case studies, guides
  Input:  Topic + pillar + audience + format
  Output: Structured long-form (Hook → Value → CTA)
  Áp dụng: Mọi type.
    Digital: Feature deep dives, tutorials, comparison guides
    Service: Case studies, methodology articles, thought leadership
    Physical: Behind-the-scenes, product stories, usage guides
    Marketplace: Both-sides content, success stories

C3 — SHORT-FORM WRITING
  Viết tweets, captions, one-liners, observations
  Input:  Ideas + pillars + audience language
  Output: Single post với standalone value
  Áp dụng: Mọi type. Daily content rhythm.

C4 — STORYTELLING
  Biến experience/data/customer journey thành narrative
  Input:  Raw material (experience, case, data) + lesson
  Output: Story (setup → conflict → resolution → lesson)
  Áp dụng: Mọi type.
    Digital: User transformation stories
    Service: Client success stories
    Physical: Origin story, maker story, customer unboxing
    Marketplace: Match stories (supply met demand)

C5 — VISUAL CONTENT
  Tạo images, carousels, infographics, short video scripts
  Input:  Content idea + platform format requirements
  Output: Visual asset (designed or scripted)
  Áp dụng: Physical product (ĐẶC BIỆT quan trọng — product photos, demos).
           Digital (UI screenshots, product demos).
           Service (process diagrams, result visuals).

C6 — ZERO-CLICK CONTENT
  Tạo content có full value in-platform, không cần click
  Input:  Topic + platform constraints
  Output: Self-contained valuable post
  Áp dụng: Mọi type. 50/50 rule (Natividad).

C7 — CTA & CONVERSION COPY
  Viết call-to-action, landing page copy, email sequences
  Input:  Offer + audience trust level + desired action
  Output: Conversion copy (CTA, landing page, email, DM script)
  Áp dụng: Mọi type. Đặc biệt critical cho Digital (landing page)
           và Physical (product page copy).

── PRODUCT/OFFER CREATION ──

C8 — MVP / PROTOTYPE DESIGN
  Thiết kế minimum viable version của product/service/offer
  Input:  Value prop + segment needs + resource constraints
  Output: MVP spec hoặc prototype
  Áp dụng:
    Digital: Landing page + core feature, no-code MVP
    Service: First engagement framework, pilot offer
    Physical: Prototype, 3D render, sample batch
    Marketplace: Concierge MVP (manual matching)

C9 — OFFER PACKAGING
  Đóng gói value thành purchasable units (tiers, bundles, add-ons)
  Input:  Offer design (S4) + pricing research (R7)
  Output: Packaged offer ready to sell
  Áp dụng:
    Digital: Pricing page, feature tiers
    Service: Service menu, scope documents
    Physical: SKU list, bundle deals
    Content: Membership tiers, premium access levels

C10 — CONTENT REPURPOSING & TEMPLATING
  Biến 1 piece thành nhiều formats + tạo reusable templates
  Input:  Winning content + performance data
  Output: Repurposed content + templates cho future use
  Áp dụng: Mọi type.
    Tweet → Thread → Newsletter → Blog → Video script → Product page
    (Gary Vee reverse pyramid + Bush/Cole autopilot system)
```

### CATEGORY 4: GROWTH (10 skills) — Phát triển

```
── ORGANIC GROWTH ──

G1 — STRATEGIC ENGAGEMENT
  Reply add-value, join conversations, participate in communities
  Input:  Community map + expertise + content pillars
  Output: Profile visits, recognized presence, warm relationships
  Áp dụng: Mọi type. $1.80 strategy (Gary Vee).
    Service: engage trong industry communities
    Digital: engage trong user communities
    Physical: engage trong hobbyist/enthusiast groups

G2 — COMMUNITY BUILDING
  Build và nurture community around brand/product/expertise
  Input:  Audience + shared interest + platform
  Output: Engaged community (group, server, forum, email list)
  Áp dụng:
    Digital: User community, beta testers, feature requesters
    Service: Client community, peer group
    Physical: Fan community, collectors, enthusiasts
    Marketplace: Both-sides community
    Content: Subscriber community

G3 — PROFILE & PRESENCE OPTIMIZATION
  Biến mọi touchpoint thành conversion opportunity
  Input:  Value prop + platform constraints + offer
  Output: Optimized profile/bio/website/storefront
  Áp dụng:
    Social profiles (mọi type)
    Website/landing page (mọi type)
    Marketplace listing (physical)
    App store listing (digital)
    Google Business (service, physical)

G4 — AUDIENCE NURTURING
  Build trust qua consistent presence + value delivery
  Input:  Audience + content calendar + engagement data
  Output: Audience trust → ready for offer
  Áp dụng: Mọi type. "Give until they ask" (Hormozi).

G5 — EMAIL / NEWSLETTER GROWTH
  Build owned audience qua email list, grow + retain subscribers
  Input:  Lead magnet + content + audience
  Output: Growing email list + open rates + click rates
  Áp dụng: Mọi type. "Own your audience" (Welsh).
    Email list = insurance against algorithm changes.

── PAID & OUTBOUND GROWTH ──

G6 — PAID ACQUISITION
  Chạy paid ads có positive ROI (sau khi organic validates)
  Input:  Winning organic content + offer + budget
  Output: Scalable paid channel with target CAC
  Áp dụng:
    Digital: Meta/Google ads → landing page → signup
    Physical: Meta/Google ads → product page → purchase
    Service: LinkedIn ads → lead magnet → consultation
    Marketplace: Targeted ads to supply OR demand side
  QUY TẮC: Chỉ paid SAU KHI organic prove demand.
           "Spending money on unvalidated creative is malpractice" (Gary Vee)

G7 — OUTBOUND & SALES
  Proactive outreach đến prospects (DM, cold email, networking, events)
  Input:  Target list + offer + pitch + personalization
  Output: Conversations → qualified leads → customers
  Áp dụng:
    Service: ĐẶC BIỆT QUAN TRỌNG — warm DM, referral ask, speaking
    Marketplace: Supply acquisition outreach
    Digital: Enterprise sales, partnership outreach
    Physical: Retail buyer outreach, wholesale
  Reference: Hormozi Core Four (warm outreach + cold outreach)

G8 — REFERRAL & PARTNERSHIP
  Thiết kế và activate referral loops + strategic partnerships
  Input:  Customer base + offer + incentive structure
  Output: Referral system + partnerships driving growth
  Áp dụng:
    Service: Referral = #1 channel (clients refer clients)
    Digital: In-product referral, integration partnerships
    Physical: Unboxing → share, affiliate, retail partnerships
    Marketplace: Supply refers supply, demand refers demand

G9 — CONTENT SCHEDULING & OPERATIONS
  Lập lịch, batch-create, maintain consistent publishing cadence
  Input:  Content mix + idea bank + analytics
  Output: Scheduled content pipeline, never miss
  Áp dụng: Mọi type. "Consistency = credibility" (Bloom).

G10 — TREND RIDING & NEWSJACKING
  Phát hiện trend sớm, tạo content ride wave
  Input:  Feed monitoring + trend signals + expertise
  Output: Timely content leveraging current attention
  Áp dụng: Mọi type.
    "Be the person who explains the trend to everyone else" (Puri)
```

### CATEGORY 5: ANALYSIS (9 skills) — Phân tích

```
A1 — STRESS TESTING
  Challenge bất kỳ positive analysis nào (10+ questions)
  Input:  Any positive output
  Output: Stress test report (weaknesses, assumptions, kill criteria)
  Áp dụng: Mọi type. Luôn cần Devil's Advocate.

  10 Universal Stress Tests:
  1. Substitution: "Workaround hiện tại là gì, sao họ switch?"
  2. Copy: "Ai copy trong 6 tháng?"
  3. Cold Start: "Ngày 1 với 0 users, cụ thể chuyện gì xảy ra?"
  4. Distribution: "Kênh nào? Tại sao kênh đó work cho mình?"
  5. Unit Economics: "Bán 1 unit có lãi không? Khi nào?"
  6. Retention: "Sau lần mua đầu, tại sao họ quay lại?"
  7. Timing: "Tại sao BÂY GIỜ? Sao không 3 năm trước?"
  8. Content-Market Fit: "Content có nói đúng ngôn ngữ audience?"
  9. Scale Ceiling: "Growth có ceiling ở đâu? Hit khi nào?"
  10. 10× Test: "Opportunity này có thể 10× next best option?"

A2 — OPPORTUNITY SCORING
  Đánh giá opportunity bằng framework phù hợp với business type
  Input:  Market data + team capabilities + constraints
  Output: Score + recommendation
  Áp dụng: Mọi type. Formula adapt theo type (xem Section 6).

A3 — UNIT ECONOMICS MODELING
  Tính toán financial viability (revenue model, costs, margins)
  Input:  Pricing + costs + acquisition + retention
  Output: Unit economics model (LTV/CAC, margin, payback)
  Áp dụng:
    Digital: MRR, churn, LTV/CAC, payback months
    Service: Project margin, utilization, effective hourly rate
    Physical: COGS, margin, inventory turns, CAC
    Marketplace: Take rate, GMV, supply/demand CAC
    Content: RPM, CPM, ARPU, sponsorship value

A4 — CONTENT PERFORMANCE ANALYSIS
  Đo và phân tích content metrics, tìm winning patterns
  Input:  Content data across platforms
  Output: Performance report + insights + optimization plan
  Áp dụng: Mọi type.

A5 — TRACTION SCORING
  Tính Traction Score — metric thống nhất cho mọi business type
  (thay thế Liquidity Score, xem Section 10 cho chi tiết)
  Input:  Business-type-specific metrics
  Output: Traction Score (0-1) + trend + diagnosis
  Áp dụng: Mọi type. Format chung, input khác.

A6 — CONTENT-MARKET FIT SCORING
  Tính CMF Score (Engagement Quality × Audience Relevance × Conversion Signal)
  Input:  Content metrics + audience sampling + conversion data
  Output: CMF Score + trend + diagnosis
  Áp dụng: Mọi type. Content-Market Fit predict Traction.

A7 — PATTERN EXTRACTION
  Rút ra reusable patterns từ experiment results
  Input:  Experiment data + content data + outcome
  Output: Pattern Library entry (product + content + market patterns)
  Áp dụng: Mọi type. Compound moat.

A8 — CUSTOMER ANALYTICS
  Phân tích customer behavior: acquisition, activation, retention, revenue, referral
  Input:  Customer data (AARRR funnel)
  Output: Funnel analysis + cohort analysis + segment behavior
  Áp dụng:
    Digital: AARRR pirate metrics, feature usage, churn analysis
    Service: Client satisfaction, repeat rate, referral rate
    Physical: Purchase frequency, AOV, reorder rate, returns
    Marketplace: Match rate, time-to-match, repeat rate both sides

A9 — PORTFOLIO ANALYSIS (Phase 2+)
  Đánh giá health toàn bộ portfolio products/ventures
  Input:  All product metrics
  Output: Portfolio health dashboard
  Áp dụng: Khi có 2+ products/ventures running.
```

### CATEGORY 6: DECISION (6 skills) — Quyết định

```
D1 — KILL / PIVOT / CONTINUE / SCALE
  Ra quyết định dựa trên Traction Score + Content-Market Fit + timeline
  Input:  Both scores + experiment data + stress test
  Output: Decision + rationale + next actions
  Áp dụng: Mọi type.

  Decision Matrix:
  ┌────────────────────┬─────────────────┬─────────────────┐
  │                    │ Traction HIGH   │ Traction LOW    │
  ├────────────────────┼─────────────────┼─────────────────┤
  │ CMF HIGH           │ SCALE           │ FIX PRODUCT     │
  │ (content works)    │ Máy đang chạy   │ Demand có,      │
  │                    │                 │ product chưa OK │
  ├────────────────────┼─────────────────┼─────────────────┤
  │ CMF LOW            │ FIX CONTENT     │ KILL or PIVOT   │
  │ (content not work) │ Product OK,     │ Không demand,   │
  │                    │ messaging sai   │ product chưa OK │
  └────────────────────┴─────────────────┴─────────────────┘

D2 — RESOURCE ALLOCATION
  Phân bổ thời gian, tiền, attention
  Input:  Portfolio health + scores + constraints
  Output: Allocation decision
  Áp dụng: Mọi type.

D3 — PHASE TRANSITION
  Quyết định chuyển Phase (1→2→3)
  Input:  Proven traction + playbook maturity + pattern depth
  Output: Phase transition decision
  Áp dụng: Mọi type.

D4 — BUILD / BUY / PARTNER DECISION
  Quyết định approach cho capability mới
  Input:  Need + economics + speed + control requirements
  Output: Decision (build in-house / outsource / partner / acquire)
  Áp dụng:
    Digital: Build feature vs integrate vs acquire
    Service: Hire vs outsource vs partner
    Physical: Manufacture vs contract vs license
    Marketplace: Build vs white-label

D5 — STRATEGY PIVOT
  Quyết định pivot approach khi metrics thấp
  Input:  Underperforming data + root cause analysis
  Output: Pivot plan (new segment / new channel / new offer / new type)
  Áp dụng: Mọi type. "Pivot nhanh, pivot sớm."

D6 — TENSION RESOLUTION
  Giải quyết conflict giữa roles bằng cách define test
  Input:  Conflicting analyses
  Output: Specific test to resolve disagreement + timeline
  Áp dụng: Mọi type.
```

---

## 5. 10 Roles — Ai sở hữu skill nào

### Role Map

```
ROLE 1 — Strategy Director      "Game gì, luật gì?"
ROLE 2 — Market Research Agent   "Thực tế ngoài kia thế nào?"
ROLE 3 — Devil's Advocate        "Tại sao analysis này sai?"
ROLE 4 — Segment Analyst         "Ai đau nhất?"
ROLE 5 — Value Architect         "Ta offer gì khác biệt?" (đổi tên từ CVP Architect)
ROLE 6 — Business Developer      "Cơ hội có real không, pursue cách nào?"
ROLE 7 — Financial Analyst       "Economics trông như thế nào?" (đổi tên)
ROLE 8 — CEO Cockpit             "Tôi cần quyết định gì?"
ROLE 9 — Growth Marketer         "Content nào, ở đâu, drive growth?"
ROLE 10 — Product Builder        "Build gì, build thế nào?" ★ MỚI
```

### ROLE 10 — Product Builder ★ MỚI

```
Tại sao cần role mới:
  Cũ: Hệ thống chỉ có marketplace → build = ops (supply/demand)
  Mới: 6 business types → cần role chuyên build product/service/offer

Core question: "Build cái gì với resources hiện có để deliver value prop?"

CORE SKILLS:
  C8 — MVP / Prototype Design
  C9 — Offer Packaging
  A8 — Customer Analytics (post-launch)

SUPPORTING SKILLS:
  R6 — Customer Research (understand usage)
  S4 — Offer Design (co-design với Value Architect)
  A3 — Unit Economics (validate build makes economic sense)

SKILL FLOW:
  Nhận S3 (value prop) + S4 (offer design) từ Value Architect
  → C8 (build MVP) → C9 (package offer) → launch
  → A8 (analyze usage) → iterate

OUTPUT:
  Per experiment: Working MVP / prototype / pilot service
  Weekly: Product metrics (usage, activation, retention)
  Post-experiment: Product patterns cho Pattern Library

ADAPT THEO TYPE:
  Digital: No-code MVP → coded MVP → feature iteration
  Service: Service blueprint → pilot → systematize
  Physical: Prototype → sample → first batch
  Marketplace: Concierge → semi-automated → platform
  Content: Format test → consistent schedule → scale
```

### Role × Skill Assignment

```
ROLE                  SKILLS (core = bold)                          COUNT
──────────────────────────────────────────────────────────────────────────
Strategy Director     S1 S6 S8 D2 D6                                  5
Market Research       R1 R2 R3 R4 R5 R6 R7                           7
Devil's Advocate      A1 D6                                           2
Segment Analyst       S2 R6 A8                                        3
Value Architect       S3 S4 S5 C7 C10                                 5
Business Developer    S6 S7 S8 G7 G8 A2 A5                           7
Financial Analyst     A3 A9 D4                                        3
CEO Cockpit           A5 A6 D1 D2 D3                                  5
Growth Marketer       C1 C2 C3 C4 C5 C6 C7 C10                      19
                      G1 G2 G3 G4 G5 G6 G9 G10
                      A4 A6 D5
Product Builder       C8 C9 R6 A3 A8                                  5
──────────────────────────────────────────────────────────────────────────
SHARED (all roles):   A7 (Pattern Extraction)                         +1 each
```

---

## 6. Business Type Adaptations — Skill thay đổi theo loại sản phẩm

### Adaptation Map: cùng skill, khác cách apply

```
┌─────────────┬────────────────┬────────────────┬────────────────┬────────────────┬────────────────┐
│ SKILL       │ DIGITAL        │ SERVICE        │ PHYSICAL       │ MARKETPLACE    │ CONTENT/MEDIA  │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ R2 Social   │ Feature        │ "Need help     │ "Looking for   │ Supply: "where │ "What topic    │
│ Listening   │ requests,      │ with...",      │ best...",      │ to sell"       │ gets engagement │
│             │ complaints     │ recommendations │ reviews        │ Demand: "where │ but no one     │
│             │ about rivals   │                │                │ to find"       │ covers well?"  │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ S3 Value    │ "Our app does  │ "We help [who] │ "Our [product] │ Supply CVP +   │ "I teach [who] │
│ Prop        │ X that [rival] │ achieve [what] │ is the only    │ Demand CVP     │ about [what]   │
│             │ can't because  │ through [how]  │ one that [diff]│ (2 statements) │ unlike [others]│
│             │ [structural]"  │ unlike [others]│ for [segment]" │                │ because [why]" │
│             │                │ who [limit]"   │                │                │                │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ S4 Offer    │ Tiers:         │ Packages:      │ SKUs:          │ Commission:    │ Access:        │
│ Design      │ Free/Pro/Ent   │ Basic/Std/Prem │ Core + upsell  │ % per trans    │ Free/Paid/VIP  │
│             │ Annual discount│ Retainer option│ Bundle deals   │ Listing fees   │ Sponsorship    │
│             │ Usage-based    │ Success fee    │ Subscribe&Save │ Subscription   │ Affiliate      │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ C4 Story    │ "User went     │ "Client came   │ "We started    │ "Seller found  │ "I used to     │
│ telling     │ from [pain]    │ with [problem] │ making this    │ buyer through  │ struggle with  │
│             │ to [transform] │ , we did [what]│ because [why]" │ our platform"  │ [X] until..."  │
│             │ using our..."  │ , result..."   │ Origin story   │ Match story    │ Creator story  │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ C5 Visual   │ UI screenshots │ Process        │ Product photos │ Platform UI    │ Thumbnails     │
│             │ Demo videos    │ diagrams       │ Unboxing video │ Success metrics│ Carousels      │
│             │ Feature tours  │ Result visuals │ Lifestyle shots│ Infographics   │ Charts/data    │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ C8 MVP      │ Landing page   │ Pilot project  │ Prototype      │ Concierge      │ 30 posts       │
│             │ + core feature │ with 1 client  │ / sample batch │ (manual match) │ in 30 days     │
│             │ No-code OK     │ Manual process │ 3D render OK   │ Spreadsheet OK │ Prove cadence  │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ G7 Outbound │ Enterprise     │ Warm DM to     │ Retail buyer   │ Supply:        │ Collab DM      │
│ & Sales     │ sales, partner │ ideal clients  │ outreach,      │ recruit sellers│ to creators    │
│             │ outreach       │ "Can I help?"  │ wholesale      │ Demand: SEO    │ Guest posts    │
│             │                │ Referral ask   │ Distributor    │ + content      │ Interviews     │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ G8 Referral │ In-product:    │ Client refer   │ Unboxing →     │ Supply refers  │ "Share with    │
│ & Partner   │ "Invite team"  │ client = #1    │ social share   │ supply         │ a friend"      │
│             │ Integration    │ Partner with   │ Affiliate      │ Demand refers  │ Cross-promote  │
│             │ partnerships   │ complementary  │ program        │ demand         │ Affiliate      │
│             │ Affiliate      │ service firms  │ Influencer     │ API partners   │ Newsletter     │
│             │                │                │ collab         │                │ swap           │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ A3 Unit     │ MRR, churn     │ Margin per     │ COGS, margin   │ Take rate ×    │ RPM, CPM       │
│ Economics   │ LTV/CAC        │ project        │ per unit       │ GMV            │ ARPU           │
│             │ Payback months │ Utilization %  │ Inventory turn │ Supply+Demand  │ Sponsor value  │
│             │ NDR (net $     │ Effective rate  │ Return rate    │ CAC, LTV/CAC   │ Community LTV  │
│             │ retention)     │ per hour       │ CAC            │                │                │
├─────────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│ CONTENT     │ Tutorial,      │ Case study,    │ Review,        │ Both-side      │ The content    │
│ PILLARS     │ comparison,    │ methodology,   │ behind-scenes  │ success story, │ IS the product │
│ (typical)   │ product-led,   │ thought leader │ lifestyle,     │ industry       │ Education,     │
│             │ user story,    │ client story,  │ maker story,   │ insight, pain  │ entertainment, │
│             │ industry trend │ contrarian take│ how-to-use     │ point content  │ inspiration    │
└─────────────┴────────────────┴────────────────┴────────────────┴────────────────┴────────────────┘
```

### Channel Priority theo Business Type

```
DIGITAL PRODUCT:
  Phase 1: Content (Twitter/LinkedIn) + Product-led growth
  Phase 2: + SEO + Paid (validated creative) + Partnerships
  Phase 3: + Referral program + Enterprise sales

SERVICE:
  Phase 1: Content (LinkedIn) + Warm outreach + Referrals
  Phase 2: + Speaking/podcasts + Strategic partnerships
  Phase 3: + Paid + Team-driven sales

PHYSICAL PRODUCT:
  Phase 1: Content (Instagram/TikTok) + D2C website
  Phase 2: + Paid ads + Influencer + Retail
  Phase 3: + Wholesale + Amazon + International

MARKETPLACE:
  Phase 1: Content + Manual supply outreach + Community
  Phase 2: + SEO + Paid (demand side) + Supply referrals
  Phase 3: + API partnerships + Cross-marketplace

CONTENT/MEDIA:
  Phase 1: Content (1 platform) → build audience
  Phase 2: + Newsletter + 2nd platform + Community
  Phase 3: + Paid community + Events + Products
```

---

## 7. Skill Dependencies — Cái gì cần trước cái gì

### Universal Critical Path (14 skills minimum)

```
R1 Market Scanning
  → R2 Social Listening
    → S2 Segmentation
      → S3 Value Prop Design
        → S4 Offer Design ──→ C8 MVP (Product Builder)
        → S5 Content Pillar Design
          → S1 Thesis (confirms direction)
          → G3 Profile Optimization
            → G1 Strategic Engagement
              → C1 Hook Writing → C2 Long-form
                → A4 Content Performance → A6 CMF Score
                  → A5 Traction Score
                    → D1 Kill/Pivot/Continue/Scale

CRITICAL PATH = 14 skills, sequential.
Tất cả skills khác support hoặc parallel với path này.
```

### Parallel Tracks

```
TRACK 1: CONTENT (Growth Marketer)
  G3 → G1 → C1 → C2 → C3 → A4 → A6

TRACK 2: PRODUCT (Product Builder)
  S4 → C8 → C9 → launch → A8

TRACK 3: GROWTH CHANNELS (Business Developer)
  S6 → S8 → G7 → G8 → G6

Track 1 + Track 2 chạy SONG SONG trong 8 tuần experiment.
Track 3 activate dần từ tuần 4+.
```

---

## 8. Skill Progression — Phase 1 → 2 → 3

```
PHASE 1 — Learn (mỗi skill ở L1 "good enough")
  ──────────────────────────────────────────────
  ACTIVE (28 skills):
    Research:  R1 R2 R3 R4 R5 R6 R7 (tất cả, mức cơ bản)
    Strategy:  S1 S2 S3 S4 S5 S7 (S6 S8 simplified)
    Creation:  C1 C2 C3 C4 C6 C7 C8 (C5 C9 C10 secondary)
    Growth:    G1 G2 G3 G4 G9 (G5-G8 G10 chưa cần)
    Analysis:  A1 A4 A5 A6 A7 (A2 A3 A8 A9 simplified)
    Decision:  D1 D5 D6 (D2 D3 D4 chưa phức tạp)

  CONSTRAINTS:
    1 product/service type → không cần adapt nhiều
    1 primary channel → không cần C10 repurposing
    60 phút/ngày content maximum
    Mục tiêu: LEARN, không optimize

PHASE 2 — Systemize (skills lên L2 "templated")
  ──────────────────────────────────────────────
  THÊM ACTIVE:
    C5 Visual Content, C9 Offer Packaging, C10 Repurposing
    G5 Email/Newsletter, G6 Paid, G7 Outbound, G8 Referral
    A2 Opportunity Scoring, A3 Unit Economics, A8 Customer Analytics
    D4 Build/Buy/Partner

  KEY: Templates từ Phase 1 → portable playbook
  "Cách tiếp cận product 1 có dùng cho product 2 không?"

PHASE 3 — Platform (skills lên L3 "teachable")
  ──────────────────────────────────────────────
  TẤT CẢ 44 skills active ở L3
  Mỗi skill có SOP + template + benchmark
  Có thể hire + train người mới
  Skills compound across products
  A9 Portfolio Analysis nâng cao
  D3 Phase Transition = build shared infrastructure
```

---

## 9. Compound Skills — Tổ hợp tạo lợi thế cạnh tranh

```
COMPOUND 1: AUDIENCE-NATIVE MESSAGING
  R2 Social Listening × S5 Content Pillars × C1 Hook Writing
  → Content dùng ĐÚNG ngôn ngữ customer
  → Không guess — data-driven
  → Apply cho MỌI business type

COMPOUND 2: CONTENT-LED LAUNCH
  S8 Go-to-Market × G1 Engagement × C2 Long-form × G4 Nurturing
  → Launch product bằng audience đã build
  → Zero/low CAC cho first customers
  → Đặc biệt mạnh cho: Digital, Service, Content

COMPOUND 3: DEMAND VALIDATION TRƯỚC KHI BUILD
  C1 Hook Writing × A6 CMF Score × C8 MVP Design
  → Test demand bằng content TRƯỚC KHI build product
  → CMF Score > 0.3 = signal to build
  → Save thời gian + tiền: không build cái không ai cần
  → Apply cho MỌI business type

COMPOUND 4: PREDICTIVE KILL SIGNAL
  A6 CMF Score × A5 Traction Score × A1 Stress Testing
  → CMF predict Traction 3-4 tuần trước
  → Kill sớm hơn → save resources
  → Apply cho MỌI business type

COMPOUND 5: CROSS-PRODUCT PLAYBOOK (Phase 2+)
  A7 Pattern Extraction × C10 Templating × S5 Content Pillars
  → Patterns product 1 → templates product 2
  → Time-to-first-content giảm 60-80%
  → Apply cho MỌI business type

COMPOUND 6: FULL-FUNNEL CONTENT
  C6 Zero-click × C7 CTA Copy × G5 Email × G4 Nurturing
  → Content feed mọi stage của funnel:
    Awareness (zero-click) → Interest (long-form)
    → Desire (email nurture) → Action (CTA copy)
  → Apply cho MỌI business type

COMPOUND 7: SALES-CONTENT HYBRID (đặc biệt cho Service)
  G7 Outbound × C4 Storytelling × G8 Referral
  → Content build authority → outbound warm hơn
  → Case studies → referrals → more case studies (flywheel)
  → Đặc biệt mạnh cho: Service, B2B Digital

COMPOUND 8: PRODUCT-CONTENT LOOP (đặc biệt cho Digital)
  C8 MVP × A8 Customer Analytics × C2 Long-form × G2 Community
  → User behavior → content ideas → attract more users
  → Community feedback → product improvement → content about improvement
  → Đặc biệt mạnh cho: Digital, Marketplace
```

---

## 10. Traction Score — Metric thống nhất

### Thay thế Liquidity Score (marketplace-only) bằng Traction Score (universal)

```
TRACTION SCORE = Acquisition Signal × Activation Signal × Retention Signal
  Mỗi signal = 0 đến 1
  Tổng score = 0 đến 1

INTERPRET:
  < 0.1:   NO TRACTION — pivot hoặc kill
  0.1-0.3: EARLY SIGNAL — continue, optimize
  0.3-0.6: GROWING — double down
  > 0.6:   STRONG — scale

KILL: Không tăng sau 8 tuần → kill, không exception.
```

### Traction Score Components theo Business Type

```
┌─────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                 │ ACQUISITION      │ ACTIVATION       │ RETENTION        │
│                 │ "Có người đến?"  │ "Họ dùng/mua?"   │ "Họ quay lại?"   │
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ DIGITAL         │ Signup rate      │ Onboarding       │ Monthly active   │
│ PRODUCT         │ (organic)        │ completion %     │ users returning  │
│                 │                  │ First key action │ MRR retention %  │
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ SERVICE         │ Inbound leads    │ Discovery call   │ Repeat clients   │
│                 │ (organic)        │ → proposal → yes │ without incentive│
│                 │ Referral rate    │ First project NPS│ Referral rate    │
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ PHYSICAL        │ Store/page       │ First purchase   │ Reorder rate     │
│ PRODUCT         │ visits (organic) │ conversion %     │ without discount │
│                 │                  │                  │ Review/share rate│
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ MARKETPLACE     │ Supply signup +  │ % listings that  │ Repeat rate      │
│                 │ Demand signup    │ transact (match) │ both sides       │
│                 │ (= Liquidity     │ % buyers found   │ without incentive│
│                 │  Score inputs)   │ match            │                  │
├─────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ CONTENT /       │ Follower/sub     │ Engagement rate  │ Open rate /      │
│ MEDIA           │ growth (organic) │ (saves, shares,  │ return visit %   │
│                 │                  │  meaningful reply)│ Churn rate       │
└─────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

### 2-Metric Decision System

```
MỌI business type dùng 2 metrics:

  METRIC 1: Content-Market Fit Score (LEADING — đo từ tuần 2-3)
    = Engagement Quality × Audience Relevance × Conversion Signal
    Predict: "Có người quan tâm đến problem ta solve không?"

  METRIC 2: Traction Score (LAGGING — đo từ tuần 4-6)
    = Acquisition × Activation × Retention
    Confirm: "Product/service có thực sự deliver value không?"

  CMF = canary in the coal mine (cảnh báo sớm)
  Traction = ground truth (xác nhận thực tế)

  CMF cao + Traction thấp = product/offer cần fix (demand có, product chưa OK)
  CMF thấp + Traction cao = content cần fix (product OK, messaging sai)
  Cả hai thấp = thesis cần review (có thể sai từ đầu)
  Cả hai cao = SCALE
```

---

## 11. Skill Matrix tổng hợp

### Role × Category Matrix

```
              │RESEARCH│STRATEGY│CREATION│ GROWTH │ANALYSIS│DECISION│ TOTAL
──────────────┼────────┼────────┼────────┼────────┼────────┼────────┼──────
Strategy Dir  │        │S1 S6 S8│        │        │        │D2 D6   │  5
Market Resrch │R1-R7   │        │        │        │        │        │  7
Devil's Advoc │        │        │        │        │A1      │D6      │  2
Segment Anlst │R6      │S2      │        │        │A8      │        │  3
Value Archit  │        │S3 S4 S5│C7 C10  │        │        │        │  5
Biz Developer │        │S6 S7 S8│        │G7 G8   │A2 A5   │        │  7
Finance Anlst │        │        │        │        │A3 A9   │D4      │  3
CEO Cockpit   │        │        │        │        │A5 A6   │D1 D2 D3│  5
Growth Mktg   │        │        │C1-C7   │G1-G6   │A4 A6   │D5      │ 19
              │        │        │C10     │G9 G10  │        │        │
Product Build │R6      │S4      │C8 C9   │        │A3 A8   │        │  5
──────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
 + shared A7  │   +1   │  +1    │  +1    │  +1    │  +1    │  +1    │
──────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
UNIQUE skills │   7    │   8    │   10   │   10   │   9    │   6    │ = 50*
──────────────┴────────┴────────┴────────┴────────┴────────┴────────┘
* 50 = total assignments (nhiều role share 1 skill)
  44 = unique skills
```

### Skill Distribution Insight

```
HEAVIEST ROLE: Growth Marketer (19 assignments)
  → Role thực thi, cần đa dạng skills nhất
  → Nhưng KHÔNG có Research, Strategy → nhận input từ role khác

MOST SPECIALIZED: Market Research (7 skills, ALL in Research)
  → Chỉ làm 1 việc, làm rất sâu

LIGHTEST BUT CRITICAL: Devil's Advocate (2 skills)
  → Ít skill nhưng impact lớn nhất (prevent bad decisions)

NEW ROLE VALUE: Product Builder (5 skills)
  → Bridge giữa Strategy (S4 Offer) và Growth (launch → measure)
  → Trước đây gap này không ai own → product bị bỏ rơi

NO ROLE spans all 6 categories → buộc collaboration
```

---

## 12. Quick Reference

### Card A — Phase 1: Bắt đầu từ đâu?

```
STEP 1: XÁC ĐỊNH BUSINESS TYPE (bạn đang build gì?)
  □ Digital / Service / Physical / Marketplace / Content / Hybrid

STEP 2: CRITICAL PATH (14 skills, thứ tự):
  1.  R1 Market Scanning         → có gap không?
  2.  R2 Social Listening        → audience nói gì?
  3.  S1 Thesis Formation        → ta tin gì?
  4.  S2 Segmentation            → ai đau nhất?
  5.  S3 Value Prop Design       → ta offer gì khác?
  6.  S4 Offer Design            → đóng gói thế nào?
  7.  S5 Content Pillar Design   → messaging gì?
  8.  C8 MVP Design              → build gì minimum?
  9.  G3 Profile Optimization    → presence ready
  10. G1 Strategic Engagement    → bắt đầu engage
  11. C1 Hook Writing            → viết hook đầu tiên
  12. C2 Long-form Writing       → viết thread/article đầu tiên
  13. A4+A6 Performance + CMF    → có content-market fit?
  14. A5+D1 Traction + Decision  → continue hay kill?

STEP 3: DAILY RHYTHM (Phase 1, 60 phút)
  15 min: Consume + capture ideas
  30 min: Engage (G1 — reply add-value)
  15 min: Create/schedule 1 post
```

### Card B — Ai làm gì, khi nào?

```
                     DISCOVER    DEFINE      BUILD+TEST    DECIDE    EXTRACT
                     (tuần 0-2)  (tuần 1-3)  (tuần 2-8)    (tuần 8)  (post)
────────────────────────────────────────────────────────────────────────────
Strategy Director    ████                                    █
Market Research      ████████
Devil's Advocate                  ██          █ (week 4)    ██
Segment Analyst      ████████
Value Architect                 ████████
Business Developer              ████████     ████████       ██
Financial Analyst                            ████           ██
CEO Cockpit                       █ (check)                 ████
Growth Marketer                   ██         ████████████████████
Product Builder                 ████████     ████████████
All roles                                                            ████
```

### Card C — 44 Skills Complete List

```
RESEARCH (7):
  R1 Market Scanning | R2 Social Listening | R3 Influencer & Community Mapping
  R4 Competitive Intelligence | R5 Content & Channel Benchmarking
  R6 Customer Research | R7 Pricing Research

STRATEGY (8):
  S1 Thesis Formation | S2 Segmentation | S3 Value Proposition Design
  S4 Offer Design | S5 Content Pillar Design | S6 Channel Strategy
  S7 Experiment Design | S8 Go-to-Market Design

CREATION (10):
  C1 Hook Writing | C2 Long-form Writing | C3 Short-form Writing
  C4 Storytelling | C5 Visual Content | C6 Zero-click Content
  C7 CTA & Conversion Copy | C8 MVP/Prototype Design
  C9 Offer Packaging | C10 Content Repurposing & Templating

GROWTH (10):
  G1 Strategic Engagement | G2 Community Building
  G3 Profile & Presence Optimization | G4 Audience Nurturing
  G5 Email/Newsletter Growth | G6 Paid Acquisition
  G7 Outbound & Sales | G8 Referral & Partnership
  G9 Content Scheduling & Operations | G10 Trend Riding & Newsjacking

ANALYSIS (9):
  A1 Stress Testing | A2 Opportunity Scoring
  A3 Unit Economics Modeling | A4 Content Performance Analysis
  A5 Traction Scoring | A6 Content-Market Fit Scoring
  A7 Pattern Extraction | A8 Customer Analytics
  A9 Portfolio Analysis

DECISION (6):
  D1 Kill/Pivot/Continue/Scale | D2 Resource Allocation
  D3 Phase Transition | D4 Build/Buy/Partner
  D5 Strategy Pivot | D6 Tension Resolution

TOTAL: 44 unique skills across 6 categories and 10 roles
```

### Card D — Business Type Quick Selector

```
"Tôi đang build _____ "

→ DIGITAL PRODUCT:
    Content focus: Tutorial, comparison, product-led
    Key metric: MRR + churn + activation rate
    #1 channel: Content + Product-led growth
    MVP: Landing page + 1 core feature

→ SERVICE:
    Content focus: Case study, methodology, thought leadership
    Key metric: Margin + utilization + repeat rate
    #1 channel: Content + Referral + Warm outreach
    MVP: 1 pilot client, manual process

→ PHYSICAL PRODUCT:
    Content focus: Behind-scenes, lifestyle, reviews, how-to
    Key metric: COGS margin + reorder rate + CAC
    #1 channel: Content + D2C + Influencer
    MVP: Prototype + sample batch

→ MARKETPLACE:
    Content focus: Both-side stories, industry insight, pain content
    Key metric: Liquidity (match rate + repeat rate)
    #1 channel: Content + Manual supply recruit + Community
    MVP: Concierge (manual matching)

→ CONTENT/MEDIA:
    Content focus: Content IS the product
    Key metric: Growth rate + engagement + monetization readiness
    #1 channel: 1 platform → Newsletter → Community
    MVP: 30 posts in 30 days (prove cadence)

→ HYBRID:
    Pick PRIMARY type first. Add secondary later.
    Phase 1 = act like 1 type. Phase 2 = hybrid.
```