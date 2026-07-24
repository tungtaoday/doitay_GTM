import React from 'react';
import { UserProfile } from '../types';
import { Icon } from './Icon';
import { QRCanvas } from './QRCanvas';
import { useToast } from './Toast';
import { getZaloChatUrl, getShareText } from '../utils';
import logoIcon from '../assets/logo-icon.png';

interface QRShareModalProps {
    profile: UserProfile;
    onClose: () => void;
    onShare: () => void;
}

/**
 * Modal "Gửi thẻ cho khách" — design "Thẻ Thợ".
 * QR sinh cục bộ, trỏ tới ZALO CHAT của thợ (khách quét → nhắn Zalo ngay).
 */
export const QRShareModal: React.FC<QRShareModalProps> = ({
    profile,
    onClose,
    onShare,
}) => {
    const toast = useToast();
    const zaloUrl = getZaloChatUrl(profile.phoneNumber);
    const trade = profile.jobTitle || 'Thợ chuyên nghiệp';
    const area = profile.location?.district || profile.location?.city || '';

    const copyShareText = async () => {
        try {
            await navigator.clipboard.writeText(getShareText(profile));
            toast('Đã chép. Anh dán vào tin nhắn gửi khách nhé!');
        } catch {
            toast('Không chép được — anh dùng nút Gửi qua Zalo nhé');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy/60 p-0 sm:p-4">
            <div className="bg-paper rounded-t-3xl sm:rounded-3xl p-5 pb-8 w-full max-w-sm shadow-2xl animate-sheet-up">
                {/* Đầu modal */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[19px] font-extrabold text-navy">Thẻ thợ của anh</h3>
                    <button
                        onClick={onClose}
                        aria-label="Đóng"
                        className="flex items-center justify-center size-11 rounded-full bg-white shadow-card active:scale-95 transition-transform"
                    >
                        <Icon name="close" size={24} color="#102F4B" />
                    </button>
                </div>

                {/* Tấm thẻ — đồng bộ signature */}
                <div className="relative card-navy rounded-3xl pt-8 pb-5 px-5 shadow-badge mb-5">
                    <div className="badge-hole absolute top-3 left-1/2 -translate-x-1/2"></div>

                    <div className="flex items-start justify-between mb-4 mt-1">
                        <div className="min-w-0">
                            <p className="text-[19px] font-extrabold text-white leading-tight truncate">
                                {profile.displayName}
                            </p>
                            <p className="text-[14px] font-semibold text-accent-cyan mt-0.5 truncate">
                                {trade}{area ? ` • ${area}` : ''}
                            </p>
                        </div>
                        <img src={logoIcon} alt="Logo" className="w-9 h-9 object-contain shrink-0 ml-3" />
                    </div>

                    <div className="bg-white rounded-2xl p-4 flex flex-col items-center">
                        {zaloUrl ? (
                            <>
                                <div className="relative">
                                    <QRCanvas value={zaloUrl} size={160} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white rounded-lg p-1 shadow-md">
                                            <img src={logoIcon} alt="" className="w-7 h-7 object-contain" />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[14px] font-bold text-navy text-center mt-3">
                                    Khách quét là nhắn Zalo cho anh ngay
                                </p>
                                <p className="text-[13px] font-semibold text-ink/50 mt-0.5">{profile.phoneNumber}</p>
                            </>
                        ) : (
                            <p className="text-[14px] font-semibold text-ink/60 text-center py-8">
                                Thêm số điện thoại vào hồ sơ để tạo mã QR
                            </p>
                        )}
                    </div>

                    <p className="text-center text-[12px] font-semibold tracking-wide text-white/60 mt-3.5">
                        Hồ Sơ Thợ — Tự hào thợ Việt
                    </p>
                </div>

                {/* Hành động */}
                <div className="space-y-3">
                    <button
                        onClick={onShare}
                        className="w-full flex items-center justify-center gap-2.5 h-[56px] bg-primary text-white rounded-2xl text-[17px] font-extrabold active:scale-[0.98] transition-transform"
                    >
                        <Icon name="share" size={22} color="white" />
                        Gửi qua Zalo
                    </button>
                    <button
                        onClick={copyShareText}
                        className="w-full flex items-center justify-center gap-2.5 h-[52px] bg-white text-navy rounded-2xl text-[16px] font-bold shadow-card active:scale-[0.98] transition-transform"
                    >
                        <Icon name="content_copy" size={22} color="#102F4B" />
                        Chép lời giới thiệu gửi khách
                    </button>
                </div>
            </div>
        </div>
    );
};
