---
code: C4
name: storytelling
description: >
  Tạo content dựa trên storytelling: narrative structure, character arc, emotional
  journey. Biến data, insight, và trải nghiệm thành câu chuyện người đọc nhớ và
  chia sẻ. Dùng skill này bất cứ khi nào user muốn: kể một câu chuyện, viết case
  study, viết origin story, biến experience cá nhân thành content, viết reel/video
  có cảm xúc, tạo content vulnerable, build trust qua narrative — kể cả khi user
  chỉ nói "viết bài về lần tôi thất bại" mà không dùng từ "storytelling".
---

## Mục đích

Biến bất kỳ message nào thành câu chuyện có sức hút. Story-driven content được nhớ gấp 22 lần so với facts đơn thuần. Skill này apply storytelling frameworks vào mọi content format: post, reel, carousel, thread, video script, case study.

## Input cần có

```json
{
  "core_message": "Message chính muốn truyền tải qua story",
  "story_source": "personal_experience | customer_story | brand_origin | industry_event | analogy | fictional_scenario",
  "raw_material": "Mô tả sự kiện/trải nghiệm/data để build story từ đó",
  "platform": "twitter | instagram | facebook | linkedin | youtube | blog",
  "content_format": "post | reel_script | carousel | thread | video_script | case_study",
  "target_audience": "Đối tượng mục tiêu (behavior-based)",
  "desired_emotion": "Cảm xúc muốn audience cảm nhận cuối story",
  "tone": "vulnerable | triumphant | humorous | dramatic | reflective | raw",
  "length": "micro (< 100 words) | short (100-500) | medium (500-1500) | long (1500+)"
}
```

> Nếu `story_source` không được cung cấp, infer từ `raw_material`. Nếu `desired_emotion` thiếu, infer từ `tone`. Nếu `length` thiếu, infer từ `platform` + `content_format`.

## Quy trình thực hiện

### Bước 1 — Chọn Story Framework

| Framework | Structure | Best for |
|-----------|-----------|----------|
| Hero's Journey (Micro) | Normal → Challenge → Struggle → Discovery → Transformation | Personal growth stories |
| Before/After/Bridge | Before (pain) → Bridge (what changed) → After (result) | Transformation, testimonial |
| In Medias Res | Start mid-action → Flashback context → Resolution | Attention-grabbing openings |
| The Unexpected | Setup expectation → Break it → Reveal lesson | Contrarian content |
| Origin Story | Why this exists → Struggle to create → What it became | Brand, product launches |
| Customer Story | Their pain → Their search → Discovery → Result | Case studies, social proof |
| Analogy Story | Familiar scenario → Parallel to unfamiliar concept → Insight | Educational content |
| Failure Story | Attempt → Fail → What went wrong → Lesson → Retry success | Vulnerability, trust building |

### Bước 2 — Story Architecture

```
HOOK: Bắt đầu tại điểm tension cao nhất
  ↓
CONTEXT: Đủ background để audience care (không nhiều hơn)
  ↓
CONFLICT: Vấn đề/challenge/obstacle cụ thể
  ↓
STRUGGLE: Quá trình đối mặt (chi tiết sensory, emotion)
  ↓
TURNING POINT: Khoảnh khắc thay đổi (cụ thể, không generic)
  ↓
RESOLUTION: Kết quả
  ↓
LESSON: Takeaway audience mang đi (1 câu)
  ↓
BRIDGE TO AUDIENCE: "Bạn thì sao?" / Áp dụng cho họ
```

### Bước 3 — Sensory Detail Layer
Biến abstract thành concrete:

| Abstract (yếu) | Sensory (mạnh) |
|----------------|-----------------|
| "Tôi rất lo lắng" | "Tay tôi run khi gõ từng chữ trong email đó" |
| "Công ty gặp khó khăn" | "Nhìn số dư tài khoản: 2.3 triệu — vừa đủ trả lương tháng này" |
| "Khách hàng rất hài lòng" | "Chị ấy gọi lại lúc 11h đêm chỉ để nói: Em ơi, cảm ơn em" |

Quy tắc: Mỗi story cần ít nhất 2 sensory details cụ thể.

### Bước 4 — Emotional Arc Design
Map cảm xúc audience qua từng section:

```
HOOK:       Curiosity ████████░░ 80%
CONTEXT:    Empathy   ██████░░░░ 60%
CONFLICT:   Tension   █████████░ 90%
STRUGGLE:   Anxiety   ████████░░ 80%
TURNING:    Surprise  █████████░ 90%
RESOLUTION: Relief    ████████░░ 80%
LESSON:     Inspired  █████████░ 90%
```

### Bước 5 — Platform Adaptation
Compress hoặc expand story theo platform:

**Micro-story (Tweet, Status):**
3 câu: Setup → Twist → Lesson

**Short-story (Caption, Reel script):**
Hook → 1 conflict → 1 turning point → Lesson

**Medium-story (Thread, Carousel):**
Full framework, 1 idea per tweet/slide

**Long-story (Blog, Video script):**
Full framework + sub-plots + multiple sensory details

## Output format (JSON)

```json
{
  "skill": "storytelling",
  "framework_used": "heros_journey | before_after_bridge | in_medias_res | unexpected | origin | customer | analogy | failure",
  "story_architecture": {
    "hook": "...",
    "context": "...",
    "conflict": "...",
    "struggle": "...",
    "turning_point": "...",
    "resolution": "...",
    "lesson": "...",
    "bridge_to_audience": "..."
  },
  "sensory_details": [
    "Detail 1 — [sense: visual/audio/tactile/emotional]",
    "Detail 2 — [sense]"
  ],
  "emotional_arc": {
    "opening_emotion": "...",
    "peak_tension": "...",
    "closing_emotion": "..."
  },
  "platform_version": {
    "platform": "...",
    "format": "...",
    "content": "Full written content ready to post/publish",
    "reel_script": {
      "scenes": [
        { "timestamp": "0-3s", "visual": "...", "voiceover": "...", "text_overlay": "...", "emotion": "..." }
      ],
      "music_mood": "...",
      "total_duration": "Xs"
    },
    "carousel_slides": [
      { "slide": 1, "headline": "...", "body": "...", "visual_direction": "..." }
    ],
    "thread_tweets": ["Tweet 1 (hook)", "Tweet 2 (context)", "..."]
  },
  "engagement_prediction": {
    "most_shareable_moment": "Phần nào của story sẽ trigger share",
    "comment_trigger": "Phần nào sẽ trigger comment",
    "save_worthy": true
  }
}
```

## Platform Adaptations

- **Twitter/X**: Micro-story trong 1 tweet hoặc thread 5-10 tweets. Tweet 1 = in medias res hook. Mỗi tweet = 1 beat trong story. Cliffhanger giữa tweets. Final tweet = lesson + "Retweet if this resonates."
- **Instagram**: Reels — story qua visual + voiceover, 30-60s, cinematic feel, text overlay cho key moments, trending audio nếu fit mood. Carousels — 1 story beat per slide, visual consistent, slide cuối = lesson + CTA. Stories — series 5-7 stories kể story real-time feel, dùng polls ("Bạn đoán chuyện gì xảy ra?"), question stickers.
- **Facebook**: Posts — longform story posts, 300-800 từ, paragraphs ngắn, personal tone, kết thúc bằng câu hỏi mở. Reels — emotional storytelling visual, 30-60s, text overlay lớn. Stories — behind-the-scenes feel, raw và authentic hơn Instagram.
- **LinkedIn**: Professional stories: career lessons, business failures, team moments. Open với unexpected moment, not chronological. End với industry-relevant lesson. 200-500 từ optimal. Vulnerable but professional.
- **YouTube**: Shorts — 60s story: hook 1s → compressed story → punchline. Long-form — full story arc với B-roll, multiple chapters, 5-15 phút.

## Quy tắc

1. **Show, don't tell** — "Tôi sợ" < "Tim tôi đập 140 nhịp khi nhấn nút Publish." Luôn dùng sensory details thay vì label emotions.
2. **1 story = 1 lesson** — Không nhét nhiều takeaways. 1 story mạnh + 1 lesson rõ > 1 story nhồi 5 lessons.
3. **Specificity creates universality** — Paradox: càng cụ thể về experience của bạn, càng nhiều người relate.
4. **Conflict is non-negotiable** — Không có conflict = không có story. "Mọi thứ đều tốt" không phải story.
5. **Honest > Perfect** — Story không cần happy ending. Failure stories thường engage hơn success stories.
6. **Audience là hero, không phải bạn** — Story của bạn chỉ là vehicle. Lesson phải applicable cho audience.
7. **Transition phải smooth** — Story → Lesson → CTA phải flow tự nhiên. Không "anyway, buy my product."
8. **Respect the story** — Không fabricate. Embellish details for clarity, but core truth must be real.