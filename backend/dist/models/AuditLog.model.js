"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = require("mongoose");
const auditLogSchema = new mongoose_1.Schema({
    actorUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    details: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
exports.AuditLog = (0, mongoose_1.model)('AuditLog', auditLogSchema);
//# sourceMappingURL=AuditLog.model.js.map