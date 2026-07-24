import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { ProfileInput } from './pages/ProfileInput';
import { ProfileView } from './pages/ProfileView';
import { HomePage } from './pages/HomePage';
import { TipsPage } from './pages/TipsPage';
import { QRShareModal } from './components/QRShareModal';
import { ToastProvider, useToast } from './components/Toast';
import { UserProfile, ProjectImage } from './types';
import { getShareText, getZaloChatUrl } from './utils';
import logoIcon from './assets/logo-icon.png';
import './css/app.css';

type AppScreen = 'welcome' | 'input' | 'home' | 'profile' | 'tips';

const AppContent: React.FC = () => {
    const { user, setUser, isLoading } = useUser();
    const toast = useToast();
    const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
    const [portfolioImages, setPortfolioImages] = useState<ProjectImage[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);
    // Tên/ảnh lấy từ tài khoản Zalo (nếu thợ đồng ý) — điền sẵn vào form
    const [zaloPrefill, setZaloPrefill] = useState<{ displayName?: string; avatarUrl?: string } | null>(null);

    // Initialize screen based on user state AFTER loading
    useEffect(() => {
        if (!isLoading) {
            if (user) {
                setCurrentScreen('home');
                const savedImages = localStorage.getItem('portfolioImages');
                if (savedImages) {
                    try {
                        setPortfolioImages(JSON.parse(savedImages));
                    } catch (e) {
                        console.error('Failed to parse portfolio images');
                    }
                }
            } else {
                setCurrentScreen('welcome');
            }
        }
    }, [isLoading, user]);

    if (isLoading || currentScreen === null) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-card flex items-center justify-center mb-5">
                        <img src={logoIcon} alt="Logo" className="w-14 h-14 object-contain" />
                    </div>
                    <h1 className="text-xl font-black mb-4 text-navy tracking-tight">HỒ SƠ THỢ</h1>
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-ink/50 text-sm font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    /**
     * Bắt đầu tạo hồ sơ: xin tên + ảnh từ tài khoản Zalo để điền sẵn
     * (danh tính do Zalo cung cấp — thợ đỡ phải gõ). Từ chối/lỗi → form trống.
     */
    const handleGetStarted = async () => {
        try {
            const { getUserInfo } = await import('zmp-sdk/apis');
            const { userInfo } = await getUserInfo({ autoRequestPermission: true });
            if (userInfo) {
                setZaloPrefill({ displayName: userInfo.name, avatarUrl: userInfo.avatar });
            }
        } catch {
            // Ngoài Zalo (trình duyệt thường) hoặc thợ từ chối — vẫn tiếp tục bình thường
        }
        setCurrentScreen('input');
    };

    const handleFormSubmit = (profile: UserProfile, images: ProjectImage[]) => {
        setUser(profile);
        setPortfolioImages(images);
        localStorage.setItem('portfolioImages', JSON.stringify(images));
        setCurrentScreen('home');
    };

    /**
     * Gửi thẻ cho khách qua Zalo: dùng share sheet CHÍNH CHỦ của Zalo Mini App.
     * Ngoài môi trường Zalo → chép lời giới thiệu vào clipboard.
     */
    const handleShare = async () => {
        if (!user) return;
        const text = getShareText(user);
        const zaloUrl = getZaloChatUrl(user.phoneNumber);
        try {
            const { openShareSheet } = await import('zmp-sdk/apis');
            await openShareSheet({
                type: 'link',
                data: {
                    link: zaloUrl || 'https://doitay.vn/tuyen-dung-tho',
                    chatOnly: false,
                },
            });
        } catch {
            try {
                await navigator.clipboard.writeText(text);
                toast('Đã chép lời giới thiệu — anh dán vào Zalo gửi khách nhé!');
            } catch {
                toast('Anh chụp màn hình thẻ gửi khách cũng được nhé!');
            }
        }
        setShowQRModal(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('portfolioImages');
        setUser(null);
        setPortfolioImages([]);
        setCurrentScreen('welcome');
    };

    switch (currentScreen) {
        case 'welcome':
            return <WelcomeScreen onGetStarted={handleGetStarted} />;

        case 'input':
            return (
                <ProfileInput
                    initialData={
                        user ||
                        (zaloPrefill
                            ? ({ displayName: zaloPrefill.displayName || '', avatarUrl: zaloPrefill.avatarUrl } as Partial<UserProfile> as UserProfile)
                            : undefined)
                    }
                    onSubmit={handleFormSubmit}
                    onBack={user ? () => setCurrentScreen('home') : undefined}
                />
            );

        case 'home':
            if (!user) {
                setCurrentScreen('welcome');
                return null;
            }
            return (
                <>
                    <HomePage
                        profile={user}
                        onShareQR={() => setShowQRModal(true)}
                        onViewProfile={() => setCurrentScreen('profile')}
                        onEditProfile={() => setCurrentScreen('input')}
                        onViewTips={() => setCurrentScreen('tips')}
                        onLogout={handleLogout}
                    />
                    {showQRModal && (
                        <QRShareModal
                            profile={user}
                            onClose={() => setShowQRModal(false)}
                            onShare={handleShare}
                        />
                    )}
                </>
            );

        case 'profile':
            if (!user) {
                setCurrentScreen('welcome');
                return null;
            }
            return (
                <>
                    <ProfileView
                        profile={user}
                        portfolioImages={portfolioImages}
                        onBack={() => setCurrentScreen('home')}
                        onShare={() => setShowQRModal(true)}
                        onEdit={() => setCurrentScreen('input')}
                        onContact={() => {
                            // Màn "khách xem": nút gọi quay số thật của thợ
                            if (user.phoneNumber) window.location.href = `tel:${user.phoneNumber}`;
                            else toast('Hồ sơ chưa có số điện thoại');
                        }}
                    />
                    {showQRModal && (
                        <QRShareModal
                            profile={user}
                            onClose={() => setShowQRModal(false)}
                            onShare={handleShare}
                        />
                    )}
                </>
            );

        case 'tips':
            return <TipsPage onBack={() => setCurrentScreen('home')} />;

        default:
            return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </UserProvider>
    );
};

export default App;
