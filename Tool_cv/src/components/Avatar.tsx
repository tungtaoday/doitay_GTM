import React from 'react';

interface AvatarProps {
    src?: string;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isVerified?: boolean;
}

const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl',
};

export const Avatar: React.FC<AvatarProps> = ({
    src,
    name,
    size = 'md',
    isVerified = false
}) => {
    const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative inline-block">
            {src ? (
                <img
                    src={src}
                    alt={name}
                    className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white shadow-lg`}
                />
            ) : (
                <div
                    className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold border-4 border-white shadow-lg`}
                >
                    {initials}
                </div>
            )}
            {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
        </div>
    );
};
