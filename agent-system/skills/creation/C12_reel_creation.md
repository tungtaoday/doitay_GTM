---
code: C12
name: reel-creation
description: >
  Tao script va storyboard cho Facebook/Instagram Reels, TikTok, YouTube Shorts.
  Tao reel 15-20 giay, format dung 9:16. Bao gom voiceover script tieng Viet,
  text overlay, visual direction tung frame (de generate anh AI lam background).
type: reasoning
---

## Muc dich

Tao reel script hoan chinh de tu dong generate video bang moviepy + edge-tts. Output phai du chi tiet de tool video generation co the render ma khong can them input.

## Input can co

```json
{
  "topic": "Chu de reel (vd: 3 sai lam khi lap dieu hoa)",
  "angle": "Cai Uy / Si Dien / Co Hoi",
  "platform": "facebook | instagram | tiktok | youtube_shorts",
  "duration_seconds": 18,
  "style": "educational | storytelling | before_after | tips | problem_solution | testimonial | listicle",
  "brand_context": "Thong tin thuong hieu (optional)",
  "target_audience": "Doi tuong muc tieu"
}
```

## Best Practice 2025-2026: Reel 15-20 giay, 5-7 frames

Nghien cuu cho thay: reel 15-20 giay co **completion rate cao nhat** tren Facebook/IG/TikTok.
- Duoi 10s: qua ngan, khong du thoi gian truyen tai gia tri → low save/share
- 15-20s: sweet spot — du dai de ke chuyen, du ngan de giu retention
- Tren 30s: drop-off tang manh, chi dung cho storytelling sau

### Cau truc 5-7 frames (18s)

| Phase | Frame | Thoi gian | Muc dich | Best Practice |
|-------|-------|-----------|----------|---------------|
| HOOK | 1 | 0-2s | Gay soc / to mo | Text LON, bold. Pattern interrupt. 80% nguoi quyet dinh o day |
| PROBLEM | 2 | 2-5s | Neu van de / pain | Visual cu the, empathy. Nguoi xem phai nghi "dung la minh" |
| BRIDGE | 3 | 5-8s | Chuyen tiep | Tao ky vong: "Nhung chi can 1 buoc..." |
| SOLUTION | 4-5 | 8-14s | Giai phap / gia tri chinh | 2 frames chi tiet. Day la phan viewer SAVE/SHARE |
| PROOF | 6 | 14-16s | Bang chung / so lieu | So cu the: "105 tho da lam", "tang 40% kheo" |
| CTA | 7 | 16-18s | Hanh dong | CTA ro rang + urgency. Logo/brand |

## Reel Frameworks (18s)

### 1. Educational Listicle (phổ biến nhất, save rate cao)
- Frame 1 (0-2s): Hook số — "3 SAI LẦM khi lắp điều hòa"
- Frame 2 (2-5s): Sai lầm 1 + hậu quả
- Frame 3 (5-8s): Sai lầm 2 + hậu quả
- Frame 4 (8-11s): Sai lầm 3 + hậu quả
- Frame 5 (11-14s): Cách làm đúng (giải pháp)
- Frame 6 (14-16s): Kết quả cụ thể (số liệu)
- Frame 7 (16-18s): CTA + brand

### 2. Problem → Solution (engagement cao)
- Frame 1 (0-2s): Hook pain phrase — "Điều hòa chạy mà không mát?"
- Frame 2 (2-5s): Mô tả vấn đề cụ thể
- Frame 3 (5-8s): Nguyên nhân (insight)
- Frame 4 (8-12s): Giải pháp step-by-step
- Frame 5 (12-15s): Kết quả before/after
- Frame 6 (15-18s): CTA

### 3. Before/After Transformation (share rate cao)
- Frame 1 (0-2s): Hook — "Trước vs Sau khi có Doitay"
- Frame 2 (2-5s): TRƯỚC — tình trạng cũ (xấu, khó khăn)
- Frame 3 (5-8s): Quá trình chuyển đổi
- Frame 4 (8-12s): SAU — kết quả mới (đẹp, thành công)
- Frame 5 (12-15s): Số liệu chứng minh
- Frame 6 (15-18s): CTA

### 4. Storytelling Mini (retention rate cao nhất)
- Frame 1 (0-2s): Hook câu chuyện — "Anh Hùng thợ điện, 3 tháng trước..."
- Frame 2 (2-5s): Bối cảnh + vấn đề nhân vật gặp
- Frame 3 (5-8s): Bước ngoặt / quyết định
- Frame 4 (8-12s): Hành động + quá trình
- Frame 5 (12-15s): Kết quả thành công
- Frame 6 (15-17s): Bài học rút ra
- Frame 7 (17-18s): CTA

### 5. Tips & Tricks (save rate rất cao)
- Frame 1 (0-2s): Hook — "Mẹo PRO mà 90% thợ không biết"
- Frame 2 (2-5s): Tip 1 + visual minh họa
- Frame 3 (5-8s): Tip 2 + visual minh họa
- Frame 4 (8-11s): Tip 3 + visual minh họa
- Frame 5 (11-14s): Bonus tip / pro level
- Frame 6 (14-16s): Tổng kết nhanh
- Frame 7 (16-18s): CTA — "Save lại để dùng"

### 6. Testimonial / Social Proof
- Frame 1 (0-2s): Hook — quote ấn tượng từ khách/thợ
- Frame 2 (2-5s): Giới thiệu nhân vật + bối cảnh
- Frame 3 (5-9s): Vấn đề họ gặp trước đó
- Frame 4 (9-13s): Giải pháp + trải nghiệm
- Frame 5 (13-16s): Kết quả cụ thể (số liệu)
- Frame 6 (16-18s): CTA

## Quy tắc viết reel script

1. **Hook 2 giây đầu** quyết định 80% — PHẢI gây tò mò, shock, hoặc pattern interrupt
2. **5-7 FRAMES**, tổng **15-20 giây** (target 18s)
3. Mỗi frame PHẢI có: text_overlay, voiceover_text, **visual_direction** (mô tả cụ thể cảnh/hình ảnh)
4. **visual_direction** phải mô tả cảnh cụ thể:
   - TỐT: "Thợ điện đang lắp điều hòa trong phòng khách hiện đại, ánh sáng tự nhiên"
   - TỐT: "Close-up bàn tay cầm remote điều hòa hiển thị 26°C, background phòng ngủ"
   - XẤU: "Dark background, bold text" (không phải hình ảnh)
5. Voiceover tiếng Việt tự nhiên, mỗi frame 1-2 câu ngắn (2-4 giây nói)
6. Text overlay NGẮN GỌN — tối đa 2 dòng, dùng keyword chính, font lớn
7. CTA frame cuối rõ ràng: inbox / gọi điện / đăng ký / xem thêm
8. **Pacing**: nhanh ở đầu (hook), chậm lại ở giữa (giải pháp), nhanh ở cuối (CTA)
9. **Mỗi reel chỉ 1 thông điệp chính** — KHÔNG nhồi nhét
10. Luôn có số liệu cụ thể (tiết kiệm 30% điện, bền hơn 5 năm, 105 thợ đã dùng...)

## Output format

```json
{
  "items": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "angle": "Cái Uy",
      "platform": "facebook",
      "content_type": "reel",
      "hook": "Text overlay frame đầu tiên (cho preview)",
      "body": "Tóm tắt nội dung reel 2-3 câu",
      "cta": "Call to action cuối reel",
      "hashtags": ["#DoitayVN", "#ThoGioi", "#MeoHay"],
      "image_prompt": "Visual style chung cho reel thumbnail",
      "reel_script": {
        "title": "Tên reel ngắn gọn",
        "duration_seconds": 18,
        "style": "educational",
        "music_mood": "upbeat",
        "frames": [
          {
            "frame_number": 1,
            "start_time": 0,
            "end_time": 2,
            "text_overlay": "3 SAI LẦM\nLẮP ĐIỀU HÒA",
            "text_position": "center",
            "text_size": "large",
            "voiceover_text": "Ba sai lầm khi lắp điều hòa mà ai cũng mắc phải",
            "visual_direction": "Thợ điện đang đứng trước điều hòa treo tường trong phòng khách, nhìn bối rối, ánh sáng tự nhiên từ cửa sổ",
            "background_color": "#1a1a2e"
          },
          {
            "frame_number": 2,
            "start_time": 2,
            "end_time": 5,
            "text_overlay": "Sai lầm 1:\nĐặt quá thấp",
            "text_position": "center",
            "text_size": "medium",
            "voiceover_text": "Sai lầm số một: đặt cục lạnh quá thấp, gió không tỏa đều phòng",
            "visual_direction": "Cận cảnh cục lạnh điều hòa được lắp ở vị trí thấp gần sàn, phòng ngủ Việt Nam điển hình",
            "background_color": "#16213e"
          },
          {
            "frame_number": 3,
            "start_time": 5,
            "end_time": 8,
            "text_overlay": "Sai lầm 2:\nỐng đồng quá dài",
            "text_position": "center",
            "text_size": "medium",
            "voiceover_text": "Sai lầm thứ hai: kéo ống đồng quá dài, máy phải chạy gấp đôi công suất",
            "visual_direction": "Ống đồng điều hòa chạy ngoằn ngoèo dọc tường ngoài trời, nhà phố Việt Nam",
            "background_color": "#2d1b69"
          },
          {
            "frame_number": 4,
            "start_time": 8,
            "end_time": 11,
            "text_overlay": "Sai lầm 3:\nKhông vệ sinh",
            "text_position": "center",
            "text_size": "medium",
            "voiceover_text": "Sai lầm ba: không vệ sinh định kỳ, vi khuẩn tích tụ gây bệnh hô hấp",
            "visual_direction": "Cận cảnh lưới lọc điều hòa đầy bụi bẩn, bên cạnh là lưới lọc sạch trắng để so sánh",
            "background_color": "#0f3d3e"
          },
          {
            "frame_number": 5,
            "start_time": 11,
            "end_time": 14,
            "text_overlay": "Cách làm ĐÚNG\n→ Tiết kiệm 30%",
            "text_position": "center",
            "text_size": "medium",
            "voiceover_text": "Lắp đúng cách, vệ sinh đều, tiết kiệm đến ba mươi phần trăm tiền điện",
            "visual_direction": "Phòng khách hiện đại, điều hòa lắp đúng vị trí cao, gia đình Việt Nam đang ngồi thoải mái, ánh sáng ấm",
            "background_color": "#16213e"
          },
          {
            "frame_number": 6,
            "start_time": 14,
            "end_time": 16,
            "text_overlay": "105 thợ đã làm đúng\nTrên Doitay.vn",
            "text_position": "center",
            "text_size": "medium",
            "voiceover_text": "Hơn một trăm thợ trên Doitay chấm VN đã áp dụng và nhận thêm kèo mỗi tuần",
            "visual_direction": "Montage nhiều thợ điện lạnh đang làm việc chuyên nghiệp, đồng phục gọn gàng, nhà khách hài lòng",
            "background_color": "#1a1a2e"
          },
          {
            "frame_number": 7,
            "start_time": 16,
            "end_time": 18,
            "text_overlay": "ĐĂNG KÝ NGAY\nDoitay.vn",
            "text_position": "center",
            "text_size": "large",
            "voiceover_text": "Đăng ký Doitay chấm VN ngay hôm nay để nhận kèo liên tục",
            "visual_direction": "Logo Doitay.vn trên nền gradient xanh đậm chuyên nghiệp, có icon điện thoại và mũi tên hướng lên",
            "background_color": "#0f3d3e"
          }
        ]
      }
    }
  ]
}
```

## Lưu ý quan trọng

- Reel cho thợ/dịch vụ: dùng ngôn ngữ đời thường, tránh thuật ngữ phức tạp
- Luôn có số liệu cụ thể (tiết kiệm 30% điện, bền hơn 5 năm...)
- Mỗi reel chỉ 1 thông điệp chính — KHÔNG nhồi nhét
- Hook phải tạo FOMO hoặc curiosity gap
- **visual_direction PHẢI mô tả CẢNH/HÌNH ẢNH cụ thể** — đây là prompt để AI generate ảnh background. Mỗi frame nên có visual khác nhau để tạo chuyển động
- Tổng thời gian = 15-20 giây (target 18s), 5-7 frames
- **Pacing quan trọng**: Frame hook ngắn (2s), frame content vừa (3s), frame CTA ngắn (2s)
- Nếu reel style là "storytelling" → có thể kéo dài 20s với 7 frames
- Nếu reel style là "tips" hoặc "listicle" → 18s với 5-6 frames là tối ưu
