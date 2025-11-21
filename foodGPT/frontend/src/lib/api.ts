/**
 * API Client for Dishcovery Backend
 * Handles all HTTP requests to the Flask API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface Recipe {
    title: string;
    ingredients: string[];
    instructions: string[];
    image_url: string;
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

class APIClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Get authentication token from Firebase
     */
    private async getAuthToken(): Promise<string | null> {
        if (typeof window === 'undefined') return null;

        try {
            const { auth } = await import('./firebase');
            const user = auth.currentUser;
            if (user) {
                return await user.getIdToken();
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return null;
    }

    /**
     * Make HTTP request with optional authentication
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = await this.getAuthToken();

        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log('Fetching:', `${this.baseURL}${endpoint}`);
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include', // Include cookies for session management
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            return {
                status: 'error',
                message: 'Failed to connect to server',
            };
        }
    }

    /**
     * Upload image and get recipe
     */
    async uploadRecipe(image: File): Promise<ApiResponse<Recipe>> {
        const formData = new FormData();
        formData.append('image', image);

        const token = await this.getAuthToken();
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/recipe/upload`, {
                method: 'POST',
                headers,
                body: formData,
                credentials: 'include',
            });

            return await response.json();
        } catch (error) {
            console.error('Upload failed:', error);
            return {
                status: 'error',
                message: 'Failed to upload image',
            };
        }
    }

    /**
     * Get sample recipe
     */
    async getSampleRecipe(name: string): Promise<ApiResponse<Recipe>> {
        return this.request<Recipe>(`/api/recipe/sample/${name}`);
    }

    /**
     * Get current recipe from session
     */
    async getCurrentRecipe(): Promise<ApiResponse<Recipe>> {
        return this.request<Recipe>('/api/recipe/current');
    }

    /**
     * Clear recipe from session
     */
    async clearRecipe(): Promise<ApiResponse<null>> {
        return this.request<null>('/api/recipe/clear', {
            method: 'DELETE',
        });
    }

    /**
     * Get list of available sample images
     */
    async getSamples(): Promise<ApiResponse<{ name: string; url: string }[]>> {
        return this.request('/api/samples');
    }

    /**
     * Initialize chat with recipe context
     */
    async initChat(title: string, ingredients: string[], recipe: string[]): Promise<ApiResponse<null>> {
        return this.request('/api/chat/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, ingredients, recipe }),
        });
    }

    /**
     * Send chat message
     */
    async sendChatMessage(message: string): Promise<ApiResponse<{ message: string }>> {
        return this.request('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });
    }

    /**
     * Get chat suggestions
     */
    async getChatSuggestions(): Promise<ApiResponse<{ suggestions: string[] }>> {
        return this.request('/api/chat/suggestions');
    }

    /**
     * Clear chat history
     */
    async clearChat(): Promise<ApiResponse<null>> {
        return this.request('/api/chat/clear', {
            method: 'POST',
        });
    }
}

// Export singleton instance
export const apiClient = new APIClient();

export default apiClient;
