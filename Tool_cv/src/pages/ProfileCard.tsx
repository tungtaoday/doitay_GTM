import React from 'react';
import { UserProfile, ProjectImage } from '../types';
import { Avatar } from '../components/Avatar';
import { SkillBadge } from '../components/SkillBadge';
import { StatCard } from '../components/StatCard';
import { ShareButton } from '../components/ShareButton';
import { QRCodeWithWatermark, WatermarkBadge } from '../components/Watermark';

interface ProfileCardProps {
    profile: UserProfile;
    portfolioImages?: ProjectImage[];
    onShare?: () => void;
    onEdit?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
    profile,
    portfolioImages = [],
    onShare,
    onEdit,
}) => {
    const beforeImages = portfolioImages.filter(img => img.type === 'before');
    const afterImages = portfolioImages.filter(img => img.type === 'after');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-primary to-blue-700 pt-8 pb-16 px-4 rounded-b-[40px] shadow-xl relative">
                {/* Watermark Badge */}
                <div className="absolute top-3 right-3">
                    <WatermarkBadge variant="dark" size="sm" />
                </div>

                <div className="flex flex-col items-center text-center">
                    <Avatar
                        src={profile.avatarUrl}
                        name={profile.displayName}
                        size="xl"
                        isVerified={profile.isVerified}
                    />
                    <h1 className="text-2xl font-bold text-white mt-4">
                        {profile.displayName}
                    </h1>
                    <p className="text-blue-200 text-lg mt-1">
                        {profile.jobTitle}
                    </p>
                    <div className="flex items-center gap-1 text-blue-200 mt-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{profile.location.district}, {profile.location.city}</span>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="px-4 -mt-8">
                <div className="grid grid-cols-3 gap-3">
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        value={`${profile.experienceYears}`}
                        label="Năm KN"
                    />
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        }
                        value={profile.isVerified ? "✓" : "○"}
                        label={profile.isVerified ? "Đã xác thực" : "Chờ duyệt"}
                    />
                    <StatCard
                        icon={
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                        }
                        value={portfolioImages.length}
                        label="Ảnh công trình"
                    />
                </div>
            </div>

            {/* Bio Section */}
            {profile.bio && (
                <div className="px-4 mt-6">
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="font-semibold text-primary mb-2">📝 Giới thiệu</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
                    </div>
                </div>
            )}

            {/* Skills Section */}
            {profile.skills.length > 0 && (
                <div className="px-4 mt-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="font-semibold text-primary mb-3">🔧 Kỹ năng chuyên môn</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map(skill => (
                                <SkillBadge key={skill} skill={skill} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Portfolio Section */}
            {portfolioImages.length > 0 && (
                <div className="px-4 mt-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm relative">
                        <h3 className="font-semibold text-primary mb-3">📸 Công trình đã thực hiện</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Before Column */}
                            <div>
                                <div className="text-center text-xs font-medium text-red-600 bg-red-50 py-1 rounded mb-2">
                                    TRƯỚC
                                </div>
                                <div className="space-y-2">
                                    {beforeImages.map((img, idx) => (
                                        <div key={`before-${idx}`} className="relative">
                                            <img
                                                src={img.url}
                                                alt={`Before ${idx + 1}`}
                                                className="w-full h-20 object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* After Column */}
                            <div>
                                <div className="text-center text-xs font-medium text-green-600 bg-green-50 py-1 rounded mb-2">
                                    SAU
                                </div>
                                <div className="space-y-2">
                                    {afterImages.map((img, idx) => (
                                        <div key={`after-${idx}`} className="relative">
                                            <img
                                                src={img.url}
                                                alt={`After ${idx + 1}`}
                                                className="w-full h-20 object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Watermark on portfolio section */}
                        <div className="absolute bottom-2 right-2 opacity-60">
                            <WatermarkBadge variant="light" size="sm" />
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Section */}
            <div className="px-4 mt-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                    <h3 className="font-semibold text-primary mb-4">📱 QR Code Hồ Sơ</h3>
                    <div className="flex justify-center">
                        <QRCodeWithWatermark profileId={profile.uid} size={140} />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 mt-6 pb-8 space-y-3">
                <ShareButton
                    profile={profile}
                    onShare={onShare}
                />
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Chỉnh sửa hồ sơ
                    </button>
                )}
            </div>
        </div>
    );
};
