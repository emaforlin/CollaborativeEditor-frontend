import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtVerify } from 'jose';
import type { Credentials } from '@/lib/auth';
import { AuthClient } from '@/lib/auth';

export interface JWTPayload {
    sub: string;
    name?: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
}

interface AuthContextType {
    login(credentials: Credentials): Promise<{ token: string }>;
    user: JWTPayload | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout(): void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<JWTPayload | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogin = async (credentials: Credentials) => {
        try {
            const response = await AuthClient.login(credentials);
            const { token: newToken, user } = response;

            if (typeof window !== "undefined") {
                localStorage.setItem("auth_token", newToken);
            }
            setToken(newToken);

            try {
                // TODO: Use public key in production
                // Using the same secret as in the original code for now
                const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production');
                const { payload } = await jwtVerify(newToken, secret);
                setUser(payload as unknown as JWTPayload);
            } catch (e) {
                console.warn("Token verification failed on login, falling back to basic user data", e);
                // Fallback using the data returned by AuthService if token verification fails (e.g. dev mode mock)
                setUser({
                    sub: user.id,
                    name: user.username,
                });
            }

            return { token: newToken };
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
        }
    };

    // Check for initialization
    useEffect(() => {
        const initAuth = async () => {
            let currentToken: string | null = null;

            if (!currentToken) {
                if (typeof window !== "undefined") {
                    currentToken = localStorage.getItem("auth_token");
                }
            }

            if (currentToken) {
                try {
                    const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production');
                    const { payload } = await jwtVerify(currentToken, secret);

                    if (typeof window !== "undefined") {
                        localStorage.setItem("auth_token", currentToken);
                    }
                    setToken(currentToken);
                    setUser(payload as unknown as JWTPayload);

                } catch (error) {
                    console.error("Failed to restore session:", error);
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("auth_token");
                    }
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login: handleLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
