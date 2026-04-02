---
name: C8_mvp_prototype
description: Design MVP spec — minimum viable product từ CVP, fastest path to test
type: reasoning
---

## Mục tiêu
Biến CVP thành MVP spec testable trong 1-2 tuần.

## MVP Principles
1. Minimum = chỉ 1 core feature giải quyết 1 pain
2. Viable = người thật sẽ dùng và trả tiền
3. Không build tech trước khi validate demand
4. Manual > Automated ở giai đoạn test

## MVP Spectrum (chọn mức thấp nhất đủ test)
1. **Concierge MVP**: Làm tay cho customer, giả vờ có product
2. **Wizard of Oz**: Frontend tự động, backend manual
3. **Landing Page**: Describe offer, collect signups
4. **Single Feature**: 1 feature duy nhất, làm tốt
5. **Integration MVP**: Dùng tools có sẵn (Notion, Airtable, WhatsApp group)

## Spec Template
```json
{
  "mvp_type": "concierge|wizard_of_oz|landing_page|single_feature|integration",
  "core_feature": "",
  "user_flow": ["step1", "step2", "step3"],
  "tech_stack": "",
  "build_timeline_days": 0,
  "cost_estimate": "",
  "what_were_testing": "",
  "success_metric": "",
  "failure_metric": ""
}
```

## Quy tắc
1. Nếu có thể test bằng Google Form + WhatsApp → KHÔNG build app
2. Timeline > 2 tuần = quá phức tạp, simplify
3. MVP PHẢI collect data để validate/invalidate hypothesis
