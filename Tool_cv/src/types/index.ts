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

// Expanded skill options with icons
export const SKILL_OPTIONS_WITH_ICONS: { name: string; icon: string }[] = [
    // Điện
    { name: 'Điện dân dụng', icon: 'bolt' },
    { name: 'Điện công nghiệp', icon: 'factory' },
    { name: 'Điện 3 pha', icon: 'electric_bolt' },
    // Nước
    { name: 'Sửa ống nước', icon: 'water_drop' },
    { name: 'Thông tắc cống', icon: 'plumbing' },
    { name: 'Lắp bồn cầu', icon: 'bathroom' },
    // Điện lạnh
    { name: 'Điều hòa', icon: 'ac_unit' },
    { name: 'Tủ lạnh', icon: 'kitchen' },
    { name: 'Máy giặt', icon: 'local_laundry_service' },
    // Xây dựng
    { name: 'Thợ mộc', icon: 'handyman' },
    { name: 'Sơn nhà', icon: 'format_paint' },
    { name: 'Ốp lát gạch', icon: 'grid_view' },
    { name: 'Thạch cao', icon: 'dashboard' },
    { name: 'Hàn xì', icon: 'hardware' },
    // An ninh & Khác
    { name: 'Camera an ninh', icon: 'videocam' },
    { name: 'Khóa cửa', icon: 'lock' },
    { name: 'Sửa cửa cuốn', icon: 'garage' },
    { name: 'Chống thấm', icon: 'water_damage' },
    // Khác
    { name: 'Sửa TV/Màn hình', icon: 'tv' },
    { name: 'Sửa máy tính', icon: 'computer' },
    { name: 'Sửa điện thoại', icon: 'smartphone' },
    { name: 'Khác', icon: 'more_horiz' },
];

// Simple skill names list
export const SKILL_OPTIONS = SKILL_OPTIONS_WITH_ICONS.map(s => s.name);

// Job title options - expanded
export const JOB_TITLES = [
    'Thợ Điện',
    'Thợ Nước',
    'Thợ Điều Hòa',
    'Thợ Điện Lạnh',
    'Thợ Sơn',
    'Thợ Thạch Cao',
    'Thợ Mộc',
    'Thợ Hàn',
    'Thợ Camera',
    'Thợ Khóa',
    'Thợ Chống Thấm',
    'Thợ Ốp Lát',
    'Kỹ thuật viên IT',
    'Thợ Đa Năng',
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
