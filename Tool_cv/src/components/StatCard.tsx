import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
    return (
        <div className="flex flex-col items-center p-3 bg-white/80 backdrop-blur rounded-xl shadow-sm">
            <div className="text-secondary mb-1">{icon}</div>
            <div className="text-lg font-bold text-primary">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
};
