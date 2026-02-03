import { Types } from 'mongoose';
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
export declare class AuditService {
    static log(params: AuditLogParams): Promise<void>;
    static getByTarget(targetType: 'USER' | 'LOAN', targetId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../models").IAuditLog, {}, {}> & import("../models").IAuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    static getByActor(actorUserId: string, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../models").IAuditLog, {}, {}> & import("../models").IAuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    static getRecent(limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../models").IAuditLog, {}, {}> & import("../models").IAuditLog & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
export {};
//# sourceMappingURL=audit.service.d.ts.map