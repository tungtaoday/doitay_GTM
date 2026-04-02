import React from 'react';
import { UserProfile } from '../types';
import { Icon } from './Icon';

interface ShareModalProps {
    profile: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onShareZalo?: () => void;
    onCopyLink?: () => void;
    onDownloadQR?: () => void;
    onPrint?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    profile,
    isOpen,
    onClose,
    onShareZalo,
    onCopyLink,
    onDownloadQR,
    onPrint,
}) => {
    if (!isOpen) return null;

    const profileUrl = `https://doitay.vn/u/${profile.displayName.toLowerCase().replace(/\s+/g, '-')}`;

    const handleShareZalo = () => {
        // Open Zalo share - fallback to native share
        if (navigator.share) {
            navigator.share({
                title: `Hồ sơ ${profile.displayName}`,
                text: `Xem hồ sơ thợ ${profile.jobTitle} - ${profile.displayName}`,
                url: profileUrl,
            });
        }
        onShareZalo?.();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            alert('Đã sao chép liên kết!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        onCopyLink?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center font-display">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col max-h-[90vh] relative z-20">
                {/* Handle bar */}
                <div className="w-full flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Icon name="close" size={24} />
                </button>

                {/* Profile Info Header */}
                <div className="px-6 pt-2 pb-6 text-center border-b border-gray-100">
                    <div className="relative mx-auto w-20 h-20 mb-3">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            {profile.avatarUrl ? (
                                <img
                                    alt="Profile Avatar"
                                    className="w-full h-full object-cover"
                                    src={profile.avatarUrl}
                                />
                            ) : (
                                <span className="text-3xl font-bold text-primary">
                                    {profile.displayName.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2>
                    <p className="text-sm text-gray-500">{profile.jobTitle} • doitay.vn</p>

                    {/* QR Code */}
                    <div className="mt-4 bg-white p-3 rounded-xl shadow-inner border border-gray-100 inline-block">
                        <div className="size-24 flex items-center justify-center">
                            <Icon name="qr_code_2" size={80} color="#d1d5db" />
                        </div>
                    </div>
                </div>

                {/* Share Options Grid */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    <button
                        onClick={handleShareZalo}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-2 shadow-lg shadow-blue-200">
                            <span className="font-bold text-white text-lg">Z</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Gửi qua Zalo</span>
                    </button>

                    <button
                        onClick={handleCopyLink}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-2 shadow-lg shadow-orange-100">
                            <Icon name="content_copy" size={24} color="white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600">Sao chép liên kết</span>
                    </button>

                    <button
                        onClick={onDownloadQR}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2 shadow-lg shadow-green-100">
                            <Icon name="qr_code_scanner" size={24} color="white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-green-600">Tải mã QR</span>
                    </button>

                    <button
                        onClick={onPrint}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-100">
                            <Icon name="print" size={24} color="white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600">In danh thiếp</span>
                    </button>
                </div>

                {/* Footer with URL */}
                <div className="p-6 pt-0 mt-auto">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <Icon name="link" size={16} color="#9ca3af" />
                            <span className="text-xs text-gray-500 truncate">{profileUrl}</span>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className="text-primary text-xs font-bold uppercase tracking-wide hover:underline px-2"
                        >
                            Copy
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full mt-4 bg-primary hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-[0.98]"
                    >
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
};
