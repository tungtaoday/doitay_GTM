---
code: S1
name: Thesis Formation
type: reasoning
category: strategy
description: Hình thành thesis kinh doanh — điều ta tin về thị trường mà người khác chưa thấy
tools_required: []
output_format: json
---

## Mục đích

Xây dựng business thesis rõ ràng, falsifiable — làm nền tảng cho mọi quyết định chiến lược tiếp theo. Thesis tốt phải trả lời: "Ta đang chơi game gì, luật chơi là gì, và tại sao ta tin mình thắng được?"

## Input cần có

- **Vertical/ngành:** Lĩnh vực kinh doanh cụ thể (không broad)
- **Observation:** Những quan sát về thị trường, pain points, behavior shifts
- **Resources available:** Vốn, kỹ năng, network, thời gian có thể commit
- **Business type:** Digital Product / Service / Marketplace
- **Geography:** Thị trường mục tiêu ban đầu (càng narrow càng tốt)

## Quy trình thực hiện

### Bước 1 — Market Condition Analysis
- Xác định market condition hiện tại: fragmentation, trust gap, information asymmetry, regulation shift, hay behavior shift?
- Liệt kê 3-5 observations cụ thể có evidence (không phải cảm tính)
- Xác định root cause tại sao condition này tồn tại

### Bước 2 — Opportunity Identification
- Từ market condition, xác định specific opportunity được tạo ra
- Xác định ai là specific actor hưởng lợi từ opportunity này
- Đánh giá timing: tại sao bây giờ, không phải 2 năm trước hay 2 năm sau?

### Bước 3 — Unfair Advantage Assessment
- Liệt kê tất cả advantages hiện có: domain knowledge, network, technical skill, distribution access, capital, data
- Loại bỏ những thứ ai cũng có (generic advantages)
- Giữ lại 1-2 unfair advantages thực sự — thứ mà đối thủ không thể copy trong 12 tháng

### Bước 4 — Thesis Construction
- Viết thesis theo template: "[Market condition] tồn tại vì [root cause]. Điều này tạo ra [specific opportunity] cho [specific actor]. Ta có [unfair advantage] để capture nó."
- Thesis phải falsifiable — có thể chứng minh sai bằng data
- Thesis phải specific — không áp dụng cho 10 ngành khác nhau

### Bước 5 — Constraints & Kill Criteria
- Xác định capital ceiling per experiment
- Xác định time to first transaction/revenue
- Định nghĩa kill criteria cụ thể, measurable
- Liệt kê explicit exclusions (NOT DOING list)

### Bước 6 — Success Definition
- Định nghĩa success cho quarter hiện tại bằng con số cụ thể
- Không dùng vanity metrics (followers, page views)
- Focus vào leading indicators của business viability

## Output format

```json
{
  "thesis": {
    "statement": "1-2 câu thesis hoàn chỉnh",
    "market_condition": "Mô tả condition cụ thể",
    "root_cause": "Tại sao condition này tồn tại",
    "opportunity": "Specific opportunity được tạo ra",
    "unfair_advantage": "Lợi thế cạnh tranh không thể copy"
  },
  "playing_field": {
    "vertical": "Ngành cụ thể, không broad",
    "geography": "Bắt đầu narrow — 1 thành phố hoặc 1 segment",
    "time_horizon": "Số quarters để validate thesis"
  },
  "constraints": {
    "capital_ceiling_per_experiment": "Số tiền tối đa cho mỗi experiment",
    "time_to_first_transaction": "Số tuần target",
    "kill_criteria": [
      "Điều kiện cụ thể #1 để kill",
      "Điều kiện cụ thể #2 để kill"
    ]
  },
  "not_doing": [
    "Exclusion #1 — lý do",
    "Exclusion #2 — lý do"
  ],
  "success_this_quarter": {
    "primary_metric": "Metric chính + target number",
    "secondary_metric": "Metric phụ + target number",
    "definition": "Câu mô tả success rõ ràng"
  },
  "falsification_test": "Nếu [điều kiện cụ thể] xảy ra, thesis này sai"
}
```

## Business Type Adaptations

- **Digital Product**: Thesis focus vào pain point của user mà existing tools không solve được. Unfair advantage thường là domain expertise hoặc unique data. Kill criteria dựa trên activation rate và retention, không phải downloads.
- **Service**: Thesis focus vào trust gap hoặc quality inconsistency trong ngành. Unfair advantage thường là process/methodology hoặc talent network. Kill criteria dựa trên repeat rate và referral rate.
- **Marketplace**: Thesis focus vào fragmentation hoặc information asymmetry. Unfair advantage thường là supply access hoặc demand aggregation. Kill criteria dựa trên Liquidity Score — % listings transacted trong 30 ngày.

## Quy tắc

- Thesis phải viết trong 1-2 câu. Nếu cần nhiều hơn, thesis chưa đủ clear.
- KHÔNG dùng buzzwords: "disrupt", "revolutionize", "AI-powered". Dùng ngôn ngữ cụ thể.
- KHÔNG viết thesis mà ai đọc cũng đồng ý — thesis tốt phải controversial với ít nhất 50% người nghe.
- Kill criteria phải measurable và có timeline. "Không có traction" là sai. "Liquidity Score < 10% sau 8 tuần" là đúng.
- NOT DOING list quan trọng ngang DOING list. Nếu không biết mình không làm gì, sẽ làm quá nhiều thứ.
- Mỗi thesis chỉ valid cho 1-2 quarters. Phải revisit khi có data mới.
- Phase 1: Giữ thesis đơn giản. 1 vertical, 1 geography, 1 experiment tại một thời điểm.
