import { getEnv } from "./utils";

export interface Credentials {
    email: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
    };
}

export interface IAuthService {
    login(credentials: Credentials): Promise<AuthResponse>;
}

export class AuthService implements IAuthService {
    private readonly authEndpoint: string;

    constructor() {
        this.authEndpoint = getEnv("VITE_AUTH_SERVICE_ENDPOINT", "");
    }

    async login(credentials: Credentials): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.authEndpoint}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Login failed with status ${response.status}`);
            }

            const data = await response.json();
            return data as AuthResponse;
        } catch (error) {
            console.error("AuthService login error:", error);
            throw error;
        }
    }
}

export const AuthClient = new AuthService();
