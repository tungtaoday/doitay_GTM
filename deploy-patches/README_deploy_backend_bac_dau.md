# Deploy backend "Bắc Đẩu events" lên PROD

> Prod backend = `/var/www/html/doitay.vn-production` trên `165.22.252.188`,
> git remote **`tungtaoday/doitay.vn.git` branch `main`** (repo GỐC — KHÁC repo rebuild
> `doitay-vn.git` nơi code đang nằm). Vì CLAUDE.md cấm add remote về repo gốc nên
> mình KHÔNG tự push — anh đưa code sang repo prod theo 1 trong 2 cách dưới.

Patch: `backend-bac-dau-events.patch` (8 file: 6 mới + 2 sửa `v1_public.php`, `ThoProfileController.php`).

---

## CÁCH A — qua git repo prod (khuyến nghị, đúng flow)
Trên máy có checkout `doitay.vn.git` (main):
```bash
git apply /đường/dẫn/backend-bac-dau-events.patch   # hoặc chép tay 8 file
git add core/ && git commit -m "[feat] product_events + API Bac Dau"
git push origin main
```
Trên server:
```bash
cd /var/www/html/doitay.vn-production
git pull origin main
cd core
# 1) Token bảo vệ endpoint thống kê (core/.env ở đây ĐÃ có sẵn, có DB creds)
grep -q '^METRICS_TOKEN=' .env || echo "METRICS_TOKEN=$(openssl rand -hex 24)" >> .env
# 2) Chạy CHỈ migration này (targeted — không đụng migration khác)
php artisan migrate --path=database/migrations/2026_07_30_000001_create_product_events_table.php --force
# 3) Nạp lại config đã cache (để đọc METRICS_TOKEN)
php artisan config:cache
```

## CÁCH B — áp thẳng trên server (nhanh)
```bash
scp backend-bac-dau-events.patch root@165.22.252.188:/tmp/
ssh root@165.22.252.188
cd /var/www/html/doitay.vn-production
git apply /tmp/backend-bac-dau-events.patch
cd core
grep -q '^METRICS_TOKEN=' .env || echo "METRICS_TOKEN=$(openssl rand -hex 24)" >> .env
php artisan migrate --path=database/migrations/2026_07_30_000001_create_product_events_table.php --force
php artisan config:cache
```

---

## Verify sau deploy
```bash
# Ghi event → mong 202
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://doitay.vn/api/v1/public/events \
  -H "Content-Type: application/json" -d '{"event":"profile_viewed","company_id":211,"surface":"khach","channel":"web"}'

# Xem phễu Bắc Đẩu (lấy TOKEN từ core/.env)
curl "https://doitay.vn/api/v1/public/metrics/bac-dau?token=<METRICS_TOKEN>&days=30"
```
Mong đợi: `funnel` + `bac_dau` (shared_profiles, shared_profiles_with_contact, real_lead_rate...).

## An toàn
- Migration chỉ `CREATE TABLE product_events` (thêm mới, có `down()`), chạy targeted `--path` → không đụng dữ liệu/bảng khác.
- `ProductEvent::log()` nuốt mọi lỗi → nếu bảng chưa có, luồng chính (publish/booking) vẫn chạy bình thường.
- Endpoint thống kê 403 nếu chưa đặt `METRICS_TOKEN` → không lộ số liệu.
