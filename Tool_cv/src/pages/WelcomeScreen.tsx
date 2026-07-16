import React from 'react';
import { Icon } from '../components/Icon';
import logoIcon from '../assets/logo-icon.png';

interface WelcomeScreenProps {
    onGetStarted: () => void;
    onLogoTap?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogoTap }) => {
    return (
        <div className="relative flex h-full min-h-screen w-full max-w-[430px] mx-auto flex-col bg-[#F4F5F7] shadow-2xl overflow-hidden font-display">
            {/* Background Decorations */}
            <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent z-0"></div>
            <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] z-0"></div>
            <div className="absolute top-[20%] left-[-150px] w-[250px] h-[250px] bg-accent-cyan/15 rounded-full blur-[80px] z-0"></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center flex-1 px-6 pt-12 pb-6">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
                    <div
                        className="w-20 h-20 bg-white rounded-[24px] shadow-[0_8px_20px_rgba(0,104,255,0.15)] flex items-center justify-center mb-5 border border-primary/10 relative overflow-hidden group cursor-pointer"
                        onClick={onLogoTap}
                    >
                        <img src={logoIcon} alt="Doitay - Hồ Sơ Thợ" className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300 relative z-10" />
                    </div>
                    <h1 className="text-3xl font-[900] text-slate-800 tracking-tight uppercase leading-none">
                        DOITAY.VN <span className="text-primary block mt-1">TẠO HỒ SƠ CỦA BẠN</span>
                    </h1>
                    <p className="text-[12px] font-bold text-slate-500 mt-2.5 uppercase tracking-widest bg-white/60 px-4 py-1.5 rounded-full border border-slate-200 backdrop-blur-sm">
                        Tự hào thợ Việt Nam
                    </p>
                </div>

                {/* Hero Image Card */}
                <div className="w-full mb-8 relative animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden bg-white shadow-[0_15px_35px_rgba(0,104,255,0.12)] border border-slate-100 flex flex-col items-center justify-center group">
                        <img
                            alt="Professional Vietnamese HVAC Technician"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI15u7kOgLN8sidGh-Aa3vQXr6rhcYKp-JUnzNepULnvZK3qWQbYdW-BuK-iVfXP7cyJwjrvadfplsXtsnzNbuRaJdWEr1A5tC4J05BY08t0VlM8M3rEaURjYbkW_bgokNEff_Kn-qYThORxIeDH9KGD99uyc7--DVwNfDzIJO6aut4QgSN7Y4IEDKZq_gzOOHl1IHWwj5uqHHgp9xBl9IhwpS5FROjRdYbYo3MnmZnu_5ZBD_yY7KPlHYnc13UGJK9e6EyMNDmTQ"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>

                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-white/95 text-primary text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md z-10 flex items-center gap-1.5 border border-primary/10">
                            <div className="bg-primary/10 p-0.5 rounded-full">
                                <Icon name="verified_user" size={12} color="#0068FF" />
                            </div>
                            CHUYÊN NGHIỆP
                        </div>

                        {/* Bottom Info Card */}
                        <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-xl p-4 rounded-xl border border-white shadow-xl z-20">
                            <h3 className="text-slate-800 font-bold text-lg leading-tight mb-1">Thợ Việt lành nghề</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                Xây dựng hồ sơ uy tín, tăng tỷ lệ nhận việc từ hàng ngàn khách hàng.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 w-full mb-6 px-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon name="badge" size={20} color="#0068FF" />
                        </div>
                        <p className="text-slate-700 text-[14px] font-semibold tracking-tight">Hồ sơ năng lực chuẩn hóa</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                            <Icon name="engineering" size={20} color="#10b981" />
                        </div>
                        <p className="text-slate-700 text-[14px] font-semibold tracking-tight">Được thiết kế riêng cho thợ</p>
                    </div>
                </div>
            </div>

            {/* Bottom CTA Section */}
            <div className="relative z-20 w-full bg-white border-t border-slate-200 p-6 pt-5 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={onGetStarted}
                        className="w-full flex items-center justify-center gap-2 rounded-2xl h-[56px] bg-primary text-white text-[15px] font-bold active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,104,255,0.25)] hover:shadow-[0_10px_25px_rgba(0,104,255,0.35)] hover:bg-[#005AEB]"
                    >
                        <Icon name="smartphone" size={22} color="white" />
                        TẠO HỒ SƠ MIỄN PHÍ
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2">
                        Bằng việc tiếp tục, bạn đồng ý với{' '}
                        <a className="text-primary hover:underline" href="https://doitay.vn/dieu-khoan">Điều khoản</a>
                        {' '}và{' '}
                        <a className="text-primary hover:underline" href="https://doitay.vn/bao-mat">Bảo mật</a>
                        {' '}của Doitay.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
