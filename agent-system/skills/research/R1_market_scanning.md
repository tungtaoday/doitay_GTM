---
code: R1
name: Market Scanning
type: api
category: research
description: "Quét tín hiệu thị trường từ nhiều nguồn để phát hiện cơ hội và xu hướng mới nổi"
tools_required:
  - mcp__marketing-tools__scan_market
  - mcp__marketing-tools__search_trends
  - mcp__marketing-tools__analyze_industry
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

Quét và tổng hợp tín hiệu thị trường từ nhiều nền tảng (Twitter, Instagram, Facebook, LinkedIn, Reddit, YouTube) để phát hiện 5 loại tín hiệu marketplace: Fragmentation, Trust Gap, Information Asymmetry, Regulation Shift, và Behavior Shift. Skill này hoạt động 24/7 và feed trực tiếp vào Hypothesis Engine.

## Input cần có

- **vertical**: Ngành/lĩnh vực cần scan (ví dụ: "thực phẩm hữu cơ", "dịch vụ sửa nhà")
- **geography**: Khu vực địa lý cụ thể (ví dụ: "TP.HCM", "Hà Nội")
- **keywords**: Danh sách 5-15 từ khóa chính và biến thể
- **language**: Ngôn ngữ scan (mặc định: "vi", hỗ trợ "en")
- **time_range**: Khoảng thời gian scan (mặc định: "7d", tùy chọn: "24h", "30d", "90d")
- **signal_types**: Loại tín hiệu cần ưu tiên (mặc định: tất cả 5 loại)

## Quy trình thực hiện

1. **Thu thập dữ liệu đa nền tảng**
   - Twitter: Scan hashtags, trending topics, và conversations liên quan đến vertical
   - Instagram: Theo dõi hashtags, Reels trends, và engagement patterns
   - Facebook: Quét Groups, Pages, và Marketplace listings trong vertical
   - LinkedIn: Scan bài viết industry leaders, job postings, và company updates
   - Reddit: Monitor subreddits liên quan, phân tích sentiment và pain points
   - YouTube: Theo dõi video trends, comments, và search volume trong vertical

2. **Phân loại tín hiệu**
   - Gắn tag mỗi tín hiệu vào 1 trong 5 loại (Fragmentation, Trust Gap, Information Asymmetry, Regulation Shift, Behavior Shift)
   - Loại bỏ noise và duplicate signals

3. **Tính Signal Strength Score**
   - Market Size (1-5) x Pain Intensity (1-5) x Frequency (1-5) x Transaction Value (1-5)
   - Phân loại: HIGH (>=200), MEDIUM (100-199), LOW (<100)

4. **Tổng hợp và cross-reference**
   - So sánh tín hiệu giữa các nền tảng để validate
   - Tín hiệu xuất hiện trên 3+ nền tảng được boost priority

5. **Output và routing**
   - HIGH signals: Fast-track vào Hypothesis Engine
   - MEDIUM signals: Đưa vào Tier 1 backlog
   - LOW signals: Monitor only, re-scan sau 30 ngày

## Output format

```json
{
  "scan_id": "R1-2026-03-22-001",
  "vertical": "string",
  "geography": "string",
  "scan_period": "2026-03-15 to 2026-03-22",
  "total_signals_detected": 12,
  "signals": [
    {
      "signal_id": "SIG-001",
      "type": "fragmentation | trust_gap | information_asymmetry | regulation_shift | behavior_shift",
      "title": "Mô tả ngắn gọn tín hiệu",
      "evidence": [
        {
          "source_platform": "Twitter | Instagram | Facebook | LinkedIn | Reddit | YouTube",
          "content_summary": "Tóm tắt nội dung phát hiện",
          "url": "link tới nguồn",
          "engagement_metrics": { "likes": 0, "comments": 0, "shares": 0 },
          "date_detected": "2026-03-22"
        }
      ],
      "platforms_detected_on": ["Twitter", "Reddit", "Facebook"],
      "signal_strength_score": {
        "market_size": 4,
        "pain_intensity": 5,
        "frequency": 3,
        "transaction_value": 4,
        "total": 240
      },
      "classification": "HIGH | MEDIUM | LOW",
      "current_workarounds": ["Workaround 1", "Workaround 2"],
      "why_workarounds_fail": "Giải thích tại sao giải pháp hiện tại không đủ tốt",
      "comparable_markets": ["Ví dụ thị trường tương tự đã giải quyết vấn đề này"],
      "routing": "hypothesis_engine | tier1_backlog | monitor"
    }
  ],
  "trend_summary": "Tổng quan xu hướng chính phát hiện được trong kỳ scan",
  "next_scan_recommended": "2026-03-29"
}
```

## Business Type Adaptations

- **Digital Product**: Tập trung scan trên Twitter, Reddit, YouTube để phát hiện unmet needs trong software/SaaS. Ưu tiên tín hiệu Behavior Shift khi users chuyển từ tool cũ sang tool mới. Theo dõi Product Hunt, GitHub trending.
- **Service**: Scan Facebook Groups và LinkedIn để phát hiện Fragmentation (nhiều freelancer nhỏ, không ai dominant). Ưu tiên Trust Gap signals từ reviews và complaints trên các nền tảng.
- **Physical Product**: Quét Instagram, YouTube, và Facebook Marketplace để phát hiện Information Asymmetry về giá và chất lượng. Theo dõi unboxing videos và review content trên YouTube.
- **Marketplace**: Scan toàn diện trên tất cả 6 nền tảng. Ưu tiên Fragmentation và Trust Gap signals. Đặc biệt chú ý đến Reddit và Facebook Groups nơi supply và demand đang tự kết nối một cách thủ công.

## Quy tắc

- Chỉ report facts, KHÔNG interpret hoặc recommend. Đây là Market Research, không phải Strategy.
- Mỗi tín hiệu phải có tối thiểu 3 evidence từ nguồn khác nhau trước khi được phân loại HIGH.
- Không bao giờ scan mà không có vertical và geography cụ thể. Broad scan = noise.
- Cross-reference giữa các nền tảng là bắt buộc. Tín hiệu chỉ xuất hiện trên 1 nền tảng cần được đánh dấu "unvalidated".
- Cập nhật scan ít nhất 1 lần/tuần cho mỗi vertical đang active.
- Loại bỏ sponsored content và paid promotions khỏi kết quả scan.
- Khi phát hiện HIGH signal, trigger ngay notification cho Hypothesis Engine, không chờ đến cuối chu kỳ scan.
- Lưu lại tất cả raw data để Pattern Library có thể truy xuất sau này.
