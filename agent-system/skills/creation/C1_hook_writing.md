---
code: C1
name: hook-writing
description: >
  Viet hook thu hut cho content tren moi nen tang (Facebook, Instagram, LinkedIn,
  YouTube, TikTok, Twitter/X). Tao cau mo dau khien nguoi doc/xem dung scroll va
  tiep tuc doc/xem.
---

## Mục đích

Tạo ra các hook (câu mở đầu) có sức hút cao cho mọi loại content: bài viết, video, carousel, reel, story. Hook quyết định 80% hiệu quả của content — nếu hook yếu, không ai đọc phần còn lại.

## Input cần có

```json
{
  "topic": "Chủ đề chính của content",
  "target_audience": "Đối tượng mục tiêu (behavior-based)",
  "platform": "twitter | instagram | facebook | linkedin | youtube",
  "content_type": "post | reel | carousel | story | thread | short",
  "pain_point": "Nỗi đau chính của audience liên quan đến topic",
  "desired_emotion": "Cảm xúc muốn trigger: curiosity | fear | surprise | excitement | anger | hope",
  "tone": "professional | casual | provocative | educational | inspirational",
  "context": "Bối cảnh bổ sung nếu có (optional)"
}
```

> Nếu `pain_point` hoặc `desired_emotion` không được cung cấp, hãy infer từ `topic` + `target_audience` trước khi tiến hành các bước tiếp theo.

## Quy trình thực hiện

### Bước 1 — Phân tích audience psychology
- Xác định pain point chính và desired outcome của audience
- Map emotion phù hợp nhất với topic + audience
- Xác định "scroll-stopping trigger" — điều gì khiến họ dừng lại

### Bước 2 — Chọn hook framework
Áp dụng 1 hoặc nhiều framework sau:

| Framework | Mô tả | Ví dụ |
|-----------|--------|-------|
| Contrarian | Đi ngược lại belief phổ biến | "Posting mỗi ngày đang giết reach của bạn" |
| Open Loop | Tạo câu hỏi trong đầu người đọc | "Tôi đã mất 3 năm để hiểu điều này..." |
| Specificity | Dùng số cụ thể, chi tiết bất ngờ | "347 ngày. Đó là thời gian tôi cần để..." |
| Pattern Interrupt | Phá vỡ kỳ vọng | "Đừng đọc bài này nếu bạn đang hài lòng với..." |
| Story Entry | Bắt đầu giữa một câu chuyện | "Lúc 2h sáng, tôi nhận được tin nhắn..." |
| Question | Câu hỏi khiến audience phải suy nghĩ | "Bạn có biết tại sao 90% startup fail?" |
| Bold Claim | Tuyên bố mạnh mẽ có data backup | "Content marketing đã chết. Đây là thứ thay thế nó." |
| Before/After | Contrast rõ ràng | "6 tháng trước tôi có 200 followers. Hôm nay: 50K." |

### Bước 3 — Viết 5 biến thể hook
- Mỗi biến thể dùng framework khác nhau
- Adapt theo platform và content type
- Giữ hook ngắn: tối đa 2 câu cho text, 3 giây cho video

### Bước 4 — Scoring và ranking
Đánh giá mỗi hook theo:
- **Curiosity Gap (1-5):** Mức độ tạo câu hỏi trong đầu người đọc
- **Specificity (1-5):** Có cụ thể, không generic
- **Emotion Trigger (1-5):** Kích hoạt cảm xúc mạnh
- **Platform Fit (1-5):** Phù hợp với platform và content type
- **Total Score = Curiosity × Specificity × Emotion × Platform Fit**

### Bước 5 — Chọn top 3 và polish
- Tối ưu từ ngữ cho platform cụ thể
- Đảm bảo hook dẫn tự nhiên vào body content
- Kiểm tra: hook có deliverable trong body không? (không clickbait trống)

## Output format (JSON)

```json
{
  "skill": "hook-writing",
  "input_summary": {
    "topic": "...",
    "platform": "...",
    "content_type": "...",
    "target_emotion": "..."
  },
  "hooks": [
    {
      "rank": 1,
      "hook_text": "...",
      "framework_used": "contrarian | open_loop | specificity | pattern_interrupt | story_entry | question | bold_claim | before_after",
      "score": {
        "curiosity_gap": 5,
        "specificity": 4,
        "emotion_trigger": 5,
        "platform_fit": 4,
        "total": 400
      },
      "why_it_works": "Giải thích ngắn tại sao hook này hiệu quả",
      "suggested_follow_up": "Câu tiếp theo sau hook để giữ momentum"
    },
    {
      "rank": 2,
      "hook_text": "...",
      "framework_used": "...",
      "score": { "curiosity_gap": 0, "specificity": 0, "emotion_trigger": 0, "platform_fit": 0, "total": 0 },
      "why_it_works": "...",
      "suggested_follow_up": "..."
    },
    {
      "rank": 3,
      "hook_text": "...",
      "framework_used": "...",
      "score": { "curiosity_gap": 0, "specificity": 0, "emotion_trigger": 0, "platform_fit": 0, "total": 0 },
      "why_it_works": "...",
      "suggested_follow_up": "..."
    }
  ],
  "cross_platform_variants": {
    "shortest_version": "Hook rút gọn tối đa cho Twitter/X",
    "video_script_opening": "Hook 3 giây cho Reels/Shorts"
  }
}
```

## Platform Adaptations

- **Twitter/X**: Hook tối đa 1 câu. Dùng contrarian hoặc bold claim. Không dùng emoji. Tối ưu cho quote-retweet.
- **Instagram**: Reels — hook trong 1.5 giây đầu (visual + text overlay). Carousels — slide đầu là hook, dùng bold text lớn. Stories — câu hỏi poll hoặc pattern interrupt visual.
- **Facebook**: Posts — hook 1-2 câu, tối ưu cho comment engagement. Reels — tương tự Instagram nhưng hook cần rõ ràng hơn vì audience đa dạng hơn. Stories — dùng câu hỏi hoặc before/after.
- **LinkedIn**: Hook chuyên nghiệp hơn nhưng vẫn provocative. Dùng story entry hoặc contrarian. Tránh clickbait rõ ràng. Line break sau hook để tạo "see more" click.
- **YouTube**: Shorts — hook trong 1 giây đầu, visual-first. Long-form — hook trong 5 giây đầu kết hợp với thumbnail promise.

## Quy tắc

1. **Không clickbait trống** — Mọi hook phải deliverable trong body content. Hook hứa gì thì content phải deliver.
2. **Specificity > Generality** — "Tôi kiếm 47 triệu/tháng" mạnh hơn "Tôi kiếm nhiều tiền".
3. **1 emotion per hook** — Không trộn lẫn nhiều cảm xúc. Chọn 1 và đẩy mạnh.
4. **Platform-native** — Hook cho LinkedIn khác hoàn toàn hook cho Instagram Reels. Không copy-paste cross-platform.
5. **Test > Opinion** — Luôn suggest A/B test giữa 2 hooks. Data quyết định, không phải taste.
6. **Không dùng hook template quá phổ biến** — "Bạn sẽ không tin..." đã bị audience nhận ra và ignore.
7. **Hook phải match content depth** — Hook mạnh + content yếu = mất trust. Chỉ viết hook cho content thực sự có substance.