---
code: C3
name: shortform-writing
description: >
  Viết content ngắn tối ưu cho engagement và viral potential trên từng platform:
  tweet đơn, caption Instagram/Facebook, script Reels/Shorts, status LinkedIn,
  TikTok video. Dùng skill này bất cứ khi nào user muốn: viết tweet, viết caption,
  viết script reel, viết story, viết status, cần content ngắn gọn cho mạng xã hội,
  tối ưu engagement, tăng reach — kể cả khi user chỉ nói "viết caption cho ảnh này"
  hoặc "viết cái gì đó post Facebook" mà không specify format cụ thể.
---

## Mục đích

Tạo short-form content tối ưu cho từng platform: tweet đơn, caption Instagram/Facebook, script cho Reels/Shorts, status LinkedIn. Short-form là front door của brand — nơi audience gặp bạn lần đầu. Mỗi từ phải earn its place.

## Input cần có

```json
{
  "topic": "Chủ đề chính",
  "platform": "twitter | instagram | facebook | linkedin | youtube | tiktok",
  "content_type": "tweet | caption | reel_script | story | status | short_script",
  "target_audience": "Đối tượng mục tiêu (behavior-based)",
  "key_message": "1 điều duy nhất người đọc phải nhớ",
  "tone": "witty | educational | provocative | inspirational | casual | raw",
  "desired_action": "like | comment | share | save | click_link | follow",
  "context": "Trending topic, reply to something, part of series (optional)",
  "brand_voice": "Mô tả giọng văn brand (optional)"
}
```

> Nếu `platform` hoặc `content_type` không được cung cấp, infer từ `topic` + `target_audience`. Nếu `desired_action` thiếu, default về `comment` cho text content và `view` cho video content.

## Quy trình thực hiện

### Bước 1 — Platform constraint check
Mỗi platform có rules riêng:

| Platform | Format | Constraint |
|----------|--------|-----------|
| Twitter/X | Tweet | 280 chars. Mỗi từ đếm. |
| Instagram | Caption | 2200 chars max nhưng 125 chars trước "more". Reels: 15-90s. Stories: 15s/slide. |
| Facebook | Post | Không limit nhưng 40-80 chars optimal cho engagement. Reels: 15-90s. Stories: 20s/slide. |
| LinkedIn | Status | 3000 chars. 210 chars trước "see more". |
| YouTube | Shorts | 60s max. Hook trong 1s. |
| TikTok | Video | 15s-3min. Hook trong 1s. |

### Bước 2 — Chọn shortform framework

| Framework | Mô tả | Best for |
|-----------|--------|----------|
| Hot Take | Ý kiến mạnh, 1 câu | Tweet, LinkedIn status |
| Micro-Story | Câu chuyện trong 3 câu | Caption, tweet |
| Listicle | 3-5 bullet points | Caption, LinkedIn |
| Question | Câu hỏi trigger suy nghĩ | Mọi platform |
| Observation | Nhận xét sắc bén về reality | Tweet, LinkedIn |
| Tip/Hack | 1 actionable advice | Reel script, caption |
| Contrast | Before/After hoặc Do/Don't | Carousel slide, reel |
| Quote + Commentary | Quote hay + góc nhìn riêng | Mọi platform |

### Bước 3 — Viết 5 biến thể
- Mỗi biến thể dùng framework khác nhau
- Tối ưu cho desired_action (comment bait ≠ share bait ≠ save bait)
- Check character limits

### Bước 4 — Engagement optimization

**Cho comment engagement:**
- Kết thúc bằng câu hỏi mở
- Tạo "agree or disagree" tension
- Dùng fill-in-the-blank

**Cho share/retweet:**
- Content phải reflect identity của sharer
- "I feel seen" effect
- Universally relatable truth

**Cho save:**
- Practical value, reference-worthy
- Framework, checklist, template
- "I'll need this later" feeling

**Cho reel/short views:**
- Hook trong 1 giây
- Pattern interrupt visual
- Loop-friendly ending

### Bước 5 — Reel/Short Script (nếu applicable)

```
[HOOK — 0-1.5s]
Visual: [mô tả]
Text overlay: [text]
Audio: [voiceover/music]

[BODY — 1.5-45s]
Visual: [mô tả từng cảnh]
Text overlay: [key points]
Audio: [voiceover script]

[CTA/LOOP — 45-60s]
Visual: [mô tả]
Text overlay: [CTA text]
Audio: [closing line — ideally loops back to hook]
```

## Output format (JSON)

```json
{
  "skill": "shortform-writing",
  "platform": "...",
  "content_type": "...",
  "variations": [
    {
      "version": 1,
      "framework": "hot_take | micro_story | listicle | question | observation | tip | contrast | quote_commentary",
      "content": "Nội dung chính",
      "character_count": 0,
      "engagement_target": "comment | share | save | view",
      "engagement_hook": "Yếu tố cụ thể trigger engagement"
    },
    {
      "version": 2,
      "framework": "...",
      "content": "...",
      "character_count": 0,
      "engagement_target": "...",
      "engagement_hook": "..."
    },
    {
      "version": 3,
      "framework": "...",
      "content": "...",
      "character_count": 0,
      "engagement_target": "...",
      "engagement_hook": "..."
    }
  ],
  "reel_script": {
    "hook": { "duration": "0-1.5s", "visual": "...", "text_overlay": "...", "audio": "..." },
    "body": [
      { "timestamp": "1.5-15s", "visual": "...", "text_overlay": "...", "audio": "..." },
      { "timestamp": "15-40s", "visual": "...", "text_overlay": "...", "audio": "..." }
    ],
    "cta_loop": { "duration": "40-60s", "visual": "...", "text_overlay": "...", "audio": "..." },
    "total_duration": "Xs",
    "music_suggestion": "..."
  },
  "hashtags": ["#tag1", "#tag2"],
  "posting_suggestion": {
    "best_time": "Khung giờ suggested",
    "pair_with": "Content type khác nên post cùng (story, poll, etc.)"
  }
}
```

## Platform Adaptations

- **Twitter/X**: Tối đa 280 chars. Không hashtag (hoặc tối đa 1). Không emoji spam. Tweet standalone phải viral-worthy. Reply-to-self cho context nếu cần. Optimize cho quote-retweet.
- **Instagram**: Caption — 125 chars đầu là hook (trước "more"), phần còn lại expand value. Reels — 15-30s optimal, hook visual trong 1s, text overlay large + readable, trending audio boost reach. Carousels — slide đầu là hook. Stories — poll, question sticker, slider để tăng engagement.
- **Facebook**: Posts — 40-80 chars cho highest engagement, hoặc 500+ cho deep engagement. Reels — tương tự Instagram nhưng audience rộng hơn, hook phải universal hơn. Stories — text-based works well, question stickers drive replies.
- **LinkedIn**: 210 chars trước "see more" — phải compelling. Line breaks tạo visual space. Professional nhưng không boring. Avoid hashtag spam (3-5 max). Carousel documents (PDF) perform well.
- **YouTube**: Shorts — 60s max, hook 1s, vertical video. Title ngắn, keyword-rich. Thumbnail text nếu applicable. End screen không có cho Shorts — dùng verbal CTA.

## Quy tắc

1. **1 idea per piece** — Short-form không có chỗ cho 2 ideas. Chọn 1, nói rõ, dừng.
2. **Cut ruthlessly** — Viết xong, xóa 30%. Nếu vẫn clear → bản gốc có filler.
3. **Platform-native language** — Viết cho platform đang dùng, không viết "nội dung" rồi paste khắp nơi.
4. **No engagement bait rõ ràng** — "Tag 3 người bạn" không work nữa. Engagement phải organic từ content value.
5. **Test formats** — Cùng 1 idea, thử tweet vs reel vs carousel. Data cho biết format nào audience prefer.
6. **Timing matters** — Short-form content có half-life ngắn. Post vào giờ audience active.
7. **Reel/Short hook rule** — Nếu không capture trong 1.5 giây, mất viewer. Hook visual + audio phải đồng thời.
8. **Caption ≠ Repetition** — Caption Instagram/Facebook bổ sung cho visual, không lặp lại nội dung trên slide/reel.