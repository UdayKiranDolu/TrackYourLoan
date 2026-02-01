import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler.middleware';

export class NotificationController {
    static async getAll(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const { page, limit, skip } = getPagination(
                req.query.page as string,
                req.query.limit as string
            );

            const filters = {
                unreadOnly: req.query.unreadOnly === 'true',
                page,
                limit,
                skip,
            };

            const { notifications, total, unreadCount } =
                await NotificationService.getByUser(req.user.userId, filters);

            res.status(200).json({
                success: true,
                data: notifications,
                unreadCount,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async markAsRead(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const notification = await NotificationService.markAsRead(
                req.params.id,
                req.user.userId
            );

            sendSuccess(res, { notification }, 'Notification marked as read');
        } catch (error) {
            next(error);
        }
    }

    static async markAllAsRead(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const count = await NotificationService.markAllAsRead(req.user.userId);

            sendSuccess(res, { markedCount: count }, 'All notifications marked as read');
        } catch (error) {
            next(error);
        }
    }

    static async getUnreadCount(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const count = await NotificationService.getUnreadCount(req.user.userId);

            sendSuccess(res, { unreadCount: count });
        } catch (error) {
            next(error);
        }
    }
}