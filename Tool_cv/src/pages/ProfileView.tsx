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

export const ProfileView: React.FC<ProfileViewProps> = ({
    profile,
    portfolioImages = [],
    onShare,
    onEdit,
    onContact,
    onBack,
}) => {
    // Chỉ sử dụng data từ user profile, không dùng mock data nữa
    const displayProjects = profile.portfolioProjects && profile.portfolioProjects.length > 0
        ? profile.portfolioProjects.map((p, i) => ({
            id: p.id || `project_${i}`,
            title: p.title || `Dự án ${i + 1}`,
            beforeImage: p.beforeImage,
            afterImage: p.afterImage,
            // For display purposes
            desc: `Dự án thực tế của ${profile.displayName}`,
            location: `${profile.location?.district || ''}, ${profile.location?.city || ''}`,
            time: 'Gần đây',
            image: p.afterImage || p.beforeImage || '',
        }))
        : [];

    const displayReviews = profile.customerReviews && profile.customerReviews.length > 0
        ? profile.customerReviews.map((r, i) => ({
            id: r.id || i + 1,
            name: r.customerName,
            initials: r.customerName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2),
            bg: ['bg-blue-100', 'bg-pink-100', 'bg-green-100', 'bg-purple-100', 'bg-yellow-100'][i % 5],
            text: ['text-blue-700', 'text-pink-700', 'text-green-700', 'text-purple-700', 'text-yellow-700'][i % 5],
            comment: `"${r.comment}"`,
            rating: r.rating,
        }))
        : [];

    return (
        <div className="relative min-h-screen w-full max-w-md mx-auto bg-[#f6f6f8] shadow-2xl overflow-hidden pb-[110px]">
            {/* Top App Bar */}
            <div className="sticky top-0 z-40 glass border-b border-gray-200 flex items-center justify-between px-4 h-16 transition-all duration-300">
                <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={onBack}>
                    <img src={logoIcon} alt="Thợ Tốt Doitay" className="h-8 w-8 object-contain" />
                    <span className="font-bold text-xl tracking-tight text-gray-900">Thợ Tốt<span className="text-primary"> Doitay</span></span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onShare}
                        className="flex items-center justify-center size-10 rounded-full bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                        title="Chia sẻ hồ sơ"
                    >
                        <Icon name="ios_share" size={20} />
                    </button>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="flex items-center justify-center size-10 rounded-full bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                        >
                            <Icon name="edit" size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Header */}
            <div className="relative flex flex-col items-center pt-8 px-6 pb-8 bg-white mb-2 shadow-sm rounded-b-3xl">
                {/* Profile Image with Status */}
                <div className="relative mb-5 group">
                    <div
                        className="size-32 rounded-full bg-cover bg-center border-[5px] border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-primary to-blue-600"
                        style={profile.avatarUrl ? { backgroundImage: `url('${profile.avatarUrl}')` } : undefined}
                    >
                        {!profile.avatarUrl && (
                            <div className="size-full flex items-center justify-center text-white text-4xl font-bold rounded-full">
                                {profile.displayName.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-green-500 border-[3px] border-white size-6 rounded-full shadow-sm animate-pulse" title="Đang online"></div>
                </div>

                {/* Name and Verification */}
                <div className="flex flex-col items-center gap-2 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 text-center leading-tight">{profile.displayName}</h1>
                    {profile.isVerified && (
                        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <Icon name="verified" size={18} color="#0068FF" />
                            <span className="text-primary text-sm font-semibold">Đã xác minh</span>
                        </div>
                    )}
                </div>

                {/* Stats Row */}
                <div className="flex w-full justify-between items-center px-4 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
                            <span>{displayReviews.length > 0 ? '4.9' : '5.0'}</span>
                            <Icon name="star" size={18} color="#eab308" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium mt-0.5">{displayReviews.length} Đánh giá</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="font-bold text-lg text-gray-900">{profile.experienceYears}+</span>
                        <span className="text-xs text-gray-500 font-medium mt-0.5">Năm KN</span>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="font-bold text-lg text-gray-900">{displayProjects.length}</span>
                        <span className="text-xs text-gray-500 font-medium mt-0.5">Dự án</span>
                    </div>
                </div>
            </div>

            {/* Service Prices Section */}
            {profile.servicePrices && profile.servicePrices.length > 0 && (
                <div className="px-5 py-6 bg-white mb-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="payments" size={24} color="#0068FF" />
                        <h3 className="text-lg font-bold text-gray-900">Bảng giá dịch vụ</h3>
                    </div>
                    <div className="space-y-3">
                        {profile.servicePrices.map((price, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-sm font-medium text-gray-700">{price.service}</span>
                                <span className="text-sm font-bold text-primary">
                                    {price.minPrice >= 1000000
                                        ? `${(price.minPrice / 1000000).toFixed(1)}tr`
                                        : `${(price.minPrice / 1000).toFixed(0)}k`}
                                    {price.maxPrice > 0 && price.maxPrice !== price.minPrice && (
                                        <> - {price.maxPrice >= 1000000
                                            ? `${(price.maxPrice / 1000000).toFixed(1)}tr`
                                            : `${(price.maxPrice / 1000).toFixed(0)}k`}
                                        </>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills Section */}
            {profile.skills && profile.skills.length > 0 && (
                <div className="px-5 py-6 bg-white mb-2 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="handyman" size={24} color="#0068FF" />
                        <h3 className="text-lg font-bold text-gray-900">Kỹ năng chính</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {profile.skills.map(skill => (
                            <div
                                key={skill}
                                className="flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-700 text-sm font-medium border border-gray-200"
                            >
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects Section */}
            {displayProjects.length > 0 && (
                <div className="px-5 py-6 bg-white mb-2 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Icon name="collections" size={24} color="#0068FF" />
                            <h3 className="text-lg font-bold text-gray-900">Dự án thực tế</h3>
                        </div>
                    </div>
                    <div className="flex flex-col gap-5">
                        {displayProjects.map(project => (
                            <div key={project.id} className="group rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all pt-1">
                                {/* Hiển thị ảnh Trước/Sau nếu có */}
                                {(project.beforeImage || project.afterImage) ? (
                                    <div className="flex gap-2 p-3 pb-0 bg-white">
                                        {project.beforeImage && (
                                            <div className="flex-1 relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                <span className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">TRƯỚC</span>
                                                <img src={project.beforeImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            </div>
                                        )}
                                        {project.afterImage && (
                                            <div className="flex-1 relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                <span className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">SAU</span>
                                                <img src={project.afterImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            </div>
                                        )}
                                    </div>
                                ) : project.image ? (
                                    <div className="relative h-52 w-full overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${project.image}')` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 text-base mb-1.5">{project.title}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{project.desc}</p>
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Icon name="location_on" size={16} color="#0068FF" />
                                            <span>{project.location}</span>
                                        </div>
                                        <span className="font-semibold text-gray-400">{project.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews Carousel */}
            {displayReviews.length > 0 && (
                <div className="px-5 py-6 bg-white mb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon name="reviews" size={24} color="#0068FF" />
                        <h3 className="text-lg font-bold text-gray-900">Đánh giá khách hàng</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                        {displayReviews.map(review => (
                            <div key={review.id} className="snap-start min-w-[280px] bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className={`size-9 rounded-full ${review.bg} flex items-center justify-center ${review.text} font-bold text-xs shadow-sm`}>
                                        {review.initials}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{review.name}</span>
                                        <div className="flex text-yellow-400 text-[10px] gap-0.5">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <Icon key={i} name="star" size={14} color="#facc15" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 italic leading-relaxed">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200 px-4 py-4 pb-6 md:absolute md:rounded-b-none">
                <div className="max-w-md mx-auto">
                    <div className="flex justify-center items-center gap-1.5 mb-3 text-xs font-medium text-green-600">
                        <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                        Đang online
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onShare}
                            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-primary text-primary bg-white hover:bg-blue-50 font-bold transition-all active:scale-[0.98]"
                        >
                            <Icon name="ios_share" size={20} color="#0068FF" />
                            Chia sẻ
                        </button>
                        <button
                            onClick={onContact}
                            className="flex-[1.5] flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white shadow-lg shadow-blue-500/30 hover:bg-[#005AEB] font-bold transition-all active:scale-[0.98]"
                        >
                            <Icon name="call" size={20} color="white" />
                            Liên hệ ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
