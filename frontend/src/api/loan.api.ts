import api from './axios';
import {
    Loan,
    LoanFormData,
    LoanHistory,
    DashboardStats,
    PaginatedResponse,
    LoanStatus,
} from '../types';

interface LoanFilters {
    status?: LoanStatus;
    search?: string;
    page?: number;
    limit?: number;
}

export const loanApi = {
    getDashboard: async () => {
        const response = await api.get<{ success: boolean; data: DashboardStats }>(
            '/loans/dashboard'
        );
        return response.data.data;
    },

    getAll: async (filters: LoanFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<PaginatedResponse<Loan>>(
            `/loans?${params.toString()}`
        );
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{
            success: boolean;
            data: { loan: Loan; history: LoanHistory[] };
        }>(`/loans/${id}`);
        return response.data.data;
    },

    create: async (data: LoanFormData) => {
        const response = await api.post<{ success: boolean; data: { loan: Loan } }>(
            '/loans',
            data
        );
        return response.data.data.loan;
    },

    update: async (id: string, data: Partial<LoanFormData>) => {
        const response = await api.patch<{ success: boolean; data: { loan: Loan } }>(
            `/loans/${id}`,
            data
        );
        return response.data.data.loan;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/loans/${id}`);
        return response.data;
    },

    markCompleted: async (id: string) => {
        const response = await api.patch<{ success: boolean; data: { loan: Loan } }>(
            `/loans/${id}/complete`
        );
        return response.data.data.loan;
    },

    getHistory: async (id: string) => {
        const response = await api.get<{
            success: boolean;
            data: { history: LoanHistory[] };
        }>(`/loans/${id}/history`);
        return response.data.data.history;
    },
};