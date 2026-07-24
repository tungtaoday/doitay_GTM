import React from 'react';
import { UserProfile, ProjectImage } from '../types';
import { Icon } from '../components/Icon';
import logoIcon from '../assets/logo-icon.png';

interface ProfileViewProps {
    profile: UserProfile;
    portfolioImages?: ProjectImage[];
    onShare?: () => void;
    onEdit?: () => void;
    onContact?: () => void;
    onBack?: () => void;
}

/**
 * Hồ sơ công khai (khách xem) — design "Thẻ Thợ".
 * Trung thực: điểm sao tính từ đánh giá thật, không mặc định 4.9;
 * không có trạng thái "đang online" giả. Nút Gọi to, màu xanh lá.
 */
export const ProfileView: React.FC<ProfileViewProps> = ({
    profile,
    portfolioImages = [],
    onShare,
    onEdit,
    onContact,
    onBack,
}) => {
    const displayProjects = profile.portfolioProjects && profile.portfolioProjects.length > 0
        ? profile.portfolioProjects.map((p, i) => ({
            id: p.id || `project_${i}`,
            title: p.title || `Công trình ${i + 1}`,
            beforeImage: p.beforeImage,
            afterImage: p.afterImage,
            location: [profile.location?.district, profile.location?.city].filter(Boolean).join(', '),
            image: p.afterImage || p.beforeImage || '',
        }))
        : [];

    const displayReviews = profile.customerReviews && profile.customerReviews.length > 0
        ? profile.customerReviews.map((r, i) => ({
            id: r.id || i + 1,
            name: r.customerName,
            initials: r.customerName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2),
            comment: r.comment,
            rating: r.rating,
        }))
        : [];

    // Điểm trung bình THẬT từ đánh giá — không bịa số
    const avgRating = displayReviews.length > 0
        ? (displayReviews.reduce((s, r) => s + (r.rating || 0), 0) / displayReviews.length).toFixed(1)
        : null;

    return (
        <div className="relative min-h-screen w-full max-w-[430px] mx-auto bg-paper font-display pb-[120px]">
            {/* Thanh trên */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border-light flex items-center justify-between px-4 h-16">
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
                    <img src={logoIcon} alt="Hồ Sơ Thợ" className="h-9 w-9 object-contain" />
                    <span className="font-extrabold text-[18px] tracking-tight text-navy">
                        Hồ Sơ<span className="text-primary"> Thợ</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onShare}
                        aria-label="Chia sẻ hồ sơ"
                        className="flex items-center justify-center size-11 rounded-full bg-paper text-navy active:scale-95 transition-transform"
                    >
                        <Icon name="ios_share" size={22} />
                    </button>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            aria-label="Sửa hồ sơ"
                            className="flex items-center justify-center size-11 rounded-full bg-paper text-navy active:scale-95 transition-transform"
                        >
                            <Icon name="edit" size={22} />
                        </button>
                    )}
                </div>
            </div>

            {/* Đầu hồ sơ */}
            <div className="relative flex flex-col items-center pt-8 px-5 pb-7 bg-white mb-2.5 rounded-b-3xl shadow-card">
                <div
                    className="size-32 rounded-full bg-cover bg-center border-4 border-white shadow-badge bg-navy mb-4"
                    style={profile.avatarUrl ? { backgroundImage: `url('${profile.avatarUrl}')` } : undefined}
                >
                    {!profile.avatarUrl && (
                        <div className="size-full flex items-center justify-center text-white text-[44px] font-extrabold rounded-full">
                            {profile.displayName.charAt(0)}
                        </div>
                    )}
                </div>

                <h1 className="text-[24px] font-extrabold text-navy text-center leading-tight">{profile.displayName}</h1>
                <p className="text-[16px] font-semibold text-primary mt-1">
                    {profile.jobTitle || 'Thợ chuyên nghiệp'}
                </p>
                {profile.isVerified && (
                    <div className="flex items-center gap-1.5 bg-green-soft px-3.5 py-1.5 rounded-full mt-2.5">
                        <Icon name="verified" size={18} color="#1E8849" />
                        <span className="text-green text-[14px] font-bold">Hồ sơ đã xác thực</span>
                    </div>
                )}

                {/* Số liệu */}
                <div className="flex w-full justify-between items-center px-2 py-4 bg-paper rounded-2xl mt-5">
                    <div className="flex flex-col items-center flex-1">
                        {avgRating ? (
                            <>
                                <div className="flex items-center gap-1 font-extrabold text-[19px] text-navy">
                                    <span>{avgRating}</span>
                                    <Icon name="star" size={19} color="#F5A623" />
                                </div>
                                <span className="text-[13px] text-ink/60 font-medium mt-0.5">{displayReviews.length} đánh giá</span>
                            </>
                        ) : (
                            <>
                                <span className="font-extrabold text-[19px] text-navy">Mới</span>
                                <span className="text-[13px] text-ink/60 font-medium mt-0.5">Chưa có đánh giá</span>
                            </>
                        )}
                    </div>
                    <div className="w-px h-9 bg-border-light"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="font-extrabold text-[19px] text-navy">{profile.experienceYears}+</span>
                        <span className="text-[13px] text-ink/60 font-medium mt-0.5">Năm làm nghề</span>
                    </div>
                    <div className="w-px h-9 bg-border-light"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="font-extrabold text-[19px] text-navy">{displayProjects.length}</span>
                        <span className="text-[13px] text-ink/60 font-medium mt-0.5">Công trình</span>
                    </div>
                </div>
            </div>

            {/* Bảng giá */}
            {profile.servicePrices && profile.servicePrices.length > 0 && (
                <div className="px-5 py-6 bg-white mb-2.5 shadow-card">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Icon name="payments" size={24} color="#006781" />
                        <h3 className="text-[19px] font-extrabold text-navy">Bảng giá</h3>
                    </div>
                    <div className="space-y-2.5">
                        {profile.servicePrices.map((price, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-paper">
                                <span className="text-[15px] font-medium text-ink">{price.service}</span>
                                <span className={`text-[16px] font-extrabold whitespace-nowrap ${price.minPrice === 0 && price.maxPrice === 0 ? 'text-green' : 'text-navy'}`}>
                                    {price.minPrice === 0 && price.maxPrice === 0 ? 'Miễn phí' : (
                                        <>
                                            {price.minPrice >= 1000000
                                                ? `${(price.minPrice / 1000000).toFixed(1)}tr`
                                                : `${(price.minPrice / 1000).toFixed(0)}k`}
                                            {price.maxPrice > 0 && price.maxPrice !== price.minPrice && (
                                                <> – {price.maxPrice >= 1000000
                                                    ? `${(price.maxPrice / 1000000).toFixed(1)}tr`
                                                    : `${(price.maxPrice / 1000).toFixed(0)}k`}
                                                </>
                                            )}
                                        </>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[13px] text-ink/50 mt-3">Giá tham khảo — gọi để được báo giá đúng việc.</p>
                </div>
            )}

            {/* Kỹ năng */}
            {profile.skills && profile.skills.length > 0 && (
                <div className="px-5 py-6 bg-white mb-2.5 shadow-card">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Icon name="handyman" size={24} color="#006781" />
                        <h3 className="text-[19px] font-extrabold text-navy">Việc nhận làm</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {profile.skills.map(skill => (
                            <div
                                key={skill}
                                className="flex items-center px-4 py-2.5 rounded-full bg-primary-soft text-navy text-[15px] font-semibold"
                            >
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Công trình đã làm */}
            {displayProjects.length > 0 && (
                <div className="px-5 py-6 bg-white mb-2.5 shadow-card">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Icon name="collections" size={24} color="#006781" />
                        <h3 className="text-[19px] font-extrabold text-navy">Ảnh công trình thật</h3>
                    </div>
                    <div className="flex flex-col gap-5">
                        {displayProjects.map(project => (
                            <div key={project.id} className="rounded-2xl bg-paper overflow-hidden">
                                {(project.beforeImage || project.afterImage) ? (
                                    <div className="flex gap-2 p-3 pb-0">
                                        {project.beforeImage && (
                                            <div className="flex-1 relative aspect-square rounded-xl overflow-hidden">
                                                <span className="absolute top-2 left-2 bg-navy text-white text-[12px] font-extrabold px-2.5 py-1 rounded-lg z-10">TRƯỚC</span>
                                                <img src={project.beforeImage} className="w-full h-full object-cover" alt="Ảnh trước khi làm" />
                                            </div>
                                        )}
                                        {project.afterImage && (
                                            <div className="flex-1 relative aspect-square rounded-xl overflow-hidden">
                                                <span className="absolute top-2 left-2 bg-green text-white text-[12px] font-extrabold px-2.5 py-1 rounded-lg z-10">SAU</span>
                                                <img src={project.afterImage} className="w-full h-full object-cover" alt="Ảnh sau khi làm" />
                                            </div>
                                        )}
                                    </div>
                                ) : project.image ? (
                                    <div
                                        className="h-52 w-full bg-cover bg-center"
                                        style={{ backgroundImage: `url('${project.image}')` }}
                                    />
                                ) : null}
                                <div className="p-4">
                                    <h4 className="font-extrabold text-navy text-[16px]">{project.title}</h4>
                                    {project.location ? (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-[14px] text-ink/60">
                                            <Icon name="location_on" size={16} color="#006781" />
                                            <span>{project.location}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Khách nói gì */}
            {displayReviews.length > 0 && (
                <div className="px-5 py-6 bg-white mb-4 shadow-card">
                    <div className="flex items-center gap-2.5 mb-4">
                        <Icon name="reviews" size={24} color="#006781" />
                        <h3 className="text-[19px] font-extrabold text-navy">Khách nói gì</h3>
                    </div>
                    <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 snap-x">
                        {displayReviews.map(review => (
                            <div key={review.id} className="snap-start min-w-[270px] bg-paper p-4 rounded-2xl">
                                <div className="flex items-center gap-3 mb-2.5">
                                    <div className="size-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-extrabold text-[14px]">
                                        {review.initials}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[15px] font-bold text-navy">{review.name}</span>
                                        <div className="flex gap-0.5">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <Icon key={i} name="star" size={15} color="#F5A623" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[15px] text-ink/80 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Thanh hành động đáy */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-white border-t border-border-light px-5 pt-4 pb-7">
                <div className="flex gap-3">
                    <button
                        onClick={onShare}
                        className="flex items-center justify-center gap-2 h-[56px] px-5 rounded-2xl bg-primary-soft text-primary font-bold text-[16px] active:scale-[0.98] transition-transform"
                    >
                        <Icon name="ios_share" size={22} color="#006781" />
                        Chia sẻ
                    </button>
                    <button
                        onClick={onContact}
                        className="flex-1 flex items-center justify-center gap-2.5 h-[56px] rounded-2xl bg-green text-white font-extrabold text-[18px] active:scale-[0.98] transition-transform"
                    >
                        <Icon name="call" size={24} color="white" />
                        Gọi thợ ngay
                    </button>
                </div>
            </div>
        </div>
    );
};
