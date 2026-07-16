import React from 'react';

interface ShareButtonProps {
    profile: {
        displayName: string;
        jobTitle: string;
        location?: { city: string; district: string };
    };
    onShare?: () => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ profile, onShare }) => {
    const handleShare = async () => {
        const shareText = `🔧 ${profile.displayName} - ${profile.jobTitle}\n📍 ${profile.location?.district}, ${profile.location?.city}\n\n✅ Xác thực bởi Doitay.vn\n\nXem hồ sơ chi tiết:`;

        // Try Web Share API first (works on mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${profile.displayName} - Doitay Hồ Sơ Thợ`,
                    text: shareText,
                    url: window.location.href,
                });
                return;
            } catch (err) {
                // User cancelled or share failed, continue to fallback
            }
        }

        // Fallback: Open Zalo share URL (works in browser)
        const zaloShareUrl = `https://zalo.me/share?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareText)}`;

        // Try to open in new window
        const newWindow = window.open(zaloShareUrl, '_blank', 'width=600,height=400');

        if (!newWindow) {
            // If popup blocked, copy to clipboard
            try {
                await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
                alert('Đã sao chép nội dung! Dán vào Zalo để chia sẻ.');
            } catch (clipboardErr) {
                alert('Vui lòng sao chép link này để chia sẻ: ' + window.location.href);
            }
        }

        if (onShare) onShare();
    };

    return (
        <button
            onClick={handleShare}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 hover:shadow-xl transition-all active:scale-[0.98]"
        >
            {/* Zalo-style message icon */}
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.49 10.272v-.045l-.006-.012-.048.057h.054zM20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14l4 4V4a2 2 0 0 0-2-2zm-8.49 8.272l-.048.057-.006-.012v-.045h.054zm.102.018l-1.263 1.469-1.267-1.474-.001-.001L6.902 8.15l1.652 1.93 1.056 1.229.99-1.151 1.65-1.92-.001-.001-1.635-1.915-.001-.001-.001-.001L6.5 10.5l-1.5-1.75h6.112v3.54z" />
            </svg>
            Gửi cho Khách qua Zalo
        </button>
    );
};
