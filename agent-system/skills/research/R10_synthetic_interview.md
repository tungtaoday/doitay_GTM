---
code: R10
name: Synthetic Interview
type: reasoning
category: research
description: "Simulate decision-driven interview với persona — gồm exploration, trade-off, scenario, pricing, threshold questions"
output_format: json
---

## Mục đích

Thực hiện **Synthetic Interview** với persona (từ R9) để extract **decision triggers** — hiểu tại sao khách mua, không mua, trả thêm, hoặc switch.

## QUAN TRỌNG: Dual-role simulation

Bạn sẽ đóng 2 vai:
1. **Interviewer**: Hỏi câu hỏi decision-driven
2. **Persona**: Trả lời dựa trên persona profile (fears, biases, contradictions)

Persona PHẢI trả lời consistent với profile — nếu có loss_aversion bias thì phải thể hiện trong câu trả lời.

## Input cần có

- **persona**: Persona profile từ R9
- **product_context**: Thông tin sản phẩm/dịch vụ đang test
- **structured_insights**: Insights gốc để ground responses

## Quy trình Interview (5 phases)

### Phase 1: Exploration (hiểu context) — 3-4 câu

Mục đích: Hiểu tình huống và trải nghiệm thực tế

```
- Bạn đang gặp vấn đề gì với [dịch vụ]?
- Lần gần nhất bạn cần [dịch vụ] là khi nào? Chuyện gì xảy ra?
- Bạn đã thử giải pháp nào? Kết quả ra sao?
- Điều gì khiến bạn thất vọng nhất?
```

### Phase 2: Trade-off (bắt buộc chọn) — 3-4 câu

Mục đích: Bắt persona reveal priorities thật

```
Nếu phải chọn 1 trong 2:
A. Giá rẻ hơn 30% nhưng không bảo hành
B. Giá cao hơn nhưng bảo hành 6 tháng
→ Bạn chọn gì? Tại sao?

A. Thợ đến trong 1 giờ nhưng bạn không biết thợ nào
B. Thợ đến sau 4 giờ nhưng có review 5 sao
→ Bạn chọn gì? Tại sao?
```

### Phase 3: Scenario (context thực tế) — 2-3 câu

Mục đích: Test hành vi trong tình huống cụ thể

```
Tình huống: [thiết bị] hỏng lúc 10h tối, trời nóng, bạn sẽ:
1. Gọi thợ quen
2. Dùng app/dịch vụ online
3. Chờ đến sáng
4. Tự sửa
→ Tại sao?
```

### Phase 4: Pricing (money extraction) — 2-3 câu

Mục đích: Hiểu price sensitivity và willingness to pay

```
- Bạn sẵn sàng trả thêm bao nhiêu % để được bảo hành?
- Mức giá nào khiến bạn thấy "quá đắt, không đáng"?
- Mức giá nào khiến bạn nghi ngờ "rẻ quá, chắc dở"?
```

### Phase 5: Threshold (điểm gãy quyết định) — 2-3 câu

Mục đích: Tìm deal breakers và switching triggers

```
- Ở điều kiện nào bạn sẽ KHÔNG BAO GIỜ dùng dịch vụ này?
- Điều gì khiến bạn bỏ dịch vụ đang dùng để chuyển sang cái mới?
- Bao nhiêu lần trải nghiệm tệ thì bạn bỏ hẳn?
```

## Quy tắc tuyệt đối

1. Persona PHẢI trả lời consistent với biases và fears trong profile
2. Behavioral contradictions PHẢI xuất hiện tự nhiên trong interview
3. KHÔNG để persona trả lời "perfectly rational" — người thật có biases
4. Mỗi câu trả lời phải reflect ít nhất 1 trait từ persona profile
5. Trade-off questions PHẢI bắt persona chọn — không cho phép "cả hai"
6. Interview tối thiểu 12 câu hỏi, tối đa 18 câu

## Output format

```json
{
  "persona_id": "PER-001",
  "persona_name": "Tên persona",
  "interview_id": "INT-001",
  "total_questions": 15,
  "interview": [
    {
      "phase": "exploration | tradeoff | scenario | pricing | threshold",
      "question": "Câu hỏi",
      "answer": "Câu trả lời của persona",
      "revealed_traits": ["loss_aversion", "fear_of_scam"],
      "key_quote": "Quote quan trọng nhất từ câu trả lời",
      "decision_signal": "buy | not_buy | pay_more | switch | neutral"
    }
  ],
  "raw_decision_signals": {
    "buy_signals": ["signal 1", "signal 2"],
    "not_buy_signals": ["signal 1"],
    "pay_more_signals": ["signal 1"],
    "switch_signals": ["signal 1"],
    "deal_breakers": ["signal 1"]
  }
}
```
