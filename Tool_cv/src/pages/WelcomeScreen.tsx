import React from 'react';
import { Icon } from '../components/Icon';
import logoIcon from '../assets/logo-icon.png';
import { QRCanvas } from '../components/QRCanvas';

interface WelcomeScreenProps {
    onGetStarted: () => void;
}

/**
 * Màn chào — design "Thẻ Thợ".
 * Hero = bản xem trước tấm thẻ thợ (thứ người thợ sẽ nhận được), không dùng stock photo.
 * Chữ to, một nút hành động duy nhất, giọng "anh".
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
    return (
        <div className="relative flex h-full min-h-screen w-full max-w-[430px] mx-auto flex-col bg-paper overflow-hidden font-display">
            {/* Nội dung */}
            <div className="flex flex-col items-center flex-1 px-5 pt-10 pb-4 overflow-y-auto">
                {/* Logo + tên */}
                <div className="flex items-center gap-3 mb-7">
                    <img src={logoIcon} alt="Hồ Sơ Thợ" className="w-12 h-12 object-contain" />
                    <div className="leading-tight">
                        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-primary">Ground Truth</p>
                        <p className="text-[17px] font-extrabold text-navy">Hồ Sơ Thợ</p>
                    </div>
                </div>

                {/* Tiêu đề */}
                <h1 className="text-[27px] leading-[1.25] font-extrabold text-navy text-center mb-3">
                    Khách hỏi tay nghề?
                    <br />
                    <span className="text-primary">Đưa thẻ thợ ra là xong.</span>
                </h1>
                <p className="text-[16px] leading-relaxed text-ink/70 text-center mb-7 max-w-[320px]">
                    Danh thiếp điện tử có ảnh việc, bảng giá — khách quét mã là nhắn Zalo được cho anh ngay.
                </p>

                {/* HERO — thẻ thợ mẫu (signature) */}
                <div className="relative w-full max-w-[330px] mb-7">
                    {/* nhãn MẪU */}
                    <span className="absolute -top-2.5 right-4 z-10 rounded-full bg-amber px-3 py-1 text-[12px] font-extrabold text-navy shadow">
                        MẪU
                    </span>
                    <div className="relative card-navy enter-up-1 rounded-3xl pt-8 pb-6 px-6 shadow-badge">
                        {/* lỗ xỏ dây */}
                        <div className="badge-hole absolute top-3 left-1/2 -translate-x-1/2"></div>

                        <div className="flex items-center justify-between mb-5 mt-1">
                            <div>
                                <p className="text-[20px] font-extrabold text-white leading-tight">Nguyễn Văn Tâm</p>
                                <p className="text-[15px] font-semibold text-accent-cyan mt-0.5">Thợ điện nước • Hà Đông</p>
                            </div>
                            <span className="bg-white rounded-xl p-1.5 shadow-sm flex items-center justify-center"><img src={logoIcon} alt="" className="w-7 h-7 object-contain" /></span>
                        </div>

                        <div className="flex items-center gap-4 bg-white rounded-2xl p-4">
                            <QRCanvas value="https://doitay.vn" size={88} className="shrink-0" />
                            <div>
                                <p className="text-[15px] font-bold text-navy leading-snug">Khách quét bằng Zalo</p>
                                <p className="text-[14px] text-ink/60 leading-snug mt-1">là nhắn được cho anh ngay</p>
                                <div className="flex items-center gap-1 mt-2 text-amber">
                                    <Icon name="star" size={16} color="#F5A623" />
                                    <Icon name="star" size={16} color="#F5A623" />
                                    <Icon name="star" size={16} color="#F5A623" />
                                    <Icon name="star" size={16} color="#F5A623" />
                                    <Icon name="star" size={16} color="#F5A623" />
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-[13px] font-semibold tracking-wide text-white/60 mt-4">
                            Hồ Sơ Thợ — Tự hào thợ Việt
                        </p>
                    </div>
                </div>

                {/* 3 điều nhận được — chữ to, không thuật ngữ */}
                <div className="w-full max-w-[330px] space-y-2.5">
                    <div className="flex items-center gap-3.5 bg-white rounded-2xl px-4 py-3.5 shadow-card">
                        <div className="w-11 h-11 rounded-xl bg-green-soft flex items-center justify-center shrink-0">
                            <Icon name="check" size={22} color="#1E8849" />
                        </div>
                        <p className="text-[16px] font-semibold text-ink">
                            Miễn phí <span className="font-normal text-ink/60">— không mất đồng nào</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3.5 bg-white rounded-2xl px-4 py-3.5 shadow-card">
                        <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                            <Icon name="schedule" size={22} color="#006781" />
                        </div>
                        <p className="text-[16px] font-semibold text-ink">
                            Làm xong trong 2 phút <span className="font-normal text-ink/60">— chỉ cần vài tấm ảnh</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3.5 bg-white rounded-2xl px-4 py-3.5 shadow-card">
                        <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                            <Icon name="share" size={22} color="#006781" />
                        </div>
                        <p className="text-[16px] font-semibold text-ink">
                            Gửi khách qua Zalo <span className="font-normal text-ink/60">— hoặc in mã dán tiệm</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Nút hành động — cố định đáy, vùng ngón cái */}
            <div className="w-full bg-white px-5 pt-4 pb-7 shadow-[0_-6px_20px_rgba(20,50,79,0.08)]">
                <button
                    onClick={onGetStarted}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl h-[58px] bg-primary text-white text-[18px] font-extrabold active:scale-[0.98] transition-transform"
                >
                    Làm thẻ thợ của tôi — MIỄN PHÍ
                </button>
                <p className="text-[13px] text-center text-ink/50 mt-3">
                    Tiếp tục là anh đồng ý với{' '}
                    <a className="text-primary underline" href="https://doitay.vn/dieu-khoan">Điều khoản</a>
                    {' '}và{' '}
                    <a className="text-primary underline" href="https://doitay.vn/bao-mat">Bảo mật</a>
                    {' '}của doitay.vn.
                </p>
                <p className="text-[12px] text-center text-ink/40 mt-1.5">
                    Sản phẩm của Hộ kinh doanh Ground Truth — vận hành doitay.vn
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;
