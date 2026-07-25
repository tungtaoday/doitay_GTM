import React, { useState, useRef } from 'react';
import { UserProfile, SKILL_OPTIONS_WITH_ICONS, COMMON_SERVICES, SERVICES_BY_TRADE, ProjectImage, ServicePrice, CustomerReview, PortfolioProject } from '../types';
import { groupThousands, digitsOnly } from '../utils';
import { Icon } from '../components/Icon';

interface ProfileInputProps {
    initialData?: Partial<UserProfile>;
    onSubmit: (data: UserProfile, portfolioImages: ProjectImage[]) => void;
    onBack?: () => void;
}

export const ProfileInput: React.FC<ProfileInputProps> = ({
    initialData,
    onSubmit,
    onBack,
}) => {
    const [step, setStep] = useState(1);
    const totalSteps = 4;
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        displayName: '',
        phoneNumber: '',
        jobTitle: '',
        skills: [],
        location: { city: 'Hà Nội', district: '' },
        experienceYears: 5,
        bio: '',
        avatarUrl: '',
        servicePrices: [],
        ...initialData,
    });
    const [portfolioImages, setPortfolioImages] = useState<ProjectImage[]>([]);
    const [syncConsent, setSyncConsent] = useState(initialData?.syncConsent ?? true);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [selectedImageType, setSelectedImageType] = useState<'before' | 'after'>('before');
    const [currentProjectName, setCurrentProjectName] = useState('');

    // Portfolio projects state (project-based) - load from initialData if available
    const [projects, setProjects] = useState<PortfolioProject[]>(
        initialData?.portfolioProjects || []
    );
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

    // Price input state
    const [newPrice, setNewPrice] = useState<ServicePrice>({
        service: '',
        minPrice: 0,
        maxPrice: 0,
    });
    const [customService, setCustomService] = useState('');

    // Customer reviews state - load from initialData if available
    const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>(
        initialData?.customerReviews || []
    );
    const [newReview, setNewReview] = useState<Partial<CustomerReview>>({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        rating: 5,
        comment: '',
    });

    const handleChange = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSkill = (skill: string) => {
        const skills = formData.skills || [];
        if (skills.includes(skill)) {
            handleChange('skills', skills.filter(s => s !== skill));
        } else {
            handleChange('skills', [...skills, skill]);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage: ProjectImage = {
                    url: reader.result as string,
                    type: selectedImageType,
                    projectName: currentProjectName || `Dự án ${portfolioImages.length + 1}`,
                };
                setPortfolioImages(prev => [...prev, newImage]);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const triggerUpload = (type: 'before' | 'after') => {
        setSelectedImageType(type);
        setTimeout(() => fileInputRef.current?.click(), 100);
    };

    const removeImage = (index: number) => {
        setPortfolioImages(prev => prev.filter((_, i) => i !== index));
    };

    // Avatar upload handler
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('avatarUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    // Project management functions
    const addProject = () => {
        const newProject: PortfolioProject = {
            id: `project_${Date.now()}`,
            title: '',
            beforeImage: undefined,
            afterImage: undefined,
        };
        setProjects(prev => [...prev, newProject]);
        setEditingProjectId(newProject.id);
    };

    const updateProjectTitle = (id: string, title: string) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, title } : p));
    };

    const removeProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const handleProjectImageUpload = (projectId: string, imageType: 'before' | 'after') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                setProjects(prev => prev.map(p => {
                    if (p.id === projectId) {
                        return imageType === 'before'
                            ? { ...p, beforeImage: imageUrl }
                            : { ...p, afterImage: imageUrl };
                    }
                    return p;
                }));
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const addServicePrice = () => {
        if (newPrice.service && newPrice.minPrice > 0) {
            const prices = formData.servicePrices || [];
            const serviceName = newPrice.service === '__custom__' ? customService.trim() : newPrice.service;
            handleChange('servicePrices', [...prices, { ...newPrice, service: serviceName }]);
            setCustomService('');
            setNewPrice({ service: '', minPrice: 0, maxPrice: 0 });
        }
    };

    const removeServicePrice = (index: number) => {
        const prices = formData.servicePrices || [];
        handleChange('servicePrices', prices.filter((_, i) => i !== index));
    };

    const addCustomerReview = () => {
        if (newReview.customerName && newReview.customerPhone && newReview.customerAddress && newReview.comment) {
            const review: CustomerReview = {
                id: `review_${Date.now()}`,
                customerName: newReview.customerName,
                customerPhone: newReview.customerPhone,
                customerAddress: newReview.customerAddress,
                rating: newReview.rating || 5,
                comment: newReview.comment,
                createdAt: new Date(),
            };
            setCustomerReviews(prev => [...prev, review]);
            setNewReview({
                customerName: '',
                customerPhone: '',
                customerAddress: '',
                rating: 5,
                comment: '',
            });
        }
    };

    const removeCustomerReview = (index: number) => {
        setCustomerReviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const finalData: UserProfile = {
            uid: initialData?.uid || `user_${Date.now()}`,
            displayName: formData.displayName || '',
            phoneNumber: formData.phoneNumber,
            jobTitle: formData.jobTitle || '',
            skills: formData.skills || [],
            location: formData.location || { city: '', district: '' },
            experienceYears: formData.experienceYears || 0,
            bio: formData.bio || '',
            avatarUrl: formData.avatarUrl,
            isVerified: false,
            syncConsent,
            servicePrices: formData.servicePrices || [],
            customerReviews: customerReviews,
            portfolioProjects: projects,
        };
        onSubmit(finalData, portfolioImages);
    };

    // Show first 8 skills or all
    const displayedSkills = showAllSkills
        ? SKILL_OPTIONS_WITH_ICONS
        : SKILL_OPTIONS_WITH_ICONS.slice(0, 8);

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)}tr`;
        }
        return `${(price / 1000).toFixed(0)}k`;
    };

    return (
        <div className="relative flex h-full min-h-screen w-full max-w-[430px] mx-auto flex-col bg-white shadow-xl overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center p-4 pb-4 justify-between sticky top-0 z-20 bg-white border-b border-gray-200">
                {onBack && (
                    <button onClick={onBack} className="text-[#1E8849] flex size-10 shrink-0 items-center justify-start">
                        <Icon name="arrow_back_ios" size={24} color="#1E8849" />
                    </button>
                )}
                <h2 className="text-navy text-[18px] font-extrabold leading-tight flex-1 text-center pr-10">
                    Làm thẻ thợ
                </h2>
            </div>

            {/* Tiến độ — chữ to, nói rõ đang ở đâu */}
            <div className="flex flex-col gap-2.5 px-5 py-4 bg-paper">
                <div className="flex justify-between items-center">
                    <p className="text-navy text-[16px] font-extrabold">
                        {step === 1 && 'Thông tin của anh'}
                        {step === 2 && 'Nghề và bảng giá'}
                        {step === 3 && 'Ảnh công việc đã làm'}
                        {step === 4 && 'Lời khen của khách cũ'}
                    </p>
                    <p className="text-ink/60 text-[14px] font-bold">Bước {step}/{totalSteps}</p>
                </div>
                <div className="flex gap-1.5">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${i < step ? 'bg-green' : 'bg-slate-200'}`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="px-5 py-6 space-y-8 flex-1 overflow-y-auto">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <>
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Icon name="person" size={24} color="#1E8849" />
                                <h3 className="text-slate-900 text-lg font-bold">Thông tin cơ bản</h3>
                            </div>
                            <div className="flex flex-col gap-5">
                                {/* Avatar Upload */}
                                <div className="flex flex-col gap-2 items-center">
                                    <label className="text-[15px] font-bold text-navy self-start">Ảnh đại diện</label>
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => avatarInputRef.current?.click()}
                                    >
                                        <div
                                            className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden"
                                        >
                                            {formData.avatarUrl ? (
                                                <img
                                                    src={formData.avatarUrl}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Icon name="person" size={48} color="#1E8849" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Icon name="camera_alt" size={28} color="white" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1E8849] flex items-center justify-center border-2 border-white shadow-md">
                                            <Icon name="edit" size={16} color="white" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">Nhấn để tải ảnh lên</p>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[15px] font-bold text-navy">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => handleChange('displayName', e.target.value)}
                                        className="w-full rounded-xl border border-border-light bg-white p-4 text-[16px] text-ink placeholder:text-slate-400 shadow-sm"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[15px] font-bold text-navy">Số điện thoại</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                                            <Icon name="call" size={20} color="#94a3b8" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber || ''}
                                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                            className="w-full rounded-xl border border-border-light bg-white pl-11 pr-4 py-4 text-[16px] text-ink placeholder:text-slate-400 shadow-sm"
                                            placeholder="0912 345 678"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[15px] font-bold text-navy">Số năm kinh nghiệm</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleChange('experienceYears', Math.max(0, (formData.experienceYears || 0) - 1))}
                                            className="w-14 h-12 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-slate-600 active:bg-slate-200 transition-colors"
                                        >
                                            <Icon name="remove" size={24} />
                                        </button>
                                        <div className="flex-1 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-200 font-bold text-lg text-[#1E8849] shadow-sm">
                                            {formData.experienceYears}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleChange('experienceYears', (formData.experienceYears || 0) + 1)}
                                            className="w-14 h-12 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-slate-600 active:bg-slate-200 transition-colors"
                                        >
                                            <Icon name="add" size={24} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* Step 2: Skills & Pricing */}
                {step === 2 && (
                    <>
                        {/* Skills Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="engineering" size={24} color="#1E8849" />
                                <h3 className="text-slate-900 text-lg font-bold">Chuyên môn dịch vụ</h3>
                            </div>
                            <p className="text-slate-500 text-xs mb-4">Chọn các lĩnh vực bạn có tay nghề tốt nhất</p>
                            <div className="grid grid-cols-2 gap-3">
                                {displayedSkills.map(skill => {
                                    const isSelected = formData.skills?.includes(skill.name);
                                    return (
                                        <div
                                            key={skill.name}
                                            onClick={() => toggleSkill(skill.name)}
                                            className={`relative flex flex-col items-center justify-center p-3 rounded-xl gap-1.5 cursor-pointer transition-all ${isSelected
                                                ? 'bg-white border-2 border-[#1E8849] shadow-sm'
                                                : 'bg-gray-50 border border-gray-200 hover:bg-white hover:border-slate-300'
                                                }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-[#1E8849] rounded-full w-5 h-5 flex items-center justify-center">
                                                    <Icon name="check" size={14} color="white" />
                                                </div>
                                            )}
                                            <Icon name={skill.icon} size={24} color={isSelected ? '#1E8849' : '#64748b'} />
                                            <span className={`text-xs font-medium text-center ${isSelected ? 'font-bold text-[#1E8849]' : 'text-slate-700'}`}>
                                                {skill.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            {!showAllSkills && (
                                <button
                                    onClick={() => setShowAllSkills(true)}
                                    className="w-full mt-3 py-2 text-sm font-semibold text-[#1E8849] hover:underline flex items-center justify-center gap-1"
                                >
                                    Xem thêm {SKILL_OPTIONS_WITH_ICONS.length - 8} kỹ năng khác
                                    <Icon name="expand_more" size={16} color="#1E8849" />
                                </button>
                            )}
                        </section>

                        {/* Pricing Section */}
                        <section className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="payments" size={24} color="#1E8849" />
                                <h3 className="text-slate-900 text-lg font-bold">Bảng giá dịch vụ</h3>
                                <span className="text-xs text-slate-400 ml-auto">(Tùy chọn)</span>
                            </div>
                            <p className="text-slate-500 text-xs mb-4">Giúp khách hàng biết trước chi phí</p>

                            {/* Existing prices */}
                            {(formData.servicePrices || []).length > 0 && (
                                <div className="flex flex-col gap-2 mb-4">
                                    {formData.servicePrices?.map((price, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{price.service}</p>
                                                <p className="text-xs text-[#1E8849] font-bold">
                                                    {formatPrice(price.minPrice)} - {formatPrice(price.maxPrice)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeServicePrice(idx)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                            >
                                                <Icon name="close" size={20} color="#ef4444" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add new price */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex flex-col gap-3">
                                    <select
                                        value={newPrice.service}
                                        onChange={(e) => setNewPrice(prev => ({ ...prev, service: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-slate-900 text-sm"
                                    >
                                        <option value="">Chọn dịch vụ...</option>
                                        {/* Gợi ý ĂN THEO chuyên môn đã chọn ở trên; chưa chọn nghề → danh sách chung */}
                                        {((formData.skills && formData.skills.length > 0)
                                            ? Array.from(new Set(formData.skills.flatMap(sk => SERVICES_BY_TRADE[sk] || [])))
                                            : COMMON_SERVICES
                                        ).map(service => (
                                            <option key={service} value={service}>{service}</option>
                                        ))}
                                        <option value="__custom__">✏️ Dịch vụ khác (tự nhập)...</option>
                                    </select>
                                    {newPrice.service === '__custom__' && (
                                        <input
                                            type="text"
                                            value={customService}
                                            onChange={(e) => setCustomService(e.target.value)}
                                            placeholder="Gõ tên dịch vụ của anh, VD: Sửa mái tôn dột"
                                            className="w-full rounded-lg border border-[#1E8849] bg-white p-3 text-slate-900 text-sm"
                                            autoFocus
                                        />
                                    )}
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-[14px] font-semibold text-ink/70 mb-1.5 block">Giá từ (VNĐ)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={newPrice.minPrice ? groupThousands(String(newPrice.minPrice)) : ''}
                                                    onChange={(e) => setNewPrice(prev => ({ ...prev, minPrice: Number(digitsOnly(e.target.value)) }))}
                                                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 pr-8 text-sm font-semibold"
                                                    placeholder="100.000"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink/40 font-medium pointer-events-none">đ</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[14px] font-semibold text-ink/70 mb-1.5 block">Đến (VNĐ)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={newPrice.maxPrice ? groupThousands(String(newPrice.maxPrice)) : ''}
                                                    onChange={(e) => setNewPrice(prev => ({ ...prev, maxPrice: Number(digitsOnly(e.target.value)) }))}
                                                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 pr-8 text-sm font-semibold"
                                                    placeholder="300.000"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink/40 font-medium pointer-events-none">đ</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={addServicePrice}
                                        disabled={!newPrice.service || newPrice.minPrice <= 0 || (newPrice.service === '__custom__' && !customService.trim())}
                                        className="w-full py-2.5 rounded-lg bg-[#1E8849] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Icon name="add" size={18} color="white" />
                                        Thêm dịch vụ
                                    </button>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {/* Step 3: Portfolio */}
                {step === 3 && (
                    <section>
                        <div className="flex items-center gap-2 mb-1">
                            <Icon name="photo_library" size={24} color="#1E8849" />
                            <h3 className="text-slate-900 text-lg font-bold">Dự án đã thực hiện</h3>
                        </div>
                        <p className="text-slate-500 text-xs mb-4">Mỗi dự án gồm: Tên + Ảnh trước + Ảnh sau. Tăng 80% độ tin tưởng!</p>

                        <div className="flex flex-col gap-4">
                            {/* Existing projects */}
                            {projects.map((project, idx) => (
                                <div key={project.id} className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                                    {/* Project header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-slate-400">DỰ ÁN {idx + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeProject(project.id)}
                                            className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                                        >
                                            <Icon name="close" size={16} color="#dc2626" />
                                        </button>
                                    </div>

                                    {/* Project title */}
                                    <input
                                        type="text"
                                        placeholder="Tên dự án (VD: Sửa điện nhà anh Nam)"
                                        value={project.title}
                                        onChange={(e) => updateProjectTitle(project.id, e.target.value)}
                                        className="w-full px-3 py-2.5 mb-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-300"
                                    />

                                    {/* Before/After images grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Before image */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-red-500 text-center">TRƯỚC</span>
                                            {project.beforeImage ? (
                                                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-red-200">
                                                    <img src={project.beforeImage} alt="Before" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setProjects(prev => prev.map(p => p.id === project.id ? { ...p, beforeImage: undefined } : p))}
                                                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                                                    >
                                                        <Icon name="close" size={14} color="white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="aspect-square rounded-lg border-2 border-dashed border-red-200 bg-red-50 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
                                                    <Icon name="add_a_photo" size={28} color="#dc2626" />
                                                    <span className="text-[10px] text-red-400 mt-1">Thêm ảnh</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleProjectImageUpload(project.id, 'before')}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {/* After image */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-green-500 text-center">SAU</span>
                                            {project.afterImage ? (
                                                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-200">
                                                    <img src={project.afterImage} alt="After" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setProjects(prev => prev.map(p => p.id === project.id ? { ...p, afterImage: undefined } : p))}
                                                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                                                    >
                                                        <Icon name="close" size={14} color="white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="aspect-square rounded-lg border-2 border-dashed border-green-200 bg-green-50 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
                                                    <Icon name="add_a_photo" size={28} color="#16a34a" />
                                                    <span className="text-[10px] text-green-400 mt-1">Thêm ảnh</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleProjectImageUpload(project.id, 'after')}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add new project button */}
                            {projects.length < 3 && (
                                <button
                                    type="button"
                                    onClick={addProject}
                                    className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                >
                                    <Icon name="add" size={24} color="#1E8849" />
                                    <span className="text-sm font-bold text-slate-600">Thêm dự án ({projects.length}/3)</span>
                                </button>
                            )}
                        </div>

                        {/* Consent Checkbox */}
                        <div className="pt-6 pb-2 flex gap-3 items-start">
                            <div className="pt-0.5">
                                <input
                                    type="checkbox"
                                    id="sync-consent"
                                    checked={syncConsent}
                                    onChange={(e) => setSyncConsent(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 bg-white text-[#1E8849] focus:ring-[#1E8849] focus:ring-offset-0"
                                />
                            </div>
                            <label className="text-sm text-slate-600 leading-tight select-none" htmlFor="sync-consent">
                                Tôi đồng ý đồng bộ thông tin với chợ thợ <span className="text-[#1E8849] font-bold">doitay.vn</span> để nhận thông báo việc làm từ khách hàng mới nhất.
                            </label>
                        </div>
                    </section>
                )}

                {/* Step 4: Customer Reviews */}
                {step === 4 && (
                    <section>
                        <div className="flex items-center gap-2 mb-1">
                            <Icon name="reviews" size={24} color="#195de6" />
                            <h3 className="text-slate-900 text-lg font-bold">Đánh giá từ khách hàng</h3>
                        </div>
                        <p className="text-slate-500 text-xs mb-4">Thêm đánh giá từ khách hàng đã sử dụng dịch vụ. Cần SĐT và địa chỉ để xác minh.</p>

                        {/* Existing reviews */}
                        {customerReviews.length > 0 && (
                            <div className="flex flex-col gap-3 mb-4">
                                {customerReviews.map((review, idx) => (
                                    <div key={review.id} className="bg-blue-50 p-4 rounded-xl border border-blue-100 relative">
                                        <button
                                            onClick={() => removeCustomerReview(idx)}
                                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full"
                                        >
                                            <Icon name="close" size={18} color="#ef4444" />
                                        </button>
                                        <div className="flex items-start gap-3">
                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {review.customerName.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-800 text-sm">{review.customerName}</span>
                                                    <div className="flex text-yellow-500">
                                                        {[...Array(review.rating)].map((_, i) => (
                                                            <Icon key={i} name="star" size={14} color="#eab308" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 italic mb-2">"{review.comment}"</p>
                                                <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Icon name="call" size={14} color="#64748b" />
                                                        <span>{review.customerPhone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Icon name="location_on" size={14} color="#64748b" />
                                                        <span>{review.customerAddress}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new review form */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Thêm đánh giá mới</h4>
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-[14px] font-semibold text-ink/70 mb-1.5 block">Tên khách hàng *</label>
                                    <input
                                        type="text"
                                        value={newReview.customerName}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, customerName: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm"
                                        placeholder="Nguyễn Văn B"
                                    />
                                </div>
                                <div>
                                    <label className="text-[14px] font-semibold text-ink/70 mb-1.5 block">Số điện thoại khách hàng * (để xác minh)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <Icon name="call" size={20} color="#94a3b8" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={newReview.customerPhone}
                                            onChange={(e) => setNewReview(prev => ({ ...prev, customerPhone: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm"
                                            placeholder="0987 654 321"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[14px] font-semibold text-ink/70 mb-1.5 block">Địa chỉ khách hàng * (để xác minh)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <Icon name="location_on" size={20} color="#94a3b8" />
                                        </div>
                                        <input
                                            type="text"
                                            value={newReview.customerAddress}
                                            onChange={(e) => setNewReview(prev => ({ ...prev, customerAddress: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm"
                                            placeholder="123 Đường ABC, Quận 1, TP.HCM"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[14px] font-semibold text-ink/70 mb-1.5 block">Đánh giá (sao)</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                className="p-2 transition-transform hover:scale-110"
                                            >
                                                <Icon
                                                    name="star"
                                                    size={32}
                                                    color={star <= (newReview.rating || 5) ? '#eab308' : '#d1d5db'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[14px] font-semibold text-ink/70 mb-1.5 block">Nội dung đánh giá *</label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                        className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm resize-none"
                                        rows={3}
                                        placeholder="Thợ làm rất kỹ, đến đúng giờ hẹn..."
                                    />
                                </div>
                                <button
                                    onClick={addCustomerReview}
                                    disabled={!newReview.customerName || !newReview.customerPhone || !newReview.customerAddress || !newReview.comment}
                                    className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Icon name="add" size={18} color="white" />
                                    Thêm đánh giá
                                </button>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-3 text-center italic">
                            * Thông tin SĐT và địa chỉ chỉ dùng để xác minh và sẽ được bảo mật
                        </p>
                    </section>
                )}
            </div>

            {/* Bottom Action */}
            <div className="mt-auto p-5 bg-white sticky bottom-0 border-t border-gray-200 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                {step < totalSteps ? (
                    <div className="flex gap-3">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex-1 flex items-center justify-center rounded-xl h-14 bg-gray-100 text-gray-700 text-base font-bold active:scale-[0.98] transition-all"
                            >
                                <Icon name="arrow_back" size={24} className="mr-2" />
                                Quay lại
                            </button>
                        )}
                        <button
                            onClick={() => setStep(step + 1)}
                            className={`${step > 1 ? 'flex-[1.4]' : 'w-full'} flex items-center justify-center rounded-xl h-14 bg-primary text-white text-[17px] font-extrabold active:scale-[0.98] transition-all shadow-lg`}
                        >
                            Tiếp tục
                            <Icon name="arrow_forward" size={24} color="white" className="ml-2" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 flex items-center justify-center rounded-xl h-14 bg-gray-100 text-gray-700 text-base font-bold active:scale-[0.98] transition-all"
                        >
                            <Icon name="arrow_back" size={24} className="mr-2" />
                            Quay lại
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-[1.4] flex items-center justify-center rounded-xl h-14 bg-green text-white text-[17px] font-extrabold active:scale-[0.98] transition-all shadow-lg"
                        >
                            Xong — tạo thẻ thợ
                            <Icon name="check" size={24} color="white" className="ml-2" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
