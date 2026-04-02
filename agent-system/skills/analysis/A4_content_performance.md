---
code: A4
name: Content Performance
type: api
category: analysis
description: >
  Fetch và structure performance metrics từ 6 social media platforms (Instagram, Facebook,
  Twitter/X, LinkedIn, TikTok, YouTube). Cung cấp data có cấu trúc cho A5 Traction Scoring
  và A6 CMF Scoring. Skill này chỉ fetch và normalize — không interpret.
tools_required:
  - mcp__marketing-tools__fetch_metrics
output_format: json
---

## Mục đích

Thu thập và tổng hợp performance metrics từ nhiều kênh social media. Cung cấp data có cấu
trúc, đã normalized, kèm data quality flags để các skill downstream (A5, A6) biết chính xác
độ tin cậy của data trước khi interpret.

Skill này **chỉ fetch và structure** — không đánh giá, không recommend, không interpret.
Mọi interpretation thuộc về A5 (Traction Scoring) và A6 (CMF Scoring).

---

## Input cần có

```json
{
  "platforms": ["instagram", "facebook", "twitter", "linkedin", "tiktok", "youtube"],
  "date_range": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "account_ids": {
    "instagram": "string | null",
    "facebook": "string | null",
    "twitter": "string | null",
    "linkedin": "string | null",
    "tiktok": "string | null",
    "youtube": "string | null"
  },
  "content_ids": ["string — optional, để trống nếu muốn fetch toàn bộ trong date_range"],
  "metrics_requested": ["engagement", "reach", "conversion", "audience"],
  "baseline_period": {
    "enabled": true,
    "days_back": 30
  }
}
```

> **Lưu ý về baseline_period:**
> - Nếu `enabled: true`, skill sẽ fetch thêm data của 30 ngày trước date_range để làm baseline cho anomaly detection.
> - Nếu `enabled: false` hoặc không có field này, anomaly detection sẽ chỉ detect within date_range (relative anomaly).
> - Default: `enabled: true, days_back: 30`.

---

## Error Handling Protocol

**Áp dụng cho mọi API call trong skill này.**

### Retry logic
```
Max retries: 3
Backoff: 2s → 4s → 8s (exponential)
Timeout per call: 15s
```

### Khi API call fail sau 3 retries

| Loại lỗi | Hành động |
|---|---|
| Rate limit (429) | Pause 60s, retry 1 lần nữa. Nếu vẫn fail → ghi vào `platforms_failed` với reason "rate_limit" |
| Auth error (401/403) | Không retry. Ghi vào `platforms_failed` với reason "auth_error" |
| Server error (5xx) | Retry theo schedule. Nếu vẫn fail → `platforms_failed` với reason "server_error" |
| Timeout | Retry theo schedule. Nếu vẫn fail → `platforms_failed` với reason "timeout" |
| Partial data | Fetch thành công nhưng thiếu fields → ghi vào `partial_data_flags` |

### Partial data handling

Nếu API trả về data nhưng thiếu một số metrics:
- Ghi `null` vào field đó trong output — không điền 0 (0 và null có nghĩa khác nhau)
- Thêm vào `partial_data_flags`: ghi rõ platform + field nào null + reason
- `data_completeness` được tính dựa trên % fields null

**Nguyên tắc:** Skill phải luôn return output JSON dù mọi platform đều fail.
Downstream skills cần biết data không có để xử lý — không được throw error và dừng.

---

## Platform Fetch Steps

Chỉ fetch các platforms có trong input `platforms` array và có `account_ids` không null.
Nếu platform trong `platforms` nhưng `account_id = null` → ghi vào `platforms_skipped` với reason "no_account_id".

---

### Step 1 — Instagram

```json
{
  "platform": "instagram",
  "metrics": [
    "reach", "impressions", "saves", "shares", "comments", "likes",
    "profile_visits", "website_clicks", "follows_from_content",
    "story_views", "story_replies", "story_exits",
    "reel_plays", "reel_shares", "reel_saves", "reel_avg_watch_time"
  ]
}
```

**Signal weights (dùng cho top content ranking):**
- Saves: 4x — highest intent signal, user muốn quay lại
- Shares: 3x — viral potential
- Comments: 2x — engagement depth
- Likes: 1x — passive engagement

**Computed metrics sau khi fetch:**
```
engagement_rate = (saves + shares + comments + likes) / reach × 100
save_rate = saves / reach × 100
share_rate = shares / reach × 100
reel_retention_rate = reel_avg_watch_time / reel_duration × 100 (nếu có)
```

---

### Step 2 — Facebook

```json
{
  "platform": "facebook",
  "metrics": [
    "reactions_like", "reactions_love", "reactions_haha",
    "reactions_wow", "reactions_sad", "reactions_angry",
    "shares", "comments", "reach_organic", "reach_paid", "reach_viral",
    "post_clicks", "link_clicks", "video_views", "video_avg_watch_time",
    "page_follows", "negative_feedback_hide", "negative_feedback_report"
  ]
}
```

**Computed metrics sau khi fetch:**
```
reactions_total = sum of all reaction types
reach_total = reach_organic + reach_paid + reach_viral
viral_reach_ratio = reach_viral / reach_total × 100
negative_feedback_rate = (negative_feedback_hide + negative_feedback_report) / reach_total × 100
engagement_rate = (reactions_total + shares + comments) / reach_total × 100
positive_reaction_ratio = (reactions_love + reactions_haha + reactions_wow)
                          / reactions_total × 100
```

> **negative_feedback_rate > 0.5%** = content mismatch signal đáng lo ngại. Flag trong anomalies.

---

### Step 3 — Twitter/X

```json
{
  "platform": "twitter",
  "metrics": [
    "impressions", "engagements", "retweets", "quote_tweets",
    "replies", "likes", "bookmarks", "link_clicks",
    "profile_clicks", "follows", "video_views", "video_completions"
  ]
}
```

**Computed metrics sau khi fetch:**
```
engagement_rate = engagements / impressions × 100
bookmark_rate = bookmarks / impressions × 100
amplification_rate = (retweets + quote_tweets) / impressions × 100
engaged_amplification_ratio = quote_tweets / (retweets + quote_tweets) × 100
```

> **engaged_amplification_ratio** = % trong tổng amplification là quote tweets (có thêm opinion).
> Cao = content provocative đủ để người khác thêm góc nhìn. Thấp = pure rebroadcast.

---

### Step 4 — LinkedIn

```json
{
  "platform": "linkedin",
  "metrics": [
    "impressions", "unique_views", "reactions", "comments", "reposts",
    "click_through_rate", "follows", "video_views", "video_completions",
    "document_views", "article_reads", "article_unique_reads",
    "follower_seniority", "follower_industry", "follower_function"
  ]
}
```

**Computed metrics sau khi fetch:**
```
engagement_rate = (reactions + comments + reposts) / impressions × 100
repost_rate = reposts / impressions × 100
comment_rate = comments / impressions × 100
```

> **Trên LinkedIn**, comment_rate là signal mạnh nhất — LinkedIn algorithm boost content có comment.
> Repost = professional endorsement, giá trị cao hơn reaction.

---

### Step 5 — TikTok

```json
{
  "platform": "tiktok",
  "metrics": [
    "video_views", "unique_viewers", "likes", "comments", "shares", "saves",
    "profile_visits", "follows", "avg_watch_time", "completion_rate",
    "traffic_source_for_you", "traffic_source_following",
    "traffic_source_search", "traffic_source_hashtag",
    "audience_territories", "audience_gender", "audience_age"
  ]
}
```

**Computed metrics sau khi fetch:**
```
engagement_rate = (likes + comments + shares + saves) / video_views × 100
save_rate = saves / video_views × 100
share_rate = shares / video_views × 100
retention_rate = avg_watch_time / video_duration × 100
viral_discovery_ratio = traffic_source_for_you / video_views × 100
```

> **viral_discovery_ratio** = % views đến từ FYP (For You Page) — cao = TikTok algorithm
> đang push content ra ngoài following. Đây là primary viral signal trên TikTok.
>
> **completion_rate > 50%** = strong content quality signal cho TikTok algorithm.

---

### Step 6 — YouTube

```json
{
  "platform": "youtube",
  "metrics": [
    "views", "unique_viewers", "watch_time_hours", "avg_view_duration",
    "avg_view_percentage", "likes", "dislikes", "comments", "shares",
    "subscribers_gained", "subscribers_lost", "impressions",
    "impressions_ctr", "end_screen_clicks", "card_clicks",
    "traffic_source_search", "traffic_source_suggested",
    "traffic_source_external", "traffic_source_browse",
    "audience_returning", "audience_new", "audience_age", "audience_gender"
  ]
}
```

**Computed metrics sau khi fetch:**
```
engagement_rate = (likes + comments + shares) / views × 100
retention_rate = avg_view_percentage
like_ratio = likes / (likes + dislikes) × 100
subscriber_conversion_rate = subscribers_gained / views × 100
discovery_ratio = traffic_source_suggested / views × 100
```

> **avg_view_percentage > 50%** = strong content quality signal cho YouTube algorithm.
> **impressions_ctr** = thumbnail + title effectiveness — benchmark: 2–10% là normal.

---

## Baseline Fetch (nếu baseline_period.enabled = true)

Fetch lại metrics cho period: `(date_range.start - baseline_period.days_back)` đến `date_range.start`.
Chỉ cần aggregate metrics (không cần top content) để làm baseline cho anomaly detection.

Nếu baseline fetch fail → ghi `baseline_available: false`, anomaly detection chuyển sang relative mode.

---

## Normalization

**Mục tiêu:** Cho phép so sánh cross-platform mà không bias về platform có base rate cao.

### Engagement Index (cross-platform comparable)

Mỗi platform có baseline engagement rate benchmark riêng:

| Platform | Benchmark engagement rate |
|---|---|
| Instagram | 1–3% |
| Facebook | 0.5–1.5% |
| Twitter/X | 0.5–1% |
| LinkedIn | 2–5% |
| TikTok | 5–9% |
| YouTube | 1–4% |

```
Platform Engagement Index = (actual_engagement_rate / platform_benchmark_midpoint) × 100

Ví dụ: TikTok 7% engagement / 7% benchmark = 100 (at benchmark)
        LinkedIn 6% engagement / 3.5% benchmark = 171 (above benchmark)
```

> **Không dùng raw engagement rate để so sánh cross-platform.**
> Luôn dùng Engagement Index khi compare. Raw rates chỉ dùng trong platform-specific analysis.

### Top Content Ranking

Với mỗi platform, rank content bằng weighted engagement score:

```
Weighted score = (saves × save_weight) + (shares × share_weight)
                + (comments × comment_weight) + (passive × 1)
```

Save/share/comment weights theo platform:

| Platform | Save weight | Share weight | Comment weight |
|---|---|---|---|
| Instagram | 4 | 3 | 2 |
| Facebook | 1 | 3 | 2 |
| Twitter/X | 3 (bookmark) | 2 | 2 |
| LinkedIn | 1 | 2 | 3 |
| TikTok | 4 | 3 | 2 |
| YouTube | 2 | 3 | 3 |

Return top 3 per platform, sorted by weighted score.

---

## Anomaly Detection

### Mode 1 — Baseline mode (khi baseline_available = true)
```
Flag nếu: metric > 2x baseline_avg HOẶC metric < 0.5x baseline_avg
Severity HIGH: > 3x hoặc < 0.3x
Severity MEDIUM: 2–3x hoặc 0.3–0.5x
```

### Mode 2 — Relative mode (khi baseline_available = false)
```
Tính avg và stddev của metric within date_range (per content piece)
Flag nếu: metric > (avg + 2×stddev) HOẶC metric < (avg - 2×stddev)
```

**Luôn flag:**
- `negative_feedback_rate > 0.5%` (Facebook) — severity HIGH
- `completion_rate < 20%` (TikTok/YouTube) — severity MEDIUM
- Bất kỳ metric nào là null khi previous period có data — severity LOW (data gap)

---

## Quy trình thực hiện

**Bước 1 — Validate input.** Kiểm tra platforms array, account_ids, date_range. Xác định
platforms sẽ được fetch (có account_id) vs skip (null account_id).

**Bước 2 — Fetch baseline (nếu enabled).** Fetch aggregate metrics cho baseline period trước.
Nếu fail → set `baseline_available: false`, tiếp tục.

**Bước 3 — Fetch từng platform** theo đúng steps 1–6 với error handling protocol.
Mỗi call: retry 3 lần với exponential backoff. Ghi kết quả vào buffer.

**Bước 4 — Compute derived metrics** cho từng platform từ raw data trong buffer.

**Bước 5 — Normalize.** Tính Engagement Index cho từng platform. Rank top content với
weighted scoring.

**Bước 6 — Cross-platform aggregation.** Tính cross-platform summary dùng Engagement Index,
không dùng raw rates.

**Bước 7 — Anomaly detection.** Chạy theo mode phù hợp (baseline vs relative).

**Bước 8 — Data quality assessment.** Tính `data_completeness` dựa trên % fields null
và số platforms failed.

**Bước 9 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A4",
  "date_range": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "baseline_period": {
    "enabled": true,
    "available": true,
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "platforms": {
    "instagram": {
      "fetched": true,
      "reach": 0,
      "impressions": 0,
      "saves": 0,
      "shares": 0,
      "comments": 0,
      "likes": 0,
      "profile_visits": 0,
      "website_clicks": 0,
      "follows_from_content": 0,
      "reel_plays": 0,
      "reel_shares": 0,
      "reel_saves": 0,
      "reel_avg_watch_time_seconds": 0,
      "engagement_rate": 0.0,
      "engagement_index": 0.0,
      "save_rate": 0.0,
      "share_rate": 0.0,
      "top_content": [
        {
          "content_id": "string",
          "type": "post | reel | story | carousel",
          "reach": 0,
          "saves": 0,
          "shares": 0,
          "comments": 0,
          "engagement_rate": 0.0,
          "weighted_score": 0.0
        }
      ]
    },
    "facebook": {
      "fetched": true,
      "reach_organic": 0,
      "reach_paid": 0,
      "reach_viral": 0,
      "reach_total": 0,
      "viral_reach_ratio": 0.0,
      "reactions": {
        "total": 0,
        "like": 0,
        "love": 0,
        "haha": 0,
        "wow": 0,
        "sad": 0,
        "angry": 0,
        "positive_ratio": 0.0
      },
      "shares": 0,
      "comments": 0,
      "post_clicks": 0,
      "link_clicks": 0,
      "video_views": 0,
      "video_avg_watch_time_seconds": 0,
      "negative_feedback_rate": 0.0,
      "engagement_rate": 0.0,
      "engagement_index": 0.0,
      "top_content": []
    },
    "twitter": {
      "fetched": true,
      "impressions": 0,
      "engagements": 0,
      "retweets": 0,
      "quote_tweets": 0,
      "replies": 0,
      "likes": 0,
      "bookmarks": 0,
      "link_clicks": 0,
      "profile_clicks": 0,
      "follows": 0,
      "engagement_rate": 0.0,
      "engagement_index": 0.0,
      "bookmark_rate": 0.0,
      "amplification_rate": 0.0,
      "engaged_amplification_ratio": 0.0,
      "top_content": []
    },
    "linkedin": {
      "fetched": true,
      "impressions": 0,
      "unique_views": 0,
      "reactions": 0,
      "comments": 0,
      "reposts": 0,
      "click_through_rate": 0.0,
      "follows": 0,
      "video_views": 0,
      "article_reads": 0,
      "engagement_rate": 0.0,
      "engagement_index": 0.0,
      "repost_rate": 0.0,
      "comment_rate": 0.0,
      "audience_quality": {
        "top_seniority": "string | null",
        "top_industry": "string | null",
        "top_function": "string | null"
      },
      "top_content": []
    },
    "tiktok": {
      "fetched": true,
      "video_views": 0,
      "unique_viewers": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "saves": 0,
      "profile_visits": 0,
      "follows": 0,
      "avg_watch_time_seconds": 0,
      "completion_rate": 0.0,
      "viral_discovery_ratio": 0.0,
      "engagement_rate": 0.0,
      "engagement_index": 0.0,
      "save_rate": 0.0,
      "share_rate": 0.0,
      "traffic_sources": {
        "for_you_percent": 0.0,
        "following_percent": 0.0,
        "search_percent": 0.0,
        "hashtag_percent": 0.0
      },
      "top_content": []
    },
    "youtube": {
      "fetched": true,
      "views": 0,
      "unique_viewers": 0,
      "watch_time_hours": 0,
      "avg_view_duration_seconds": 0,
      "avg_view_percentage": 0.0,
      "likes": 0,
      "dislikes": 0,
      "comments": 0,
      "shares": 0,
      "subscribers_gained": 0,
      "subscribers_lost": 0,
      "impressions": 0,
      "impressions_ctr": 0.0,
      "like_ratio": 0.0,
      "subscriber_conversion_rate": 0.0,
      "discovery_ratio": 0.0,
      "engagement_rate": 0.0,
      "engagement_index": 0.0,
      "retention_rate": 0.0,
      "traffic_sources": {
        "search_percent": 0.0,
        "suggested_percent": 0.0,
        "external_percent": 0.0,
        "browse_percent": 0.0
      },
      "audience": {
        "returning_percent": 0.0,
        "new_percent": 0.0
      },
      "top_content": []
    }
  },
  "cross_platform_summary": {
    "total_reach": 0,
    "total_engagement": 0,
    "avg_engagement_index": 0.0,
    "best_performing_platform": "string",
    "best_performing_platform_index": 0.0,
    "best_performing_content_type": "string",
    "content_count_total": 0,
    "platforms_above_benchmark": ["string — platforms có engagement_index > 100"]
  },
  "anomalies": [
    {
      "platform": "string",
      "metric": "string",
      "type": "spike | drop | negative_signal | data_gap",
      "severity": "HIGH | MEDIUM | LOW",
      "current_value": "string — với đơn vị",
      "baseline_value": "string — với đơn vị | null nếu relative mode",
      "detection_mode": "baseline | relative",
      "description": "string"
    }
  ],
  "data_quality": {
    "platforms_requested": ["string"],
    "platforms_fetched": ["string"],
    "platforms_failed": [
      {
        "platform": "string",
        "reason": "rate_limit | auth_error | server_error | timeout"
      }
    ],
    "platforms_skipped": [
      {
        "platform": "string",
        "reason": "no_account_id"
      }
    ],
    "partial_data_flags": [
      {
        "platform": "string",
        "fields_null": ["string"],
        "reason": "string"
      }
    ],
    "baseline_available": true,
    "data_completeness": "FULL | PARTIAL | MINIMAL",
    "data_completeness_note": "string — ví dụ: '2/6 platforms failed, TikTok partial'"
  }
}
```

---

## Business Type Adaptations

| Business Type | Primary Platforms | Key Metrics | Signal Priority |
|---|---|---|---|
| **B2C Marketplace** | Instagram, TikTok | Save rate, Share rate | Saves > Shares > Comments |
| **B2B Marketplace** | LinkedIn, Twitter | Comment rate, CTR | Comments > Reposts > CTR |
| **Local Service** | Facebook, Instagram | Shares, Website clicks | Shares > Link clicks > Reactions |
| **Content Platform** | YouTube, TikTok | Retention rate, Completion rate | Retention > Completion > Subscribers |
| **Professional Service** | LinkedIn | Article reads, Comment rate | Comments > Article reads > Reposts |

---

## Rules bắt buộc

1. **Luôn gọi API trước khi tính toán** — không dùng cached data quá 24h.
2. **Error handling protocol PHẢI được áp dụng cho mọi API call** — không skip retry logic.
3. **Null ≠ 0.** Fields không có data phải là `null`, không điền 0 để tránh distort computed metrics.
4. **Engagement rate = (engagements / reach) × 100**, KHÔNG phải / followers.
5. **Cross-platform comparison PHẢI dùng Engagement Index**, không dùng raw engagement rates.
6. **Top content PHẢI dùng weighted scoring** theo platform-specific weights, không phải raw engagement rate.
7. Skill này **KHÔNG interpret data** — không có section "insights", "recommendations", hay "patterns". Interpretation thuộc A5 và A6.
8. **Output JSON PHẢI luôn được return** dù mọi platform fail — downstream skills cần data_quality section để xử lý.
9. Anomaly detection: **phải ghi rõ detection_mode** (baseline vs relative) trong mỗi anomaly.
10. `data_completeness` được xác định theo rule:
    - `FULL`: 0 platforms failed, 0 partial_data_flags
    - `PARTIAL`: 1–2 platforms failed HOẶC có partial_data_flags
    - `MINIMAL`: ≥ 3 platforms failed