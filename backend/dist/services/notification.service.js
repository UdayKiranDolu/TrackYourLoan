"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
class NotificationService {
    static async getByUser(userId, filters) {
        const baseQuery = {
            userId: new mongoose_1.Types.ObjectId(userId),
            channel: 'IN_APP',
        };
        const query = filters.unreadOnly
            ? { ...baseQuery, readAt: null }
            : baseQuery;
        const [notifications, total, unreadCount] = await Promise.all([
            models_1.Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit)
                .populate('loanId', 'borrowerName actualAmount'),
            models_1.Notification.countDocuments(query),
            models_1.Notification.countDocuments({ ...baseQuery, readAt: null }),
        ]);
        return { notifications, total, unreadCount };
    }
    static async markAsRead(notificationId, userId) {
        const notification = await models_1.Notification.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(notificationId),
            userId: new mongoose_1.Types.ObjectId(userId),
            channel: 'IN_APP',
        }, { readAt: new Date() }, { new: true });
        if (!notification) {
            throw new errorHandler_middleware_1.AppError('Notification not found', 404);
        }
        return notification;
    }
    static async markAllAsRead(userId) {
        const result = await models_1.Notification.updateMany({
            userId: new mongoose_1.Types.ObjectId(userId),
            channel: 'IN_APP',
            readAt: null,
        }, { readAt: new Date() });
        return result.modifiedCount;
    }
    static async getUnreadCount(userId) {
        return models_1.Notification.countDocuments({
            userId: new mongoose_1.Types.ObjectId(userId),
            channel: 'IN_APP',
            readAt: null,
        });
    }
    static async create(data) {
        return models_1.Notification.create({
            userId: new mongoose_1.Types.ObjectId(data.userId),
            loanId: data.loanId ? new mongoose_1.Types.ObjectId(data.loanId) : undefined,
            type: data.type,
            channel: data.channel,
            title: data.title,
            message: data.message,
            emailStatus: data.channel === 'EMAIL' ? 'PENDING' : undefined,
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map