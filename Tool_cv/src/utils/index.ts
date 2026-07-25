/**
 * Utility functions for the ThợTốt app
 */

/**
 * Format price to Vietnamese currency string
 * @param price - Price in VND
 * @returns Formatted string (e.g., "150k", "1.5tr")
 */
export const formatPrice = (price: number): string => {
    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1).replace('.0', '')}tr`;
    }
    if (price >= 1000) {
        return `${(price / 1000).toFixed(0)}k`;
    }
    return price.toString();
};

/**
 * Format price range
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Formatted range string
 */
export const formatPriceRange = (min: number, max: number): string => {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
};

/**
 * Generate initials from full name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

/**
 * Generate profile URL
 * @param profile - User profile with uid or displayName
 * @returns Full profile URL
 */
export const getProfileUrl = (profile: { uid?: string; displayName?: string }): string => {
    if (profile.uid) {
        return `https://doitay.vn/tho/${profile.uid}`;
    }
    const slug = (profile.displayName || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '-');
    return `https://doitay.vn/u/${slug}`;
};

/**
 * Validate Vietnamese phone number
 * @param phone - Phone number string
 * @returns Whether phone is valid
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    // Vietnamese mobile: 09x, 03x, 07x, 08x, 05x (10 digits)
    return /^(0[35789])\d{8}$/.test(cleaned);
};

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @returns Formatted (e.g., "0912 345 678")
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
};

/**
 * Get relative time string (Vietnamese)
 * @param date - Date to format
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
};

/**
 * Generate unique ID
 * @param prefix - Optional prefix
 * @returns Unique ID string
 */
export const generateId = (prefix = ''): string => {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object (simple implementation)
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Class name utility (similar to clsx)
 * @param classes - Class names or conditions
 * @returns Combined class string
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
    return classes.filter(Boolean).join(' ');
};

/**
 * Link Zalo chat của thợ — ĐÍCH của mã QR trên thẻ.
 * Khách quét → mở thẳng khung chat Zalo với thợ. Hoạt động NGAY, không cần
 * hồ sơ tồn tại trên web (uid cục bộ dạng user_<timestamp> KHÔNG phải id
 * trên doitay.vn — link doitay.vn/tho/<uid> cũ luôn 404).
 */
export const getZaloChatUrl = (phone?: string): string | null => {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return null;
    // 09xxxxxxxx -> 849xxxxxxxx (định dạng zalo.me chuẩn)
    const intl = digits.startsWith('0') ? '84' + digits.slice(1) : digits;
    return `https://zalo.me/${intl}`;
};

/** Nội dung tin nhắn giới thiệu thợ — dùng cho nút chia sẻ/chép. */
export const getShareText = (profile: {
    displayName: string;
    jobTitle?: string;
    phoneNumber?: string;
    location?: { city?: string; district?: string };
}): string => {
    const area = [profile.location?.district, profile.location?.city].filter(Boolean).join(', ');
    const zalo = getZaloChatUrl(profile.phoneNumber);
    return [
        `🔧 ${profile.displayName}${profile.jobTitle ? ' — ' + profile.jobTitle : ''}`,
        area ? `📍 ${area}` : '',
        profile.phoneNumber ? `📞 ${profile.phoneNumber}` : '',
        zalo ? `💬 Nhắn Zalo: ${zalo}` : '',
        '— Thẻ thợ tạo trên Hồ Sơ Thợ (doitay.vn)',
    ].filter(Boolean).join('\n');
};

/** Chỉ giữ chữ số. "100.000đ" -> "100000" */
export const digitsOnly = (v: string): string => (v || '').replace(/\D/g, '');

/** Chèn dấu chấm phân cách nghìn khi gõ. "100000" -> "100.000", "" -> "" */
export const groupThousands = (v: string): string => {
    const d = digitsOnly(v);
    return d ? Number(d).toLocaleString('vi-VN') : '';
};

// ── Kết nối chợ thợ doitay.vn ────────────────────────────────────────────────
export const DOITAY_API = 'https://doitay.vn/api/v1';
export const DOITAY_WEB = 'https://doitay.vn';

/** Xuất bản hồ sơ thợ lên doitay (tạo company pending). Trả về {companyId, reviewStatus} hoặc null. */
export const publishProfileToDoitay = async (profile: {
    displayName: string; phoneNumber?: string; jobTitle?: string;
    location?: { city?: string; district?: string }; experienceYears?: number; bio?: string;
    skills?: string[]; servicePrices?: { service: string; minPrice: number; maxPrice: number }[];
    zaloId?: string;
}): Promise<{ companyId: number; reviewStatus: 'pending' | 'live' } | null> => {
    try {
        const body = {
            name: profile.displayName,
            phone: profile.phoneNumber || '',
            nghe: profile.jobTitle || 'Thợ',
            city: profile.location?.city || '',
            district: profile.location?.district || '',
            experience: profile.experienceYears || 0,
            description: profile.bio || '',
            tags: profile.skills || [],
            services: (profile.servicePrices || []).map(sp => ({
                name: sp.service,
                unit: '',
                price: sp.maxPrice ? `${sp.minPrice.toLocaleString('vi-VN')} - ${sp.maxPrice.toLocaleString('vi-VN')}` : String(sp.minPrice),
            })),
            zalo_id: profile.zaloId || '',
        };
        const res = await fetch(`${DOITAY_API}/public/tho-profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) return null;
        const json = await res.json();
        const d = json?.data;
        if (!d?.company_id) return null;
        return { companyId: d.company_id, reviewStatus: d.is_live ? 'live' : 'pending' };
    } catch {
        return null;
    }
};

/** Kiểm tra company đã lên chợ (duyệt xong) chưa: GET công khai 200 = live. */
export const checkProfileLive = async (companyId: number): Promise<boolean> => {
    try {
        const res = await fetch(`${DOITAY_API}/public/companies/${companyId}`, { headers: { Accept: 'application/json' } });
        return res.ok;
    } catch {
        return false;
    }
};

/**
 * Đích chia sẻ/QR:
 * - Đã LIVE trên doitay → trang hồ sơ đầy đủ (ảnh/giá/đánh giá) doitay.vn/tho/<id>.
 * - Chưa → mở chat Zalo với thợ (khách vẫn liên hệ được ngay).
 */
export const getShareTarget = (profile: { companyId?: number; reviewStatus?: string; phoneNumber?: string }): string => {
    if (profile.companyId && profile.reviewStatus === 'live') {
        return `${DOITAY_WEB}/tho/${profile.companyId}`;
    }
    return getZaloChatUrl(profile.phoneNumber) || DOITAY_WEB + '/tuyen-dung-tho';
};

/** Đọc companyId từ tham số khởi chạy (khi khách mở Mini App từ thẻ được chia sẻ). */
export const getLaunchThoId = (): number | null => {
    try {
        const fromSearch = new URLSearchParams(window.location.search).get('tho');
        const hash = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const fromHash = new URLSearchParams(hash).get('tho');
        const id = Number(fromSearch || fromHash || '');
        return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
        return null;
    }
};

/** Lấy hồ sơ công khai của thợ theo id (khách xem). */
export const fetchPublicCompany = async (companyId: number): Promise<any | null> => {
    try {
        const res = await fetch(`${DOITAY_API}/public/companies/${companyId}`, { headers: { Accept: 'application/json' } });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? null;
    } catch {
        return null;
    }
};
