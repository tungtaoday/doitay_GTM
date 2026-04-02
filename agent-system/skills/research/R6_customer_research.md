---
code: R6
name: Customer Research
type: reasoning
category: research
description: "Phân tích hành vi, nhu cầu và pain points của khách hàng mục tiêu thông qua dữ liệu định tính và định lượng"
tools_required:
  - mcp__marketing-tools__analyze_audience
  - mcp__marketing-tools__segment_users
  - mcp__marketing-tools__survey_analysis
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

Nghiên cứu sâu về khách hàng mục tiêu bằng phương pháp reasoning - tổng hợp và phân tích dữ liệu từ nhiều nguồn (social media, surveys, interviews, behavioral data) để xây dựng customer profiles dựa trên Jobs-to-be-done (KHÔNG demographics). Skill này feed trực tiếp vào Segment Analyst và CVP Architect, đảm bảo mọi quyết định về segment và value proposition đều grounded trong customer reality.

## Input cần có

- **vertical**: Ngành/lĩnh vực nghiên cứu
- **geography**: Khu vực địa lý
- **initial_hypothesis**: Giả thuyết ban đầu về customer (ai, cần gì, tại sao)
- **side**: "supply" hoặc "demand" hoặc "both" (cho marketplace)
- **data_sources**: Nguồn dữ liệu có sẵn
  - social_data: true/false (từ R2 Social Listening)
  - survey_data: file path hoặc null
  - interview_transcripts: file path hoặc null
  - behavioral_data: analytics data hoặc null
  - support_tickets: file path hoặc null
- **existing_segments**: Segments đã được định nghĩa (nếu có, từ Segment Analyst)
- **questions_to_answer**: Câu hỏi cụ thể cần trả lời về customer

## Quy trình thực hiện

1. **Data Aggregation - Tổng hợp dữ liệu khách hàng**
   - Thu thập social data từ 6 nền tảng qua R2 Social Listening output:
     - Twitter: Phân tích conversations, questions, complaints trong vertical
     - Instagram: Phân tích comments, DM patterns (nếu có), saved content patterns
     - Facebook: Phân tích Group discussions, questions, recommendations requests
     - LinkedIn: Phân tích professional context, career-related needs
     - Reddit: Mining deep pain points từ honest, anonymous discussions
     - YouTube: Phân tích comments, "how to" searches, tutorial requests
   - Import survey results nếu có
   - Import interview transcripts nếu có
   - Aggregate behavioral data (website analytics, app usage) nếu có
   - Compile support tickets và FAQ patterns nếu có

2. **Jobs-to-be-done Extraction**
   - Từ mỗi data source, extract "jobs" customer đang cố gắng hoàn thành
   - Phân loại jobs: Functional (cần làm gì), Emotional (cần cảm thấy gì), Social (cần được nhìn nhận thế nào)
   - Map current solutions/workarounds cho mỗi job
   - Xác định "failure modes" - lúc nào workaround fail

3. **Behavioral Pattern Analysis (Reasoning)**
   - Xác định switching triggers: events gì khiến customer tìm solution mới
   - Map decision journey: từ awareness đến decision, qua những bước nào
   - Phân tích information sources: customer tìm thông tin ở đâu trước khi quyết định
   - Xác định trust signals: customer cần gì để tin tưởng và hành động

4. **Segment Formation (Jobs-based, KHÔNG demographics)**
   - Nhóm customers theo shared jobs và shared failure modes
   - Đặt tên segment bằng behavior description (ví dụ: "người cần sửa nhà gấp nhưng không biết thợ nào đáng tin")
   - Tính Underservice Score: Importance (1-5) x Dissatisfaction (1-5) x Frequency (1-5)
   - Chạy 3 Quality Tests: Jobs Test, Non-Overlap Test, Reachability Test

5. **Willingness-to-Pay Analysis**
   - Thu thập evidence về giá customer đang trả cho workarounds
   - Phân tích price sensitivity signals từ social conversations
   - Map value perception: customer đánh giá value dựa trên tiêu chí gì
   - Xác định pricing anchors: customer so sánh giá với gì

6. **Customer Journey Mapping**
   - Map touchpoints trên mỗi platform
   - Xác định moments of truth (khoảnh khắc quyết định)
   - Phát hiện drop-off points trong journey
   - Map emotional states tại mỗi touchpoint

7. **Synthesis và Reasoning**
   - Cross-reference findings giữa các data sources
   - Xác định contradictions (customer nói một đằng, làm một nẻo)
   - Formulate insights (patterns có ý nghĩa)
   - Validate hoặc invalidate initial hypothesis

## Output format

```json
{
  "research_id": "R6-2026-03-22-001",
  "vertical": "string",
  "side": "supply | demand | both",
  "data_sources_used": ["social_6_platforms", "survey_n=150", "interviews_n=12"],
  "initial_hypothesis_status": "validated | partially_validated | invalidated",
  "hypothesis_update": "Giả thuyết sau khi điều chỉnh bằng data",
  "jobs_to_be_done": [
    {
      "job_id": "JOB-001",
      "job_statement": "Khi [tình huống], tôi muốn [hành động], để [kết quả mong muốn]",
      "job_type": "functional | emotional | social",
      "importance": 5,
      "current_satisfaction": 2,
      "frequency": "weekly | monthly | quarterly | event_triggered",
      "current_workaround": "Cách customer đang giải quyết hiện tại",
      "workaround_failure_mode": "Lúc nào và tại sao workaround fail",
      "evidence": [
        {
          "source": "Reddit r/subreddit",
          "quote": "Trích dẫn nguyên văn (anonymized)",
          "context": "Bối cảnh của quote"
        },
        {
          "source": "Facebook Group XYZ",
          "quote": "Trích dẫn nguyên văn",
          "context": "Bối cảnh"
        },
        {
          "source": "Interview #5",
          "quote": "Trích dẫn từ phỏng vấn",
          "context": "Bối cảnh"
        }
      ]
    }
  ],
  "segments": [
    {
      "segment_id": "SEG-001",
      "behavioral_name": "Tên segment mô tả bằng hành vi, KHÔNG demographics",
      "job_they_do": "JOB-001",
      "current_workaround": "Chi tiết cách họ đang handle",
      "how_workaround_fails": "Failure mode cụ thể",
      "switching_trigger": "Event cụ thể khiến họ tìm solution mới",
      "willingness_to_pay": {
        "evidence": "Hiện đang trả X cho workaround Y",
        "price_sensitivity": "high | medium | low",
        "value_criteria": ["Tiêu chí 1 họ dùng để đánh giá value", "Tiêu chí 2"],
        "pricing_anchor": "Họ so sánh giá với sản phẩm/dịch vụ nào"
      },
      "acquisition_channels": [
        {
          "channel": "Facebook Groups - nhóm [tên cụ thể]",
          "why": "Segment này active nhất ở đây, hỏi đáp hàng ngày",
          "estimated_reach": 15000
        },
        {
          "channel": "Instagram - hashtag [tên cụ thể]",
          "why": "Segment này discover solutions qua visual content",
          "estimated_reach": 8000
        },
        {
          "channel": "YouTube - search [keyword cụ thể]",
          "why": "Segment này tìm hướng dẫn trước khi quyết định",
          "estimated_reach": 5000
        }
      ],
      "underservice_score": {
        "importance": 5,
        "dissatisfaction": 4,
        "frequency": 3,
        "total": 60
      },
      "quality_tests": {
        "jobs_test": "PASS - mô tả hoàn toàn bằng behavior",
        "non_overlap_test": "PASS - không overlap với SEG-002",
        "reachability_test": "PASS - 3 kênh cụ thể identified"
      }
    }
  ],
  "customer_journey": {
    "awareness": {
      "touchpoints": ["YouTube search", "Reddit browsing", "Facebook Group recommendation"],
      "emotional_state": "frustrated, seeking solutions",
      "key_questions": ["Có ai gặp vấn đề giống mình không?", "Giải pháp nào tốt nhất?"]
    },
    "consideration": {
      "touchpoints": ["Instagram profile review", "YouTube reviews", "Facebook comments"],
      "emotional_state": "cautious, comparing options",
      "key_questions": ["Có đáng tin không?", "Giá có hợp lý không?"],
      "trust_signals_needed": ["Reviews thật", "Portfolio/case studies", "Social proof"]
    },
    "decision": {
      "touchpoints": ["Website/app", "DM on Instagram/Facebook", "Phone call"],
      "emotional_state": "ready but need final push",
      "key_questions": ["Có guarantee không?", "Quy trình cụ thể thế nào?"],
      "drop_off_risks": ["Giá không transparent", "Response time chậm", "Thiếu trust signals"]
    },
    "post_purchase": {
      "touchpoints": ["WhatsApp/Zalo follow-up", "Instagram tag/review", "Facebook review"],
      "emotional_state": "hopeful → satisfied hoặc disappointed",
      "repeat_triggers": ["Cần dịch vụ lại", "Recommend cho bạn bè"],
      "advocacy_channels": ["Facebook Group sharing", "Instagram Stories mention", "Word of mouth"]
    }
  },
  "contradictions_found": [
    {
      "what_they_say": "Giá không quan trọng, chất lượng mới quan trọng",
      "what_they_do": "80% chọn option rẻ nhất trong practice",
      "implication": "Pricing strategy cần balance perceived quality với accessible price point"
    }
  ],
  "key_insights": [
    {
      "insight": "Phát biểu insight rõ ràng",
      "evidence_strength": "strong | moderate | weak",
      "implications_for": "segment_analyst | cvp_architect | biz_dev",
      "action_suggested": "Hành động cụ thể nên test"
    }
  ],
  "research_gaps": [
    "Chưa có đủ data về willingness-to-pay cho SEG-002. Cần survey hoặc pricing experiment.",
    "Supply side research cần thêm interviews. Social data không đủ sâu."
  ]
}
```

## Business Type Adaptations

- **Digital Product**: Focus vào feature adoption patterns và workflow analysis. Twitter và Reddit cho honest feedback về tools. YouTube tutorials reveal how customers actually use products (vs intended use). LinkedIn cho B2B buyer journey. Product reviews trên platforms là gold mine. Track "alternative to [competitor]" searches.
- **Service**: Facebook Groups là nguồn richest cho service customer research. Instagram DM patterns (questions trước khi book) reveal decision criteria. YouTube "how to choose a [service provider]" videos show evaluation process. Word-of-mouth tracking qua social mentions. Trust journey dài hơn digital products.
- **Physical Product**: Instagram và YouTube cho product usage patterns. Facebook Marketplace behaviors cho pricing research. Reddit honest reviews không bị influenced bởi paid promotions. Unboxing reactions trên YouTube reveal first impression gaps. Return/complaint patterns trên social reveal product-market fit issues.
- **Marketplace**: PHẢI research cả hai sides independently. Supply side thường ít vocal trên social, cần deeper research (LinkedIn, industry forums). Demand side vocal trên Facebook Groups, Reddit, Instagram. Chicken-egg research: tìm hiểu side nào có pain point ACUTE hơn (đó là side bắt đầu). Trust research critical: cả hai sides cần trust marketplace khác nhau thế nào.

## Quy tắc

- TUYỆT ĐỐI KHÔNG mô tả customer bằng demographics (tuổi, giới tính, thu nhập, quy mô công ty). Chỉ dùng Jobs-to-be-done và behavioral descriptions.
- Mỗi insight phải có evidence từ ít nhất 2 data sources khác nhau. Single-source insight phải được gắn cờ "needs validation".
- Contradictions (nói vs làm) là insights giá trị nhất. Luôn tìm và report contradictions.
- Customer quotes phải được anonymized hoàn toàn trước khi đưa vào output.
- Reasoning type skill: phải explain logic chain từ data → pattern → insight. Không nhảy thẳng từ data sang conclusion.
- Underservice Score phải dựa trên evidence, không phải assumption. Nếu không có đủ data cho 1 dimension, ghi rõ "estimated" và flag cần validate.
- Research gaps phải luôn được report. Không có research nào complete 100%.
- Customer research không bao giờ kết thúc. Đây là continuous process, mỗi lần output là snapshot tại thời điểm đó.
- Khi research cho marketplace: LUÔN tách riêng supply side và demand side. Gộp chung = sai methodology.
- 3 Quality Tests (Jobs, Non-Overlap, Reachability) là bắt buộc trước khi pass segment sang CVP Architect. Fail 1 test = cần rework.
