import React from 'react';
import { UserProfile } from '../types';
import { Icon } from './Icon';
import logoIcon from '../assets/logo-icon.png';

interface QRShareModalProps {
    profile: UserProfile;
    onClose: () => void;
    onShare: () => void;
}

export const QRShareModal: React.FC<QRShareModalProps> = ({
    profile,
    onClose,
    onShare,
}) => {
    // Generate QR code URL using Google Charts API
    const profileUrl = `https://doitay.vn/tho/${profile.uid}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff&color=1A237E`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Danh thiếp của bạn</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <Icon name="close" size={24} color="#6b7280" />
                    </button>
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-dashed border-slate-200 mb-5 relative overflow-hidden">
                    <div className="relative bg-white p-4 rounded-xl shadow-lg">
                        {/* Real QR Code from API */}
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-44 h-44 rounded-lg"
                            onError={(e) => {
                                // Fallback to a placeholder if API fails
                                (e.target as HTMLImageElement).src = `https://via.placeholder.com/200x200/1A237E/ffffff?text=QR`;
                            }}
                        />
                        {/* Logo overlay in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-1.5 shadow-md border border-gray-100">
                                <img src={logoIcon} alt="Doitay" className="w-7 h-7 object-contain" />
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-700 font-semibold text-center">
                        {profile.displayName}
                    </p>
                    <p className="text-xs text-slate-400">{profile.jobTitle}</p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <p className="text-slate-600 text-sm leading-relaxed text-center">
                        Chia sẻ mã QR này để khách hàng có thể dễ dàng liên hệ với bạn.
                    </p>
                    <button
                        onClick={onShare}
                        className="w-full flex items-center justify-center gap-2 h-12 bg-[#195de6] hover:bg-[#1A237E] active:bg-blue-800 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Icon name="share" size={20} color="white" />
                        <span>Chia sẻ qua Zalo</span>
                    </button>
                    <button
                        onClick={() => {
                            // Copy profile link
                            navigator.clipboard.writeText(profileUrl);
                            alert('Đã sao chép link hồ sơ!');
                        }}
                        className="w-full flex items-center justify-center gap-2 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                    >
                        <Icon name="content_copy" size={20} />
                        <span>Sao chép link</span>
                    </button>
                </div>

                {/* Footer branding */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                        Được xác thực bởi <span className="text-[#195de6] font-semibold">Doitay.vn</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
