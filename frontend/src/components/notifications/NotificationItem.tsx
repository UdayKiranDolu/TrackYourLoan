import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Notification } from '../../types';
import { formatRelative } from '../../utils/formatDate';
import { NOTIFICATION_TYPE_COLORS } from '../../utils/constants';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({
    notification,
    onMarkAsRead,
}: NotificationItemProps) {
    const isRead = !!notification.readAt;

    const getIcon = () => {
        switch (notification.type) {
            case 'OVERDUE':
                return <FiAlertCircle className="w-5 h-5 text-red-500" />;
            case 'DUE_SOON':
                return <FiClock className="w-5 h-5 text-yellow-500" />;
            default:
                return <FiAlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div
            className={`p-4 rounded-lg border transition-colors ${isRead
                    ? 'bg-white border-gray-100'
                    : 'bg-blue-50 border-blue-100'
                }`}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4
                                className={`text-sm font-medium ${isRead ? 'text-gray-700' : 'text-gray-900'
                                    }`}
                            >
                                {notification.title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {notification.message}
                            </p>
                        </div>

                        <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${NOTIFICATION_TYPE_COLORS[notification.type]
                                }`}
                        >
                            {notification.type === 'DUE_SOON' ? 'Due Soon' : 'Overdue'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-gray-400">
                            {formatRelative(notification.createdAt)}
                        </span>

                        {notification.loanId && (
                            <Link
                                to={`/loans/${notification.loanId._id}`}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View Loan
                            </Link>
                        )}

                        {!isRead && (
                            <button
                                onClick={() => onMarkAsRead(notification._id)}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            >
                                <FiCheckCircle className="w-3 h-3" />
                                Mark as read
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}