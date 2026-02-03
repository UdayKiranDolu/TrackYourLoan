import { IUser } from '../models';
interface UserFilters {
    search?: string;
    page: number;
    limit: number;
    skip: number;
}
export declare class AdminService {
    static getUsers(filters: UserFilters): Promise<{
        users: IUser[];
        total: number;
    }>;
    static getUserById(userId: string): Promise<{
        user: IUser;
        loanStats: {
            totalLoans: number;
            activeLoans: number;
            overdueLoans: number;
            completedLoans: number;
            totalAmount: number;
        };
    }>;
    static updateUser(userId: string, data: {
        role?: string;
        forcePasswordReset?: boolean;
    }, actorUserId: string, auditInfo?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<IUser>;
    static resetPassword(userId: string, tempPassword: string, actorUserId: string, auditInfo?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
    static impersonate(targetUserId: string, actorUserId: string, auditInfo?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        accessToken: string;
        user: Partial<IUser>;
    }>;
    static stopImpersonation(originalAdminId: string, impersonatedUserId: string, auditInfo?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        accessToken: string;
        user: Partial<IUser>;
    }>;
}
export {};
//# sourceMappingURL=admin.service.d.ts.map