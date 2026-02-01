export interface User {
    id: string;
    _id?: string;
    email: string;
    role: 'USER' | 'ADMIN';
    forcePasswordReset: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isImpersonating: boolean;
    originalAdminId?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
}

export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'COMPLETED';

export interface Loan {
    _id: string;
    ownerUserId: string | { _id: string; email: string };
    borrowerName: string;
    actualAmount: number;
    interestAmount: number;
    givenDate: string;
    dueDate: string;
    notes: string;
    status: LoanStatus;
    createdAt: string;
    updatedAt: string;
}

export interface LoanFormData {
    borrowerName: string;
    actualAmount: number;
    interestAmount: number;
    givenDate: string;
    dueDate: string;
    notes?: string;
    status?: LoanStatus;
}

export interface LoanChange {
    field: 'dueDate' | 'interestAmount';
    oldValue: string | number;
    newValue: string | number;
}

export interface LoanHistory {
    _id: string;
    loanId: string;
    changedByUserId: { _id: string; email: string } | string;
    changedAt: string;
    changes: LoanChange[];
    note: string;
}

export interface Notification {
    _id: string;
    userId: string;
    loanId?: {
        _id: string;
        borrowerName: string;
        actualAmount: number;
    };
    type: 'DUE_SOON' | 'OVERDUE';
    channel: 'IN_APP' | 'EMAIL';
    title: string;
    message: string;
    readAt: string | null;
    createdAt: string;
}

export interface DashboardStats {
    totalLoans: number;
    activeLoans: number;
    overdueLoans: number;
    completedLoans: number;
    totalAmount: number;
    totalInterest: number;
}

export interface AdminDashboardStats extends DashboardStats {
    totalUsers: number;
}

export interface UserWithStats {
    user: User;
    loanStats: {
        totalLoans: number;
        activeLoans: number;
        overdueLoans: number;
        completedLoans: number;
        totalAmount: number;
    };
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    details?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: Pagination;
    unreadCount?: number;
}