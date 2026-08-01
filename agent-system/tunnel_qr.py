# -*- coding: utf-8 -*-
"""Lấy URL công khai từ ngrok (API local :4040) → in URL + QR (ASCII terminal + PNG) → mở PNG.
Gọi bởi marketing_tunnel.bat sau khi ngrok đã chạy."""
import sys, os, time, json, urllib.request, urllib.parse, webbrowser


def get_public_url(timeout_s: int = 45):
    api = "http://127.0.0.1:4040/api/tunnels"
    for _ in range(timeout_s):
        try:
            with urllib.request.urlopen(api, timeout=2) as r:
                data = json.load(r)
            https = [t["public_url"] for t in data.get("tunnels", []) if t.get("public_url", "").startswith("https")]
            if https:
                return https[0]
            any_url = [t["public_url"] for t in data.get("tunnels", []) if t.get("public_url")]
            if any_url:
                return any_url[0]
        except Exception:
            pass
        time.sleep(1)
    return None


def make_qr_local(link: str, png_path: str) -> bool:
    try:
        import qrcode
    except ImportError:
        os.system(f'"{sys.executable}" -m pip install --quiet "qrcode[pil]"')
        try:
            import qrcode
        except Exception:
            return False
    try:
        qr = qrcode.QRCode(border=2)
        qr.add_data(link)
        qr.make(fit=True)
        # QR ASCII ngay trong terminal — quét được cả khi không mở file ảnh
        qr.print_ascii(invert=True)
        qr.make_image().save(png_path)
        return True
    except Exception:
        return False


def main():
    print("Đang chờ ngrok tạo tunnel...", flush=True)
    link = get_public_url()
    if not link:
        print("\n[LỖI] Không lấy được URL ngrok.")
        print("  - Đảm bảo đã chạy 1 lần:  ngrok config add-authtoken <token-cua-ban>")
        print("  - Xem cửa sổ 'ngrok' có báo lỗi không.")
        try:
            webbrowser.open("http://127.0.0.1:4040")
        except Exception:
            pass
        return

    bar = "=" * 60
    print("\n" + bar)
    print("  HỆ MARKETING — TRUY CẬP MỌI NƠI")
    print("  Hôm nay làm gì:  " + link + "/homnay")
    print("  Dashboard:       " + link)
    print(bar + "\n")

    png = os.path.join(os.path.dirname(os.path.abspath(__file__)), "marketing_qr.png")
    if make_qr_local(link + "/homnay", png):
        print(f"\n[QR] Đã lưu: {png}  — quét bằng camera điện thoại.")
        try:
            os.startfile(png)  # mở ảnh QR (Windows)
        except Exception:
            pass
    else:
        q = "https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=" + urllib.parse.quote(link + "/homnay", safe="")
        print("\n[QR] Không tạo được QR cục bộ → mở QR online trên trình duyệt:")
        print("  " + q)
        try:
            webbrowser.open(q)
        except Exception:
            pass

    # Lưu URL ra file cho tiện copy
    try:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "marketing_url.txt"), "w", encoding="utf-8") as f:
            f.write(link + "\n")
    except Exception:
        pass


if __name__ == "__main__":
    main()
