import { Types } from 'mongoose';
import { AuditLog } from '../models';
import { AuditAction } from '../types';

interface AuditLogParams {
    actorUserId: string;
    action: AuditAction;
    targetType: 'USER' | 'LOAN';
    targetId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

export class AuditService {
    static async log(params: AuditLogParams): Promise<void> {
        try {
            await AuditLog.create({
                actorUserId: new Types.ObjectId(params.actorUserId),
                action: params.action,
                targetType: params.targetType,
                targetId: new Types.ObjectId(params.targetId),
                details: params.details || {},
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - audit logging should not break main flow
        }
    }

    static async getByTarget(
        targetType: 'USER' | 'LOAN',
        targetId: string,
        limit = 50
    ) {
        return AuditLog.find({
            targetType,
            targetId: new Types.ObjectId(targetId),
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('actorUserId', 'email role');
    }

    static async getByActor(actorUserId: string, limit = 50) {
        return AuditLog.find({
            actorUserId: new Types.ObjectId(actorUserId),
        })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    static async getRecent(limit = 100) {
        return AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('actorUserId', 'email role');
    }
}