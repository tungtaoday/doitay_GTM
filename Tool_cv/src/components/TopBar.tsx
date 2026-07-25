import React, { ReactNode } from 'react';
import logoIcon from '../assets/logo-icon.png';

/**
 * Thanh trên THỐNG NHẤT cho mọi màn: logo bàn tay + "Hồ Sơ Thợ" bên trái,
 * khe hành động (bell/menu/share...) bên phải. Đồng bộ nhận diện, tránh mỗi
 * màn một kiểu header.
 */
export const TopBar: React.FC<{
    right?: ReactNode;
    onBrandClick?: () => void;
}> = ({ right, onBrandClick }) => {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border-light bg-white/95 px-4 backdrop-blur">
            <button
                type="button"
                onClick={onBrandClick}
                className="flex items-center gap-2.5 active:scale-95 transition-transform"
            >
                <img src={logoIcon} alt="Hồ Sơ Thợ" className="h-9 w-9 object-contain" />
                <span className="font-extrabold text-[18px] tracking-tight text-navy">
                    Hồ Sơ<span className="text-primary"> Thợ</span>
                </span>
            </button>
            {right ? <div className="flex items-center gap-2">{right}</div> : null}
        </header>
    );
};
