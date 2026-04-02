import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { ProfileInput } from './pages/ProfileInput';
import { ProfileView } from './pages/ProfileView';
import { HomePage } from './pages/HomePage';
import { TipsPage } from './pages/TipsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { QRShareModal } from './components/QRShareModal';
import { Icon } from './components/Icon';
import { UserProfile, ProjectImage } from './types';
import logoIcon from './assets/logo-icon.png';
import './css/app.css';

type AppScreen = 'welcome' | 'input' | 'home' | 'profile' | 'tips' | 'admin';

const AppContent: React.FC = () => {
    const { user, setUser, isLoading } = useUser();
    const [currentScreen, setCurrentScreen] = useState<AppScreen | null>(null);
    const [portfolioImages, setPortfolioImages] = useState<ProjectImage[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [adminTapCount, setAdminTapCount] = useState(0);

    // Initialize screen based on user state AFTER loading
    useEffect(() => {
        if (!isLoading) {
            if (user) {
                setCurrentScreen('home'); // Go to home dashboard when logged in
                // Load portfolio images from localStorage
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

    // Secret admin access: tap 5 times on logo
    useEffect(() => {
        if (adminTapCount >= 5) {
            setCurrentScreen('admin');
            setAdminTapCount(0);
        }
        const timer = setTimeout(() => setAdminTapCount(0), 2000);
        return () => clearTimeout(timer);
    }, [adminTapCount]);

    // Show loading while determining initial screen
    if (isLoading || currentScreen === null) {
        return (
            <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center">
                <div className="text-center flex flex-col items-center">
                    <div
                        className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-5 cursor-pointer"
                        onClick={() => setAdminTapCount(prev => prev + 1)}
                    >
                        <img src={logoIcon} alt="Logo" className="w-14 h-14 object-contain" />
                    </div>
                    <h1 className="text-xl font-black mb-4 text-slate-800 tracking-tight">DOITAY.VN</h1>
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm font-medium">Đang tải cấu hình...</p>
                    {adminTapCount > 0 && (
                        <p className="text-xs text-slate-400 mt-3">{5 - adminTapCount} taps to admin</p>
                    )}
                </div>
            </div>
        );
    }

    const handleGetStarted = () => {
        setCurrentScreen('input');
    };

    const handleFormSubmit = (profile: UserProfile, images: ProjectImage[]) => {
        console.log('Form submitted:', profile, images);
        setUser(profile);
        setPortfolioImages(images);
        localStorage.setItem('portfolioImages', JSON.stringify(images));
        setCurrentScreen('home');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${user?.displayName} - ${user?.jobTitle}`,
                    text: `Xem hồ sơ của ${user?.displayName} - ${user?.jobTitle} tại ${user?.location?.district}, ${user?.location?.city}`,
                    url: `https://doitay.vn/tho/${user?.uid}`,
                });
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            try {
                await navigator.clipboard.writeText(`https://doitay.vn/tho/${user?.uid}`);
                alert('Đã sao chép link hồ sơ!');
            } catch (err) {
                alert('Tính năng chia sẻ qua Zalo sẽ hoạt động đầy đủ khi deploy lên Zalo Mini App!');
            }
        }
        setShowQRModal(false);
    };

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('portfolioImages');
        // Reset state
        setUser(null);
        setPortfolioImages([]);
        setCurrentScreen('welcome');
    };

    // Render based on current screen
    switch (currentScreen) {
        case 'welcome':
            return (
                <>
                    <WelcomeScreen
                        onGetStarted={handleGetStarted}
                        onLogoTap={() => setAdminTapCount(prev => prev + 1)}
                    />
                    {adminTapCount > 0 && adminTapCount < 5 && (
                        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                            {5 - adminTapCount} taps to admin
                        </div>
                    )}
                </>
            );

        case 'input':
            return (
                <ProfileInput
                    initialData={user || undefined}
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
                        onContact={() => alert('Liên hệ qua Zalo!')}
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
            return (
                <TipsPage
                    onBack={() => setCurrentScreen('home')}
                />
            );

        case 'admin':
            return (
                <AdminDashboard
                    onBack={() => setCurrentScreen(user ? 'home' : 'welcome')}
                />
            );

        default:
            return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <AppContent />
        </UserProvider>
    );
};

export default App;
