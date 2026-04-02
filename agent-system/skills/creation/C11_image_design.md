---
code: C11
name: image-design
description: >
  Thiết kế visual direction và viết image prompt tối ưu cho AI image generation
  (Midjourney, DALL-E, Firefly, Stable Diffusion). Chọn style, mood, composition,
  color palette phù hợp với từng content angle và platform. Dùng skill này bất cứ
  khi nào user muốn: tạo ảnh cho post, viết prompt AI image, chọn visual style,
  thiết kế mood board, cần ảnh minh họa cho content — kể cả khi user chỉ nói
  "tạo ảnh cho bài này" hoặc "viết prompt Midjourney về X" mà không specify rõ.
---

## Mục đích

Nhận content (hook + body + angle) → output image prompt tối ưu cho AI image generator. Mỗi ảnh phải stop scroll trong 1.5 giây đầu — trước khi user đọc một chữ.

## Input cần có

```json
{
  "content_summary": "Hook + body của bài đăng cần pair ảnh",
  "platform": "facebook | instagram | linkedin | twitter | youtube | tiktok | zalo | blog",
  "format": "feed | reel | story | thumbnail | banner",
  "brand_context": {
    "industry": "Ngành nghề / lĩnh vực của brand",
    "tone": "Mô tả brand tone (ví dụ: ấm áp, chuyên nghiệp, năng động)",
    "avoid": "Những gì KHÔNG muốn xuất hiện trong ảnh",
    "subject_focus": "Chủ thể chính thường xuyên xuất hiện (người, sản phẩm, địa điểm)"
  },
  "content_angle": "Emotion muốn trigger: trust | aspiration | urgency | curiosity | relatability",
  "style_preference": "photography | illustration | graphic | editorial | documentary (optional)",
  "color_palette": ["#hex1", "#hex2"],
  "reference_mood": "Mô tả mood mong muốn bằng lời (optional)"
}
```

> Nếu `style_preference` không có, infer từ `content_angle` + `platform`. Nếu `color_palette` không có, suggest palette phù hợp với `brand_context.tone`.

## Quy trình thiết kế

### Bước 1 — Phân tích content và angle

Đọc `content_summary` → xác định:
- **Chủ đề chính** và **cảm xúc mục tiêu**
- **Content angle** → mỗi angle có visual language riêng (xem bảng dưới)
- **Subject cụ thể** — không dùng subject generic ("person", "worker"), luôn describe hành động và context cụ thể

### Bước 2 — Chọn Visual Direction theo Content Angle

| Content Angle | Mục tiêu cảm xúc | Mood | Color Direction | Composition |
|--------------|-----------------|------|-----------------|-------------|
| **Trust** | Tin tưởng, an tâm | Ấm áp, trang trọng, tôn trọng | Warm neutrals, deep blue, earth tones | Hero shot, golden hour, shallow depth of field |
| **Aspiration** | Khao khát, hướng tới | Hiện đại, clean, elevated | Clean white, teal, navy, muted luxury | Centered, studio-feel, negative space |
| **Urgency** | FOMO, cơ hội không đợi | Năng động, exciting | Orange, bright accent, high contrast | Dynamic angle, split screen, bold diagonal |
| **Curiosity** | Tò mò, muốn biết thêm | Mysterious, intriguing | Dark mood, single accent color | Unusual angle, partial reveal, bokeh |
| **Relatability** | "Đây là tôi", đồng cảm | Raw, authentic, real | Natural, unsaturated, documentary | Candid, imperfect, environmental |

### Bước 3 — Chọn Visual Style

| Style | Mô tả | Dùng khi |
|-------|--------|----------|
| **Photography-realistic** | Ảnh thực, ánh sáng tự nhiên | Storytelling, case study, Trust angle |
| **Warm editorial** | Editorial, màu ấm, cinematic | Brand story, Aspiration angle |
| **Bold graphic** | Typography mạnh, contrast cao | CTA, Urgency angle |
| **Flat illustration** | Vector art, clean, modern | Tips, infographic, educational |
| **Documentary** | Raw, chân thực, candid | Behind-the-scenes, Relatability angle |

### Bước 4 — Viết Image Prompt

Cấu trúc prompt tối ưu:

```
[Subject cụ thể + hành động cụ thể],
[bối cảnh / location chi tiết],
[lighting và mood],
[style nghệ thuật],
[camera angle + depth of field],
[color palette direction],
--no text, no watermark, no logo, no stock photo feel
```

**Prompt tốt:**
> "Vietnamese woman in her 30s reviewing documents at a minimalist wooden desk, warm afternoon light through a window, shallow depth of field, warm editorial style, shot from slightly above, earth tones and warm white"

**Prompt yếu:**
> "businesswoman working at desk"

Nguyên tắc: càng cụ thể → output càng gần ý. Luôn include subject, environment, lighting, style, angle.

### Bước 5 — Platform Adaptation

| Platform | Format | Ratio | Kích thước | Lưu ý |
|----------|--------|-------|-----------|-------|
| Facebook | Post | 16:9 | 1200×630px | Eye-catching, text area ở giữa |
| Facebook | Reel | 9:16 | 1080×1920px | Hook visual trong 0.5s đầu |
| Facebook | Story | 9:16 | 1080×1920px | Casual, text-heavy works |
| Instagram | Feed | 1:1 hoặc 4:5 | 1080×1080 / 1080×1350 | High quality, cohesive grid |
| Instagram | Story | 9:16 | 1080×1920px | Interactive elements area: bottom 20% |
| Instagram | Reel cover | 9:16 | 1080×1920px | First frame = thumbnail |
| LinkedIn | Post | 1.91:1 | 1200×627px | Professional, data-viz friendly |
| Twitter/X | Image | 16:9 | 1200×675px | Bold, high contrast |
| YouTube | Thumbnail | 16:9 | 1280×720px | Bold text, face if possible |
| YouTube | Shorts | 9:16 | 1080×1920px | Text overlay lớn, fast cuts |
| Zalo | Post | 16:9 | 1200×630px | Clear message, simple |
| Blog | Hero | 16:9 | 1200×630px | Sets article tone |

### Bước 6 — Quality Check

- [ ] 1 focal point duy nhất — mắt biết nhìn vào đâu ngay lập tức?
- [ ] Readable trên 6-inch mobile screen?
- [ ] Subject đủ cụ thể để AI generate đúng?
- [ ] Visual match content angle (không contrast với message)?
- [ ] Không có stock photo feel (cười gượng, bắt tay generic)?
- [ ] Color palette consistent với brand?

## Output format (JSON)

```json
{
  "skill": "image-design",
  "platform": "...",
  "format": "feed | reel | story | thumbnail | banner",
  "visual_direction": {
    "content_angle": "trust | aspiration | urgency | curiosity | relatability",
    "style": "photography | warm_editorial | bold_graphic | flat_illustration | documentary",
    "mood": "2-3 từ mô tả mood",
    "focal_point": "Mô tả điểm nhìn chính"
  },
  "specs": {
    "aspect_ratio": "...",
    "dimensions": "...",
    "safe_zone": "Giữ content chính trong 85% frame"
  },
  "color_palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "rationale": "Lý do chọn palette này"
  },
  "image_prompt": {
    "full_prompt": "Full prompt cho AI image generator",
    "negative_prompt": "no text, no watermark, no logo, no stock photo feel, no artificial smile",
    "ai_tool_notes": "Gợi ý nếu dùng tool cụ thể (Midjourney style suffix, DALL-E notes...)"
  },
  "composition_notes": "Ghi chú bố cục, camera angle, depth of field",
  "angle_alignment": "Giải thích visual này support content angle như thế nào",
  "variations": [
    {
      "variation": "A",
      "description": "Biến thể để A/B test",
      "key_difference": "Điểm khác so với main prompt",
      "prompt": "..."
    }
  ]
}
```

## Quy tắc

1. **Subject cụ thể, không generic** — "thợ điện đang đấu nối bảng điện tại căn hộ Hà Nội" > "electrician working". Luôn describe hành động + bối cảnh.
2. **Tránh stock photo feel** — Không người cầm laptop cười, không bắt tay business, không team meeting generic. Visual phải feel real và specific.
3. **1 focal point** — Mắt người nhìn không biết nhìn vào đâu = visual thất bại. 1 hero subject, background support.
4. **No text in image prompt** — Text overlay thêm sau bằng design tool (Canva, Figma). Prompt chỉ cho visual element.
5. **Context beats beauty** — Ảnh đẹp mà không relate đến content = waste. Ảnh phải reinforce message, không decorate nó.
6. **Mobile-first** — 80%+ audience xem trên điện thoại. Test ở thumbnail size (150×150px) — focal point vẫn phải recognizable.
7. **Consistent brand feel** — Dù style khác nhau theo format, palette và subject direction phải cảm thấy cùng 1 thương hiệu.
8. **Luôn output 2 variations** — Main prompt + 1 A/B test variation với key difference rõ ràng. Data quyết định, không phải taste.