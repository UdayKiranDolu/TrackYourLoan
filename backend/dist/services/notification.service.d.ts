import { INotification } from '../models';
interface NotificationFilters {
    unreadOnly?: boolean;
    page: number;
    limit: number;
    skip: number;
}
export declare class NotificationService {
    static getByUser(userId: string, filters: NotificationFilters): Promise<{
        notifications: INotification[];
        total: number;
        unreadCount: number;
    }>;
    static markAsRead(notificationId: string, userId: string): Promise<INotification>;
    static markAllAsRead(userId: string): Promise<number>;
    static getUnreadCount(userId: string): Promise<number>;
    static create(data: {
        userId: string;
        loanId?: string;
        type: 'DUE_SOON' | 'OVERDUE';
        channel: 'IN_APP' | 'EMAIL';
        title: string;
        message: string;
    }): Promise<INotification>;
}
export {};
//# sourceMappingURL=notification.service.d.ts.map