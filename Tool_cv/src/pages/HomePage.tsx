import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Icon } from '../components/Icon';
import logoIcon from '../assets/logo-icon.png';
import tip1Image from '../assets/tip1.png';
import tip2Image from '../assets/tip2.png';
import tip3Image from '../assets/tip3.png';

interface HomePageProps {
    profile: UserProfile;
    onShareQR?: () => void;
    onViewProfile?: () => void;
    onEditProfile?: () => void;
    onViewTips?: () => void;
    onLogout?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
    profile,
    onShareQR,
    onViewProfile,
    onEditProfile,
    onViewTips,
    onLogout,
}) => {
    const [showMenu, setShowMenu] = useState(false);

    // Tips data
    const tips = [
        {
            id: 1,
            title: 'Thêm ảnh dự án mới',
            desc: 'Cập nhật hình ảnh các công trình bạn vừa hoàn thành để thu hút khách.',
            badge: '+15 điểm tin cậy',
            image: tip1Image,
            action: 'Thực hiện ngay',
        },
        {
            id: 2,
            title: 'Xin đánh giá khách cũ',
            desc: 'Lời khen từ khách hàng cũ là cách tốt nhất để xây dựng lòng tin.',
            badge: 'Rất quan trọng',
            image: tip2Image,
            action: 'Gửi lời mời',
        },
        {
            id: 3,
            title: 'Xác thực danh tính',
            desc: 'Hoàn tất hồ sơ giấy tờ để nhận huy hiệu "Đã xác thực".',
            badge: 'Huy hiệu đặc biệt',
            image: tip3Image,
            action: 'Cập nhật',
        },
    ];

    return (
        <div className="bg-[#f8f9fc] font-display text-slate-900 antialiased pb-24 min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#f8f9fc]/95 backdrop-blur-sm transition-colors duration-300">
                <div className="flex items-center p-4 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border border-slate-200"
                                style={profile.avatarUrl ? { backgroundImage: `url("${profile.avatarUrl}")` } : undefined}
                            >
                                {!profile.avatarUrl && (
                                    <div className="size-full flex items-center justify-center bg-primary text-white font-bold rounded-full">
                                        {profile.displayName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-medium">Xin chào,</span>
                            <h2 className="text-slate-900 text-base font-bold leading-tight">{profile.displayName}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onViewProfile}
                            className="flex items-center justify-center size-10 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors"
                            title="Xem trước hồ sơ"
                        >
                            <Icon name="visibility" size={20} />
                        </button>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="relative flex items-center justify-center size-10 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Icon name="notifications" size={24} />
                            <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </div>

                {/* Dropdown Menu */}
                {showMenu && (
                    <>
                        {/* Overlay để click ra ngoài tắt menu */}
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                        
                        <div className="absolute top-16 right-4 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[160px] z-50">
                            <button
                                onClick={() => { onEditProfile?.(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left relative z-10"
                            >
                                <Icon name="edit" size={20} />
                                <span className="text-sm font-medium">Sửa hồ sơ</span>
                            </button>
                            <button
                                onClick={() => { onViewProfile?.(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left relative z-10"
                            >
                                <Icon name="badge" size={20} />
                                <span className="text-sm font-medium">Xem CV</span>
                            </button>
                            <div className="border-t border-gray-100 my-1 relative z-10"></div>
                            <button
                                onClick={() => { onLogout?.(); setShowMenu(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left relative z-10"
                            >
                                <Icon name="logout" size={20} color="#dc2626" />
                                <span className="text-sm font-medium">Thoát</span>
                            </button>
                        </div>
                    </>
                )}
            </header>

            {/* Main Content */}
            <main className="flex flex-col w-full px-4 gap-6">
                {/* QR Card Section */}
                <section className="w-full">
                    <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Danh thiếp của bạn</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Sẵn sàng</span>
                        </div>
                        <div className="flex flex-col items-center justify-center py-7 bg-gradient-to-br from-[#E5F0FF] to-[#F3F8FF] rounded-2xl border border-[#D5E6FF] mb-5 relative overflow-hidden shadow-sm">
                            {/* Decorative Elements */}
                            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                            <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-[#00F2FF]/10 rounded-full blur-xl"></div>

                            {/* QR Container */}
                            <div className="relative bg-white p-3.5 rounded-2xl shadow-[0_8px_20px_rgba(0,104,255,0.15)] border-2 border-white group transition-transform hover:scale-105">
                                {/* Center Logo overlay */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-md border border-slate-100 z-10">
                                    <img src={logoIcon} alt="Logo" className="w-[80%] h-[80%] object-contain" />
                                </div>
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://doitay.vn/tho/${profile.uid}&margin=0`} 
                                    className="w-36 h-36 object-contain"
                                    alt="QR Code"
                                />
                            </div>

                            <p className="relative mt-4 text-[13px] text-[#0068FF] font-bold text-center bg-white/80 px-4 py-1.5 rounded-full border border-blue-100 backdrop-blur-sm shadow-sm">
                                Doitay.vn — Hồ Sơ Thợ
                            </p>
                            <p className="text-[11px] text-slate-500 mt-2 font-medium text-center px-4">
                                Khách hàng quét mã này bằng Zalo để xem ngay hồ sơ và bảng giá của bạn!
                            </p>
                        </div>
                        <div className="space-y-4">
                            <p className="text-slate-600 text-sm leading-relaxed text-center">
                                Chia sẻ mã QR này để khách hàng có thể dễ dàng liên hệ và đặt lịch với bạn.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onShareQR}
                                    className="w-full flex items-center justify-center gap-2 h-12 bg-primary hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <Icon name="share" size={20} color="white" />
                                    <span>Chia sẻ ngay</span>
                                </button>
                                <button
                                    onClick={onViewProfile}
                                    className="w-full flex items-center justify-center gap-2 h-12 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg font-semibold transition-colors"
                                >
                                    <Icon name="visibility" size={20} color="#0068FF" />
                                    <span>Xem giao diện khách hàng</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tips Section */}
                <section className="w-full">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-slate-900">Mẹo tăng uy tín</h2>
                        <button onClick={onViewTips} className="text-primary text-sm font-medium hover:underline">Xem tất cả</button>
                    </div>
                    <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 hide-scrollbar snap-x snap-mandatory">
                        {tips.map(tip => (
                            <button
                                key={tip.id}
                                onClick={onViewTips}
                                className="snap-start shrink-0 w-64 flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 text-left hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                {tip.image ? (
                                    <div
                                        className="h-32 w-full bg-cover bg-center relative"
                                        style={{ backgroundImage: `url("${tip.image}")` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                            {tip.badge && (
                                                <span className="text-white text-xs font-bold bg-primary/90 px-2 py-0.5 rounded backdrop-blur-sm">{tip.badge}</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 w-full bg-indigo-50 flex items-center justify-center relative">
                                        <Icon name="star" size={48} color="#818cf8" />
                                    </div>
                                )}
                                <div className="p-3 flex flex-col gap-1">
                                    <h4 className="font-bold text-slate-900 text-sm">{tip.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">{tip.desc}</p>
                                    <span className="mt-2 text-primary text-xs font-bold self-start uppercase tracking-wide">{tip.action}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Jobs Section - Empty State */}
                <section className="w-full">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Công việc từ Doitay</h2>
                    <div className="w-full bg-white rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        {/* CTA Card */}
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onEditProfile?.(); }}
                            className="mb-5 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3 w-full max-w-sm hover:shadow-md transition-shadow"
                        >
                            <div className="size-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                <Icon name="auto_fix_high" size={18} color="#ca8a04" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-xs text-slate-700 font-medium">
                                    Hoàn thiện hồ sơ để tăng <span className="font-bold text-green-600">80%</span> khả năng nhận việc
                                </p>
                                <div className="text-primary text-xs font-bold mt-1 flex items-center gap-1">
                                    Cập nhật ngay <Icon name="arrow_forward" size={14} color="#0068FF" />
                                </div>
                            </div>
                        </a>
                        <div className="size-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-primary">
                            <Icon name="connect_without_contact" size={32} color="#0068FF" className="animate-pulse" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-base mb-1">Đang kết nối hệ thống...</h3>
                        <p className="text-slate-500 text-sm max-w-[260px]">
                            Công việc mới phù hợp với kỹ năng của bạn sẽ sớm xuất hiện tại đây!
                        </p>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 pb-safe pt-2 px-2 z-50">
                <div className="flex justify-around items-center h-14">
                    <a className="flex flex-col items-center justify-center w-full gap-1 group" href="#">
                        <Icon name="home" size={24} color="#0068FF" />
                        <span className="text-[10px] font-bold text-primary">Trang chủ</span>
                    </a>
                    <a className="flex flex-col items-center justify-center w-full gap-1 group text-slate-400 hover:text-primary transition-colors" href="#">
                        <Icon name="work" size={24} color="#94a3b8" />
                        <span className="text-[10px] font-medium">Công việc</span>
                    </a>
                    <a className="flex flex-col items-center justify-center w-full gap-1 group text-slate-400 hover:text-primary transition-colors" href="#">
                        <Icon name="forum" size={24} color="#94a3b8" />
                        <span className="text-[10px] font-medium">Cộng đồng</span>
                    </a>
                    <button
                        onClick={onViewProfile}
                        className="flex flex-col items-center justify-center w-full gap-1 group text-slate-400 hover:text-primary transition-colors"
                    >
                        <Icon name="person" size={24} color="#94a3b8" />
                        <span className="text-[10px] font-medium">Hồ sơ</span>
                    </button>
                </div>
                <div className="h-4 w-full bg-white"></div>
            </nav>
        </div>
    );
};
