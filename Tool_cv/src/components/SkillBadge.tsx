import React from 'react';

interface SkillBadgeProps {
    skill: string;
    onRemove?: () => void;
    removable?: boolean;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
    skill,
    onRemove,
    removable = false
}) => {
    return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-primary text-sm font-medium rounded-full border border-blue-200">
            {skill}
            {removable && onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </span>
    );
};
