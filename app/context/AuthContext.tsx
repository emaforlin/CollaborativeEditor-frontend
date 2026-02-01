import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtVerify } from 'jose';
import { useNavigate } from 'react-router';
import type { Credentials } from '@/lib/auth';
import { AuthClient } from '@/lib/auth';
import { getEnv } from '@/lib/utils';
import { logger } from '@/lib/logger';

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
    validateToken(): Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const JWT_SECRET = new TextEncoder().encode(getEnv("VITE_JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production"));

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<JWTPayload | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Helper to clear session and redirect to login
    const clearSession = () => {
        setToken(null);
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
        }
    };

    // Validate token and check expiration
    const validateToken = async (tokenToValidate: string = token || ''): Promise<boolean> => {
        if (!tokenToValidate) return false;

        try {
            const { payload } = await jwtVerify(tokenToValidate, JWT_SECRET);

            // Check if token is expired
            if (payload.exp) {
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp < now) {
                    logger.warn('Token has expired');
                    clearSession();
                    navigate('/login', { replace: true });
                    return false;
                }
            }

            return true;
        } catch (error) {
            logger.error('Token validation failed:', error);
            clearSession();
            navigate('/login', { replace: true });
            return false;
        }
    };

    const handleLogin = async (credentials: Credentials) => {
        try {
            const response = await AuthClient.login(credentials);
            const { token: newToken, user } = response;

            if (typeof window !== "undefined") {
                localStorage.setItem("auth_token", newToken);
            }
            setToken(newToken);

            try {
                const { payload } = await jwtVerify(newToken, JWT_SECRET);
                setUser(payload as unknown as JWTPayload);
            } catch (e) {
                logger.warn("Token verification failed on login, falling back to basic user data", e);
                // Fallback using the data returned by AuthService if token verification fails (e.g. dev mode mock)
                setUser({
                    sub: user.id,
                    name: user.username,
                });
            }

            return { token: newToken };
        } catch (error) {
            logger.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        clearSession();
        navigate('/login', { replace: true });
    };

    // Check for initialization and validate token
    useEffect(() => {
        const initAuth = async () => {
            let currentToken: string | null = null;

            if (typeof window !== "undefined") {
                currentToken = localStorage.getItem("auth_token");
            }

            if (currentToken) {
                try {
                    const { payload } = await jwtVerify(currentToken, JWT_SECRET);

                    // Check if token is expired
                    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                        logger.warn('Token expired during initialization');
                        clearSession();
                    } else {
                        setToken(currentToken);
                        setUser(payload as unknown as JWTPayload);
                    }
                } catch (error) {
                    logger.error("Failed to restore session:", error);
                    clearSession();
                }
            }
            setIsLoading(false);
        };
        if (typeof window !== "undefined") {
            initAuth();
        }
    }, []);

    // Monitor token expiration - check every minute
    useEffect(() => {
        if (!token || !user?.exp) return;

        const checkExpiration = () => {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = (user.exp || 0) - now;

            // If token expires in less than 1 minute or already expired
            if (timeUntilExpiry <= 60) {
                logger.warn('Token expired or expiring soon');
                clearSession();
                navigate('/login', { replace: true });
            }
        };

        // Check immediately
        checkExpiration();

        // Then check every minute
        const interval = setInterval(checkExpiration, 60000);

        return () => clearInterval(interval);
    }, [token, user, navigate]);

    // Validate token when window regains focus
    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleVisibilityChange = async () => {
            if (!document.hidden && token) {
                await validateToken(token);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login: handleLogin, logout, validateToken }}>
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
