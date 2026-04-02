---
code: R8
name: Insight Structuring
type: reasoning
category: research
description: "Cluster raw pain phrases & signals thành structured insights với context, emotion, pain type, frequency"
output_format: json
---

## Mục đích

Biến raw data (pain phrases, signals, reviews) thành **Atomic Insight Units (AIU)** — mỗi insight được chuẩn hóa với đầy đủ context, emotion, pain type, và frequency.

## Input cần có

- **pain_phrases**: Danh sách pain phrases từ social listening (R2)
- **signals**: Danh sách signals từ market scan (R1)
- **audience_intel**: Audience intelligence data (nếu có)
- **reviews**: Reviews/comments raw (nếu có)

## Quy trình thực hiện

### Bước 1: Chuẩn hóa mỗi data point thành Atomic Insight Unit

Mỗi raw input → chuyển thành format:

```
[Context] + [Emotion] + [Problem] + [Desired State]
```

Ví dụ:
- Raw: "Gọi thợ sửa điều hòa mà thợ đến muộn 3 tiếng, nóng chết"
- AIU: Context="Cần sửa điều hòa gấp" + Emotion="Frustrated, angry" + Problem="Thợ không đúng giờ" + Desired="Thợ đến nhanh, đúng hẹn"

### Bước 2: Phân loại Pain Type

Mỗi insight phải gắn 1 trong 3 pain types:
- **functional**: Lỗi sản phẩm/dịch vụ, không hoạt động đúng
- **emotional**: Sợ hãi, lo lắng, khó chịu, mất niềm tin
- **financial**: Giá cao, chi phí phát sinh, bị chặt chém

### Bước 3: Đánh giá Emotional Intensity

Scale 1-5:
- 1: Nhẹ (inconvenience)
- 2: Khó chịu (annoyance)
- 3: Trung bình (frustration)
- 4: Mạnh (anger/fear)
- 5: Rất mạnh (outrage/panic)

### Bước 4: Tính Frequency

- Đếm số lần insight tương tự xuất hiện trong data
- Group các insight tương tự (>70% semantic similarity) lại

### Bước 5: Clustering

Group insights thành clusters dựa trên:
- Cùng problem domain
- Cùng pain type
- Cùng desired state

Mỗi cluster = 1 "insight theme" với representative insight.

## Quy tắc tuyệt đối

1. KHÔNG thêm insight mà data không có evidence
2. Giữ nguyên ngôn ngữ gốc của người dùng trong quotes
3. Frequency phải dựa trên data thực, KHÔNG ước lượng
4. Mỗi insight PHẢI có ít nhất 1 evidence source

## Output format

```json
{
  "total_raw_inputs": 0,
  "total_insights": 0,
  "total_clusters": 0,
  "insights": [
    {
      "id": "INS-001",
      "context": "Mô tả tình huống",
      "emotion": "Cảm xúc chính",
      "problem": "Vấn đề cốt lõi",
      "desired_state": "Trạng thái mong muốn",
      "pain_type": "functional | emotional | financial",
      "emotional_intensity": 1-5,
      "frequency": 0,
      "evidence": [
        {
          "raw_text": "Quote gốc từ người dùng",
          "source": "platform/source",
          "date": "2026-01-01"
        }
      ],
      "cluster_id": "CLU-001"
    }
  ],
  "clusters": [
    {
      "id": "CLU-001",
      "theme": "Tên theme",
      "description": "Mô tả cluster",
      "pain_type": "functional | emotional | financial",
      "avg_emotional_intensity": 3.5,
      "total_frequency": 15,
      "insight_ids": ["INS-001", "INS-002"],
      "representative_quote": "Quote đại diện nhất"
    }
  ]
}
```
