import { Types } from 'mongoose';
import { Notification, INotification } from '../models';
import { AppError } from '../middleware/errorHandler.middleware';

interface NotificationFilters {
    unreadOnly?: boolean;
    page: number;
    limit: number;
    skip: number;
}

export class NotificationService {
    static async getByUser(
        userId: string,
        filters: NotificationFilters
    ): Promise<{
        notifications: INotification[];
        total: number;
        unreadCount: number;
    }> {
        const baseQuery = {
            userId: new Types.ObjectId(userId),
            channel: 'IN_APP',
        };

        const query = filters.unreadOnly
            ? { ...baseQuery, readAt: null }
            : baseQuery;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit)
                .populate('loanId', 'borrowerName actualAmount'),
            Notification.countDocuments(query),
            Notification.countDocuments({ ...baseQuery, readAt: null }),
        ]);

        return { notifications, total, unreadCount };
    }

    static async markAsRead(
        notificationId: string,
        userId: string
    ): Promise<INotification> {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: new Types.ObjectId(notificationId),
                userId: new Types.ObjectId(userId),
                channel: 'IN_APP',
            },
            { readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        return notification;
    }

    static async markAllAsRead(userId: string): Promise<number> {
        const result = await Notification.updateMany(
            {
                userId: new Types.ObjectId(userId),
                channel: 'IN_APP',
                readAt: null,
            },
            { readAt: new Date() }
        );

        return result.modifiedCount;
    }

    static async getUnreadCount(userId: string): Promise<number> {
        return Notification.countDocuments({
            userId: new Types.ObjectId(userId),
            channel: 'IN_APP',
            readAt: null,
        });
    }

    static async create(data: {
        userId: string;
        loanId?: string;
        type: 'DUE_SOON' | 'OVERDUE';
        channel: 'IN_APP' | 'EMAIL';
        title: string;
        message: string;
    }): Promise<INotification> {
        return Notification.create({
            userId: new Types.ObjectId(data.userId),
            loanId: data.loanId ? new Types.ObjectId(data.loanId) : undefined,
            type: data.type,
            channel: data.channel,
            title: data.title,
            message: data.message,
            emailStatus: data.channel === 'EMAIL' ? 'PENDING' : undefined,
        });
    }
}