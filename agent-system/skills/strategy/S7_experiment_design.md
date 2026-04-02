---
code: S7
name: Experiment Design
type: reasoning
category: strategy
description: Thiết kế experiment 8 tuần — validate hypothesis với chi phí và thời gian tối thiểu
tools_required: []
output_format: json
---

## Mục đích

Thiết kế experiment 8 tuần có cấu trúc rõ ràng để validate hoặc invalidate business hypothesis. Mỗi experiment test ĐÚNG 1 hypothesis, có success/failure metrics cụ thể, và kill criteria không thương lượng. Mục tiêu là LEARN nhanh nhất có thể, không phải BUILD nhiều nhất có thể.

## Input cần có

- **Thesis** (output từ S1)
- **Wedge segment** (output từ S2)
- **CVP** (output từ S3)
- **Offer** (output từ S4)
- **Channel strategy** (output từ S6)
- **Business type:** Digital Product / Service / Marketplace
- **Budget:** Ngân sách tối đa cho experiment
- **Team:** Ai available, bao nhiêu giờ/tuần

## Quy trình thực hiện

### Bước 1 — Hypothesis Formulation

Viết hypothesis theo format falsifiable:
```
Nếu ta [action cụ thể] cho [segment cụ thể] qua [channel cụ thể],
thì [measurable outcome] sẽ xảy ra trong [timeframe].
```

Hypothesis phải:
- Falsifiable: Có thể chứng minh SAI bằng data
- Specific: 1 action, 1 segment, 1 outcome
- Time-bound: Có deadline rõ ràng
- Test 1 thứ duy nhất: Nếu test nhiều thứ cùng lúc, không biết cái nào work

### Bước 2 — Metrics Definition

**Primary metric (1 con số duy nhất):**
- Số phản ánh trực tiếp hypothesis đúng hay sai
- Ví dụ: conversion rate, repeat purchase rate, Liquidity Score, activation rate

**Secondary metrics (2-3 numbers):**
- Leading indicators cho primary metric
- Giúp diagnose TẠI SAO primary metric đạt hoặc không đạt

**Success threshold:**
- Số cụ thể mà nếu đạt → hypothesis validated
- Phải set TRƯỚC khi chạy experiment, không adjust giữa chừng

**Kill threshold:**
- Số cụ thể mà nếu không đạt tại checkpoint → kill experiment
- Kill = dừng, rút bài học, chuyển sang hypothesis khác
- KHÔNG negotiate kill criteria khi đã set

### Bước 3 — 8-Week Plan

#### Phase A: Setup (Tuần 1-2)
- **Tuần 1:** Build minimum viable version của offer + set up tracking
  - Cụ thể: build/setup gì, ai làm, deadline
  - Tracking: tool nào, metric nào, cách đo
  - Output: Offer ready to ship
- **Tuần 2:** Initial outreach + first transactions
  - Cụ thể: reach ai, qua kênh nào, message gì
  - Target: Số customers đầu tiên tiếp cận
  - Output: First feedback collected

#### Phase B: Traction (Tuần 3-4)
- **Tuần 3:** Scale outreach + optimize dựa trên feedback tuần 2
  - Adjust offer/messaging based on first feedback
  - Expand reach channels
  - Target: [số] new customers engaged
- **Tuần 4:** First checkpoint — evaluate early signals
  - **CHECKPOINT 1:** Primary metric ≥ [threshold]?
  - Nếu YES → proceed to Phase C
  - Nếu NO nhưng close → adjust 1 variable, continue
  - Nếu NO và far off → evaluate kill

#### Phase C: Validation (Tuần 5-6)
- **Tuần 5:** Double down trên channel/approach đang work
  - Focus resources vào highest performing channel
  - Remove friction points identified in Phase B
  - Target: [số] transactions/activations
- **Tuần 6:** Second checkpoint — trend analysis
  - **CHECKPOINT 2:** Primary metric trending up?
  - Nếu YES → proceed to Phase D
  - Nếu FLAT → identify blocker, make 1 change
  - Nếu DOWN → prepare kill case

#### Phase D: Confirmation (Tuần 7-8)
- **Tuần 7:** Consistency test — results repeat without extra effort?
  - Reduce outreach effort to test organic/repeat behavior
  - Measure: repeat rate, referral, organic discovery
  - Target: [%] organic/repeat vs pushed
- **Tuần 8:** Final evaluation + documentation
  - **FINAL CHECKPOINT:** Primary metric vs success threshold
  - Document all learnings regardless of outcome
  - Prepare GO/NO-GO recommendation

### Bước 4 — Resource Plan

**Budget breakdown:**
- Tuần 1-2: Setup costs (tools, initial inventory, etc.)
- Tuần 3-6: Operating costs (ads, content, outreach)
- Tuần 7-8: Minimal spend — testing organic sustainability
- Reserve: 20% buffer cho unexpected needs

**Team allocation:**
- Ai làm gì, bao nhiêu giờ/tuần
- Single owner cho mỗi task — không shared responsibility
- CEO time: Maximum 2 giờ/tuần cho review, không execution

### Bước 5 — Risk Identification & Mitigation

Liệt kê top 3 risks có thể khiến experiment fail:
- Risk description
- Probability (High/Medium/Low)
- Impact (High/Medium/Low)
- Mitigation plan
- Early warning signal

### Bước 6 — Learning Extraction Framework

Bất kể outcome, extract:
- Gì đã work? (keep)
- Gì đã không work? (stop)
- Gì bất ngờ? (investigate)
- Customer nói gì verbatim? (capture exact quotes)
- Hypothesis tiếp theo là gì? (next experiment)

## Output format

```json
{
  "experiment_brief": {
    "name": "Tên experiment ngắn gọn",
    "hypothesis": "Nếu ta [action] cho [segment] qua [channel], thì [outcome] trong [timeframe]",
    "what_we_test": "1 thứ duy nhất đang test",
    "business_type": "Digital Product / Service / Marketplace"
  },
  "metrics": {
    "primary": {
      "metric": "Tên metric",
      "success_threshold": "Số cụ thể để declare success",
      "kill_threshold": "Số cụ thể để trigger kill",
      "measurement_method": "Cách đo cụ thể"
    },
    "secondary": [
      {"metric": "Tên metric", "target": "Số target", "purpose": "Diagnose gì"}
    ]
  },
  "eight_week_plan": {
    "phase_a_setup": {
      "week_1": {
        "focus": "Build MVP + tracking",
        "tasks": ["Task #1 — ai — deadline", "Task #2 — ai — deadline"],
        "output": "Deliverable cụ thể",
        "budget": "Chi phí tuần này"
      },
      "week_2": {
        "focus": "Initial outreach + first transactions",
        "tasks": ["Task #1", "Task #2"],
        "output": "Deliverable cụ thể",
        "budget": "Chi phí tuần này"
      }
    },
    "phase_b_traction": {
      "week_3": {
        "focus": "Scale outreach + optimize",
        "tasks": ["Task #1", "Task #2"],
        "target": "Số customers/transactions",
        "budget": "Chi phí tuần này"
      },
      "week_4": {
        "focus": "CHECKPOINT 1",
        "checkpoint": {
          "evaluate": "Primary metric vs threshold",
          "if_pass": "Action nếu pass",
          "if_close": "Action nếu close",
          "if_fail": "Action nếu fail — consider kill"
        },
        "budget": "Chi phí tuần này"
      }
    },
    "phase_c_validation": {
      "week_5": {
        "focus": "Double down on what works",
        "tasks": ["Task #1", "Task #2"],
        "target": "Số transactions/activations",
        "budget": "Chi phí tuần này"
      },
      "week_6": {
        "focus": "CHECKPOINT 2",
        "checkpoint": {
          "evaluate": "Trend analysis — metric đang up/flat/down",
          "if_up": "Action nếu up",
          "if_flat": "Action nếu flat",
          "if_down": "Action nếu down — prepare kill"
        },
        "budget": "Chi phí tuần này"
      }
    },
    "phase_d_confirmation": {
      "week_7": {
        "focus": "Organic sustainability test",
        "tasks": ["Reduce pushed effort", "Measure organic behavior"],
        "target": "% organic/repeat vs pushed",
        "budget": "Minimal"
      },
      "week_8": {
        "focus": "FINAL EVALUATION",
        "checkpoint": {
          "primary_metric_result": "Số thực tế vs success threshold",
          "verdict": "VALIDATED / INVALIDATED / INCONCLUSIVE",
          "recommendation": "GO / PIVOT / KILL"
        },
        "budget": "Minimal"
      }
    }
  },
  "resources": {
    "total_budget": "Tổng budget 8 tuần",
    "budget_breakdown": {
      "setup": "Tuần 1-2",
      "operating": "Tuần 3-6",
      "confirmation": "Tuần 7-8",
      "reserve": "20% buffer"
    },
    "team": [
      {"role": "Vai trò", "person": "Tên/position", "hours_per_week": 0, "responsibilities": "Trách nhiệm cụ thể"}
    ],
    "ceo_time": "Maximum 2 giờ/tuần — review only, không execution"
  },
  "risks": [
    {
      "risk": "Mô tả risk",
      "probability": "High/Medium/Low",
      "impact": "High/Medium/Low",
      "mitigation": "Kế hoạch giảm thiểu",
      "early_warning": "Signal cảnh báo sớm"
    }
  ],
  "kill_criteria": {
    "checkpoint_1_week_4": "Kill nếu [điều kiện cụ thể]",
    "checkpoint_2_week_6": "Kill nếu [điều kiện cụ thể]",
    "final_week_8": "Kill nếu [điều kiện cụ thể]",
    "absolute_kill": "Kill NGAY LẬP TỨC nếu [điều kiện nghiêm trọng]"
  },
  "learning_extraction": {
    "template": {
      "what_worked": [],
      "what_didnt_work": [],
      "surprises": [],
      "customer_verbatims": [],
      "next_hypothesis": ""
    },
    "pattern_library_entry": {
      "cold_start_approach": "Gì đã work/không work cho cold start",
      "liquidity_mechanism": "Gì đã tạo/không tạo liquidity",
      "trust_model": "Cách build trust",
      "monetization": "Model + take rate + timing"
    }
  }
}
```

## Business Type Adaptations

- **Digital Product**: Primary metric thường là activation rate (% users complete core action lần đầu) hoặc retention (% users quay lại tuần 2). Week 1-2 focus build landing page + MVP feature. Cold start không phải issue — focus user experience. Kill signal: activation rate < 20% sau 4 tuần.
- **Service**: Primary metric thường là repeat booking rate hoặc referral rate. Week 1-2 focus manual service delivery cho 10 customers đầu. Quality consistency là key risk. Kill signal: NPS < 7 hoặc 0% repeat sau 6 tuần.
- **Marketplace**: Primary metric là Liquidity Score (% listings transacted trong 30 ngày). Week 1-2 focus acquire 50 supply units. Cold start là biggest risk — phải solve chicken-egg. Kill signal: Liquidity Score không tăng sau 8 tuần = kill ngay, không exception.

## Quy tắc

- Mỗi experiment test ĐÚNG 1 hypothesis. Nếu muốn test 2 thứ → chạy 2 experiments tuần tự.
- Success và kill thresholds PHẢI set TRƯỚC khi bắt đầu. Adjust giữa chừng = self-deception.
- Kill criteria là NON-NEGOTIABLE. Không có "cho thêm 2 tuần". Nếu kill signal xuất hiện → kill, extract learnings, move on.
- 8 tuần là MAXIMUM, không phải minimum. Nếu có clear signal (positive hoặc negative) sớm hơn → act sớm hơn.
- Budget reserve 20% là bắt buộc. Experiments luôn có chi phí unexpected.
- CEO KHÔNG execute. CEO review 2 giờ/tuần maximum. Nếu CEO phải execute → team không đủ, adjust scope.
- Mỗi tuần phải có 1 clear output/deliverable. Nếu tuần trống = experiment thiếu structure.
- Learning extraction quan trọng ngang outcome. Experiment fail nhưng extract đúng learnings = valuable. Experiment win nhưng không biết tại sao = dangerous.
- Phase 1: Chỉ 1 experiment tại 1 thời điểm. Không chạy parallel experiments.
- Document EVERYTHING: customer quotes, metrics daily, decisions và rationale. Memory fades, data doesn't.
- Sau khi experiment kết thúc, PHẢI update Pattern Library trước khi bắt đầu experiment mới.
