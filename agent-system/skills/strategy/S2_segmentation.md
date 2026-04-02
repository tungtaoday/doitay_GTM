---
code: S2
name: Segmentation
type: reasoning
category: strategy
description: Phân khúc khách hàng theo Jobs-to-be-done — ai đang bị underserved đau nhất ngay lúc này
tools_required: []
output_format: json
---

## Mục đích

Xác định và ưu tiên các nhóm khách hàng mục tiêu dựa trên hành vi và nhu cầu thực tế (Jobs-to-be-done), không phải demographics. Tìm ra wedge segment — nhóm khách hàng đầu tiên để phục vụ, nơi pain cao nhất và reachability tốt nhất.

## Input cần có

- **Thesis đã hình thành** (output từ S1)
- **Vertical/ngành cụ thể:** Lĩnh vực đang target
- **Observations về customer behavior:** Những gì đã quan sát được từ thị trường
- **Business type:** Digital Product / Service / Marketplace
- **Existing data (nếu có):** Survey, interview notes, analytics, forum discussions

## Quy trình thực hiện

### Bước 1 — Job Mapping
- Liệt kê tất cả "jobs" mà potential customers đang cố gắng hoàn thành trong vertical này
- Mỗi job phải viết theo format: "[Ai] cần [làm gì] để [đạt outcome gì]"
- Phân loại jobs: functional (hoàn thành task), emotional (cảm giác), social (được nhìn nhận thế nào)
- Ưu tiên jobs có frequency cao và importance cao

### Bước 2 — Current Workaround Analysis
- Với mỗi job, xác định workaround hiện tại mà customer đang dùng
- Phân tích cách workaround fail: tốn thời gian? tốn tiền? không reliable? không scalable?
- Xác định "switching cost" — customer phải bỏ gì để switch sang solution mới
- Xác định "switching trigger" — event cụ thể nào khiến customer tìm solution mới

### Bước 3 — Underservice Scoring
- Với mỗi job-segment combination, tính Underservice Score:
  - Importance of job (1-5): Job này quan trọng thế nào với cuộc sống/business của họ?
  - Dissatisfaction with current solution (1-5): Họ bất mãn thế nào với cách hiện tại?
  - Frequency (1-5): Họ cần làm job này bao lâu một lần?
- Score = Importance x Dissatisfaction x Frequency (max 125)

### Bước 4 — Segment Profile Construction
Với mỗi segment, fill đầy đủ profile:
- Who they are (CHỈ behavior, KHÔNG demographics)
- Job they're trying to do (functional + emotional + social)
- Current workaround (cụ thể)
- How workaround fails them (cụ thể)
- Switching trigger (event cụ thể)
- Willingness to pay (evidence-based, không assumption)
- Acquisition channels (3+ kênh cụ thể, có tên platform/community/location)

### Bước 5 — Quality Tests
Chạy 3 tests bắt buộc trước khi finalize:

**Jobs Test:** Mô tả segment hoàn toàn bằng behavior? Có dùng age/gender/income/company size không? Nếu có → rewrite.

**Non-Overlap Test:** Cùng một người có thể thuộc 2 segments không? Nếu có → merge hoặc redefine boundaries.

**Reachability Test:** Có ít nhất 3 kênh cụ thể (có tên) để reach segment này không? Nếu không → segment này unreachable, deprioritize.

### Bước 6 — Wedge Selection
- Rank top 3 segments theo Underservice Score
- Đánh giá thêm: cold start fit (segment nào dễ acquire nhất với zero resources?)
- Chọn wedge segment: score cao nhất + reachable nhất + fit cold start tốt nhất

## Output format

```json
{
  "segments": [
    {
      "rank": 1,
      "name": "Tên behavioral — mô tả bằng hành vi, không demographics",
      "job_to_be_done": {
        "functional": "Cần làm gì cụ thể",
        "emotional": "Muốn cảm thấy gì",
        "social": "Muốn được nhìn nhận thế nào"
      },
      "current_workaround": "Cách họ đang giải quyết hiện tại",
      "workaround_failure": "Cách workaround fail cụ thể",
      "switching_trigger": "Event cụ thể khiến họ tìm solution mới",
      "willingness_to_pay": {
        "estimate": "Mức giá/tháng hoặc /transaction",
        "evidence": "Bằng chứng cụ thể — không phải assumption"
      },
      "acquisition_channels": [
        "Kênh #1 — tên cụ thể",
        "Kênh #2 — tên cụ thể",
        "Kênh #3 — tên cụ thể"
      ],
      "underservice_score": {
        "importance": 0,
        "dissatisfaction": 0,
        "frequency": 0,
        "total": 0
      }
    }
  ],
  "wedge_segment": {
    "selected": "Tên segment được chọn",
    "reason": "Score cao nhất + reachable nhất + cold start fit tốt nhất",
    "cold_start_fit": "Tại sao segment này dễ acquire nhất khi bắt đầu từ 0"
  },
  "quality_checks": {
    "jobs_test": "PASS/FAIL — ghi chú",
    "non_overlap_test": "PASS/FAIL — ghi chú",
    "reachability_test": "PASS/FAIL — ghi chú"
  }
}
```

## Business Type Adaptations

- **Digital Product**: Segments thường chia theo workflow/use case, không phải industry. Ví dụ: "Người tạo content hàng ngày nhưng không có design skill" thay vì "SME marketing team". Switching trigger thường là tool hiện tại tăng giá hoặc thêm friction.
- **Service**: Segments thường chia theo urgency và complexity của job. Ví dụ: "Chủ nhà cần sửa chữa gấp trong 24h mà không biết ai đáng tin" thay vì "Homeowner 30-45 tuổi". Willingness to pay evidence từ giá dịch vụ hiện tại trên thị trường.
- **Marketplace**: Phải segment CẢ supply side VÀ demand side riêng biệt. Wedge segment phải xét cả hai bên. Cold start fit đặc biệt quan trọng — segment nào dễ acquire supply trước?

## Quy tắc

- TUYỆT ĐỐI không dùng demographics để mô tả segment. Không age, gender, income, company size. Chỉ dùng behavior và jobs.
- Mỗi segment phải có ít nhất 3 acquisition channels CỤ THỂ (có tên platform, community, location). "Social media" là SAI. "Facebook Group 'Hội chủ quán cà phê Sài Gòn' — 50k members" là ĐÚNG.
- Willingness to pay phải có evidence: giá dịch vụ tương tự, chi phí workaround hiện tại, hoặc direct customer quote. Không bao giờ assume.
- Non-Overlap Test là bắt buộc. Nếu 1 người thuộc 2 segments → segments chưa clean.
- Switching trigger phải là EVENT cụ thể, không phải trạng thái. "Bất mãn với dịch vụ" là SAI. "Bị cancel booking lần thứ 3 trong tháng" là ĐÚNG.
- Output tối đa 5 segments, recommend 3. Quá nhiều segments = không focused.
- Phase 1: Chỉ chọn 1 wedge segment. Không cố serve nhiều segments cùng lúc.
