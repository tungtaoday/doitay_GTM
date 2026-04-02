---
code: R9
name: Persona Synthesis
type: reasoning
category: research
description: "Build persona từ structured insights — bao gồm fear, bias, behavioral contradiction, past experience"
output_format: json
---

## Mục đích

Tạo **Decision-Ready Personas** từ structured insights (R8 output). Persona KHÔNG chỉ là demographic — phải có fear, bias, contradiction, và past experience để phục vụ Synthetic Interview (R10).

## Input cần có

- **structured_insights**: Output từ R8 (Insight Structuring) — clusters + insights
- **audience_intel**: Audience intelligence data bổ sung (nếu có)
- **segments**: Segment data từ research (nếu có)

## Quy trình thực hiện

### Bước 1: Xác định Persona Candidates

Từ insight clusters, group theo:
- Behavioral patterns tương tự
- Pain types giống nhau
- Context sử dụng giống nhau

Mỗi group → 1 persona candidate. Minimum 3 insights/persona.

### Bước 2: Build Persona Profile

Mỗi persona PHẢI có:

#### 2.1 Core Identity
- Tên đại diện (behavioral, không demographic)
- Job-to-be-done chính
- Context sử dụng phổ biến nhất

#### 2.2 Fears (bắt buộc)
- Sợ bị lừa/chặt chém
- Sợ mất tiền
- Sợ mất thời gian
- Sợ chất lượng kém
- Sợ mất mặt/xấu hổ

#### 2.3 Past Experience (bắt buộc)
- Trải nghiệm tệ trước đó với dịch vụ tương tự
- Workaround đang dùng
- Tại sao workaround không đủ tốt

#### 2.4 Cognitive Biases (rất quan trọng)
- **Loss aversion**: Sợ mất hơn ham được
- **Status quo bias**: Ngại thay đổi, dùng cái cũ cho an toàn
- **Social proof bias**: Tin người khác đã dùng
- **Anchoring bias**: Bám vào giá/thông tin đầu tiên
- **Bandwagon effect**: Theo số đông

#### 2.5 Behavioral Contradictions (quan trọng nhất)
- Nói tiết kiệm nhưng vẫn chọn đắt khi cần gấp
- Nói không tin app nhưng vẫn thử khi bế tắc
- Nói ưu tiên chất lượng nhưng so giá trước
- Nói muốn nhanh nhưng lại research kỹ

### Bước 3: Validate Persona

Mỗi trait PHẢI có evidence từ data:
- Fear → link tới insight có emotional_intensity >= 3
- Past experience → link tới insight có evidence quote
- Bias → suy luận từ behavioral patterns trong data
- Contradiction → 2 insights mâu thuẫn từ cùng cluster

## Quy tắc tuyệt đối

1. KHÔNG tạo persona từ assumption — mọi trait phải có evidence
2. Minimum 3 fears per persona
3. Minimum 1 behavioral contradiction per persona
4. Minimum 2 cognitive biases per persona
5. KHÔNG dùng demographic (tuổi, giới, thu nhập) làm primary identifier

## Output format

```json
{
  "total_personas": 0,
  "personas": [
    {
      "id": "PER-001",
      "name": "Tên behavioral (VD: 'Người cần gấp nhưng sợ bị lừa')",
      "job_to_be_done": "JTBD chính",
      "primary_context": "Tình huống sử dụng phổ biến nhất",
      "fears": [
        {
          "fear": "Mô tả nỗi sợ",
          "intensity": 1-5,
          "evidence_insight_ids": ["INS-001"]
        }
      ],
      "past_experiences": [
        {
          "experience": "Mô tả trải nghiệm",
          "impact_on_behavior": "Ảnh hưởng lên hành vi hiện tại",
          "evidence_insight_ids": ["INS-002"]
        }
      ],
      "cognitive_biases": [
        {
          "bias": "loss_aversion | status_quo | social_proof | anchoring | bandwagon",
          "manifestation": "Biểu hiện cụ thể",
          "evidence_insight_ids": ["INS-003"]
        }
      ],
      "behavioral_contradictions": [
        {
          "says": "Điều persona nói/tin",
          "does": "Điều persona thực sự làm",
          "trigger": "Điều kiện kích hoạt contradiction",
          "evidence_insight_ids": ["INS-001", "INS-004"]
        }
      ],
      "current_workaround": "Giải pháp đang dùng",
      "workaround_failure_mode": "Tại sao giải pháp hiện tại fail",
      "source_cluster_ids": ["CLU-001", "CLU-002"],
      "confidence": 0.0-1.0
    }
  ]
}
```
