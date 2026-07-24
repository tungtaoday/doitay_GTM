// TypeScript types for the application

export interface ServicePrice {
    service: string;
    minPrice: number;
    maxPrice: number;
}

// NEW: Customer Review with verification info
export interface CustomerReview {
    id: string;
    customerName: string;
    customerPhone: string;  // Required for verification
    customerAddress: string; // Required for verification
    rating: number; // 1-5
    comment: string;
    createdAt?: Date;
}

export interface UserProfile {
    uid: string;
    zaloId?: string;
    phoneNumber?: string;
    displayName: string;
    avatarUrl?: string;
    jobTitle: string;
    skills: string[];
    location: {
        city: string;
        district: string;
    };
    experienceYears: number;
    bio: string;
    isVerified: boolean;
    servicePrices?: ServicePrice[]; // Bảng giá dịch vụ
    customerReviews?: CustomerReview[]; // NEW: Đánh giá từ khách hàng
    portfolioProjects?: PortfolioProject[]; // Dự án ảnh trước/sau
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Project {
    id: string;
    userId: string;
    title: string;
    description: string;
    images: ProjectImage[];
    completedAt?: Date;
}

export interface ProjectImage {
    url: string;
    type: 'before' | 'after';
    projectName?: string;  // Optional project name for grouping
}

// New: Portfolio Project with before/after images
export interface PortfolioProject {
    id: string;
    title: string;
    beforeImage?: string;  // URL or base64
    afterImage?: string;   // URL or base64
}

// Expanded skill options with icons matching Doitay.vn categories
export const SKILL_OPTIONS_WITH_ICONS: { name: string; icon: string }[] = [
    { name: 'Thợ Điện', icon: 'bolt' },
    { name: 'Thợ Nước', icon: 'water_drop' },
    { name: 'Thợ Xây Dựng', icon: 'hardware' },
    { name: 'Thợ Sơn', icon: 'format_paint' },
    { name: 'Thợ Mộc', icon: 'park' },
    { name: 'Thợ Điều Hòa', icon: 'ac_unit' },
    { name: 'Thợ Ốp Lát', icon: 'grid_view' },
    { name: 'Thợ Hàn', icon: 'local_fire_department' },
    { name: 'Thợ Vệ Sinh', icon: 'cleaning_services' },
    { name: 'Thợ Sửa Chữa Tổng Hợp', icon: 'home_repair_service' },
];

// Simple skill names list
export const SKILL_OPTIONS = SKILL_OPTIONS_WITH_ICONS.map(s => s.name);

// Job title options - synced with main categories
export const JOB_TITLES = [
    'Thợ Điện',
    'Thợ Nước',
    'Thợ Xây Dựng',
    'Thợ Sơn',
    'Thợ Mộc',
    'Thợ Điều Hòa',
    'Thợ Ốp Lát',
    'Thợ Hàn',
    'Thợ Vệ Sinh',
    'Thợ Sửa Chữa Tổng Hợp',
];

// Common service examples for pricing
export const COMMON_SERVICES = [
    'Sửa ống nước',
    'Thông tắc cống',
    'Lắp điều hòa',
    'Vệ sinh máy lạnh',
    'Sửa điện',
    'Lắp đèn/ổ cắm',
    'Sơn tường (m²)',
    'Lắp camera',
    'Mở khóa cửa',
    'Sửa máy giặt',
];

// Vietnam cities/provinces
export const CITIES = [
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Bình Dương',
    'Đồng Nai',
    'Khánh Hòa',
    'Quảng Ninh',
];

// Hanoi districts example
export const HANOI_DISTRICTS = [
    'Ba Đình',
    'Hoàn Kiếm',
    'Hai Bà Trưng',
    'Đống Đa',
    'Cầu Giấy',
    'Thanh Xuân',
    'Hoàng Mai',
    'Long Biên',
    'Tây Hồ',
    'Bắc Từ Liêm',
    'Nam Từ Liêm',
    'Hà Đông',
];
