"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
class AuditService {
    static async log(params) {
        try {
            await models_1.AuditLog.create({
                actorUserId: new mongoose_1.Types.ObjectId(params.actorUserId),
                action: params.action,
                targetType: params.targetType,
                targetId: new mongoose_1.Types.ObjectId(params.targetId),
                details: params.details || {},
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - audit logging should not break main flow
        }
    }
    static async getByTarget(targetType, targetId, limit = 50) {
        return models_1.AuditLog.find({
            targetType,
            targetId: new mongoose_1.Types.ObjectId(targetId),
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('actorUserId', 'email role');
    }
    static async getByActor(actorUserId, limit = 50) {
        return models_1.AuditLog.find({
            actorUserId: new mongoose_1.Types.ObjectId(actorUserId),
        })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
    static async getRecent(limit = 100) {
        return models_1.AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('actorUserId', 'email role');
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map