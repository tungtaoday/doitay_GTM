---
name: C5_visual_content
name: visual-content
description: >
  Tạo visual direction cho content trên mọi platform: image prompts cho AI generation,
  carousel layout, video storyboard, reel shot list. Dùng skill này bất cứ khi nào
  user muốn: tạo visual cho post, thiết kế carousel, storyboard cho reel/video,
  viết prompt cho AI image, chọn màu sắc và style cho content, cần hướng dẫn visual
  cụ thể để pair với text — kể cả khi user chỉ nói "tạo ảnh cho bài này" hoặc
  "thiết kế carousel về X" mà không dùng từ "visual direction".
---

## Mục đích

Tạo visual direction để pair với text content trên từng platform. Visual quyết định 3 giây đầu — trước khi user đọc một chữ. Skill này output: image prompts cho AI generation, carousel layouts, video storyboards, shot lists cho reels, và platform-specific visual specs.

## Input cần có

```json
{
  "content_summary": "Tóm tắt text content cần pair visual",
  "platform": "instagram | facebook | twitter | linkedin | youtube | tiktok",
  "format": "image | carousel | reel | story | video | shorts",
  "brand_voice": "Mô tả brand aesthetic (optional)",
  "color_palette": ["#hex1", "#hex2"],
  "style": "minimal | bold | data_viz | behind_scenes | tutorial | cinematic | flat",
  "target_audience": "Đối tượng mục tiêu (behavior-based)",
  "reference_mood": "Mô tả mood/feel mong muốn (optional)"
}
```

> Nếu `color_palette` không có, suggest palette phù hợp với `brand_voice` + `style`. Nếu `style` không có, infer từ `platform` + `target_audience`.

## Platform Visual Specs

| Platform | Format | Ratio | Constraint |
|----------|--------|-------|-----------|
| Instagram | Feed post | 1:1 hoặc 4:5 | High quality, aesthetic consistent |
| Instagram | Reels | 9:16 | Hook visual trong 1s đầu, 15-60s |
| Instagram | Carousel | 1:1 hoặc 4:5 | 5-10 slides, consistent style xuyên suốt |
| Instagram | Stories | 9:16 | Casual, behind-the-scenes feel |
| Facebook | Post image | 1200×630px | Eye-catching, text overlay rõ |
| Facebook | Reels | 9:16 | Similar Instagram, hook universal hơn |
| Facebook | Story | 9:16 | Casual, text-heavy works |
| Facebook | Video | 16:9 hoặc 1:1 | Subtitles bắt buộc |
| Twitter/X | Image | 16:9 (1200×675px) | Bold text overlay, high contrast |
| Twitter/X | Thread visual | 16:9 | Consistent style across all images |
| LinkedIn | Post | 1200×627px | Clean, professional, data-viz friendly |
| YouTube | Shorts | 9:16 | Text overlays lớn, fast cuts |
| YouTube | Thumbnail | 1280×720px | Bold text, high contrast, face if possible |
| TikTok | Video | 9:16 | Hook frame 0-1s, text overlay large |

## Quy trình thực hiện

### Bước 1 — Visual Strategy
- Xác định focal point duy nhất: 1 visual = 1 điều muốn mắt nhìn vào đầu tiên
- Map visual với emotional arc của text content
- Chọn style phù hợp brand voice + platform culture

### Bước 2 — Image Direction

Tạo image prompt cho AI generation (Midjourney, DALL-E, Firefly,Gemini):

```
[Subject] + [Action/State] + [Environment] + [Lighting] + [Style] + [Mood] + [Technical specs]
```

Ví dụ tốt:
> "Vietnamese woman in her 30s, sitting at a laptop in a minimalist Hanoi café, warm afternoon light through window, shallow depth of field, candid feel, color palette earth tones, shot on 35mm"

Ví dụ yếu:
> "beautiful woman working on laptop"

### Bước 3 — Carousel Layout (nếu applicable)

```
Slide 1 (Hook):   Bold headline + minimal visual — stop the scroll
Slide 2-N (Body): 1 idea per slide, consistent header position
                  Text: max 20-30 từ per slide
                  Visual: supports text, không compete
Slide cuối (CTA): Clear action + brand element
```

Design constraints:
- Font size: tối thiểu 24px trên slide 1:1
- Contrast ratio: text/background ≥ 4.5:1 (WCAG AA)
- Safe zone: giữ content trong 85% frame (tránh bị crop)

### Bước 4 — Video/Reel Storyboard (nếu applicable)

```
[FRAME 1 — 0-1s: Hook frame]
Shot type: [close-up | wide | overhead | POV]
Subject: [mô tả]
Text overlay: [text nếu có]
Motion: [static | pan | zoom | cut]

[FRAME 2-N — Body frames]
Shot type: ...
Subject: ...
Text overlay: ...
Transition: [cut | dissolve | match cut | jump cut]

[FINAL FRAME — CTA]
Visual: ...
Text overlay: ...
```

### Bước 5 — Quality check
- [ ] Focal point rõ ràng không?
- [ ] Text overlay readable trên mobile (< 6 inch screen)?
- [ ] Style consistent xuyên suốt carousel/series?
- [ ] Visual match tone của text content?
- [ ] Brand elements present nhưng không overwhelm?

## Output format (JSON)

```json
{
  "skill": "visual-content",
  "platform": "...",
  "format": "image | carousel | reel | story | video",
  "visual_strategy": {
    "focal_point": "...",
    "emotional_tone": "...",
    "style_chosen": "minimal | bold | data_viz | behind_scenes | tutorial | cinematic | flat"
  },
  "specs": {
    "aspect_ratio": "...",
    "dimensions": "...",
    "duration": "Xs (nếu video)"
  },
  "color_palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "image_direction": {
    "image_prompt": "Full AI generation prompt",
    "text_overlay": "...",
    "font_style": "...",
    "brand_elements": []
  },
  "carousel_slides": [
    {
      "slide_number": 1,
      "type": "hook | body | cta",
      "headline": "...",
      "body_text": "...",
      "visual_description": "...",
      "text_position": "top | center | bottom",
      "image_prompt": "..."
    }
  ],
  "storyboard": [
    {
      "frame": 1,
      "timestamp": "0-1s",
      "shot_type": "close_up | wide | overhead | pov",
      "subject": "...",
      "text_overlay": "...",
      "motion": "static | pan | zoom | cut",
      "transition_to_next": "cut | dissolve | match_cut"
    }
  ],
  "music_direction": {
    "mood": "...",
    "tempo": "slow | medium | fast | trending",
    "suggested_style": "..."
  },
  "reference_mood": "..."
}
```

## Quy tắc

1. **1 focal point per visual** — Mắt người nhìn không biết nhìn vào đâu = visual thất bại.
2. **Mobile-first** — 80%+ audience xem trên điện thoại. Nếu không readable trên 6-inch screen → redesign.
3. **Text overlay phải standalone** — Nhiều user xem video không có âm thanh. Text overlay phải đủ để hiểu nếu không có audio.
4. **Carousel: swipe reward** — Mỗi slide phải có value mới để justify swipe. Nếu slide N+1 không add gì → xóa.
5. **Consistency > Variety** — Brand nhận diện qua sự nhất quán. Palette và font phải same xuyên suốt series.
6. **Hook frame là quan trọng nhất** — Video: frame 0-1s quyết định watch time. Image: thumbnail quyết định click. Invest time nhất vào đây.
7. **Visual complement, không compete** — Visual support text message, không kể câu chuyện khác song song.
8. **AI prompt specificity** — Prompt càng cụ thể → output càng gần ý. Include: subject, environment, lighting, style, mood, technical specs.