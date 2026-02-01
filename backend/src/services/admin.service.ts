import { Types } from 'mongoose';
import { User, IUser, Loan } from '../models';
import { hashPassword } from '../utils/password';
import { generateTokenPair } from '../utils/jwt';
import { JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';
import { AuditService } from './audit.service';

interface UserFilters {
    search?: string;
    page: number;
    limit: number;
    skip: number;
}

export class AdminService {
    static async getUsers(
        filters: UserFilters
    ): Promise<{ users: IUser[]; total: number }> {
        const query: any = {};

        if (filters.search) {
            query.email = { $regex: filters.search, $options: 'i' };
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-passwordHash -refreshToken')
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit),
            User.countDocuments(query),
        ]);

        return { users, total };
    }

    static async getUserById(userId: string): Promise<{
        user: IUser;
        loanStats: {
            totalLoans: number;
            activeLoans: number;
            overdueLoans: number;
            completedLoans: number;
            totalAmount: number;
        };
    }> {
        const user = await User.findById(userId).select('-passwordHash -refreshToken');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const userObjectId = new Types.ObjectId(userId);

        const [total, active, overdue, completed, amounts] = await Promise.all([
            Loan.countDocuments({ ownerUserId: userObjectId }),
            Loan.countDocuments({ ownerUserId: userObjectId, status: 'ACTIVE' }),
            Loan.countDocuments({ ownerUserId: userObjectId, status: 'OVERDUE' }),
            Loan.countDocuments({ ownerUserId: userObjectId, status: 'COMPLETED' }),
            Loan.aggregate([
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

    static async updateUser(
        userId: string,
        data: { role?: string; forcePasswordReset?: boolean },
        actorUserId: string,
        auditInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<IUser> {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const updates: any = {};
        if (data.role) updates.role = data.role;
        if (data.forcePasswordReset !== undefined)
            updates.forcePasswordReset = data.forcePasswordReset;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-passwordHash -refreshToken');

        if (!updatedUser) {
            throw new AppError('Failed to update user', 500);
        }

        await AuditService.log({
            actorUserId,
            action: 'USER_UPDATE',
            targetType: 'USER',
            targetId: userId,
            details: { updates: data },
            ...auditInfo,
        });

        return updatedUser;
    }

    static async resetPassword(
        userId: string,
        tempPassword: string,
        actorUserId: string,
        auditInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<void> {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const passwordHash = await hashPassword(tempPassword);

        user.passwordHash = passwordHash;
        user.forcePasswordReset = true;
        user.refreshToken = null; // Invalidate existing sessions
        await user.save();

        await AuditService.log({
            actorUserId,
            action: 'USER_PASSWORD_RESET',
            targetType: 'USER',
            targetId: userId,
            details: { targetEmail: user.email },
            ...auditInfo,
        });
    }

    static async impersonate(
        targetUserId: string,
        actorUserId: string,
        auditInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<{ accessToken: string; user: Partial<IUser> }> {
        const targetUser = await User.findById(targetUserId).select(
            '-passwordHash -refreshToken'
        );

        if (!targetUser) {
            throw new AppError('User not found', 404);
        }

        // Prevent impersonating other admins
        if (targetUser.role === 'ADMIN') {
            throw new AppError('Cannot impersonate admin users', 403);
        }

        // Generate token with impersonation flag
        const payload: JwtPayload = {
            userId: targetUser._id.toString(),
            email: targetUser.email,
            role: targetUser.role,
            isImpersonating: true,
            originalAdminId: actorUserId,
        };

        const { accessToken } = generateTokenPair(payload);

        await AuditService.log({
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

    static async stopImpersonation(
        originalAdminId: string,
        impersonatedUserId: string,
        auditInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<{ accessToken: string; user: Partial<IUser> }> {
        const admin = await User.findById(originalAdminId).select(
            '-passwordHash -refreshToken'
        );

        if (!admin || admin.role !== 'ADMIN') {
            throw new AppError('Admin not found', 404);
        }

        // Generate normal admin token
        const payload: JwtPayload = {
            userId: admin._id.toString(),
            email: admin.email,
            role: admin.role,
        };

        const { accessToken } = generateTokenPair(payload);

        await AuditService.log({
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