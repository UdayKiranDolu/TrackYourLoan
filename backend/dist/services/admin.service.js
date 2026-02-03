"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
const audit_service_1 = require("./audit.service");
class AdminService {
    static async getUsers(filters) {
        const query = {};
        if (filters.search) {
            query.email = { $regex: filters.search, $options: 'i' };
        }
        const [users, total] = await Promise.all([
            models_1.User.find(query)
                .select('-passwordHash -refreshToken')
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit),
            models_1.User.countDocuments(query),
        ]);
        return { users, total };
    }
    static async getUserById(userId) {
        const user = await models_1.User.findById(userId).select('-passwordHash -refreshToken');
        if (!user) {
            throw new errorHandler_middleware_1.AppError('User not found', 404);
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const [total, active, overdue, completed, amounts] = await Promise.all([
            models_1.Loan.countDocuments({ ownerUserId: userObjectId }),
            models_1.Loan.countDocuments({ ownerUserId: userObjectId, status: 'ACTIVE' }),
            models_1.Loan.countDocuments({ ownerUserId: userObjectId, status: 'OVERDUE' }),
            models_1.Loan.countDocuments({ ownerUserId: userObjectId, status: 'COMPLETED' }),
            models_1.Loan.aggregate([
                { $match: { ownerUserId: userObjectId } },
                { $group: { _id: null, totalAmount: { $sum: '$actualAmount' } } },
            ]),
        ]);
        return {
            user,
            loanStats: {
                totalLoans: total,
                activeLoans: active,
                overdueLoans: overdue,
                completedLoans: completed,
                totalAmount: amounts[0]?.totalAmount || 0,
            },
        };
    }
    static async updateUser(userId, data, actorUserId, auditInfo) {
        const user = await models_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_middleware_1.AppError('User not found', 404);
        }
        const updates = {};
        if (data.role)
            updates.role = data.role;
        if (data.forcePasswordReset !== undefined)
            updates.forcePasswordReset = data.forcePasswordReset;
        const updatedUser = await models_1.User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).select('-passwordHash -refreshToken');
        if (!updatedUser) {
            throw new errorHandler_middleware_1.AppError('Failed to update user', 500);
        }
        await audit_service_1.AuditService.log({
            actorUserId,
            action: 'USER_UPDATE',
            targetType: 'USER',
            targetId: userId,
            details: { updates: data },
            ...auditInfo,
        });
        return updatedUser;
    }
    static async resetPassword(userId, tempPassword, actorUserId, auditInfo) {
        const user = await models_1.User.findById(userId);
        if (!user) {
            throw new errorHandler_middleware_1.AppError('User not found', 404);
        }
        const passwordHash = await (0, password_1.hashPassword)(tempPassword);
        user.passwordHash = passwordHash;
        user.forcePasswordReset = true;
        user.refreshToken = null; // Invalidate existing sessions
        await user.save();
        await audit_service_1.AuditService.log({
            actorUserId,
            action: 'USER_PASSWORD_RESET',
            targetType: 'USER',
            targetId: userId,
            details: { targetEmail: user.email },
            ...auditInfo,
        });
    }
    static async impersonate(targetUserId, actorUserId, auditInfo) {
        const targetUser = await models_1.User.findById(targetUserId).select('-passwordHash -refreshToken');
        if (!targetUser) {
            throw new errorHandler_middleware_1.AppError('User not found', 404);
        }
        // Prevent impersonating other admins
        if (targetUser.role === 'ADMIN') {
            throw new errorHandler_middleware_1.AppError('Cannot impersonate admin users', 403);
        }
        // Generate token with impersonation flag
        const payload = {
            userId: targetUser._id.toString(),
            email: targetUser.email,
            role: targetUser.role,
            isImpersonating: true,
            originalAdminId: actorUserId,
        };
        const { accessToken } = (0, jwt_1.generateTokenPair)(payload);
        await audit_service_1.AuditService.log({
            actorUserId,
            action: 'IMPERSONATE_START',
            targetType: 'USER',
            targetId: targetUserId,
            details: { targetEmail: targetUser.email },
            ...auditInfo,
        });
        return {
            accessToken,
            user: {
                _id: targetUser._id,
                email: targetUser.email,
                role: targetUser.role,
            },
        };
    }
    static async stopImpersonation(originalAdminId, impersonatedUserId, auditInfo) {
        const admin = await models_1.User.findById(originalAdminId).select('-passwordHash -refreshToken');
        if (!admin || admin.role !== 'ADMIN') {
            throw new errorHandler_middleware_1.AppError('Admin not found', 404);
        }
        // Generate normal admin token
        const payload = {
            userId: admin._id.toString(),
            email: admin.email,
            role: admin.role,
        };
        const { accessToken } = (0, jwt_1.generateTokenPair)(payload);
        await audit_service_1.AuditService.log({
            actorUserId: originalAdminId,
            action: 'IMPERSONATE_END',
            targetType: 'USER',
            targetId: impersonatedUserId,
            ...auditInfo,
        });
        return {
            accessToken,
            user: {
                _id: admin._id,
                email: admin.email,
                role: admin.role,
            },
        };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map