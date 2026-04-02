---
code: S5
name: Content Pillars
type: reasoning
category: strategy
description: Xác định 3-5 content pillars — trụ cột nội dung phục vụ brand building và demand generation
tools_required: []
output_format: json
---

## Mục đích

Định nghĩa 3-5 content pillars (trụ cột nội dung) tạo nền tảng cho toàn bộ hoạt động content marketing. Mỗi pillar phải phục vụ đồng thời: (1) thu hút đúng audience, (2) build authority/trust, (3) nurture audience thành customer. Content pillars là "luật chơi" — mọi content phải thuộc về 1 pillar.

## Input cần có

- **Wedge segment profile** (output từ S2)
- **CVP** (output từ S3)
- **Offer** (output từ S4)
- **Business type:** Digital Product / Service / Marketplace
- **Brand voice:** Tone and personality (nếu đã có)
- **Founder/team expertise:** Chuyên môn gì có thể share authentically

## Quy trình thực hiện

### Bước 1 — Audience Job Mapping cho Content
Từ segment profile (S2), xác định:
- **Information jobs:** Audience cần biết gì để làm job-to-be-done tốt hơn?
- **Inspiration jobs:** Audience cần thấy gì để tin rằng outcome khả thi?
- **Community jobs:** Audience cần connect với ai để cảm thấy thuộc về?
- **Entertainment jobs:** Audience muốn tiêu thụ content dạng gì trong leisure time?

### Bước 2 — Content Pillar Brainstorming
Liệt kê 8-10 potential pillars, mỗi pillar là 1 chủ đề broad đủ để tạo 50+ pieces of content.

Pillar tốt phải pass 3 tests:
- **Relevance test:** Audience thực sự quan tâm chủ đề này? (evidence từ search volume, forum activity, social engagement)
- **Authority test:** Ta có expertise/credibility để nói về chủ đề này? (không fake expertise)
- **Business alignment test:** Content về chủ đề này dẫn đến product/service awareness tự nhiên?

### Bước 3 — Pillar Selection & Prioritization
Chọn 3-5 pillars từ danh sách, đảm bảo mix:

**Pillar Types:**
- **Educational (1-2 pillars):** Dạy audience skill hoặc knowledge liên quan đến job-to-be-done. Builds authority.
- **Behind-the-scenes (1 pillar):** Chia sẻ journey, process, lessons learned. Builds trust và relatability.
- **Industry/Market (1 pillar):** Phân tích trends, news, insights về vertical. Positions as thought leader.
- **Community/Social proof (0-1 pillar):** Customer stories, case studies, community highlights. Builds trust.
- **Entertainment/Culture (0-1 pillar):** Memes, relatable content, culture references liên quan đến audience. Builds engagement.

### Bước 4 — Pillar Deep Dive
Với mỗi pillar đã chọn, define:

**Pillar Definition:**
- Tên pillar (2-4 từ, dễ nhớ)
- Mô tả 1 câu: "Content về [chủ đề] giúp audience [outcome]"
- 5-10 topic ideas cụ thể thuộc pillar này
- Content formats phù hợp nhất (carousel, video ngắn, long-form, thread, story)

**Content Funnel Mapping:**
- TOFU (Top of Funnel): Content attract new audience — broad, entertaining, shareable
- MOFU (Middle of Funnel): Content educate và nurture — specific, valuable, builds trust
- BOFU (Bottom of Funnel): Content convert audience thành customer — case study, comparison, offer

### Bước 5 — Content Ratio Planning
Xác định tỷ lệ content theo pillar và theo funnel stage:

**Pillar ratio:** Phân bổ % content cho mỗi pillar (tổng = 100%)
**Funnel ratio:** Thường 60% TOFU / 30% MOFU / 10% BOFU
**Value vs Promotion ratio:** 80% value-giving / 20% promotion maximum

### Bước 6 — Signature Content Series
Với mỗi pillar, define 1 "signature series" — recurring content format:
- Tên series
- Format (weekly thread, monthly deep-dive, daily tip, etc.)
- Cadence (daily, 3x/week, weekly, bi-weekly)
- Ví dụ 3 episodes đầu tiên

## Output format

```json
{
  "content_strategy_overview": {
    "target_audience": "Mô tả audience = wedge segment từ S2",
    "content_mission": "Giúp [audience] [achieve outcome] thông qua [content approach]",
    "brand_voice": {
      "tone": "Mô tả tone: professional/casual/authoritative/friendly/etc.",
      "personality_traits": ["Trait #1", "Trait #2", "Trait #3"],
      "language_style": "Mô tả cách dùng ngôn ngữ"
    }
  },
  "content_pillars": [
    {
      "pillar_number": 1,
      "name": "Tên pillar 2-4 từ",
      "type": "Educational / Behind-the-scenes / Industry / Community / Entertainment",
      "description": "Content về [chủ đề] giúp audience [outcome]",
      "percentage_of_content": "30%",
      "topic_ideas": [
        "Topic idea #1",
        "Topic idea #2",
        "Topic idea #3",
        "Topic idea #4",
        "Topic idea #5"
      ],
      "best_formats": ["Carousel", "Video ngắn", "Thread"],
      "funnel_mapping": {
        "tofu": "Loại content TOFU cho pillar này",
        "mofu": "Loại content MOFU cho pillar này",
        "bofu": "Loại content BOFU cho pillar này"
      },
      "signature_series": {
        "name": "Tên series",
        "format": "Định dạng",
        "cadence": "Tần suất",
        "first_3_episodes": [
          "Episode 1: [topic]",
          "Episode 2: [topic]",
          "Episode 3: [topic]"
        ]
      }
    }
  ],
  "content_ratios": {
    "funnel_split": {
      "tofu_percent": 60,
      "mofu_percent": 30,
      "bofu_percent": 10
    },
    "value_vs_promotion": {
      "value_percent": 80,
      "promotion_percent": 20
    }
  },
  "content_calendar_framework": {
    "posts_per_week": "Số posts target/tuần",
    "weekly_schedule": {
      "monday": "Pillar X — Format Y",
      "tuesday": "Pillar X — Format Y",
      "wednesday": "Pillar X — Format Y",
      "thursday": "Pillar X — Format Y",
      "friday": "Pillar X — Format Y",
      "saturday": "Pillar X — Format Y (optional)",
      "sunday": "Rest / Engagement only"
    }
  }
}
```

## Business Type Adaptations

- **Digital Product**: Pillars nên heavy về Educational (dạy cách dùng category tool, không chỉ product) và Behind-the-scenes (building in public). Community pillar quan trọng nếu product có network effect. Entertainment pillar dùng memes/relatable content về pain points.
- **Service**: Pillars nên heavy về Industry insights và Social proof (case studies, before/after). Educational pillar focus "teach what you know" — cho kiến thức miễn phí, charge for implementation. Behind-the-scenes pillar show process và expertise.
- **Marketplace**: Cần content cho CẢ 2 sides. Supply-side pillars: "Cách kiếm thêm thu nhập", "Success stories từ top sellers". Demand-side pillars: "Cách tìm/chọn [supply]", "Market insights". Shared pillar: Community stories, market trends.

## Quy tắc

- TỐI THIỂU 3, TỐI ĐA 5 pillars. Ít hơn 3 = không đủ variety. Nhiều hơn 5 = mất focus.
- Mỗi pillar phải có ít nhất 50 topic ideas tiềm năng. Nếu chỉ nghĩ ra 10 topics → pillar quá narrow.
- KHÔNG có pillar thuần "bán hàng". Promotion nằm trong ratio 20%, weave vào các pillars, không phải pillar riêng.
- Content mission phải customer-centric. "Trở thành brand lớn nhất" là SAI. "Giúp [audience] [achieve outcome]" là ĐÚNG.
- Brand voice phải consistent và authentic. Đừng cố "chuyên nghiệp" nếu team là startup scrappy. Authenticity > Polish.
- Signature series là commitment — chỉ launch khi chắc chắn duy trì ít nhất 8 tuần liên tục.
- Phase 1: Bắt đầu với 3 pillars. Thêm pillars khi đã consistent với 3 pillars đầu ít nhất 4 tuần.
- Mỗi piece of content phải thuộc ĐÚNG 1 pillar. Nếu content thuộc 2 pillars → pillars chưa clean.
- 80/20 rule: 80% content cho value, 20% cho promotion. Vi phạm → mất audience trust.
