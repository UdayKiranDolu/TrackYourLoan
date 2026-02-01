import api from './axios';
import { LoginCredentials, RegisterCredentials, User } from '../types';

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: 'USER' | 'ADMIN';
        forcePasswordReset: boolean;
    };
}

export const authApi = {
    register: async (credentials: RegisterCredentials) => {
        const response = await api.post<{ success: boolean; data: AuthResponse }>(
            '/auth/register',
            credentials
        );
        return response.data.data;
    },

    login: async (credentials: LoginCredentials) => {
        const response = await api.post<{ success: boolean; data: AuthResponse }>(
            '/auth/login',
            credentials
        );
        return response.data.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    refresh: async (refreshToken: string) => {
        const response = await api.post<{
            success: boolean;
            data: { accessToken: string; refreshToken: string };
        }>('/auth/refresh', { refreshToken });
        return response.data.data;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await api.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get<{ success: boolean; data: { user: User } }>(
            '/auth/profile'
        );
        return response.data.data.user;
    },
};