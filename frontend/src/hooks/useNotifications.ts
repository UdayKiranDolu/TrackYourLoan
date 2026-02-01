import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notification.api';
import { Notification, Pagination } from '../types';

interface UseNotificationsOptions {
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await notificationApi.getAll({
                unreadOnly: options.unreadOnly,
                page: options.page,
                limit: options.limit,
            });

            setNotifications(response.data);
            setUnreadCount(response.unreadCount);
            setPagination(response.pagination);
        } catch (err) {
            setError('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, [options.unreadOnly, options.page, options.limit]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        await notificationApi.markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) =>
                n._id === id ? { ...n, readAt: new Date().toISOString() } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await notificationApi.markAllAsRead();
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        pagination,
        isLoading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}

export function useUnreadCount() {
    const [count, setCount] = useState(0);

    const fetchCount = useCallback(async () => {
        try {
            const unreadCount = await notificationApi.getUnreadCount();
            setCount(unreadCount);
        } catch {
            // Ignore errors
        }
    }, []);

    useEffect(() => {
        fetchCount();

        // Poll every 60 seconds
        const interval = setInterval(fetchCount, 60000);
        return () => clearInterval(interval);
    }, [fetchCount]);

    return { count, refetch: fetchCount };
}