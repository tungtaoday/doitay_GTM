import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * QR sinh CỤC BỘ (thư viện qrcode, render canvas) — thay cho api.qrserver.com:
 * không phụ thuộc mạng ngoài, không bị CSP Mini App chặn, hiện tức thì kể cả
 * khi thợ ở công trường sóng yếu.
 */
export const QRCanvas: React.FC<{
    value: string;
    size?: number;
    className?: string;
    /** Màu QR — mặc định navy thẻ thợ */
    dark?: string;
}> = ({ value, size = 200, className, dark = '#14324F' }) => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!ref.current || !value) return;
        QRCode.toCanvas(ref.current, value, {
            width: size,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark, light: '#FFFFFF' },
        }).catch(() => {
            /* giá trị quá dài/không hợp lệ — bỏ qua, canvas trống */
        });
    }, [value, size, dark]);

    return <canvas ref={ref} className={className} style={{ width: size, height: size }} />;
};
