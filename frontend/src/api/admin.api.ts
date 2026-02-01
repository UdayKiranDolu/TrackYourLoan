import api from './axios';
import {
    User,
    Loan,
    LoanHistory,
    AdminDashboardStats,
    UserWithStats,
    PaginatedResponse,
    LoanStatus,
} from '../types';

interface UserFilters {
    search?: string;
    page?: number;
    limit?: number;
}

interface AdminLoanFilters {
    userId?: string;
    status?: LoanStatus;
    search?: string;
    page?: number;
    limit?: number;
}

export const adminApi = {
    // Dashboard
    getDashboard: async () => {
        const response = await api.get<{ success: boolean; data: AdminDashboardStats }>(
            '/admin/dashboard'
        );
        return response.data.data;
    },

    // Users
    getUsers: async (filters: UserFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<PaginatedResponse<User>>(
            `/admin/users?${params.toString()}`
        );
        return response.data;
    },

    getUserById: async (id: string) => {
        const response = await api.get<{ success: boolean; data: UserWithStats }>(
            `/admin/users/${id}`
        );
        return response.data.data;
    },

    updateUser: async (
        id: string,
        data: { role?: 'USER' | 'ADMIN'; forcePasswordReset?: boolean }
    ) => {
        const response = await api.patch<{ success: boolean; data: { user: User } }>(
            `/admin/users/${id}`,
            data
        );
        return response.data.data.user;
    },

    resetPassword: async (id: string, tempPassword: string) => {
        const response = await api.post(`/admin/users/${id}/reset-password`, {
            tempPassword,
        });
        return response.data;
    },

    impersonate: async (id: string) => {
        const response = await api.post<{
            success: boolean;
            data: { accessToken: string; user: Partial<User> };
        }>(`/admin/users/${id}/impersonate`);
        return response.data.data;
    },

    stopImpersonation: async () => {
        const response = await api.post<{
            success: boolean;
            data: { accessToken: string; user: Partial<User> };
        }>('/admin/stop-impersonation');
        return response.data.data;
    },

    // Loans
    getAllLoans: async (filters: AdminLoanFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.userId) params.append('userId', filters.userId);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<PaginatedResponse<Loan>>(
            `/admin/loans?${params.toString()}`
        );
        return response.data;
    },

    getLoanById: async (id: string) => {
        const response = await api.get<{
            success: boolean;
            data: { loan: Loan; history: LoanHistory[]; owner: { email: string } };
        }>(`/admin/loans/${id}`);
        return response.data.data;
    },

    updateLoan: async (id: string, data: Partial<Loan>) => {
        const response = await api.patch<{ success: boolean; data: { loan: Loan } }>(
            `/admin/loans/${id}`,
            data
        );
        return response.data.data.loan;
    },

    deleteLoan: async (id: string) => {
        const response = await api.delete(`/admin/loans/${id}`);
        return response.data;
    },

    // Exports
    downloadAllLoansCSV: async (filters: { userId?: string; status?: LoanStatus } = {}) => {
        const params = new URLSearchParams();
        if (filters.userId) params.append('userId', filters.userId);
        if (filters.status) params.append('status', filters.status);

        const response = await api.get(`/admin/export/loans/csv?${params.toString()}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `all_loans_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    downloadAllLoansPDF: async (filters: { userId?: string; status?: LoanStatus } = {}) => {
        const params = new URLSearchParams();
        if (filters.userId) params.append('userId', filters.userId);
        if (filters.status) params.append('status', filters.status);

        const response = await api.get(`/admin/export/loans/pdf?${params.toString()}`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `all_loans_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};