'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'driver' | 'admin';
};

type AuthContextType = {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage for persisted user on mount
        const storedUser = localStorage.getItem('transitma_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('transitma_user', JSON.stringify(userData));

        // Redirect based on role
        if (userData.role === 'admin') {
            router.push('/admin/dashboard');
        } else if (userData.role === 'driver') {
            router.push('/driver/current-trip');
        } else {
            router.push('/search');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('transitma_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
