import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { ProfileInput } from './pages/ProfileInput';
import { ProfileView } from './pages/ProfileView';
import { HomePage } from './pages/HomePage';
import { TipsPage } from './pages/TipsPage';
import { PublicProfileView } from './pages/PublicProfileView';
import { LegalPage, LegalDoc } from './pages/LegalPage';
import { QRShareModal } from './components/QRShareModal';
import { ToastProvider, useToast } from './components/Toast';
import { UserProfile, ProjectImage } from './types';
import { getShareText, getShareTarget, publishProfileToDoitay, getLaunchThoId } from './utils';
import logoIcon from './assets/logo-icon.png';
import './css/app.css';

type AppScreen = 'welcome' | 'input' | 'home' | 'profile' | 'tips';

const AppContent: React.FC = () => {
    const { user, setUser, isLoading } = useUser();
    const toast = useToast();
    const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
    const [portfolioImages, setPortfolioImages] = useState<ProjectImage[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);
    // Trang Điều khoản / Bảo mật — mở chồng lên màn hiện tại (giữ nguyên dữ liệu đang nhập).
    const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null);
    // Tên/ảnh lấy từ tài khoản Zalo (nếu thợ đồng ý) — điền sẵn vào form
    const [zaloPrefill, setZaloPrefill] = useState<{ displayName?: string; avatarUrl?: string } | null>(null);
    // Khách mở Mini App từ thẻ được chia sẻ (?tho=<id>) → xem hồ sơ công khai.
    const [publicThoId, setPublicThoId] = useState<number | null>(null);
    useEffect(() => { setPublicThoId(getLaunchThoId()); }, []);

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

    // Khách xem hồ sơ thợ (mở từ thẻ chia sẻ) — ưu tiên trên mọi luồng.
    if (publicThoId) {
        return <PublicProfileView companyId={publicThoId} onClose={() => setPublicThoId(null)} />;
    }

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

    const handleFormSubmit = async (profile: UserProfile, images: ProjectImage[]) => {
        // Thợ đồng ý chia sẻ → xuất bản hồ sơ lên chợ doitay (tạo company chờ duyệt).
        // Lỗi mạng/CORS → bỏ qua, thẻ vẫn dùng bình thường (QR = chat Zalo).
        let published = profile;
        if (profile.syncConsent && !profile.companyId) {
            const r = await publishProfileToDoitay({
                displayName: profile.displayName,
                phoneNumber: profile.phoneNumber,
                jobTitle: profile.jobTitle,
                location: profile.location,
                experienceYears: profile.experienceYears,
                bio: profile.bio,
                skills: profile.skills,
                servicePrices: profile.servicePrices,
                zaloId: profile.zaloId,
            });
            if (r) published = { ...profile, companyId: r.companyId, reviewStatus: r.reviewStatus };
        }
        setUser(published);
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
        const area = [user.location?.district, user.location?.city].filter(Boolean).join(', ');

        // Chưa có hồ sơ trên chợ → xuất bản NGAY (thợ đang chia sẻ = muốn khách xem được).
        let companyId = user.companyId;
        if (!companyId) {
            const r = await publishProfileToDoitay({
                displayName: user.displayName, phoneNumber: user.phoneNumber, jobTitle: user.jobTitle,
                location: user.location, experienceYears: user.experienceYears, bio: user.bio,
                skills: user.skills, servicePrices: user.servicePrices, zaloId: user.zaloId,
            });
            if (r) {
                companyId = r.companyId;
                setUser({ ...user, companyId: r.companyId, reviewStatus: r.reviewStatus });
            }
        }

        try {
            const { openShareSheet } = await import('zmp-sdk/apis');
            if (companyId) {
                // Chia sẻ chính Mini App: khách bấm mở app tại hồ sơ thợ (native Zalo).
                await openShareSheet({
                    type: 'zmp',
                    data: {
                        title: `${user.displayName} — ${user.jobTitle || 'Thợ'}`,
                        description: `Thợ ${user.jobTitle || ''}${area ? ' • ' + area : ''} — xem hồ sơ & đặt lịch`,
                        thumbnail: user.avatarUrl || '',
                        path: `?tho=${companyId}`,
                    },
                });
            } else {
                // Xuất bản thất bại (mạng/CORS/chưa khai domain) → báo rõ + gửi tạm link Zalo.
                toast('Chưa đưa được hồ sơ lên chợ — kiểm tra mạng / đã khai domain doitay.vn chưa nhé');
                await openShareSheet({ type: 'link', data: { link: getShareTarget(user), chatOnly: false } });
            }
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

    const legalOverlay = legalDoc ? (
        <LegalPage doc={legalDoc} onClose={() => setLegalDoc(null)} onSwitch={setLegalDoc} />
    ) : null;

    const renderScreen = () => {
    switch (currentScreen) {
        case 'welcome':
            return (
                <WelcomeScreen
                    onGetStarted={handleGetStarted}
                    onShowTerms={() => setLegalDoc('terms')}
                    onShowPrivacy={() => setLegalDoc('privacy')}
                />
            );

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
                    onShowTerms={() => setLegalDoc('terms')}
                    onShowPrivacy={() => setLegalDoc('privacy')}
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
                        onProfileLive={() => setUser({ ...user, reviewStatus: 'live' })}
                        onShowTerms={() => setLegalDoc('terms')}
                        onShowPrivacy={() => setLegalDoc('privacy')}
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
            return (
                <WelcomeScreen
                    onGetStarted={handleGetStarted}
                    onShowTerms={() => setLegalDoc('terms')}
                    onShowPrivacy={() => setLegalDoc('privacy')}
                />
            );
    }
    };

    return (
        <>
            {renderScreen()}
            {legalOverlay}
        </>
    );
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
