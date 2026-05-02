# CLAUDE.md — Strategy Repository

> Hướng dẫn tổng quan cho Claude Code khi làm việc trong repo này.

## 1. Tổng quan repo

Repo này chứa toàn bộ tech stack cho **doitay.vn** và các tool phụ trợ:

```
Strategy/
├── doitay-vn/          ← Dự án chính: marketplace thợ sửa chữa Việt Nam
│   ├── core/           ← Laravel 11 backend (PHP 8.3, MySQL)
│   ├── frontend/       ← Next.js 15 frontend (TypeScript strict)
│   └── CLAUDE.md       ← Hướng dẫn chi tiết cho doitay-vn (ĐỌC FILE NÀY)
│
├── agent-system/       ← AI agent automation (Python, marketing/content)
│   ├── src/agents/     ← Agent implementations
│   ├── src/api/        ← API wrappers (Facebook, TikTok, YouTube)
│   ├── src/tools/      ← Tools (image, reel, music generator)
│   ├── playbooks/      ← Automation playbooks (YAML)
│   └── project.yaml    ← Doitay.vn context injected vào mọi agent
│
├── Tool_cv/            ← ThợTốt: Zalo Mini App (React/Ionic)
│   └── DOCUMENTATION.md ← App docs
│
└── cockpit/            ← Dashboard/admin companion app
```

## 2. Git

- **Remote**: `origin/main` tại GitHub
- **Lưu ý**: `doitay-vn/` là **git submodule / nested repo riêng**, có branch `rebuild/headless-nextjs`
- Khi commit repo gốc (Strategy): đừng stage `doitay-vn/` trừ khi update submodule pointer
- Khi làm việc trong `doitay-vn/`: cd vào đó và commit riêng

## 3. Dự án chính — doitay-vn

Đây là project được làm việc nhiều nhất. Trước khi chỉnh bất kỳ thứ gì trong `doitay-vn/`:

**BẮT BUỘC đọc:** `doitay-vn/CLAUDE.md` (backend) và `doitay-vn/frontend/CLAUDE.md` (frontend)

Tóm tắt nhanh:
- Backend: XAMPP Apache port 8080, không dùng `php artisan serve`
- Frontend: `npm run dev` tại `frontend/`, port 3000
- Design System: `doitay-vn/docs/design-system.md` — bắt buộc tuân thủ

## 4. Agent System

Python-based marketing automation. Entry point: `agent-system/run.py`

```bash
cd agent-system
python run.py                          # main agent runner
python scripts/run_seed.py --stats     # seed marketplace stats
python scripts/run_seed.py 5 5 10     # seed 5 contractors, 5 customers, 10 appointments
```

Cần file `agent-system/.env` với:
```
DOITAY_API_BASE=http://localhost:8080/api/v1
DOITAY_SEED_TOKEN=<admin_token>
GEMINI_API_KEY=<key>
```

## 5. Tool_cv (ThợTốt Zalo Mini App)

Zalo Mini App dạng CV số cho thợ. Build bằng React + Ionic.

```bash
cd Tool_cv
npm run dev    # development
npm run build  # production build → www/
```

## 6. Workflow skills

Skills bắt buộc tham chiếu khi phát triển: `C:\cypher_ai\claude\skills\`

Không tự bịa skill mới — dùng các skill có sẵn: `analyze-requirements`, `breakdown-requirements`, `design-domain`, `implement-tests`, `implement-code`, `review`.

## 7. Nguyên tắc chung

- Trả lời bằng **tiếng Việt**
- Không hardcode giá trị config (brand, price, contact) — đọc từ DB/settings
- Verify cột DB tồn tại trước khi viết query
- Không `git add -A` — stage explicit từng file để tránh commit file nhạy cảm
