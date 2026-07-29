import React, { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { TopBar } from '../components/TopBar';
import { fetchPublicCompany, DOITAY_WEB, recordEvent } from '../utils';
import logoIcon from '../assets/logo-icon.png';

/**
 * MÀN KHÁCH XEM — mở khi khách bấm vào thẻ thợ được chia sẻ (deep link ?tho=<id>).
 * Lấy hồ sơ công khai từ doitay, hiển thị read-only, CTA đặt lịch/liên hệ.
 * Đây là "hồ sơ Mini App" mà thợ gửi cho khách (native trong Zalo).
 */
export const PublicProfileView: React.FC<{ companyId: number; onClose: () => void }> = ({ companyId, onClose }) => {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Khách mở thẻ thợ được chia sẻ → đo phễu Bắc Đẩu (nửa sau).
        recordEvent('profile_viewed', { companyId, surface: 'khach', channel: 'miniapp' });
        fetchPublicCompany(companyId).then((d) => {
            setData(d);
            setLoading(false);
        });
    }, [companyId]);

    const openBooking = async () => {
        recordEvent('contact_clicked', { companyId, surface: 'khach', channel: 'miniapp' });
        const url = `${DOITAY_WEB}/tho/${companyId}?utm_source=miniapp_card`;
        try {
            const { openWebview } = await import('zmp-sdk/apis');
            await openWebview({ url });
        } catch {
            window.open(url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-paper">
                <TopBar right={<button onClick={onClose} className="size-11 rounded-full bg-paper flex items-center justify-center"><Icon name="close" size={22} /></button>} />
                <div className="px-6 py-20 text-center">
                    <p className="text-navy font-bold text-[18px]">Không tìm thấy hồ sơ</p>
                    <p className="text-ink/60 text-[15px] mt-2">Hồ sơ có thể đang chờ duyệt hoặc đã gỡ.</p>
                </div>
            </div>
        );
    }

    const name = data.name || 'Thợ';
    const trade = data.category?.name || 'Thợ chuyên nghiệp';
    const area = [data.location?.district, data.location?.city].filter(Boolean).join(', ');
    const rating = typeof data.rating_avg === 'number' && data.rating_avg > 0 ? data.rating_avg.toFixed(1) : null;
    const ratingCount = data.rating_count || 0;
    const img = data.image && !String(data.image).includes('unsplash.com') ? data.image : logoIcon;
    const services: any[] = Array.isArray(data.services) ? data.services : [];
    const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
    const portfolios: any[] = Array.isArray(data.portfolios) ? data.portfolios : [];

    return (
        <div className="relative min-h-screen w-full max-w-[430px] mx-auto bg-paper font-display pb-[110px]">
            <TopBar
                onBrandClick={onClose}
                right={<button onClick={onClose} aria-label="Đóng" className="size-11 rounded-full bg-paper flex items-center justify-center active:scale-95"><Icon name="close" size={22} color="#102F4B" /></button>}
            />

            {/* Đầu hồ sơ */}
            <div className="flex flex-col items-center pt-8 px-5 pb-7 bg-white mb-2.5 rounded-b-3xl shadow-card">
                <div className="size-28 rounded-full overflow-hidden border-4 border-white shadow-badge bg-navy mb-4">
                    <img src={img} alt={name} className="w-full h-full object-cover" />
                </div>
                <h1 className="text-[24px] font-extrabold text-navy text-center leading-tight">{name}</h1>
                <p className="text-[16px] font-semibold text-primary mt-1">{trade}</p>
                {area ? <p className="text-[14px] text-ink/60 mt-1 flex items-center gap-1"><Icon name="location_on" size={16} color="#737780" />{area}</p> : null}

                <div className="flex w-full justify-around items-center px-2 py-4 bg-paper rounded-2xl mt-5">
                    <div className="flex flex-col items-center">
                        {rating ? (
                            <>
                                <div className="flex items-center gap-1 font-extrabold text-[19px] text-navy">{rating}<Icon name="star" size={18} color="#F5A623" /></div>
                                <span className="text-[13px] text-ink/60 mt-0.5">{ratingCount} đánh giá</span>
                            </>
                        ) : (
                            <>
                                <span className="font-extrabold text-[19px] text-navy">Mới</span>
                                <span className="text-[13px] text-ink/60 mt-0.5">Chưa có đánh giá</span>
                            </>
                        )}
                    </div>
                    <div className="w-px h-9 bg-border-light" />
                    <div className="flex flex-col items-center">
                        <span className="font-extrabold text-[19px] text-navy">{data.experience || 0}+</span>
                        <span className="text-[13px] text-ink/60 mt-0.5">Năm làm nghề</span>
                    </div>
                </div>
            </div>

            {/* Bảng giá */}
            {services.length > 0 && (
                <section className="bg-white mx-4 rounded-2xl p-5 shadow-card mb-2.5">
                    <div className="flex items-center gap-2 mb-3"><Icon name="payments" size={22} color="#1E8849" /><h3 className="text-[18px] font-extrabold text-navy">Bảng giá</h3></div>
                    <div className="flex flex-col gap-2.5">
                        {services.map((s, i) => (
                            <div key={i} className="flex items-center justify-between gap-3">
                                <span className="text-[15px] text-ink">{s.name}</span>
                                <span className="text-[15px] font-bold text-navy whitespace-nowrap">{s.price || 'Liên hệ'}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Giới thiệu */}
            {data.description && (
                <section className="bg-white mx-4 rounded-2xl p-5 shadow-card mb-2.5">
                    <h3 className="text-[18px] font-extrabold text-navy mb-2">Giới thiệu</h3>
                    <p className="text-[15px] text-ink/80 leading-relaxed whitespace-pre-line">{data.description}</p>
                </section>
            )}

            {/* Việc nhận làm */}
            {tags.length > 0 && (
                <section className="bg-white mx-4 rounded-2xl p-5 shadow-card mb-2.5">
                    <h3 className="text-[18px] font-extrabold text-navy mb-3">Việc nhận làm</h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((t) => <span key={t} className="px-3 py-1.5 rounded-full bg-primary-soft text-primary text-[14px] font-semibold">{t}</span>)}
                    </div>
                </section>
            )}

            {/* Ảnh công trình */}
            {portfolios.length > 0 && (
                <section className="bg-white mx-4 rounded-2xl p-5 shadow-card mb-2.5">
                    <h3 className="text-[18px] font-extrabold text-navy mb-3">Ảnh công trình</h3>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                        {portfolios.map((p, i) => (
                            <img key={i} src={p.image || p.url} alt="Công trình" className="w-40 h-40 rounded-xl object-cover shrink-0" />
                        ))}
                    </div>
                </section>
            )}

            {/* CTA đáy */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-white border-t border-border-light px-5 pt-4 pb-7">
                <button
                    onClick={openBooking}
                    className="w-full flex items-center justify-center gap-2.5 h-[56px] rounded-2xl bg-primary text-white font-extrabold text-[18px] active:scale-[0.98] transition-transform"
                >
                    <Icon name="event_available" size={24} color="white" />
                    Đặt lịch / Liên hệ thợ
                </button>
            </div>
        </div>
    );
};

export default PublicProfileView;
