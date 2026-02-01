import { useState, useEffect, useCallback } from 'react';
import { loanApi } from '../api/loan.api';
import { Loan, DashboardStats, LoanStatus, Pagination } from '../types';

interface UseLoansOptions {
    status?: LoanStatus;
    search?: string;
    page?: number;
    limit?: number;
}

export function useLoans(options: UseLoansOptions = {}) {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLoans = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await loanApi.getAll({
                status: options.status,
                search: options.search,
                page: options.page,
                limit: options.limit,
            });

            setLoans(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setError('Failed to load loans');
            console.error('Error fetching loans:', err);
        } finally {
            setIsLoading(false);
        }
    }, [options.status, options.search, options.page, options.limit]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    return {
        loans,
        pagination,
        isLoading,
        error,
        refetch: fetchLoans,
    };
}

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await loanApi.getDashboard();
            setStats(data);
        } catch (err) {
            setError('Failed to load dashboard');
            console.error('Error fetching dashboard:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        isLoading,
        error,
        refetch: fetchStats,
    };
}