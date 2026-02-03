import { ILoan } from '../models';
import { LoanStatus } from '../types';
interface CreateLoanData {
    borrowerName: string;
    actualAmount: number;
    interestAmount: number;
    givenDate: string;
    dueDate: string;
    notes?: string;
    status?: LoanStatus;
}
interface UpdateLoanData {
    borrowerName?: string;
    actualAmount?: number;
    interestAmount?: number;
    givenDate?: string;
    dueDate?: string;
    notes?: string;
    status?: LoanStatus;
}
interface LoanFilters {
    status?: LoanStatus;
    search?: string;
    page: number;
    limit: number;
    skip: number;
}
export declare class LoanService {
    static create(userId: string, data: CreateLoanData, actorUserId?: string, auditInfo?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<ILoan>;
    static findByUser(userId: string, filters: LoanFilters): Promise<{
        loans: ILoan[];
        total: number;
    }>;
    static findAll(filters: LoanFilters & {
        userId?: string;
    }): Promise<{
        loans: ILoan[];
        total: number;
    }>;
    static findById(loanId: string, userId?: string): Promise<ILoan>;
    static findByIdWithHistory(loanId: string, userId?: string): Promise<{
        loan: ILoan;
        history: any[];
    }>;
    static update(loanId: string, data: UpdateLoanData, userId: string, isAdmin?: boolean, auditInfo?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<ILoan>;
    static markCompleted(loanId: string, userId: string, isAdmin?: boolean): Promise<ILoan>;
    static delete(loanId: string, userId: string, isAdmin?: boolean, auditInfo?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void>;
    static getDashboardStats(userId: string): Promise<{
        totalLoans: number;
        activeLoans: number;
        overdueLoans: number;
        completedLoans: number;
        totalAmount: number;
        totalInterest: number;
    }>;
    static getAdminDashboardStats(): Promise<{
        totalUsers: number;
        totalLoans: number;
        activeLoans: number;
        overdueLoans: number;
        completedLoans: number;
        totalAmount: number;
        totalInterest: number;
    }>;
}
export {};
//# sourceMappingURL=loan.service.d.ts.map