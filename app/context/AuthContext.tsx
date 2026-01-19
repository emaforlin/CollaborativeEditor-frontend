
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { jwtVerify } from 'jose';

export interface JWTPayload {
    sub: string;
    name?: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
}

interface AuthContextType {
    user: JWTPayload | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<JWTPayload | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const initAuth = async () => {
            // 1. Check URL for token
            let currentToken = searchParams.get("token");

            // 2. If not in URL, check localStorage (optional, but good for persistence)
            if (!currentToken) {
                if (typeof window !== "undefined") {
                    currentToken = localStorage.getItem("auth_token");
                }
            }

            if (currentToken) {
                try {
                    // Store in localStorage if found
                    if (typeof window !== "undefined") {
                        localStorage.setItem("auth_token", currentToken);
                    }
                    setToken(currentToken);

                    // Decode token
                    // Verify and decode token using jose
                    // TODO: Replace 'your-super-secret-jwt-key-change-this-in-production' with your actual secret key or public key.
                    // WARNING: Storing a symmetric secret in the frontend is insecure. Use a public key if possible.
                    const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production');

                    try {
                        const { payload } = await jwtVerify(currentToken, secret);
                        // Cast to our JWTPayload type
                        setUser(payload as unknown as JWTPayload);
                    } catch (verifyError) {
                        console.error("Token verification failed:", verifyError);
                        throw verifyError; // Allow the outer catch block to handle it
                    }
                } catch (error) {
                    console.error("Failed to decode token:", error);
                    // Invalid token, clear it
                    setToken(null);
                    setUser(null);
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("auth_token");
                    }
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [searchParams]);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading }}>
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
