import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Icon } from '../components/Icon';
import logoIcon from '../assets/logo-icon.png';
import { QRCanvas } from '../components/QRCanvas';
import { getZaloChatUrl } from '../utils';
import tip1Image from '../assets/tip1.jpg';
import tip2Image from '../assets/tip2.jpg';
import tip3Image from '../assets/tip3.jpg';

interface HomePageProps {
    profile: UserProfile;
    onShareQR?: () => void;
    onViewProfile?: () => void;
    onEditProfile?: () => void;
    onViewTips?: () => void;
    onLogout?: () => void;
}

/**
 * Trang chủ — design "Thẻ Thợ".
 * Signature: tấm thẻ đeo công trường màu navy (lỗ xỏ dây + tên + nghề + QR).
 * Nguyên tắc: mọi nút đều dẫn đến hành động THẬT — không tab chết, không mục giả.
 */
export const HomePage: React.FC<HomePageProps> = ({
    profile,
    onShareQR,
    onViewProfile,
    onEditProfile,
    onViewTips,
    onLogout,
}) => {
    const [showMenu, setShowMenu] = useState(false);

    const trade = profile.jobTitle || 'Thợ chuyên nghiệp';
    const area = profile.location?.district || profile.location?.city || '';

    const tips = [
        {
            id: 1,
            title: 'Thêm ảnh công việc mới',
            desc: 'Chụp công trình anh vừa làm xong — khách nhìn ảnh là tin.',
            image: tip1Image,
        },
        {
            id: 2,
            title: 'Xin khách cũ vài lời khen',
            desc: 'Một câu khen của khách cũ đáng giá hơn trăm lời quảng cáo.',
            image: tip2Image,
        },
        {
            id: 3,
            title: 'Điền đủ bảng giá',
            desc: 'Khách thấy giá rõ ràng sẽ yên tâm gọi hơn.',
            image: tip3Image,
        },
    ];

    return (
        <div className="bg-paper font-display text-ink antialiased pb-28 min-h-screen max-w-[430px] mx-auto">
            {/* Đầu trang */}
            <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm">
                <div className="flex items-center px-5 py-4 justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-11 border-2 border-white shadow-card shrink-0"
                            style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
                        >
                            {!profile.avatarUrl && (
                                <div className="size-full flex items-center justify-center bg-primary text-white text-[18px] font-extrabold rounded-full">
                                    {profile.displayName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] text-ink/60 font-medium">Chào anh,</span>
                            <h2 className="text-navy text-[17px] font-extrabold leading-tight">{profile.displayName}</h2>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        aria-label="Mở menu"
                        className="flex items-center justify-center size-11 rounded-full bg-white shadow-card text-navy active:scale-95 transition-transform"
                    >
                        <Icon name="menu" size={24} />
                    </button>
                </div>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute top-16 right-5 bg-white rounded-2xl shadow-badge py-2 min-w-[190px] z-50">
                            <button
                                onClick={() => { onEditProfile?.(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-ink text-left"
                            >
                                <Icon name="edit" size={22} color="#006781" />
                                <span className="text-[16px] font-semibold">Sửa hồ sơ</span>
                            </button>
                            <button
                                onClick={() => { onViewTips?.(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-ink text-left"
                            >
                                <Icon name="star" size={22} color="#006781" />
                                <span className="text-[16px] font-semibold">Mẹo tăng uy tín</span>
                            </button>
                            <div className="border-t border-border-light my-1"></div>
                            <button
                                onClick={() => { onLogout?.(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-red-600 text-left"
                            >
                                <Icon name="logout" size={22} color="#dc2626" />
                                <span className="text-[16px] font-semibold">Thoát</span>
                            </button>
                        </div>
                    </>
                )}
            </header>

            <main className="flex flex-col w-full px-5 gap-7">
                {/* ═══ THẺ THỢ — signature ═══ */}
                <section className="w-full">
                    <div className="relative card-navy enter-up rounded-3xl pt-9 pb-6 px-6 shadow-badge">
                        {/* lỗ xỏ dây */}
                        <div className="badge-hole absolute top-3.5 left-1/2 -translate-x-1/2"></div>

                        {/* tên + nghề */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="min-w-0">
                                <p className="text-[22px] font-extrabold text-white leading-tight truncate">
                                    {profile.displayName}
                                </p>
                                <p className="text-[15px] font-semibold text-accent-cyan mt-1 truncate">
                                    {trade}{area ? ` • ${area}` : ''}
                                </p>
                            </div>
                            <img src={logoIcon} alt="Logo" className="w-10 h-10 object-contain shrink-0 ml-3" />
                        </div>

                        {/* QR */}
                        <div className="bg-white rounded-2xl p-5 flex flex-col items-center">
                            {getZaloChatUrl(profile.phoneNumber) ? (
                                <QRCanvas value={getZaloChatUrl(profile.phoneNumber)!} size={176} className="w-44 h-44" />
                            ) : (
                                <p className="text-[14px] font-semibold text-ink/60 text-center py-10">
                                    Thêm số điện thoại để tạo mã QR
                                </p>
                            )}
                            <p className="text-[15px] font-bold text-navy text-center mt-3.5 leading-snug">
                                Khách quét mã bằng Zalo
                                <br />
                                <span className="font-medium text-ink/60 text-[14px]">là nhắn tin được cho anh ngay</span>
                            </p>
                        </div>

                        <p className="text-center text-[13px] font-semibold tracking-wide text-white/60 mt-4">
                            Hồ Sơ Thợ — Tự hào thợ Việt
                        </p>
                    </div>

                    {/* 2 hành động chính */}
                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={onShareQR}
                            className="w-full flex items-center justify-center gap-2.5 h-[56px] bg-primary text-white rounded-2xl text-[17px] font-extrabold active:scale-[0.98] transition-transform"
                        >
                            <Icon name="share" size={22} color="white" />
                            Gửi thẻ cho khách
                        </button>
                        <button
                            onClick={onViewProfile}
                            className="w-full flex items-center justify-center gap-2.5 h-[52px] bg-white text-primary border-2 border-primary/25 rounded-2xl text-[16px] font-bold active:scale-[0.98] transition-transform"
                        >
                            <Icon name="visibility" size={22} color="#006781" />
                            Xem hồ sơ như khách xem
                        </button>
                    </div>
                </section>

                {/* Mẹo tăng uy tín */}
                <section className="w-full">
                    <div className="flex items-center justify-between mb-3.5">
                        <h2 className="text-[19px] font-extrabold text-navy">Mẹo có thêm khách</h2>
                        <button onClick={onViewTips} className="text-primary text-[15px] font-bold">
                            Xem hết
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-3.5 pb-2 -mx-5 px-5 hide-scrollbar snap-x snap-mandatory">
                        {tips.map(tip => (
                            <button
                                key={tip.id}
                                onClick={onViewTips}
                                className="snap-start shrink-0 w-[240px] flex flex-col bg-white rounded-2xl overflow-hidden shadow-card text-left active:scale-[0.98] transition-transform"
                            >
                                <div
                                    className="h-28 w-full bg-cover bg-center"
                                    style={{ backgroundImage: `url("${tip.image}")` }}
                                />
                                <div className="p-4 flex flex-col gap-1.5">
                                    <h4 className="font-extrabold text-navy text-[16px] leading-snug">{tip.title}</h4>
                                    <p className="text-[14px] text-ink/60 leading-snug">{tip.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Lên chợ thợ doitay.vn — link THẬT (trang tuyển thợ), không phải hồ sơ ảo */}
                <section className="w-full">
                    <a
                        href="https://doitay.vn/tuyen-dung-tho"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-card active:scale-[0.98] transition-transform"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                            <Icon name="public" size={24} color="#006781" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[16px] font-bold text-navy">Đưa hồ sơ lên chợ thợ doitay.vn</p>
                            <p className="text-[14px] text-ink/60 truncate">Khách tìm thợ trên mạng sẽ thấy anh — miễn phí</p>
                        </div>
                        <Icon name="arrow_forward" size={22} color="#006781" />
                    </a>
                </section>
            </main>

            {/* Thanh dưới — 4 nút, TẤT CẢ đều thật */}
            <nav className="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto bg-white border-t border-border-light z-50">
                <div className="flex justify-around items-stretch pt-2 pb-5">
                    <button className="flex flex-col items-center justify-center flex-1 gap-1 py-1">
                        <Icon name="home" size={26} color="#006781" />
                        <span className="text-[12px] font-extrabold text-primary">Trang chủ</span>
                    </button>
                    <button
                        onClick={onViewProfile}
                        className="flex flex-col items-center justify-center flex-1 gap-1 py-1 text-ink/50"
                    >
                        <Icon name="badge" size={26} color="#8A99A8" />
                        <span className="text-[12px] font-semibold">Hồ sơ</span>
                    </button>
                    <button
                        onClick={onEditProfile}
                        className="flex flex-col items-center justify-center flex-1 gap-1 py-1 text-ink/50"
                    >
                        <Icon name="edit" size={26} color="#8A99A8" />
                        <span className="text-[12px] font-semibold">Sửa hồ sơ</span>
                    </button>
                    <button
                        onClick={onViewTips}
                        className="flex flex-col items-center justify-center flex-1 gap-1 py-1 text-ink/50"
                    >
                        <Icon name="star" size={26} color="#8A99A8" />
                        <span className="text-[12px] font-semibold">Mẹo hay</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};
