---
code: A8
name: Customer Analytics
type: api
category: analysis
description: >
  Fetch và structure web/app analytics data từ 4 platforms (GA4, Mixpanel, Amplitude, Plausible).
  Platform routing tự động theo input. Cung cấp data có cấu trúc cho A3, A5, và downstream
  skills. Skill này chỉ fetch và compute — không interpret.
tools_required:
  - mcp__marketing-tools__fetch_web_analytics
output_format: json
---

## Mục đích

Thu thập web/app analytics data để hiểu hành vi người dùng trên website/app. Cung cấp
structured data cho A3 (Unit Economics), A5 (Traction Scoring), và các downstream skills.

Skill này **chỉ fetch và compute** — không đánh giá, không recommend. Interpretation thuộc
về các skills khác trong hệ thống.

---

## Input cần có

```json
{
  "website_url": "string",
  "analytics_platform": "ga4 | mixpanel | amplitude | plausible",
  "date_range": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "baseline_period": {
    "enabled": true,
    "days_back": 30
  },
  "segments_to_analyze": ["all_users", "new_users", "returning_users", "supply_side", "demand_side"],
  "segment_identifiers": {
    "supply_side": {
      "method": "user_property | url_pattern | event_tag | null",
      "value": "string | null — ví dụ: user_property 'role=provider', url '/dashboard/supply', event 'supply_onboarded'"
    },
    "demand_side": {
      "method": "user_property | url_pattern | event_tag | null",
      "value": "string | null"
    },
    "custom_segments": [
      {
        "name": "string",
        "method": "user_property | url_pattern | event_tag",
        "value": "string"
      }
    ]
  },
  "goals_configured": [
    {
      "goal_name": "string",
      "goal_type": "signup | transaction | lead | pageview | custom_event",
      "event_or_url": "string — event name hoặc URL trigger goal này"
    }
  ],
  "funnel_definition": [
    {
      "step": 0,
      "name": "string — tên step",
      "trigger": "string — URL hoặc event name"
    }
  ],
  "metrics_requested": ["traffic", "behavior", "conversion", "acquisition", "retention"]
}
```

> **Lưu ý về `segment_identifiers`:**
> - Nếu `supply_side.method = null` → skip supply/demand segment comparison, ghi vào `segments_skipped`.
> - Nếu không define custom segments → chỉ fetch new vs returning.
>
> **Lưu ý về `baseline_period`:**
> - Nếu `enabled: true`, fetch thêm aggregate metrics của 30 ngày trước để làm baseline cho anomaly detection.
> - Default: `enabled: true, days_back: 30`.

---

## Error Handling Protocol

Áp dụng cho mọi API call. Giống A4.

```
Max retries: 3
Backoff: 2s → 4s → 8s (exponential)
Timeout per call: 15s
```

| Lỗi | Hành động |
|---|---|
| Rate limit (429) | Pause 60s, retry 1 lần nữa → nếu fail: `reports_failed` |
| Auth error (401/403) | Không retry → `reports_failed` với reason "auth_error" |
| Server error (5xx) | Retry theo schedule → `reports_failed` với reason "server_error" |
| Partial data | Ghi `null` vào fields thiếu, thêm vào `partial_data_flags` |

**Output JSON PHẢI luôn được return** dù mọi report fail. `null ≠ 0`.

---

## Platform Routing

**Bước đầu tiên bắt buộc:** Xác định platform path trước khi gọi bất kỳ API nào.

| analytics_platform | Path |
|---|---|
| `ga4` | Path GA4 |
| `mixpanel` | Path Mixpanel |
| `amplitude` | Path Amplitude |
| `plausible` | Path Plausible |

Nếu platform không recognized → ghi `"platform_error": "unsupported platform"`, return empty output với data_quality note.

---

## Path GA4 — Google Analytics 4

### GA4-1: Traffic Report
```json
{
  "platform": "ga4",
  "report_type": "traffic",
  "metrics": [
    "sessions", "totalUsers", "newUsers", "engagedSessions",
    "screenPageViews", "screenPageViewsPerSession",
    "averageSessionDuration", "bounceRate"
  ],
  "dimensions": ["date", "sessionDefaultChannelGroup", "deviceCategory", "country", "city"]
}
```

### GA4-2: Behavior Report
```json
{
  "platform": "ga4",
  "report_type": "behavior",
  "metrics": [
    "screenPageViews", "averageSessionDuration", "bounceRate",
    "scrolledUsers", "eventCount", "eventCountPerUser"
  ],
  "dimensions": ["pagePath", "pageTitle", "eventName", "eventCategory"]
}
```

### GA4-3: Conversion Report
```json
{
  "platform": "ga4",
  "report_type": "conversion",
  "metrics": [
    "conversions", "sessionConversionRate", "userConversionRate",
    "totalRevenue", "averagePurchaseRevenue", "purchaseToViewRate"
  ],
  "dimensions": ["eventName", "sessionDefaultChannelGroup", "landingPage", "deviceCategory"]
}
```

### GA4-4: Acquisition Report
```json
{
  "platform": "ga4",
  "report_type": "acquisition",
  "metrics": [
    "sessions", "totalUsers", "newUsers", "conversions",
    "sessionConversionRate", "totalRevenue"
  ],
  "dimensions": ["sessionDefaultChannelGroup", "sessionSource", "sessionMedium", "sessionCampaignName"]
}
```

### GA4-5: Retention Report
```json
{
  "platform": "ga4",
  "report_type": "retention",
  "metrics": [
    "cohortActiveUsers", "cohortTotalUsers"
  ],
  "dimensions": ["cohort", "cohortNthDay", "cohortNthWeek"]
}
```

**GA4 field mappings → normalized output:**
```
totalUsers → total_users
newUsers → new_users
averageSessionDuration → avg_session_duration_seconds
sessionDefaultChannelGroup → channel
cohortNthDay (0,6,13,29) → d1, d7, d14, d30 retention
```

---

## Path Mixpanel

### MP-1: Traffic / User Report
```json
{
  "platform": "mixpanel",
  "report_type": "insights",
  "event_name": "$mp_web_session_start",
  "metrics": ["total", "unique"],
  "breakdown": ["$browser", "$device", "$city", "$region"]
}
```

### MP-2: Funnel Report
```json
{
  "platform": "mixpanel",
  "report_type": "funnels",
  "funnel_steps": ["funnel_definition từ input"],
  "metrics": ["conversion_rate", "avg_time_to_convert", "drop_off_count"]
}
```

### MP-3: Retention Report
```json
{
  "platform": "mixpanel",
  "report_type": "retention",
  "born_event": "goals_configured[0].event_or_url",
  "return_event": "$mp_web_session_start",
  "retention_type": "birth",
  "intervals": [1, 7, 14, 30]
}
```

### MP-4: User Properties / Segment
```json
{
  "platform": "mixpanel",
  "report_type": "users",
  "filter": "segment_identifiers theo input",
  "properties": ["$email", "$last_seen", "$city", "custom_properties"]
}
```

**Mixpanel field mappings → normalized output:**
```
total (session event) → total_sessions
unique (session event) → total_users
distinct_id count → unique_users
retention_rate[interval=1] → cohort_d1
retention_rate[interval=7] → cohort_d7
```

---

## Path Amplitude

### AMP-1: Event Segmentation
```json
{
  "platform": "amplitude",
  "report_type": "segmentation",
  "event": "Any",
  "metrics": ["totals", "uniques"],
  "group_by": ["platform", "country", "city", "version"]
}
```

### AMP-2: Funnel Analysis
```json
{
  "platform": "amplitude",
  "report_type": "funnel",
  "events": ["funnel_definition từ input"],
  "conversion_window": 86400,
  "order": "ordered"
}
```

### AMP-3: Retention Analysis
```json
{
  "platform": "amplitude",
  "report_type": "retention",
  "start_event": "goals_configured[0].event_or_url",
  "return_event": "Any",
  "retention_type": "n-day",
  "days": [1, 7, 14, 30]
}
```

### AMP-4: User Sessions
```json
{
  "platform": "amplitude",
  "report_type": "sessions",
  "metrics": ["avg_session_length", "sessions_per_user", "unique_users"],
  "group_by": ["platform", "country"]
}
```

**Amplitude field mappings → normalized output:**
```
uniques → total_users
totals → total_sessions
avg_session_length → avg_session_duration_seconds
n_day_retention[n=1,7,14,30] → cohort_d1, d7, d14, d30
```

---

## Path Plausible

### PL-1: Aggregate Stats
```json
{
  "platform": "plausible",
  "report_type": "aggregate",
  "metrics": ["visitors", "visits", "pageviews", "views_per_visit",
              "bounce_rate", "visit_duration"]
}
```

### PL-2: Breakdown by Source
```json
{
  "platform": "plausible",
  "report_type": "breakdown",
  "property": "visit:source",
  "metrics": ["visitors", "bounce_rate", "visit_duration", "conversions"]
}
```

### PL-3: Breakdown by Page
```json
{
  "platform": "plausible",
  "report_type": "breakdown",
  "property": "event:page",
  "metrics": ["visitors", "pageviews", "bounce_rate", "time_on_page"]
}
```

### PL-4: Goals / Conversions
```json
{
  "platform": "plausible",
  "report_type": "breakdown",
  "property": "event:goal",
  "metrics": ["visitors", "events", "conversion_rate"]
}
```

> **Lưu ý Plausible:** Plausible không có cohort retention natively. Nếu `retention` trong `metrics_requested` → ghi `retention_available: false`, note "Plausible does not support cohort retention — use Mixpanel or Amplitude for retention analysis."

**Plausible field mappings → normalized output:**
```
visitors → total_users
visits → total_sessions
visit_duration → avg_session_duration_seconds
```

---

## Compute Steps (sau khi fetch xong)

Sau khi tất cả API calls hoàn thành, thực hiện các computations sau từ raw data. Đây **không phải** API calls — là derived metrics.

### Compute 1 — User Flow Construction
Từ behavior data (page paths, exit rates):
```
Top entry pages = pages with highest "first page in session" count
Top exit pages = pages with highest exit_rate × pageviews
Drop-off points = funnel_definition steps với drop_off_percent cao nhất
Common paths = top 3-5 sequences của pages per session
```

### Compute 2 — Segment Comparison
Nếu `segment_identifiers` được define:
```
Với mỗi segment: tính sessions, users, conversion_rate, avg_session_duration, pages_per_session
So sánh supply vs demand (nếu cả hai defined)
So sánh new vs returning (luôn compute nếu có data)
```

Nếu `segment_identifiers.supply_side.method = null` → ghi `segments_skipped: ["supply_side", "demand_side"]`.

### Compute 3 — Acquisition Quality Score
Với mỗi channel:
```
Quality Score = (conversion_rate × 0.5) + ((1 - bounce_rate) × 0.3) + (avg_session_duration_normalized × 0.2)
Normalize avg_session_duration: 0 → 0, ≥ 300s → 1.0
```

### Compute 4 — Anomaly Detection

**Nếu baseline available:**
```
Flag nếu: metric > 2× baseline_avg HOẶC metric < 0.5× baseline_avg
Severity HIGH: > 3× hoặc < 0.3×
```

**Page-type-aware thresholds** — không dùng universal bounce rate:

| Page Type | Bounce Rate Concern Threshold | Lý do |
|---|---|---|
| Homepage | > 60% | Entry point — high bounce = low relevance |
| Landing page (paid) | > 70% | Paid traffic — mismatch giữa ad và page |
| Product / listing page | > 55% | Intent page — should engage |
| Blog / content page | > 80% | Reading then leaving là bình thường |
| Checkout / signup | > 40% | High-friction page — any bounce is bad |
| Thank you / confirmation | > 20% | Should stay low — mission accomplished |

Ghi `page_type` inference trong anomaly description nếu page type được detect từ URL pattern.

---

## Data Contract với Downstream Skills

A8 output được dùng bởi các skills sau — field alignment quan trọng:

### → A5 (Traction Scoring)
```
A8 output field → A5 input field
retention.cohort_d7 → current_metrics.retention.d7_retention
retention.cohort_d30 → current_metrics.retention.d30_retention
behavior.avg_session_duration_seconds / 60 → current_metrics.engagement.avg_session_duration_minutes
behavior.pages_per_session → current_metrics.engagement.actions_per_session (proxy)
```

### → A3 (Unit Economics)
```
conversion.overall_conversion_rate → dùng để validate A3 conversion assumptions
acquisition.channels[n].cpa → acquisition_costs.demand_cac (per channel)
retention.cohort_d30 → retention_data.demand_monthly_churn (derived: 1 - d30_retention)
```

> Khi populate A5 hoặc A3 input từ A8 output, ghi `source: "A8"` và `confidence: "ACTUAL"` trong data_confidence fields của A5/A3.

---

## Quy trình thực hiện

**Bước 1 — Platform Routing.** Xác định Path (GA4/Mixpanel/Amplitude/Plausible) từ `analytics_platform`. Nếu không recognized → return error output.

**Bước 2 — Baseline Fetch (nếu enabled).** Fetch aggregate metrics cho baseline period. Nếu fail → `baseline_available: false`.

**Bước 3 — Fetch Reports** theo đúng path, chỉ fetch `metrics_requested` trong input. Áp dụng error handling protocol cho mỗi call.

**Bước 4 — Normalize Fields** từ platform-specific names sang normalized output schema.

**Bước 5 — Compute Steps 1–4.** User flow, segment comparison, acquisition quality score, anomaly detection.

**Bước 6 — Data Quality Assessment.** Tính `data_completeness` từ % fields null và reports failed.

**Bước 7 — Compose JSON output.**

---

## Output format (JSON)

```json
{
  "skill": "A8",
  "website": "string",
  "analytics_platform": "ga4 | mixpanel | amplitude | plausible",
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
  "traffic": {
    "total_sessions": 0,
    "total_users": 0,
    "new_users": 0,
    "returning_users": 0,
    "new_vs_returning_ratio": 0.0,
    "avg_session_duration_seconds": 0,
    "pages_per_session": 0.0,
    "bounce_rate": 0.0,
    "top_sources": [
      {
        "source_medium": "string",
        "sessions": 0,
        "conversion_rate": 0.0,
        "bounce_rate": 0.0,
        "quality_score": 0.0
      }
    ],
    "device_split": {
      "mobile_percent": 0.0,
      "desktop_percent": 0.0,
      "tablet_percent": 0.0
    },
    "geo_distribution": [
      {
        "city": "string",
        "country": "string",
        "sessions": 0,
        "percent": 0.0
      }
    ]
  },
  "behavior": {
    "top_pages": [
      {
        "page": "string",
        "pageviews": 0,
        "avg_time_seconds": 0,
        "exit_rate": 0.0,
        "inferred_page_type": "homepage | landing | product | content | checkout | confirmation | other"
      }
    ],
    "user_flow": {
      "top_entry_pages": ["string"],
      "top_exit_pages": ["string"],
      "common_paths": [
        {
          "path": ["string"],
          "frequency": 0
        }
      ],
      "drop_off_points": [
        {
          "page": "string",
          "drop_off_rate": 0.0,
          "sessions_lost": 0,
          "funnel_step": 0
        }
      ]
    },
    "internal_search": {
      "search_usage_rate": 0.0,
      "top_queries": ["string"],
      "search_exit_rate": 0.0
    }
  },
  "conversion": {
    "overall_conversion_rate": 0.0,
    "goals": [
      {
        "goal_name": "string",
        "completions": 0,
        "conversion_rate": 0.0,
        "avg_time_to_conversion_seconds": 0,
        "top_converting_source": "string"
      }
    ],
    "funnel": [
      {
        "step": 0,
        "name": "string",
        "sessions": 0,
        "drop_off_percent": 0.0,
        "sessions_lost": 0
      }
    ],
    "transactions": {
      "total": 0,
      "revenue": 0,
      "avg_order_value": 0,
      "currency": "string"
    }
  },
  "acquisition": {
    "channels": [
      {
        "channel": "string",
        "sessions": 0,
        "users": 0,
        "conversion_rate": 0.0,
        "cpa": 0,
        "quality_score": 0.0
      }
    ],
    "top_referrals": [
      {
        "source": "string",
        "sessions": 0,
        "quality_score": 0.0
      }
    ],
    "campaigns": [
      {
        "name": "string",
        "sessions": 0,
        "conversions": 0,
        "cpa": 0,
        "roi": 0.0
      }
    ]
  },
  "retention": {
    "retention_available": true,
    "cohort_d1": 0.0,
    "cohort_d7": 0.0,
    "cohort_d14": 0.0,
    "cohort_d30": 0.0,
    "returning_user_rate": 0.0,
    "avg_visits_per_user": 0.0,
    "demand_churn_proxy": 0.0,
    "demand_churn_proxy_note": "1 - cohort_d30 — proxy for A3/A5 input"
  },
  "segments": {
    "new_vs_returning": {
      "new_users": {
        "users": 0,
        "sessions": 0,
        "conversion_rate": 0.0,
        "avg_session_duration_seconds": 0,
        "pages_per_session": 0.0
      },
      "returning_users": {
        "users": 0,
        "sessions": 0,
        "conversion_rate": 0.0,
        "avg_session_duration_seconds": 0,
        "pages_per_session": 0.0
      }
    },
    "supply_vs_demand": {
      "available": false,
      "supply": null,
      "demand": null,
      "not_available_reason": "string | null"
    },
    "custom": [
      {
        "segment_name": "string",
        "users": 0,
        "sessions": 0,
        "conversion_rate": 0.0,
        "avg_session_duration_seconds": 0
      }
    ],
    "segments_skipped": ["string — tên segment và lý do skip"]
  },
  "anomalies": [
    {
      "metric": "string",
      "page": "string | null",
      "inferred_page_type": "string | null",
      "type": "spike | drop | trend_change | threshold_breach",
      "severity": "HIGH | MEDIUM | LOW",
      "current_value": "string",
      "baseline_value": "string | null",
      "detection_mode": "baseline | page_type_threshold",
      "description": "string"
    }
  ],
  "downstream_data": {
    "for_a5": {
      "d7_retention": 0.0,
      "d30_retention": 0.0,
      "avg_session_duration_minutes": 0.0,
      "actions_per_session_proxy": 0.0
    },
    "for_a3": {
      "demand_cac_by_channel": [
        { "channel": "string", "cpa": 0 }
      ],
      "demand_monthly_churn_proxy": 0.0,
      "overall_conversion_rate": 0.0
    }
  },
  "data_quality": {
    "platform": "string",
    "reports_fetched": ["string"],
    "reports_failed": [
      { "report": "string", "reason": "string" }
    ],
    "partial_data_flags": [
      { "report": "string", "fields_null": ["string"], "reason": "string" }
    ],
    "segments_skipped": ["string"],
    "baseline_available": true,
    "retention_available": true,
    "data_completeness": "FULL | PARTIAL | MINIMAL",
    "data_completeness_note": "string"
  }
}
```

---

## Business Type Adaptations

| Business Type | Key Behavior Focus | Key Conversion Metric | Segment Priority |
|---|---|---|---|
| Marketplace | Search → listing → contact flow | Transaction, listing creation | Supply vs demand (bắt buộc define segment_identifiers) |
| Content Platform | Content depth, scroll, time on page | Creator signup, subscriber conversion | Creators vs consumers |
| SaaS | Feature usage events, onboarding completion | Trial → paid, upgrade event | Free vs paid tier |
| Service | Service page depth, review reads | Booking completion, inquiry submit | First-time vs repeat bookers |
| E-commerce | Product views, cart adds, checkout starts | Purchase, repeat purchase | New vs returning buyers |

---

## Rules bắt buộc

1. **Platform routing PHẢI chạy trước mọi API call.** Không gọi API với GA4 params khi platform là Mixpanel.
2. **Error handling protocol áp dụng cho mọi API call** — retry, backoff, partial data handling.
3. **Null ≠ 0.** Fields không có data = `null`.
4. **Fetch steps và Compute steps phải tách biệt rõ ràng** trong execution — Compute steps không gọi API.
5. **Anomaly detection PHẢI dùng page-type-aware thresholds**, không phải universal bounce rate.
6. **Supply/demand segment chỉ compute khi `segment_identifiers` được define.** Nếu không → `supply_vs_demand.available: false`, ghi reason.
7. **`downstream_data` section PHẢI được populate** để A5 và A3 có thể dùng trực tiếp — không để họ tự parse raw output.
8. Skill này **KHÔNG interpret data** — không có section "insights" hay "recommendations."
9. `data_completeness` được xác định: `FULL` = 0 reports failed + 0 null fields; `PARTIAL` = 1–2 reports failed hoặc có partial flags; `MINIMAL` = ≥ 3 reports failed.
10. Output phải là **pure JSON**, không có narrative text bên ngoài JSON structure.