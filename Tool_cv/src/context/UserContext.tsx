import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';

interface UserContextType {
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    isLoading: boolean;
    isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for saved profile (for demo purposes)
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                setUser(JSON.parse(savedProfile));
            } catch (e) {
                console.error('Failed to parse saved profile');
            }
        }
        setIsLoading(false);
    }, []);

    const handleSetUser = (newUser: UserProfile | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('userProfile', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('userProfile');
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            setUser: handleSetUser,
            isLoading,
            isLoggedIn: !!user
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
