---
code: C2
name: longform-writing
description: >
  Viết bài dài chất lượng cao với cấu trúc logic, giữ được attention xuyên suốt.
  Bao gồm: bài blog, thread Twitter/X, carousel Instagram/Facebook, LinkedIn article,
  newsletter, deep-dive article. Dùng skill này bất cứ khi nào user muốn: viết bài
  dài, viết thread, viết carousel, viết newsletter, viết article, cần cấu trúc cho
  content dài hơn 300 từ, build authority qua content, hoặc bất kỳ yêu cầu longform
  nào — kể cả khi user chỉ nói "viết bài về X" mà không specify format cụ thể.
---

## Mục đích

Tạo longform content có cấu trúc chặt chẽ, giữ được attention từ đầu đến cuối. Bao gồm: bài blog, thread (Twitter/X, LinkedIn), carousel (Instagram, Facebook), newsletter, và deep-dive article. Longform là nơi build authority và trust — không phải nơi để filler.

## Input cần có

```json
{
  "topic": "Chủ đề chính",
  "content_format": "blog | thread | carousel | newsletter | article",
  "platform": "twitter | instagram | facebook | linkedin | blog | substack",
  "target_audience": "Đối tượng mục tiêu (behavior-based)",
  "key_message": "1 takeaway chính người đọc phải nhớ",
  "supporting_points": ["Điểm hỗ trợ 1", "Điểm hỗ trợ 2", "Điểm hỗ trợ 3"],
  "tone": "educational | storytelling | analytical | provocative | inspirational",
  "word_count_target": "500 | 1000 | 1500 | 2000+",
  "cta": "Hành động mong muốn sau khi đọc (optional)",
  "source_material": "Data, research, experience để reference (optional)"
}
```

> Nếu `content_format` hoặc `platform` không được cung cấp, infer từ `topic` + `target_audience`. Nếu `key_message` thiếu, extract từ `supporting_points` trước khi tiến hành.

## Quy trình thực hiện

### Bước 1 — Content Architecture
Chọn structure phù hợp với format:

| Structure | Khi nào dùng | Format phù hợp |
|-----------|-------------|-----------------|
| Problem → Agitate → Solve | Content giải quyết pain point | Blog, thread, carousel |
| Story → Lesson → Application | Content dựa trên experience | Thread, article, newsletter |
| List/Framework | Content dạy framework/process | Carousel, blog, thread |
| Myth → Reality → Proof | Content contrarian | Thread, LinkedIn article |
| Before → Bridge → After | Content transformation | Carousel, story-driven blog |
| Question → Explore → Conclude | Content analytical | Article, newsletter |

### Bước 2 — Outline với retention hooks
- Mỗi section phải có micro-hook để giữ reader tiếp tục
- Đặt "open loops" ở cuối mỗi section
- Distribute value đều — không front-load hoặc back-load toàn bộ

```
HOOK → dùng skill hook-writing nếu có, hoặc viết mới
SECTION 1: Setup context + first value bomb
  ↳ Transition hook → Section 2
SECTION 2: Core insight + evidence
  ↳ Transition hook → Section 3
SECTION 3: Application / How-to
  ↳ Transition hook → Conclusion
CONCLUSION: Reinforce key message + CTA
```

### Bước 3 — Draft theo platform constraints

**Blog/Article:**
- Paragraphs ngắn (2-3 câu)
- Subheadings mỗi 200-300 từ
- Bold key phrases
- Bullet points cho lists

**Thread (Twitter/X):**
- Tweet 1 = Hook (standalone phải có value)
- Mỗi tweet = 1 idea hoàn chỉnh
- Tweet cuối = summary + CTA
- 7-15 tweets là sweet spot

**Carousel (Instagram/Facebook):**
- Slide 1 = Hook visual + text lớn
- 1 idea per slide, tối đa 10-15 slides
- Text ngắn trên slide, detail trong caption
- Slide cuối = CTA rõ ràng
- Design consistent (font, color, layout)

**LinkedIn Article:**
- Professional tone nhưng personal
- Open với story hoặc contrarian take
- Data-backed claims
- 800-1500 từ optimal

**Newsletter:**
- Personal opening (1-2 câu)
- 1 big idea, explored deeply
- Actionable takeaway
- Conversational tone

### Bước 4 — Edit pass
1. **Cut 20%** — Xóa mọi câu không add value
2. **Strengthen transitions** — Mỗi section phải flow tự nhiên
3. **Verify promises** — Hook hứa gì → content deliver đúng
4. **Add specificity** — Thay mọi generic statement bằng specific example
5. **Read aloud test** — Content phải sound natural khi đọc to

### Bước 5 — Platform optimization
- Thêm formatting phù hợp platform
- Optimize cho algorithm (engagement signals)
- Thêm hashtags/tags nếu cần

## Output format (JSON)

```json
{
  "skill": "longform-writing",
  "content_format": "blog | thread | carousel | newsletter | article",
  "platform": "...",
  "structure_used": "PAS | story_lesson | list_framework | myth_reality | before_after | question_explore",
  "content": {
    "title": "Tiêu đề chính",
    "hook": "Hook mở đầu",
    "sections": [
      {
        "section_number": 1,
        "heading": "Tiêu đề section (nếu applicable)",
        "body": "Nội dung section",
        "transition_hook": "Câu chuyển tiếp sang section tiếp theo"
      }
    ],
    "conclusion": "Kết luận + reinforcement of key message",
    "cta": "Call-to-action cụ thể"
  },
  "platform_specific": {
    "thread_tweets": ["Tweet 1", "Tweet 2", "..."],
    "carousel_slides": [
      { "slide_number": 1, "headline": "...", "body_text": "...", "visual_note": "..." }
    ],
    "hashtags": ["#tag1", "#tag2"],
    "caption": "Caption cho post (Instagram/Facebook)"
  },
  "metadata": {
    "word_count": 0,
    "estimated_read_time": "X phút",
    "key_message_reinforced": true,
    "value_distribution": "even | front-loaded | back-loaded"
  }
}
```

## Platform Adaptations

- **Twitter/X**: Thread format. Tweet 1 phải standalone viral-worthy. Mỗi tweet < 280 ký tự. Dùng numbering (1/, 2/, ...). Cuối thread: "Retweet tweet đầu nếu thấy hữu ích."
- **Instagram**: Carousels — 10 slides max, mỗi slide 1 idea, visual-first, caption dài (up to 2200 chars) expand on slides. Reels — longform concept condensed thành 60-90s script. Stories — break thành series 5-7 stories với polls/questions.
- **Facebook**: Posts — longform text posts vẫn work, 500-1000 từ, paragraphs ngắn. Reels — adapt carousel concept thành video. Stories — tương tự Instagram stories nhưng text-heavier.
- **LinkedIn**: Article hoặc long post. Professional but personal. Open with insight, not pleasantries. Tag relevant people. 1300-1500 từ cho article, 200-300 từ cho post.
- **YouTube**: Shorts scripts từ key sections. Long-form script structure: hook → context → value → CTA. Timestamps cho mỗi section.

## Quy tắc

1. **1 key message rule** — Mỗi longform piece chỉ có 1 takeaway chính. Supporting points phải phục vụ takeaway đó.
2. **No filler** — Mỗi câu phải earn its place. Nếu xóa 1 câu mà content không mất gì → câu đó là filler.
3. **Evidence > Opinion** — Mỗi claim cần ít nhất 1 trong: data, example, personal experience, logic chain.
4. **Front-load value** — Reader quyết định tiếp tục đọc trong 30 giây đầu. Đừng "warm up" quá lâu.
5. **Consistent tone** — Không nhảy giữa formal và casual trong cùng 1 piece.
6. **CTA phải natural** — CTA grow từ content, không phải paste vào cuối.
7. **Cross-reference skills** — Dùng hook-writing cho hook, storytelling sections nếu có skill tương ứng.