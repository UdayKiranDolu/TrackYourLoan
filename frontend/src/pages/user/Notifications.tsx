import React, { useState } from 'react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from '../../components/notifications/NotificationItem';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function Notifications() {
    const [page, setPage] = useState(1);
    const [unreadOnly, setUnreadOnly] = useState(false);

    const {
        notifications,
        unreadCount,
        pagination,
        isLoading,
        markAsRead,
        markAllAsRead,
    } = useNotifications({ unreadOnly, page, limit: 10 });

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        leftIcon={<FiCheckCircle className="w-4 h-4" />}
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        setUnreadOnly(false);
                        setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!unreadOnly
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => {
                        setUnreadOnly(true);
                        setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unreadOnly
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Unread
                    {unreadCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <PageLoader />
            ) : notifications.length === 0 ? (
                <EmptyState
                    icon={<FiBell className="w-8 h-8 text-gray-400" />}
                    title="No notifications"
                    description={
                        unreadOnly
                            ? "You've read all your notifications"
                            : "You don't have any notifications yet"
                    }
                />
            ) : (
                <>
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                            />
                        ))}
                    </div>

                    {pagination && (
                        <Pagination pagination={pagination} onPageChange={setPage} />
                    )}
                </>
            )}
        </div>
    );
}