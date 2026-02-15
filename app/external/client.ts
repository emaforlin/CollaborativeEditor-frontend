
/**
 * Configuration for the API client
 */
export interface APIClientConfig {
    baseUrl: string;
    authHeader?: string;
    authToken?: string;
    defaultHeaders?: Record<string, string>;
}

/**
 * Base API client for making HTTP requests
 */
export class APIClient {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor(config: APIClientConfig) {
        this.baseUrl = config.baseUrl;
        this.headers = {
            "Content-Type": "application/json",
            ...config.defaultHeaders,
        };

        if (config.authHeader && config.authToken) {
            this.headers[config.authHeader] = config.authToken;
        }
    }

    /**
     * Make a request to the API
     */
    protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = { ...this.headers, ...options.headers };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorMessage = `API request failed: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Ignore JSON parse error if response body is not JSON
            }
            throw new Error(errorMessage);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }
}
