import axios, { AxiosInstance } from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';
import { setupMockAdapter } from './mockAdapter';

const API_1_URL = import.meta.env.VITE_API_1_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const authApi: AxiosInstance = axios.create({
    baseURL: API_1_URL,
    headers: {
        'Content-Type': 'application/json',
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

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await authApi.post('/auth/login', credentials);
        const authResponse = response.data;

        // Store token and user in localStorage
        localStorage.setItem('auth_token', authResponse.token);
        localStorage.setItem('auth_user', JSON.stringify(authResponse.user));

        return authResponse;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await authApi.post('/auth/register', data);
        const authResponse = response.data;

        // Store token and user in localStorage
        localStorage.setItem('auth_token', authResponse.token);
        localStorage.setItem('auth_user', JSON.stringify(authResponse.user));

        return authResponse;
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
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('auth_user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Failed to parse user data:', error);
            return null;
        }
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};
