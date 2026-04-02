---
code: G11
name: Social Group Posting
type: api
category: growth
description: Chọn lựa và đăng bài lên Facebook Groups, Zalo cá nhân, và Zalo Groups thông qua Claude Computer Use hoặc Claude Chrome Extension.
tools_required:
  - computer
  - browser
output_format: json
---

## Mục đích

Quản lý việc đăng bài lên các Facebook Groups và Zalo (cá nhân + groups) mà API không hỗ trợ trực tiếp. Sử dụng Claude Computer Use hoặc Claude Chrome Extension để thao tác trực tiếp trên trình duyệt, mô phỏng hành vi người dùng thực.

## Input cần có

```yaml
content:
  id: "[content ID từ content queue]"
  body: "[nội dung bài đăng]"
  images: ["[url hình ảnh nếu có]"]
  cta: "[call to action]"
  hashtags: ["#tag1", "#tag2"]
  content_type: "[educational / promotional / entertainment / community]"

targets:
  facebook_groups:
    - group_id: "[FB group ID hoặc URL]"
      group_name: "[tên group]"
      category: "[relevant / high_engagement / niche]"
      posting_rules: "[quy tắc đăng bài của group nếu có]"
      priority: 1
  zalo_personal:
    enabled: true
    message: "[text cho Zalo cá nhân - có thể khác FB]"
  zalo_groups:
    - group_name: "[tên group Zalo]"
      member_count: "[số thành viên]"
      category: "[relevant / niche]"
      priority: 1

posting_config:
  delay_between_posts_minutes: 5
  max_posts_per_session: 10
  randomize_order: true
  adapt_content_per_group: true
  browser_tool: "computer_use | chrome_extension"
```

## Quy trình thực hiện

### Bước 1 — Content Adaptation

Với mỗi target group, adapt content cho phù hợp:

```
FACEBOOK GROUP ADAPTATION:
  - Đọc quy tắc group (pinned post, about section)
  - Adjust tone: formal group → formal, casual group → casual
  - Thêm/bỏ hashtags theo culture của group
  - Thêm context phù hợp với chủ đề group
  - KHÔNG copy-paste y nguyên giữa các group (bị đánh spam)

ZALO ADAPTATION:
  - Ngắn gọn hơn Facebook (Zalo culture = nhanh, trực tiếp)
  - Dùng emoji phù hợp
  - Personal message style cho Zalo cá nhân
  - Group Zalo thường casual hơn Facebook Group
```

### Bước 2 — Group Selection & Prioritization

```
SELECTION CRITERIA:
  1. Relevance Score (0-10): Group topic khớp với content theme?
  2. Engagement Level: Group có active không? (posts/ngày, comments trung bình)
  3. Member Overlap: Tránh đăng nhiều group có cùng members
  4. Posting Rules: Group cho phép loại content này không?
  5. Time Since Last Post: Đã đăng group này bao lâu rồi? (min 24h gap)

PRIORITY ORDER:
  P1: High relevance + high engagement + cho phép posting
  P2: Medium relevance + decent engagement
  P3: Low relevance nhưng large audience
  SKIP: Group cấm promotional / đã post < 24h trước
```

### Bước 3 — Posting via Computer Use / Chrome Extension

**Flow cho Facebook Groups:**

```
1. Mở trình duyệt → Facebook đã login
2. Navigate đến group URL
3. Click vào ô "Write something..." / "Viết gì đó..."
4. Paste adapted content
5. Attach images nếu có (click photo icon → upload)
6. Review nội dung trước khi submit
7. Click "Post" / "Đăng"
8. Verify post appeared successfully
9. Copy post URL để lưu database
10. Chờ delay_between_posts_minutes trước khi post tiếp
```

**Flow cho Zalo cá nhân:**

```
1. Mở Zalo Web (chat.zalo.me) hoặc Zalo PC
2. Click vào "Nhật ký" / Timeline
3. Viết status mới
4. Paste content + attach images
5. Click "Đăng"
6. Verify post appeared
```

**Flow cho Zalo Groups:**

```
1. Mở Zalo Web hoặc Zalo PC
2. Navigate đến group chat
3. Paste message content
4. Attach images nếu có
5. Send message
6. Lặp lại cho group tiếp theo với delay
```

### Bước 4 — Anti-Spam Protection

```
RULES (bắt buộc tuân thủ):
  - Delay tối thiểu 3-5 phút giữa mỗi post
  - KHÔNG đăng y nguyên 1 nội dung vào > 5 groups/session
  - Mỗi group phải có ít nhất 1 câu khác nhau (personalized intro)
  - Max 10 groups/session, max 2 sessions/ngày
  - Randomize thứ tự groups
  - Nếu gặp CAPTCHA → dừng session, báo cáo
  - Nếu bị block/restrict → dừng ngay, báo cáo lỗi
  - Tôn trọng group rules tuyệt đối
```

### Bước 5 — Result Tracking

Sau mỗi post thành công:
- Lưu post URL (Facebook) hoặc screenshot confirmation (Zalo)
- Ghi nhận thời gian đăng
- Ghi nhận group đã đăng
- Update content status trong database

## Output format (JSON)

```json
{
  "skill": "G11_social_group_posting",
  "session_id": "session_20260325_001",
  "content_id": "content_001",
  "browser_tool_used": "computer_use",
  "total_targets": 8,
  "successful_posts": 7,
  "failed_posts": 1,
  "results": {
    "facebook_groups": [
      {
        "group_name": "Handmade Vietnam",
        "group_url": "https://facebook.com/groups/handmade-vn",
        "status": "posted",
        "post_url": "https://facebook.com/groups/handmade-vn/posts/12345",
        "adapted_content_preview": "Chào cả nhà! Mình muốn chia sẻ...",
        "posted_at": "2026-03-25T11:30:00+07:00",
        "images_attached": 2
      },
      {
        "group_name": "Kinh doanh online VN",
        "group_url": "https://facebook.com/groups/kd-online",
        "status": "failed",
        "error": "Group requires admin approval for posts",
        "posted_at": null
      }
    ],
    "zalo_personal": {
      "status": "posted",
      "posted_at": "2026-03-25T11:45:00+07:00"
    },
    "zalo_groups": [
      {
        "group_name": "Hội handmade SG",
        "status": "posted",
        "posted_at": "2026-03-25T11:50:00+07:00"
      }
    ]
  },
  "anti_spam_report": {
    "total_delay_minutes": 35,
    "unique_variations": 7,
    "captcha_encountered": false,
    "block_detected": false
  },
  "next_eligible_posting": "2026-03-26T11:30:00+07:00",
  "recommendations": [
    "Group 'Kinh doanh online VN' cần admin approval — submit post và chờ duyệt",
    "Zalo group 'Hội handmade SG' engagement cao — prioritize group này"
  ]
}
```

## Quy tắc

1. **KHÔNG spam** — Đây là quy tắc số 1. Mỗi post phải có giá trị thực cho group members, không chỉ promotional.
2. **Respect group rules** — Đọc rules trước khi post. Nếu group cấm quảng cáo, KHÔNG post promotional content.
3. **Personalize mỗi post** — Mỗi group nhận adapted version. Copy-paste y nguyên = spam = bị ban.
4. **Delay bắt buộc** — Tối thiểu 3 phút giữa các posts. Không accelerate.
5. **Stop on any warning** — Captcha, restrict, block → dừng ngay lập tức. Không cố bypass.
6. **Track everything** — Mọi action đều được log để phân tích hiệu quả sau này.
7. **Content quality > quantity** — Đăng 3 groups với content tốt hơn 10 groups với spam.
8. **Session limits** — Max 10 groups/session, max 2 sessions/ngày. Không vượt quá.
9. **Zalo khác Facebook** — Tone, length, format khác nhau. Không dùng cùng 1 format.
10. **Human-in-the-loop** — Nếu không chắc chắn (group rules unclear, content fit questionable) → hỏi user trước khi post.
