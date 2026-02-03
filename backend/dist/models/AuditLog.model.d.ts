import { Document, Types } from 'mongoose';
import { AuditAction } from '../types';
export interface IAuditLog extends Document {
    _id: Types.ObjectId;
    actorUserId: Types.ObjectId;
    action: AuditAction;
    targetType: 'USER' | 'LOAN';
    targetId: Types.ObjectId;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
export declare const AuditLog: import("mongoose").Model<IAuditLog, {}, {}, {}, Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditLog.model.d.ts.map