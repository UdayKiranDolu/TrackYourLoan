import api from './axios';
import { Notification, PaginatedResponse } from '../types';

interface NotificationFilters {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}

export const notificationApi = {
    getAll: async (filters: NotificationFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.unreadOnly) params.append('unreadOnly', 'true');
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<PaginatedResponse<Notification> & { unreadCount: number }>(
            `/notifications?${params.toString()}`
        );
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get<{
            success: boolean;
            data: { unreadCount: number };
        }>('/notifications/unread-count');
        return response.data.data.unreadCount;
    },

    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },
};