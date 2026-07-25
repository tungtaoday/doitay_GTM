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
    /** Thợ đã đồng ý chia sẻ/đồng bộ hồ sơ lên chợ thợ doitay.vn */
    syncConsent?: boolean;
    /** Đã xuất bản lên doitay: id company thật + trạng thái duyệt */
    companyId?: number;
    reviewStatus?: 'pending' | 'live';
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
// Dịch vụ gợi ý THEO NGHỀ — dropdown bảng giá ăn theo chuyên môn thợ đã chọn.
export const SERVICES_BY_TRADE: Record<string, string[]> = {
    'Thợ Điện': ['Sửa chập / mất điện', 'Lắp đèn, ổ cắm, công tắc', 'Lắp quạt trần / quạt hút', 'Đi dây điện nổi / âm tường', 'Lắp tủ điện, aptomat', 'Sửa bình nóng lạnh'],
    'Thợ Nước': ['Sửa rò rỉ ống nước', 'Thông tắc cống / bồn cầu', 'Lắp vòi, chậu rửa', 'Lắp bồn cầu, thiết bị vệ sinh', 'Lắp máy bơm nước', 'Đi đường ống mới'],
    'Thợ Điều Hòa': ['Vệ sinh điều hòa', 'Bơm gas điều hòa', 'Lắp đặt điều hòa mới', 'Tháo / di dời điều hòa', 'Sửa điều hòa không mát', 'Bảo dưỡng định kỳ'],
    'Thợ Xây Dựng': ['Xây, trát tường', 'Sửa chữa cải tạo nhà', 'Chống thấm tường / sân thượng', 'Đổ bê tông', 'Lát nền'],
    'Thợ Sơn': ['Sơn tường trong nhà (m²)', 'Sơn ngoại thất (m²)', 'Bả matit (m²)', 'Xử lý chống thấm, nấm mốc'],
    'Thợ Mộc': ['Đóng tủ, kệ theo yêu cầu', 'Sửa cửa gỗ, bản lề', 'Lắp sàn gỗ', 'Đánh vecni / sơn PU'],
    'Thợ Ốp Lát': ['Ốp lát gạch nền (m²)', 'Ốp tường, nhà vệ sinh (m²)', 'Xử lý gạch bong rộp'],
    'Thợ Hàn': ['Hàn cửa sắt, lan can', 'Làm khung mái tôn', 'Hàn sửa đồ inox', 'Làm khung sắt theo yêu cầu'],
    'Thợ Vệ Sinh': ['Tổng vệ sinh nhà (gói)', 'Vệ sinh sofa, nệm, rèm', 'Vệ sinh kính, mặt tiền'],
    'Thợ Sửa Chữa Tổng Hợp': ['Sửa chữa vặt trong nhà', 'Lắp đặt thiết bị gia dụng', 'Khoan tường, treo kệ / tranh', 'Sửa khóa, bản lề cửa'],
};

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
