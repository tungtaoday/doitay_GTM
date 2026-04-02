---
code: R7
name: Pricing Research
type: api
category: research
description: "Nghiên cứu mô hình giá, mức giá thị trường, và willingness-to-pay để xây dựng pricing strategy có data support"
tools_required:
  - mcp__marketing-tools__analyze_pricing
  - mcp__marketing-tools__scrape_prices
  - mcp__marketing-tools__pricing_sentiment
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

Thu thập và phân tích dữ liệu giá cả trong một vertical cụ thể từ nhiều nguồn (social media, marketplaces, websites, public data). Xác định mô hình giá phổ biến, mức giá thị trường (market rates), price sensitivity của customers, và cơ hội pricing differentiation. Skill này feed trực tiếp vào Investment Analyst (Unit Economics Model) và CVP Architect (Monetization Timing), đảm bảo pricing decisions dựa trên market reality.

## Input cần có

- **vertical**: Ngành/lĩnh vực cần research giá
- **geography**: Khu vực địa lý (giá thường khác nhau theo vùng)
- **product_service_type**: Loại sản phẩm/dịch vụ cụ thể cần research
- **competitors**: Danh sách competitors cần track giá (từ R4)
- **current_pricing**: Mô hình giá hiện tại của mình (nếu có)
- **pricing_models_to_explore**: Các mô hình giá muốn nghiên cứu (commission, subscription, freemium, per-transaction, tiered)
- **customer_segments**: Segments từ R6 để phân tích WTP theo segment
- **marketplace_side**: "supply_take_rate" hoặc "demand_fee" hoặc "both" (cho marketplace)

## Quy trình thực hiện

1. **Market Price Collection - Thu thập giá thị trường**
   - Scrape giá từ websites và marketplaces của competitors
   - Facebook Marketplace: Thu thập listing prices trong vertical và geography
   - Instagram: Phân tích giá được post trong captions, DM-based pricing patterns ("inbox giá")
   - Facebook Groups: Monitor giá được chia sẻ trong mua bán groups
   - YouTube: Thu thập giá từ review videos và comparison content
   - Twitter: Track pricing announcements và customer reactions
   - LinkedIn: Phân tích B2B pricing signals từ company posts và discussions
   - Reddit: Mining honest price discussions và "how much should I pay" threads

2. **Pricing Model Analysis**
   - Map pricing models đang được dùng trong vertical:
     - Commission/Take rate: % per transaction
     - Subscription: Monthly/annual fee
     - Freemium: Free tier + paid features
     - Per-transaction: Fixed fee per transaction
     - Tiered: Different packages at different prices
     - Hybrid: Combination models
   - Phân tích ưu/nhược điểm của mỗi model trong context vertical này
   - Xác định model nào dominant và tại sao

3. **Price Point Mapping**
   - Xây dựng price map: min, max, median, mode cho mỗi category
   - Phân tích price distribution (clustered ở đâu?)
   - Xác định price bands (budget, mid-range, premium)
   - Track price trends (tăng/giảm theo thời gian)

4. **Willingness-to-Pay Analysis**
   - Thu thập WTP signals từ social media:
     - Comments về giá trên Instagram/Facebook/YouTube ("đắt quá", "giá hợp lý", "rẻ bất ngờ")
     - Reddit discussions về value vs price
     - Twitter complaints/praises về pricing
   - Phân tích price elasticity signals: volume thay đổi thế nào khi giá thay đổi
   - Map WTP theo segment (từ R6 Customer Research)
   - Xác định pricing anchors: customer so sánh giá với gì

5. **Take Rate Analysis (cho Marketplace)**
   - Thu thập take rates của marketplaces tương tự (local và global)
   - Phân tích relationship giữa take rate và liquidity
   - Xác định take rate ceiling (điểm mà supply rời đi)
   - Map monetization timing: khi nào bắt đầu charge mà không kill liquidity

6. **Price Sensitivity Scoring**
   - Tính Price Sensitivity Index cho mỗi segment
   - Xác định value drivers: features/benefits nào justify premium pricing
   - Map price objections và frequency
   - Phân tích competitive pricing pressure

7. **Pricing Opportunity Identification**
   - Tìm pricing gaps: segments sẵn sàng trả nhiều hơn nhưng không có premium option
   - Xác định underpricing opportunities: value delivered > price charged
   - Phát hiện bundling opportunities
   - Assess dynamic pricing potential

## Output format

```json
{
  "research_id": "R7-2026-03-22-001",
  "vertical": "string",
  "geography": "string",
  "period": "2026-02-22 to 2026-03-22",
  "market_pricing_overview": {
    "dominant_pricing_model": "commission | subscription | freemium | per_transaction | tiered",
    "why_dominant": "Giải thích tại sao model này phổ biến nhất",
    "models_in_use": [
      {
        "model": "commission",
        "usage_percentage": 60,
        "typical_rate": "10-15%",
        "pros": ["Aligned with value", "Low barrier to entry"],
        "cons": ["Revenue depends on volume", "Disintermediation risk"]
      },
      {
        "model": "subscription",
        "usage_percentage": 25,
        "typical_rate": "$20-50/month",
        "pros": ["Predictable revenue", "Higher LTV"],
        "cons": ["Harder to acquire", "Churn risk"]
      }
    ]
  },
  "price_map": {
    "categories": [
      {
        "category": "Tên category/tier",
        "price_range": { "min": 100000, "max": 500000, "median": 250000, "mode": 200000 },
        "currency": "VND",
        "unit": "per transaction | per month | per item",
        "sample_size": 150,
        "sources": ["Facebook Marketplace", "competitor websites", "Instagram listings"],
        "trend": "stable | increasing | decreasing",
        "trend_rate": "+5% over 6 months"
      }
    ],
    "price_bands": {
      "budget": { "range": "100K-200K", "market_share": "40%", "typical_customer": "Price-sensitive, first-time buyers" },
      "mid_range": { "range": "200K-350K", "market_share": "45%", "typical_customer": "Value-seekers, repeat buyers" },
      "premium": { "range": "350K-500K+", "market_share": "15%", "typical_customer": "Quality-first, willing to pay for trust" }
    }
  },
  "competitor_pricing": [
    {
      "competitor": "Tên competitor",
      "pricing_model": "commission",
      "price_points": {
        "take_rate": "12%",
        "minimum_fee": "20,000 VND",
        "premium_features": "50,000 VND/month for priority listing"
      },
      "recent_changes": "Tăng take rate từ 10% lên 12% vào Q1 2026",
      "customer_reaction": "Negative - 30% increase in complaints trên Facebook",
      "source": "Website + social media monitoring"
    }
  ],
  "willingness_to_pay": {
    "by_segment": [
      {
        "segment": "SEG-001 (từ R6)",
        "wtp_range": "200K-300K",
        "evidence": [
          {
            "source": "Reddit r/subreddit",
            "signal": "Sẵn sàng trả premium nếu có guarantee",
            "quote": "Mình sẵn sàng trả thêm 50K nếu biết chắc thợ đến đúng hẹn"
          },
          {
            "source": "Facebook Group ABC",
            "signal": "Price anchoring với dịch vụ offline",
            "quote": "Ngoài tiệm lấy 300K, trên app lấy 250K thì ok"
          }
        ],
        "price_sensitivity_index": 3.5,
        "value_drivers": ["Trust/guarantee", "Convenience", "Speed"],
        "price_objection_frequency": "medium"
      }
    ],
    "overall_price_sensitivity": "medium",
    "key_finding": "Customers sẵn sàng trả 10-20% premium cho trust và convenience, nhưng rất nhạy cảm với hidden fees"
  },
  "take_rate_analysis": {
    "applicable": true,
    "comparable_marketplaces": [
      {
        "marketplace": "Tên marketplace",
        "vertical": "Same | Adjacent",
        "take_rate": "15%",
        "how_they_started": "0% first 6 months, then gradual increase",
        "current_liquidity_impact": "Stable, no significant supply churn"
      }
    ],
    "recommended_range": "8-12%",
    "ceiling_estimate": "15% - beyond this, supply starts leaving based on comparable data",
    "monetization_timing": {
      "recommendation": "Start at 0% for first 8 weeks, introduce 5% at week 9 if liquidity score > threshold",
      "rationale": "Charging before liquidity = killing marketplace before it starts",
      "risk": "Delayed revenue, but necessary for cold start"
    }
  },
  "pricing_opportunities": [
    {
      "opportunity": "Mô tả cơ hội pricing",
      "type": "premium_tier | bundling | dynamic | freemium_upgrade",
      "estimated_revenue_impact": "+15-20% ARPU",
      "evidence": "Data points supporting this opportunity",
      "risk": "Rủi ro nếu implement sai",
      "test_suggestion": "Cách test nhỏ trước khi roll out"
    }
  ],
  "unit_economics_inputs": {
    "avg_transaction_value": 250000,
    "recommended_take_rate": "10%",
    "revenue_per_transaction": 25000,
    "estimated_supply_cac": 50000,
    "estimated_demand_cac": 30000,
    "blended_cac": 40000,
    "estimated_ltv": 300000,
    "ltv_cac_ratio": 7.5,
    "payback_period_months": 2,
    "note": "Ước tính dựa trên market data. Cần validate bằng experiment."
  },
  "pricing_risks": [
    {
      "risk": "Race to bottom nếu competitors giảm giá",
      "probability": "medium",
      "mitigation": "Differentiate trên value, không compete trên price"
    },
    {
      "risk": "Disintermediation - supply và demand bypass platform sau first transaction",
      "probability": "high trong service verticals",
      "mitigation": "Build value-add mà chỉ có thể access qua platform (insurance, payment protection, reviews)"
    }
  ]
}
```

## Business Type Adaptations

- **Digital Product**: Focus vào subscription pricing tiers và feature gating strategy. Track competitor pricing pages (wayback machine cho historical changes). Reddit threads "is [product] worth it?" cho WTP insights. YouTube comparison videos thường discuss pricing. LinkedIn discussions cho B2B software pricing benchmarks. Freemium conversion rates là key metric.
- **Service**: Giá dịch vụ thường opaque ("inbox giá" trên Instagram/Facebook). Thu thập giá từ Facebook Groups nơi providers quote công khai. YouTube "how much does [service] cost" videos. Track seasonal pricing patterns. Tipping/gratuity norms affect total cost perception. Location-based pricing variation lớn.
- **Physical Product**: E-commerce platforms (Shopee, Tiki, Lazada) là nguồn giá chính. Facebook Marketplace cho secondhand và small seller pricing. Instagram shoppable posts cho premium positioning. YouTube review videos thường mention giá. Track promotional pricing frequency và depth. Shipping cost là hidden factor affect WTP.
- **Marketplace**: Take rate research là CRITICAL. Phân tích riêng supply-side fees và demand-side fees. Monetization timing phải align với liquidity goals. Facebook Groups cho informal marketplace pricing benchmarks. Track cách competitors giải quyết pricing transparency (hiển thị giá vs "liên hệ"). Zero-commission period length research từ comparable marketplaces.

## Quy tắc

- Pricing research phải dựa trên DATA THỊ TRƯỜNG THỰC TẾ, không phải models lý thuyết.
- Mọi price points phải có source rõ ràng. Không estimate mà không ghi "estimated" và rationale.
- Thu thập đủ sample size trước khi kết luận. Minimum 30 data points cho mỗi price category.
- WTP analysis phải tách theo segment. Average WTP across all segments = vô nghĩa.
- Đối với marketplace: KHÔNG BAO GIỜ recommend take rate mà không phân tích monetization timing impact lên liquidity.
- Hidden fees và total cost of ownership phải được tính. Giá headline không phải giá thực customer trả.
- Cập nhật pricing research mỗi quý. Giá thay đổi theo thị trường, seasonality, và competitive pressure.
- Currency và unit phải consistent trong toàn bộ report. VND per transaction vs VND per month phải được phân biệt rõ.
- Pricing research KHÔNG recommend giá cụ thể (đó là việc của Strategy Director + Investment Analyst). Chỉ provide data và analysis.
- Disintermediation risk phải luôn được đánh giá cho marketplace pricing. Take rate cao + low switching cost = high disintermediation risk.
- Cross-reference giá trên social media với giá trên website/app. Social pricing thường khác (discount cho followers, negotiated prices trong DM).
