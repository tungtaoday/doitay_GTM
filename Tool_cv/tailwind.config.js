/** @type {import('tailwindcss').Config} */
// Design "Thẻ Thợ" — bảng màu áo bảo hộ, lấy từ logo Doitay (navy/sky/green).
// Nguyên tắc cho thợ 30-50 tuổi: chữ to, nút to, tương phản cao, không trang trí thừa.
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Hành động chính — sky Doitay làm đậm để đạt tương phản AA trên nền trắng
        "primary": "#1E8849",
        "secondary": "#166B3A",          // trạng thái nhấn/press
        "primary-soft": "#E6F4EC",       // nền chip/selected
        // Nhận diện
        "navy": "#102F4B",               // thẻ thợ, tiêu đề — màu áo bảo hộ
        "ink": "#1B2B3A",                // chữ nội dung
        "green": "#1E8849",              // miễn phí / gọi điện / thành công
        "green-soft": "#E6F4EC",
        "amber": "#F5A623",              // CHỈ dùng cho sao đánh giá
        "paper": "#F3F6F9",              // nền trang
        // Khoá cũ giữ lại để trang chưa redesign không vỡ
        "dark-bg": "#070A15",
        "accent-cyan": "#48BBE2",
        "surface-dark": "#111827",
        "background-light": "#F3F6F9",
        "background-dark": "#111621",
        "surface-light": "#ffffff",
        "border-light": "#E4EAF0",
      },
      fontFamily: {
        // System stack: Roboto trên Android (máy thợ dùng) — tải tức thì, tiếng Việt chuẩn
        "display": ["Be Vietnam Pro", "-apple-system", "BlinkMacSystemFont", "Roboto", "Segoe UI", "Arial", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
        "full": "9999px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(16,47,75,0.08), 0 4px 14px rgba(16,47,75,0.06)",
        "badge": "0 10px 30px rgba(16,47,75,0.35)",
      },
    },
  },
  plugins: [],
}
