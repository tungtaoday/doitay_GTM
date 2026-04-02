import React, { useState, useRef } from 'react';
import { UserProfile, SKILL_OPTIONS, JOB_TITLES, CITIES, HANOI_DISTRICTS, ProjectImage } from '../types';
import { SkillBadge } from '../components/SkillBadge';
import { PortfolioUploader } from '../components/PortfolioUploader';

interface ProfileFormProps {
    initialData?: Partial<UserProfile>;
    onSubmit: (data: UserProfile, portfolioImages: ProjectImage[]) => void;
    onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        displayName: '',
        jobTitle: '',
        skills: [],
        location: { city: 'Hà Nội', district: '' },
        experienceYears: 1,
        bio: '',
        avatarUrl: '',
        ...initialData,
    });

    const [portfolioImages, setPortfolioImages] = useState<ProjectImage[]>([]);
    const [showSkillPicker, setShowSkillPicker] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationChange = (field: 'city' | 'district', value: string) => {
        setFormData(prev => ({
            ...prev,
            location: { ...prev.location!, [field]: value },
        }));
    };

    const addSkill = (skill: string) => {
        if (!formData.skills?.includes(skill)) {
            handleChange('skills', [...(formData.skills || []), skill]);
        }
        setShowSkillPicker(false);
    };

    const removeSkill = (skill: string) => {
        handleChange('skills', formData.skills?.filter(s => s !== skill) || []);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('avatarUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData: UserProfile = {
            uid: initialData?.uid || `user_${Date.now()}`,
            displayName: formData.displayName || '',
            jobTitle: formData.jobTitle || '',
            skills: formData.skills || [],
            location: formData.location || { city: '', district: '' },
            experienceYears: formData.experienceYears || 0,
            bio: formData.bio || '',
            avatarUrl: formData.avatarUrl,
            isVerified: false,
        };
        onSubmit(finalData, portfolioImages);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
                <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative cursor-pointer"
                >
                    {formData.avatarUrl ? (
                        <img
                            src={formData.avatarUrl}
                            alt="Avatar"
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-xl">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-secondary rounded-full p-2 shadow-lg">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                </div>
                <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
                <p className="text-sm text-gray-500 mt-2">Nhấn để thêm ảnh đại diện</p>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    placeholder="VD: Anh Minh Thợ Điện"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                />
            </div>

            {/* Job Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nghề nghiệp <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                    required
                >
                    <option value="">Chọn nghề...</option>
                    {JOB_TITLES.map(job => (
                        <option key={job} value={job}>{job}</option>
                    ))}
                </select>
            </div>

            {/* Experience */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số năm kinh nghiệm
                </label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="30"
                        value={formData.experienceYears}
                        onChange={(e) => handleChange('experienceYears', parseInt(e.target.value))}
                        className="flex-1"
                    />
                    <span className="text-lg font-bold text-primary w-16 text-center">
                        {formData.experienceYears} năm
                    </span>
                </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                    <select
                        value={formData.location?.city}
                        onChange={(e) => handleLocationChange('city', e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-sm"
                    >
                        {CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                    <select
                        value={formData.location?.district}
                        onChange={(e) => handleLocationChange('district', e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white text-sm"
                    >
                        <option value="">Chọn quận...</option>
                        {HANOI_DISTRICTS.map(district => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Skills */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kỹ năng chuyên môn
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills?.map(skill => (
                        <SkillBadge
                            key={skill}
                            skill={skill}
                            removable
                            onRemove={() => removeSkill(skill)}
                        />
                    ))}
                </div>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowSkillPicker(!showSkillPicker)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Thêm kỹ năng
                    </button>
                    {showSkillPicker && (
                        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto">
                            {SKILL_OPTIONS.filter(s => !formData.skills?.includes(s)).map(skill => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => addSkill(skill)}
                                    className="w-full px-4 py-2 text-left hover:bg-blue-50 text-sm transition-colors"
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới thiệu bản thân
                </label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="VD: Tôi có 10 năm kinh nghiệm sửa chữa điện dân dụng, làm việc tận tâm, giá cả hợp lý..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
                <p className="text-xs text-gray-400 text-right">{formData.bio?.length || 0}/200</p>
            </div>

            {/* Portfolio */}
            <PortfolioUploader
                images={portfolioImages}
                onImagesChange={setPortfolioImages}
            />

            {/* Submit */}
            <div className="pt-4 space-y-3">
                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                    ✨ Tạo Hồ Sơ Pro
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                )}
            </div>
        </form>
    );
};
