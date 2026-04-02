import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Avatar } from '../components/Avatar';
import { SkillBadge } from '../components/SkillBadge';

// Mock data for demo - in production, fetch from Firebase
const MOCK_USERS: UserProfile[] = [
    {
        uid: 'demo_1',
        displayName: 'Anh Minh Thợ Điện',
        jobTitle: 'Thợ Điện',
        skills: ['Lắp đặt điện', 'Sửa chữa điện'],
        location: { city: 'Hà Nội', district: 'Cầu Giấy' },
        experienceYears: 8,
        bio: 'Thợ điện có 8 năm kinh nghiệm, làm việc uy tín.',
        isVerified: false,
    },
    {
        uid: 'demo_2',
        displayName: 'Bác Hùng Điều Hòa',
        jobTitle: 'Thợ Điều Hòa',
        skills: ['Điều hòa', 'Máy giặt', 'Tủ lạnh'],
        location: { city: 'Hà Nội', district: 'Thanh Xuân' },
        experienceYears: 12,
        bio: 'Chuyên sửa điều hòa các hãng, bảo hành 6 tháng.',
        isVerified: true,
    },
];

interface AdminDashboardProps {
    onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

    useEffect(() => {
        // Simulate loading from Firebase
        setTimeout(() => {
            // In production: fetch from Firestore
            // const usersRef = collection(db, 'users');
            // const snapshot = await getDocs(usersRef);
            setUsers(MOCK_USERS);
            setIsLoading(false);
        }, 500);
    }, []);

    const toggleVerification = (uid: string) => {
        setUsers(prev =>
            prev.map(user =>
                user.uid === uid
                    ? { ...user, isVerified: !user.isVerified }
                    : user
            )
        );
        // In production: update Firestore
        // await updateDoc(doc(db, 'users', uid), { isVerified: !currentStatus });
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'pending') return !user.isVerified;
        if (filter === 'verified') return user.isVerified;
        return true;
    });

    const pendingCount = users.filter(u => !u.isVerified).length;
    const verifiedCount = users.filter(u => u.isVerified).length;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Đang tải danh sách thợ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-primary text-white px-4 py-4 sticky top-0 z-20">
                <div className="flex items-center justify-between">
                    {onBack && (
                        <button onClick={onBack} className="p-2 -ml-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <h1 className="text-lg font-bold flex-1 text-center">🔧 Admin Dashboard</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 py-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-2xl font-bold text-primary">{users.length}</div>
                    <div className="text-xs text-gray-500">Tổng số thợ</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
                    <div className="text-xs text-gray-500">Chờ duyệt</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-500">{verifiedCount}</div>
                    <div className="text-xs text-gray-500">Đã xác thực</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 mb-4">
                <div className="flex bg-white rounded-xl p-1 shadow-sm">
                    {(['all', 'pending', 'verified'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                        </button>
                    ))}
                </div>
            </div>

            {/* User List */}
            <div className="px-4 pb-8 space-y-3">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Không có thợ nào trong danh sách này
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.uid} className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <Avatar
                                    src={user.avatarUrl}
                                    name={user.displayName}
                                    size="md"
                                    isVerified={user.isVerified}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-primary truncate">{user.displayName}</h3>
                                        {user.isVerified && (
                                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{user.jobTitle}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        📍 {user.location.district}, {user.location.city} • {user.experienceYears} năm KN
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {user.skills.slice(0, 3).map(skill => (
                                            <span key={skill} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => toggleVerification(user.uid)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${user.isVerified
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    {user.isVerified ? '❌ Bỏ xác thực' : '✓ Xác thực'}
                                </button>
                                <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                    👁 Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Note */}
            <div className="px-4 pb-8 text-center">
                <p className="text-xs text-gray-400">
                    💡 Tip: Trong giai đoạn đầu, xác thực thủ công từng thợ để đảm bảo chất lượng.
                </p>
            </div>
        </div>
    );
};
