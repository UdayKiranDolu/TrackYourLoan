import { Schema, model, Document, Types } from 'mongoose';
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

const auditLogSchema = new Schema<IAuditLog>(
    {
        actorUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: [
                'IMPERSONATE_START',
                'IMPERSONATE_END',
                'LOAN_CREATE',
                'LOAN_UPDATE',
                'LOAN_DELETE',
                'USER_PASSWORD_RESET',
                'USER_UPDATE',
            ],
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            enum: ['USER', 'LOAN'],
            required: true,
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        details: {
            type: Schema.Types.Mixed,
            default: {},
        },
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);