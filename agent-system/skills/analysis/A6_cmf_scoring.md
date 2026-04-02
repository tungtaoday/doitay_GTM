---
code: A6
name: CMF Scoring
type: reasoning
category: analysis
description: >
  Tính Content-Market Fit Score từ 3 dimensions: Engagement Quality, Audience Quality,
  Conversion Signal. Formula weighted additive — không multiplicative. Deterministic,
  có audit trail, nhất quán với data contract từ A4.
tools_required: []
output_format: json
---

## Mục đích

Đánh giá mức độ Content-Market Fit của một content strategy hoặc campaign bằng cách tính
CMF Score từ 3 dimensions. Cung cấp signal để CEO quyết định scale, optimize, hoặc kill
content direction — không phải để prescribe action.

Skill này **chỉ score và observe**. `content_signals` mô tả pattern quan sát được, không
phải việc phải làm. Quyết định thuộc CEO.

---

## Input cần có

```json
{
  "campaign_name": "string",
  "business_type": "marketplace | content_platform | saas | service | b2b",
  "content_week": 0,
  "target_segment_definition": {
    "description": "string — mô tả target segment bằng behavior/jobs-to-be-done",
    "platform_proxies": {
      "instagram": "string | null — hashtags, accounts, hoặc demographics target segment follow",
      "linkedin": "string | null — seniority, industry, function của target",
      "tiktok": "string | null — niche topics, sound categories target segment engage",
      "youtube": "string | null — channel types target segment watch",
      "facebook": "string | null — interests, groups target segment thuộc về",
      "twitter": "string | null — accounts, topics target segment follows"
    }
  },
  "platform_data": {
    "instagram": {
      "from_a4": true,
      "reach": 0,
      "impressions": 0,
      "saves": 0,
      "shares": 0,
      "comments": 0,
      "likes": 0,
      "website_clicks": 0,
      "follows_from_content": 0,
      "engagement_index": 0.0,
      "audience_demographics": {
        "age_match_percent": 0.0,
        "location_match_percent": 0.0,
        "gender_match_percent": 0.0
      },
      "top_content": []
    },
    "facebook": {
      "from_a4": true,
      "reach_total": 0,
      "reactions_total": 0,
      "shares": 0,
      "comments": 0,
      "link_clicks": 0,
      "negative_feedback_rate": 0.0,
      "engagement_index": 0.0,
      "viral_reach_ratio": 0.0,
      "audience_demographics": {
        "age_match_percent": 0.0,
        "location_match_percent": 0.0
      }
    },
    "twitter": {
      "from_a4": true,
      "impressions": 0,
      "bookmarks": 0,
      "quote_tweets": 0,
      "retweets": 0,
      "replies": 0,
      "likes": 0,
      "link_clicks": 0,
      "engagement_index": 0.0
    },
    "linkedin": {
      "from_a4": true,
      "impressions": 0,
      "comments": 0,
      "reposts": 0,
      "reactions": 0,
      "click_through_rate": 0.0,
      "engagement_index": 0.0,
      "audience_quality": {
        "top_seniority": "string | null",
        "top_industry": "string | null",
        "top_function": "string | null",
        "segment_match_percent": 0.0
      }
    },
    "tiktok": {
      "from_a4": true,
      "video_views": 0,
      "saves": 0,
      "shares": 0,
      "comments": 0,
      "likes": 0,
      "completion_rate": 0.0,
      "viral_discovery_ratio": 0.0,
      "engagement_index": 0.0
    },
    "youtube": {
      "from_a4": true,
      "views": 0,
      "avg_view_percentage": 0.0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "subscriber_conversion_rate": 0.0,
      "engagement_index": 0.0
    }
  },
  "conversion_tracking": {
    "tracked_actions": ["link_click | dm_inquiry | email_signup | form_fill | purchase | other"],
    "conversions_total": 0,
    "total_reach_for_conversion": 0,
    "conversion_value_per_action": 0.0,
    "currency": "VND | USD"
  },
  "historical_context": {
    "previous_week_scores": {
      "cmf_score": 0.0,
      "engagement_quality": 0.0,
      "audience_quality": 0.0,
      "conversion_signal": 0.0
    },
    "last_n_weeks_cmf_scores": [0.0],
    "weeks_available": 0
  }
}
```

> **Lưu ý về data contract với A4:**
> - Tất cả fields có `from_a4: true` nên được populated từ A4 output của cùng date range.
> - `engagement_index` là field đã normalized từ A4 — A6 dùng trực tiếp, không normalize lại.
> - Nếu A4 không chạy trước, `engagement_index = null` và confidence dimension đó = LOW.
>
> **Lưu ý về `target_segment_definition`:**
> - `platform_proxies` là cách operationalize target segment trên từng platform.
> - LinkedIn có `segment_match_percent` vì LinkedIn API return demographic breakdown — dùng để tính Audience Quality trực tiếp.
> - Các platform khác dùng `age_match_percent`, `location_match_percent` từ demographic data nếu có.

---

## Tại sao Weighted Additive thay vì Multiplicative

Công thức gốc `CMF = EQ × AR × CS` có vấn đề cốt lõi:

- Nếu một component = 0.3, CMF tối đa chỉ là 0.3 dù hai components kia hoàn hảo.
- Threshold CMF > 0.5 với formula này yêu cầu mỗi component trung bình ~0.79 — unrealistically high.
- Early-stage content thường có Conversion Signal thấp — multiplicative formula sẽ kill mọi thứ.

**Weighted additive phản ánh đúng thực tế hơn:** mỗi dimension contribute, không có dimension nào có quyền veto đơn độc. Trọng số phản ánh tầm quan trọng tương đối.

---

## Business Type Weights

Giống A5, EQ/AQ/CS weights thay đổi theo business type — không dùng một bộ cố định.

### B2C Marketplace
```
EQ: 35%   AQ: 40%   CS: 25%
```
*AQ > EQ: reach đúng người quan trọng hơn content resonance trong marketplace context.*

### B2B Marketplace
```
EQ: 25%   AQ: 50%   CS: 25%
```
*AQ dominant: ICP precision là sống còn trong B2B. EQ thấp vì B2B content thường ít viral.*

### Local Service
```
EQ: 30%   AQ: 45%   CS: 25%
```
*AQ critical vì location match. CS đo website click và DM inquiry.*

### Content Platform
```
EQ: 50%   AQ: 30%   CS: 20%
```
*EQ dominant: engagement quality là metric chính của content platform.*

### SaaS
```
EQ: 30%   AQ: 45%   CS: 25%
```
*AQ > EQ: function + seniority match với ICP quyết định conversion quality.*

> **Rule:** Xác định weights từ bảng trên trước khi tính CMF Score.
> Ghi weights đã apply vào `weights_applied` trong output.

---

## Scoring System

### Formula

```
CMF Score = EQ × weight_eq + AQ × weight_aq + CS × weight_cs
Range: 0–100
```

*Weights lấy từ bảng Business Type Weights theo `business_type` của input.*

### CMF Health Thresholds

| CMF Score | Health | Ý nghĩa |
|---|---|---|
| 70–100 | **STRONG_FIT** | Content đang hit đúng audience với quality cao |
| 50–69 | **GOOD_FIT** | Fit tốt, room to optimize |
| 30–49 | **PARTIAL_FIT** | Có signal nhưng chưa đủ mạnh ở 1–2 dimensions |
| 15–29 | **WEAK_FIT** | Tín hiệu yếu, cần investigate |
| 0–14 | **NO_FIT** | Không có signal meaningful |

### Kill Signals

| Điều kiện | Severity |
|---|---|
| CMF Score < 15 tại content_week ≥ 4 | KILL |
| CMF Score giảm ≥ 3 tuần liên tiếp | WARNING |
| EQ < 10 tại content_week ≥ 4 (content không resonant) | KILL |
| AQ < 10 tại content_week ≥ 4 (reaching completely wrong audience) | INVESTIGATE |
| CS = 0 tại content_week ≥ 8 (không có conversion signal gì) | WARNING |

---

## Dimension 1 — Engagement Quality (EQ)

**Mục tiêu:** Đo tỷ lệ meaningful interactions so với passive exposure.
Signal: người dùng chủ động làm gì với content, không chỉ xem qua.

### Bước EQ1 — Meaningful Interaction Score per platform

Với mỗi platform, tính Meaningful Interaction Score (MIS):

**Instagram:**
```
MIS_instagram = (saves × 3 + shares × 2 + comments × 1.5 + likes × 0.5) / reach
Normalize: floor = 0, ceiling = 0.15 (15% weighted interaction rate = exceptional)
```

**Facebook:**
```
MIS_facebook = (shares × 3 + comments × 2 + positive_reactions × 1 + link_clicks × 2) / reach_total
Penalty: subtract (negative_feedback_rate × 50) from normalized score
Normalize: floor = 0, ceiling = 0.10
```

**Twitter/X:**
```
MIS_twitter = (bookmarks × 3 + quote_tweets × 2.5 + retweets × 1.5
               + replies × 1.5 + likes × 0.5) / impressions
Normalize: floor = 0, ceiling = 0.08
```

**LinkedIn:**
```
MIS_linkedin = (comments × 3 + reposts × 2.5 + reactions × 1
                + click_through_rate × 100 × 2) / 6.5
Normalize: floor = 0, ceiling = 0.06
```

**TikTok:**
```
MIS_tiktok = (saves × 4 + shares × 3 + comments × 2 + likes × 0.5) / video_views
Bonus: add (completion_rate / 100 × 20) to normalized score, cap at 100
Normalize base: floor = 0, ceiling = 0.20
```

**YouTube:**
```
MIS_youtube = (shares × 3 + comments × 2.5 + likes × 1
               + subscriber_conversion_rate × 100 × 3) / 6.5
Bonus: add (avg_view_percentage / 100 × 25) to normalized score, cap at 100
Normalize base: floor = 0, ceiling = 0.05
```

### Bước EQ2 — Cross-platform EQ (tách rõ hai roles)

**Vấn đề cần tránh:** Dùng `engagement_index` để weight `MIS_normalized` là double counting — cả hai đều encode engagement quality. `engagement_index` (từ A4) đã phản ánh relative performance của platform; MIS đã phản ánh content quality trên platform đó.

**Đúng:** `engagement_index` xác định **platform relevance** cho campaign này — platform nào đang được audience engage nhiều hơn trong context hiện tại thì có tiếng nói lớn hơn. MIS được normalize độc lập, không bị điều chỉnh bởi engagement_index.

```
Bước 1 — Tính Platform Relevance Weight từ engagement_index:
  Relevance_platform = engagement_index_platform / Σ(engagement_index_all_active_platforms)
  (active = platform có data và engagement_index > 0)

Bước 2 — Cross-platform EQ:
  EQ = Σ(MIS_normalized_platform × Relevance_platform)

Lý do tách: MIS đo "content này tốt không trên platform đó"
            Relevance đo "platform này có đang được audience của ta dùng không"
            Hai câu hỏi khác nhau → không được multiply cùng nhau.
```

Nếu chỉ có 1 platform: `EQ = MIS_normalized` của platform đó, `Relevance = 1.0`.

---

## Dimension 2 — Audience Quality (AQ)

**Mục tiêu:** Đo mức độ content đang reach đúng target segment.

> **Lưu ý quan trọng về tính toán:**
> Audience Quality không thể được đo trực tiếp từ hầu hết platform APIs — chúng không
> return "user này có trong target segment không." Thay vào đó, AQ được tính từ **proxy signals**
> kết hợp với demographic data nơi có thể lấy được.

### Bước AQ1 — Demographic Match Score (nơi có data)

Với LinkedIn, Instagram, Facebook — có demographic breakdown từ API:
```
Demo_match = (age_match_percent × 0.35)
           + (location_match_percent × 0.40)
           + (gender_match_percent × 0.25)    [chỉ nếu relevant với target]

Normalize: floor = 0, ceiling = 100 (đây đã là % nên không cần convert)
```

Nếu `target_segment_definition.platform_proxies` không specify gender → bỏ gender_match,
redistribute: age = 0.45, location = 0.55.

### Bước AQ2 — Behavioral Proxy Score

Các signals phản ánh audience quality mà không cần demographic data:

| Platform | Proxy Signal | Ý nghĩa |
|---|---|---|
| TikTok | `viral_discovery_ratio` thấp (< 20%) | Reach chủ yếu từ following/search = more targeted |
| TikTok | `viral_discovery_ratio` cao (> 70%) | Reach random FYP = less targeted |
| Facebook | `viral_reach_ratio` thấp (< 10%) | Organic reach = closer to existing audience |
| Instagram | `follows_from_content / reach` | Conversion to follow = strong audience fit signal |
| LinkedIn | `segment_match_percent` từ `audience_quality` | Direct demographic match |
| YouTube | `audience_returning_percent` | Returning viewers = built targeted base |
| Any | `negative_feedback_rate` (Facebook) | High = wrong audience |

**Behavioral Proxy Score formula:**
```
BPS_platform = base score từ primary proxy signal của platform (0–100)
             - penalty nếu có negative signal (negative_feedback_rate > 0.5% = -20 points)
```

### Bước AQ3 — Intent Layer (optional enhancement)

Intent signals là stronger evidence of audience quality hơn demographics hay behavioral proxies — họ không chỉ "giống target" mà đang thể hiện intent thực sự.

**Intent signals available per platform:**

| Platform | Intent Signal | Proxy cho |
|---|---|---|
| YouTube | `audience_returning_percent` | Audience đã build, không phải random |
| Instagram | `follows_from_content / reach` | Strong fit → follow action |
| TikTok | `traffic_source_following / video_views` | % từ people đã follow = targeted base |
| LinkedIn | `click_through_rate > 2%` | Professional intent signal |
| Any | DM inquiries (nếu tracked trong conversion_tracking) | Highest intent signal |

**Intent Score (IS) — chỉ tính nếu có ít nhất 1 intent signal:**
```
IS = weighted average của intent signals available (normalize 0–100 per signal)
IS confidence = HIGH nếu ≥ 2 signals, MEDIUM nếu 1 signal
```

### Bước AQ4 — Composite AQ

```
Nếu có demographic data VÀ intent signals (IS available):
  AQ = Demo_match × 0.30 + BPS_weighted × 0.30 + IS × 0.40
  audience_quality_confidence = HIGH

Nếu có demographic data, không có IS:
  AQ = Demo_match × 0.60 + BPS_weighted × 0.40
  audience_quality_confidence = MEDIUM

Nếu không có demographic data, có IS:
  AQ = BPS_weighted × 0.40 + IS × 0.60
  audience_quality_confidence = MEDIUM

Nếu chỉ có BPS (không có demo, không có IS):
  AQ = BPS_weighted
  audience_quality_confidence = LOW

Nếu không có gì:
  AQ = 50 (neutral assumption)
  audience_quality_confidence = LOW
```

> **Intent layer là optional** — nếu không có data thì fallback về tier thấp hơn với confidence flag.
> Không hardcode IS weight = 40% nếu không có data để back it up.

---

## Dimension 3 — Conversion Signal (CS)

**Mục tiêu:** Đo intent toward action — bất kỳ measurable step nào về phía transaction.

### Bước CS1 — Conversion Rate

```
Conversion Rate = conversions_total / total_reach_for_conversion × 100
```

### Bước CS2 — Normalize theo business type

**Universal ceiling 3% là sai** — context khác nhau, baseline khác nhau.

| Business Type | CS Ceiling | Lý do |
|---|---|---|
| B2C Marketplace | 3% | Social → product page click là low-friction |
| B2B Marketplace | 1% | Form fill / DM inquiry từ content là high-friction |
| Local Service | 2% | Website click / DM từ local content |
| Content Platform | 5% | Subscribe / email signup = lower friction |
| SaaS | 0.5% | Trial signup / demo request từ content = rất high-friction |

```
CS_ceiling = lấy từ bảng theo business_type
CS = clamp((conversion_rate / CS_ceiling) × 100, 0, 100)
```

*Ghi `cs_ceiling_used` trong output để audit trail.*

### Bước CS3 — Conversion Quality Multiplier

Không phải mọi conversion có giá trị như nhau:

| Tracked Action | Quality Multiplier |
|---|---|
| purchase | 1.5 |
| form_fill / email_signup | 1.2 |
| dm_inquiry | 1.0 |
| link_click | 0.7 |
| other | 0.8 |

```
CS_adjusted = CS × quality_multiplier (cap tại 100)
```

---

## Trend và Velocity

**Yêu cầu `weeks_available > 0` trong historical_context.**

```
CMF delta = cmf_score_current - previous_week_scores.cmf_score
EQ delta = eq_current - previous_week_scores.engagement_quality
AQ delta = aq_current - previous_week_scores.audience_quality
CS delta = cs_current - previous_week_scores.conversion_signal
```

**CMF Trend** (dùng `last_n_weeks_cmf_scores`):

| Điều kiện | Trend |
|---|---|
| slope > +2/week (≥ 3 tuần) | ACCELERATING |
| slope 0 đến +2 | STEADY |
| slope -2 đến 0 | DECELERATING |
| slope < -2 | DECLINING |
| weeks_available < 2 | null, flag trend_confidence = LOW |

---

## Content Signals

Sau khi tính xong 3 dimensions, detect các patterns sau:

| Pattern | Điều kiện | Severity |
|---|---|---|
| `high_eq_low_aq` | EQ > 60 VÀ AQ < 30 | HIGH — content resonant nhưng với wrong audience |
| `high_aq_low_eq` | AQ > 60 VÀ EQ < 30 | MEDIUM — đúng audience nhưng content chưa hit |
| `eq_cs_gap` | EQ > 60 VÀ CS < 20 | MEDIUM — engagement tốt nhưng không convert |
| `cs_spike_no_eq` | CS > 60 VÀ EQ < 30 | HIGH — conversion là anomaly, không sustainable |
| `all_dimensions_low` | EQ < 20 VÀ AQ < 20 VÀ CS < 20 | CRITICAL — no signal anywhere |
| `strong_fit_signal` | EQ > 60 VÀ AQ > 60 VÀ CS > 40 | — Positive pattern, not a warning |

> `content_signals` là observation — không dùng từ "cần/nên/phải/hãy."

---

## Quy trình thực hiện

**Bước 1 — Validate input.** Kiểm tra `business_type`, xác định weights từ Business Type Weights table. Kiểm tra platforms có data, `engagement_index` có từ A4 không. Xác định `weeks_available`.

**Bước 2 — Tính EQ.** Tính MIS per platform (normalize độc lập). Tính Platform Relevance Weight từ `engagement_index` (tách biệt với MIS). Cross-platform EQ = Σ(MIS_normalized × Relevance_weight).

**Bước 3 — Tính AQ.** Xác định data available (demo / behavioral / intent). Tính từng layer. Chọn composite formula theo tier. Xác định `audience_quality_confidence`.

**Bước 4 — Tính CS.** Lấy CS ceiling theo business type. Tính conversion rate, normalize theo ceiling, apply quality multiplier.

**Bước 5 — Tính CMF Score** = EQ × weight_eq + AQ × weight_aq + CS × weight_cs.

**Bước 6 — Trend** (chỉ khi weeks_available > 0).

**Bước 7 — Kill Signal Check.**

**Bước 8 — Content Signals.** Detect cross-dimension patterns.

**Bước 9 — Confidence Assessment.**

**Bước 10 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A6",
  "campaign_name": "string",
  "business_type": "string",
  "content_week": 0,
  "trend_available": true,
  "weights_applied": {
    "eq": 0.0,
    "aq": 0.0,
    "cs": 0.0,
    "source": "business_type_table"
  },
  "cmf_score": 0.0,
  "dimensions": {
    "engagement_quality": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "platform_breakdown": {
        "instagram": {
          "mis_raw": 0.0,
          "mis_normalized": 0.0,
          "platform_relevance_weight": 0.0,
          "note": "relevance_weight from engagement_index, independent of mis_normalized"
        },
        "facebook": { "mis_raw": 0.0, "mis_normalized": 0.0, "platform_relevance_weight": 0.0 },
        "twitter": { "mis_raw": 0.0, "mis_normalized": 0.0, "platform_relevance_weight": 0.0 },
        "linkedin": { "mis_raw": 0.0, "mis_normalized": 0.0, "platform_relevance_weight": 0.0 },
        "tiktok": { "mis_raw": 0.0, "mis_normalized": 0.0, "platform_relevance_weight": 0.0 },
        "youtube": { "mis_raw": 0.0, "mis_normalized": 0.0, "platform_relevance_weight": 0.0 }
      },
      "delta_vs_last_week": 0.0,
      "trend": "UP | DOWN | FLAT | null"
    },
    "audience_quality": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "demographic_match_score": 0.0,
      "behavioral_proxy_score": 0.0,
      "intent_score": 0.0,
      "intent_signals_used": ["string | null"],
      "calculation_basis": "demo + behavioral + intent | demo + behavioral | behavioral + intent | behavioral_only | neutral_assumption",
      "audience_quality_confidence": "HIGH | MEDIUM | LOW",
      "delta_vs_last_week": 0.0,
      "trend": "UP | DOWN | FLAT | null"
    },
    "conversion_signal": {
      "score": 0.0,
      "weighted_contribution": 0.0,
      "conversion_rate_percent": 0.0,
      "cs_ceiling_used": 0.0,
      "conversions_total": 0,
      "tracked_action_type": "string",
      "quality_multiplier_applied": 0.0,
      "delta_vs_last_week": 0.0,
      "trend": "UP | DOWN | FLAT | null"
    }
  },
  "cmf_trend": "ACCELERATING | STEADY | DECELERATING | DECLINING | null",
  "cmf_velocity": 0.0,
  "trend_confidence": "HIGH | MEDIUM | LOW | null",
  "health": "STRONG_FIT | GOOD_FIT | PARTIAL_FIT | WEAK_FIT | NO_FIT",
  "kill_signals": {
    "checkable": true,
    "triggered": false,
    "signals": [
      {
        "type": "string",
        "severity": "KILL | WARNING | INVESTIGATE",
        "condition_met": "string"
      }
    ]
  },
  "content_signals": [
    {
      "pattern": "string — tên pattern",
      "dimensions_involved": ["string"],
      "observation": "string — mô tả pattern, không phải action",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW | POSITIVE"
    }
  ],
  "top_contributing_content": [
    {
      "platform": "string",
      "content_id": "string",
      "cmf_contribution": "string — dimension nào strong nhất với content này",
      "weighted_score": 0.0
    }
  ],
  "confidence_overall": "HIGH | MEDIUM | LOW",
  "confidence_notes": [
    "string — lý do cụ thể nếu dimension bị LOW confidence"
  ]
}
```

---

## Business Type Adaptations

| Business Type | EQ Signal Trọng tâm | AQ Priority | CS Definition |
|---|---|---|---|
| B2C Marketplace | Instagram/TikTok saves + shares | Demographics match + location | Link click → product page |
| B2B Marketplace | LinkedIn comments + reposts | Seniority + Industry match | Form fill, DM inquiry |
| Local Service | Facebook shares + link clicks | Location match là critical | Website click, DM |
| Content Platform | YouTube retention + TikTok completion | Interest/niche match | Subscribe, email signup |
| SaaS | LinkedIn CTR + Twitter bookmarks | Function + Seniority match | Trial signup, demo request |

---

## Rules bắt buộc

1. **Formula PHẢI là weighted additive**. Weights lấy từ Business Type Weights table — không dùng fixed 40/35/25.
2. **`engagement_index` từ A4 dùng để tính Platform Relevance Weight** — không dùng để weight MIS_normalized. Hai roles phải tách biệt hoàn toàn.
3. **AQ PHẢI dùng đúng tier composite** theo data available: Intent > Demographic > Behavioral > Neutral. Ghi rõ `calculation_basis` và `audience_quality_confidence`.
4. **CS ceiling PHẢI theo business type** — không dùng universal 3%. Ghi `cs_ceiling_used` trong output.
5. **`weights_applied` PHẢI được output** với source = "business_type_table" để audit trail.
6. **AQ confidence PHẢI được ghi rõ.** Nếu không có demographic data và không có intent signals → `audience_quality_confidence: LOW`.
7. **CS = 0 không tự động kill** — chỉ kill khi CS = 0 tại week ≥ 8.
8. **Trend chỉ tính khi `weeks_available > 0`.** Nếu không → `trend_available: false`.
9. **`content_signals` là observation only** — không dùng từ "cần/nên/phải/hãy."
10. **`top_contributing_content` lấy từ A4 `top_content`** per platform — không re-rank.
11. **Không so sánh CMF Score cross-campaign** nếu business type khác nhau — weights và CS ceiling khác nhau, scores không comparable.
12. Kill signals là **không negotiable** — CMF < 15 tại week ≥ 4 = KILL.
13. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.