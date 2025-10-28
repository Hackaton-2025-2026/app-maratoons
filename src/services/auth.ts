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
    withCredentials: true, // Enable sending cookies with requests
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
        // Backend returns: { message, user } and sets httpOnly cookie
        const response = await authApi.post('/api/users/login', credentials);
        const { user: backendUser } = response.data;

        // Transform and store user data in localStorage
        const user = transformBackendUser(backendUser);
        localStorage.setItem('auth_user', JSON.stringify(user));
        currentUserRef.value = user;

        return {
            token: '', // Token is now in httpOnly cookie
            user
        };
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        // Backend endpoint: POST /api/users/register
        // Backend returns: { message, user } and sets httpOnly cookie
        const response = await authApi.post('/api/users/register', data);
        const { user: backendUser } = response.data;

        // Transform and store user data
        const user = transformBackendUser(backendUser);
        localStorage.setItem('auth_user', JSON.stringify(user));

        // Update reactive state
        currentUserRef.value = user;

        return {
            token: '', // Token is now in httpOnly cookie
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
        // Call API to clear the httpOnly cookie
        try {
            await authApi.post('/api/users/logout');
        } catch (error) {
            console.error('Logout API call failed:', error);
        }

        // Clear local storage
        localStorage.removeItem('auth_user');

        // Update reactive state
        currentUserRef.value = null;
    },

    getCurrentUser(): User | null {
        return currentUserRef.value;
    },

    isAuthenticated(): boolean {
        return !!currentUserRef.value;
    },

    // Refresh user data from API to get latest solde/points
    async refreshUserData(): Promise<User | null> {
        const currentUser = this.getCurrentUser();

        if (!currentUser) {
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
