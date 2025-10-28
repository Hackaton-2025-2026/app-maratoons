import axios, { AxiosInstance } from 'axios';
import { ref } from 'vue';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';
import { setupMockAdapter } from './mockAdapter';
import { transformBackendUser } from './dataTransform';

const API_1_URL = import.meta.env.VITE_API_1_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const authApi: AxiosInstance = axios.create({
    baseURL: API_1_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
    },
});

// Add token to requests if it exists
authApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Initialize mock adapter if enabled
if (USE_MOCK) {
    setupMockAdapter(authApi);
}

// Reactive current user state
const currentUserRef = ref<User | null>(null);

// Initialize from localStorage
const initUser = () => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
        try {
            currentUserRef.value = JSON.parse(userStr);
        } catch (error) {
            console.error('Failed to parse user data:', error);
            currentUserRef.value = null;
        }
    } else {
        currentUserRef.value = null;
    }
};

// Initialize on module load
initUser();

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        // Backend endpoint: POST /api/users/login
        // Backend returns: { token } (no user object)
        const response = await authApi.post('/api/users/login', credentials);
        const { token } = response.data;

        // Store token in localStorage
        localStorage.setItem('auth_token', token);

        // Decode JWT to get user ID or fetch user data
        // For now, we'll fetch user data separately if needed
        // The backend might include user data in the token payload
        let user: User | null = null;

        try {
            // Attempt to decode JWT token to get user ID
            const tokenPayload = this.decodeToken(token);
            if (tokenPayload && tokenPayload.id) {
                // Fetch complete user profile from API to get current solde/points
                try {
                    const userResponse = await authApi.get(`/api/users/${tokenPayload.id}`);
                    user = transformBackendUser(userResponse.data);
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    currentUserRef.value = user; // Update reactive state
                } catch (err) {
                    console.warn('Could not fetch user profile, using token data:', err);
                    // Fallback to token payload if API call fails
                    user = transformBackendUser(tokenPayload);
                    localStorage.setItem('auth_user', JSON.stringify(user));
                    currentUserRef.value = user; // Update reactive state
                }
            }
        } catch (error) {
            console.warn('Could not decode token, user will be fetched on demand');
        }

        return {
            token,
            user: user || { id: '', name: '', email: credentials.email, role: 'user' }
        };
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        // Backend endpoint: POST /api/users/register
        // Backend returns: { user, token }
        const response = await authApi.post('/api/users/register', data);
        const backendResponse = response.data;

        // Store token in localStorage
        localStorage.setItem('auth_token', backendResponse.token);

        // Transform and store user data
        const user = transformBackendUser(backendResponse.user || backendResponse);
        localStorage.setItem('auth_user', JSON.stringify(user));

        // Update reactive state
        currentUserRef.value = user;

        return {
            token: backendResponse.token,
            user
        };
    },

    // Helper method to decode JWT token
    decodeToken(token: string): any | null {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    },

    async logout(): Promise<void> {
        // Optional: Call API to invalidate token on server
        try {
            await authApi.post('/auth/logout');
        } catch (error) {
            console.error('Logout API call failed:', error);
        }

        // Clear local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Update reactive state
        currentUserRef.value = null;
    },

    getCurrentUser(): User | null {
        return currentUserRef.value;
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    // Refresh user data from API to get latest solde/points
    async refreshUserData(): Promise<User | null> {
        const token = this.getToken();
        const currentUser = this.getCurrentUser();

        if (!token || !currentUser) {
            return null;
        }

        try {
            const userResponse = await authApi.get(`/api/users/${currentUser.id}`);
            const updatedUser = transformBackendUser(userResponse.data);
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));

            // Update reactive state
            currentUserRef.value = updatedUser;

            return updatedUser;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            return null;
        }
    }
};
