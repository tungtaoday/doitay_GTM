import React from 'react';

interface WatermarkBadgeProps {
    variant?: 'light' | 'dark';
    size?: 'sm' | 'md';
}

export const WatermarkBadge: React.FC<WatermarkBadgeProps> = ({
    variant = 'light',
    size = 'md'
}) => {
    const textColor = variant === 'light' ? 'text-blue-600' : 'text-white';
    const bgColor = variant === 'light' ? 'bg-blue-50/80' : 'bg-black/30';
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 ${bgColor} backdrop-blur-sm rounded-full ${textColor} ${textSize}`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Doitay.vn</span>
        </div>
    );
};

interface ProfileWatermarkProps {
    position?: 'top-right' | 'bottom-right' | 'bottom-center';
}

export const ProfileWatermark: React.FC<ProfileWatermarkProps> = ({
    position = 'bottom-center'
}) => {
    const positionClasses = {
        'top-right': 'top-2 right-2',
        'bottom-right': 'bottom-2 right-2',
        'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
    };

    return (
        <div className={`absolute ${positionClasses[position]} z-10`}>
            <WatermarkBadge variant="dark" size="sm" />
        </div>
    );
};

// QR Code with watermark overlay
interface QRCodeWithWatermarkProps {
    profileId: string;
    size?: number;
}

export const QRCodeWithWatermark: React.FC<QRCodeWithWatermarkProps> = ({
    profileId,
    size = 160
}) => {
    // Generate a simple QR-like pattern (in production, use a real QR library)
    const qrUrl = `https://doitay.vn/tho/${profileId}`;

    return (
        <div className="relative inline-block">
            <div
                className="bg-white p-3 rounded-xl shadow-lg"
                style={{ width: size, height: size }}
            >
                {/* QR Pattern Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* QR dots pattern */}
                    <div className="absolute inset-2 grid grid-cols-5 gap-1">
                        {[...Array(25)].map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-sm ${[0, 1, 2, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i)
                                        ? 'bg-white'
                                        : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                    {/* Center logo */}
                    <div className="absolute bg-white rounded-lg p-1.5 shadow-lg">
                        <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
            {/* Branding below QR */}
            <div className="text-center mt-2">
                <p className="text-xs text-gray-400">Quét để xem hồ sơ</p>
                <WatermarkBadge variant="light" size="sm" />
            </div>
        </div>
    );
};
