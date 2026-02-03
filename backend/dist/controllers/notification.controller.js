"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
class NotificationController {
    static async getAll(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const { page, limit, skip } = (0, pagination_1.getPagination)(req.query.page, req.query.limit);
            const filters = {
                unreadOnly: req.query.unreadOnly === 'true',
                page,
                limit,
                skip,
            };
            const { notifications, total, unreadCount } = await notification_service_1.NotificationService.getByUser(req.user.userId, filters);
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
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const notification = await notification_service_1.NotificationService.markAsRead(req.params.id, req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, { notification }, 'Notification marked as read');
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const count = await notification_service_1.NotificationService.markAllAsRead(req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, { markedCount: count }, 'All notifications marked as read');
        }
        catch (error) {
            next(error);
        }
    }
    static async getUnreadCount(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const count = await notification_service_1.NotificationService.getUnreadCount(req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, { unreadCount: count });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map