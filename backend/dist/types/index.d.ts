import { Request } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
    isImpersonating?: boolean;
    originalAdminId?: string;
}
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
export type UserRole = 'USER' | 'ADMIN';
export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'COMPLETED';
export type NotificationType = 'DUE_SOON' | 'OVERDUE';
export type NotificationChannel = 'IN_APP' | 'EMAIL';
export type AuditAction = 'IMPERSONATE_START' | 'IMPERSONATE_END' | 'LOAN_CREATE' | 'LOAN_UPDATE' | 'LOAN_DELETE' | 'USER_PASSWORD_RESET' | 'USER_UPDATE';
export interface PaginationQuery {
    page?: string;
    limit?: string;
}
export interface LoanFilters extends PaginationQuery {
    status?: LoanStatus;
    search?: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map