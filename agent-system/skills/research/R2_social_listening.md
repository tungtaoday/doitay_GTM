---
code: R2
name: Social Listening
type: api
category: research
description: "Lắng nghe và phân tích hội thoại trên mạng xã hội để nắm bắt sentiment và pain points của thị trường"
tools_required:
  - mcp__marketing-tools__social_listen
  - mcp__marketing-tools__analyze_sentiment
  - mcp__marketing-tools__track_mentions
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

Theo dõi, thu thập và phân tích các cuộc hội thoại tự nhiên trên mạng xã hội (Twitter, Instagram, Facebook, LinkedIn, Reddit, YouTube) để hiểu sentiment thị trường, phát hiện pain points thực tế, và nhận diện các thay đổi hành vi của supply và demand side. Khác với Market Scanning (R1) tập trung vào tín hiệu vĩ mô, Social Listening đi sâu vào giọng nói thực sự của customer.

## Input cần có

- **topic**: Chủ đề hoặc vertical cần lắng nghe (ví dụ: "thuê thợ sửa ống nước")
- **keywords**: Danh sách từ khóa chính + từ khóa phụ + từ khóa loại trừ
- **brand_mentions**: Tên thương hiệu/sản phẩm cần track (nếu có)
- **competitor_mentions**: Tên đối thủ cần theo dõi
- **geography**: Khu vực địa lý
- **language**: Ngôn ngữ (mặc định: "vi")
- **platforms**: Nền tảng ưu tiên (mặc định: tất cả 6)
- **time_range**: Khoảng thời gian (mặc định: "7d")

## Quy trình thực hiện

1. **Thiết lập listening queries**
   - Xây dựng boolean queries cho từng nền tảng
   - Twitter: Track keywords, hashtags, replies, và quote tweets
   - Instagram: Monitor hashtags, comment threads trên posts liên quan, Stories mentions
   - Facebook: Quét posts trong Groups liên quan, comments trên Pages, Marketplace conversations
   - LinkedIn: Theo dõi discussions trong Groups, comments trên industry posts
   - Reddit: Monitor threads trong subreddits liên quan, track cross-posts
   - YouTube: Phân tích comments trên videos liên quan, community posts

2. **Thu thập và lọc dữ liệu**
   - Lọc bỏ spam, bot accounts, và promotional content
   - Xác định ngôn ngữ và geography chính xác
   - Gắn tag theo chủ đề và context

3. **Phân tích sentiment**
   - Phân loại mỗi mention: Positive / Negative / Neutral / Mixed
   - Tính sentiment score tổng thể (-100 đến +100)
   - Phát hiện sentiment shifts (thay đổi đột ngột trong 24-48h)

4. **Trích xuất pain points và insights**
   - Nhóm các complaints/frustrations thành pain point categories
   - Xếp hạng pain points theo frequency và intensity
   - Trích xuất exact quotes làm evidence

5. **Phân tích theo supply/demand side**
   - Tách biệt conversations từ supply side (người bán/cung cấp) và demand side (người mua/sử dụng)
   - Map pain points riêng cho từng side

6. **Báo cáo và alert**
   - Tổng hợp báo cáo theo chu kỳ
   - Trigger alert khi sentiment shift > 20 điểm trong 48h
   - Flag emerging topics chưa có trong keyword list

## Output format

```json
{
  "listening_id": "R2-2026-03-22-001",
  "topic": "string",
  "period": "2026-03-15 to 2026-03-22",
  "total_mentions": 1250,
  "platform_breakdown": {
    "twitter": { "mentions": 320, "avg_sentiment": 15 },
    "instagram": { "mentions": 280, "avg_sentiment": 25 },
    "facebook": { "mentions": 350, "avg_sentiment": -10 },
    "linkedin": { "mentions": 80, "avg_sentiment": 30 },
    "reddit": { "mentions": 150, "avg_sentiment": -20 },
    "youtube": { "mentions": 70, "avg_sentiment": 5 }
  },
  "overall_sentiment": {
    "score": 8,
    "distribution": { "positive": 35, "negative": 28, "neutral": 30, "mixed": 7 },
    "trend": "stable | improving | declining",
    "shift_detected": false
  },
  "pain_points": [
    {
      "category": "Tên nhóm pain point",
      "frequency": 145,
      "intensity": "high | medium | low",
      "side": "supply | demand | both",
      "sample_quotes": [
        {
          "text": "Trích dẫn nguyên văn từ user",
          "platform": "Facebook",
          "engagement": 45,
          "date": "2026-03-20"
        }
      ],
      "current_workaround": "Cách người dùng đang tự giải quyết"
    }
  ],
  "emerging_topics": [
    {
      "topic": "Chủ đề mới nổi",
      "mention_growth": "+150% so với tuần trước",
      "platforms": ["Reddit", "Twitter"],
      "sample_content": "Ví dụ nội dung"
    }
  ],
  "competitor_mentions": [
    {
      "competitor": "Tên đối thủ",
      "mention_count": 85,
      "sentiment": -5,
      "top_complaints": ["Complaint 1", "Complaint 2"],
      "top_praises": ["Praise 1"]
    }
  ],
  "key_influencer_voices": [
    {
      "handle": "@username",
      "platform": "Twitter",
      "followers": 15000,
      "sentiment": "negative",
      "quote": "Trích dẫn đáng chú ý",
      "reach_estimate": 5000
    }
  ],
  "alerts": [
    {
      "type": "sentiment_shift | volume_spike | new_competitor | regulation_mention",
      "description": "Mô tả alert",
      "urgency": "high | medium | low"
    }
  ]
}
```

## Business Type Adaptations

- **Digital Product**: Ưu tiên lắng nghe trên Twitter, Reddit, và YouTube nơi users thường chia sẻ bug reports, feature requests, và so sánh tools. Theo dõi hashtags như #buildinpublic, các subreddit chuyên ngành. Đặc biệt chú ý đến "switching signals" khi users nói về việc rời bỏ competitor.
- **Service**: Tập trung vào Facebook Groups và Google Reviews (qua YouTube reviews) nơi người dùng hay hỏi recommendations và chia sẻ trải nghiệm dịch vụ. Pain points thường xuất hiện dưới dạng "có ai biết chỗ nào..." hoặc "vừa bị lừa...". Instagram Stories cũng là nguồn phát hiện service quality issues.
- **Physical Product**: Monitor Instagram (visual reviews, unboxing), YouTube (review videos, comments), và Facebook Groups (mua bán, đánh giá). Chú ý đến complaints về chất lượng, giá cả, và shipping. Track cả TikTok mentions nếu target audience phù hợp.
- **Marketplace**: Lắng nghe cả hai phía supply và demand. Facebook Groups thường là nơi supply-demand tự kết nối. Reddit threads tiết lộ frustrations sâu nhất. LinkedIn cho B2B marketplace signals. Phân tích riêng sentiment của mỗi side để hiểu chicken-egg dynamics.

## Quy tắc

- Social Listening chỉ THU THẬP và PHÂN TÍCH. Không recommend hành động, không interpret ý nghĩa chiến lược.
- Mỗi pain point phải có ít nhất 3 sample quotes từ nguồn khác nhau.
- Không bao giờ bao gồm private messages hoặc nội dung từ closed groups mà không có quyền truy cập.
- Phân biệt rõ giữa organic mentions và paid/sponsored content. Chỉ phân tích organic.
- Sentiment analysis phải tính đến context văn hóa Việt Nam (ví dụ: sarcasm, indirect complaints).
- Alert sentiment shift chỉ khi có volume đủ lớn (>50 mentions) để tránh false positives.
- Cập nhật competitor tracking list mỗi tháng.
- Raw quotes phải được anonymized trước khi đưa vào report (bỏ tên, SĐT, địa chỉ cụ thể).
- Cross-reference pain points giữa các nền tảng. Pain point chỉ xuất hiện trên 1 nền tảng cần gắn cờ "single-source".
