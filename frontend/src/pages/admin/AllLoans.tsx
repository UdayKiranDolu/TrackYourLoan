import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiDownload, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { adminApi } from '../../api/admin.api';
import { exportApi } from '../../api/export.api';
import { Loan, LoanStatus, Pagination as PaginationType } from '../../types';
import LoanCard from '../../components/loans/LoanCard';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/Modal';
import { LOAN_STATUS_OPTIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function AllLoans() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [pagination, setPagination] = useState<PaginationType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [status, setStatus] = useState<LoanStatus | ''>(
        (searchParams.get('status') as LoanStatus) || ''
    );
    const [userId, setUserId] = useState(searchParams.get('userId') || '');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLoans = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await adminApi.getAllLoans({
                search: search || undefined,
                status: status || undefined,
                userId: userId || undefined,
                page,
                limit: 12,
            });
            setLoans(response.data);
            setPagination(response.pagination);
        } catch (error) {
            toast.error('Failed to load loans');
        } finally {
            setIsLoading(false);
        }
    }, [search, status, userId, page]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    useEffect(() => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (userId) params.userId = userId;
        if (page > 1) params.page = page.toString();
        setSearchParams(params);
    }, [search, status, userId, page, setSearchParams]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value: LoanStatus | '') => {
        setStatus(value);
        setPage(1);
    };

    const handleClearUserId = () => {
        setUserId('');
        setPage(1);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await adminApi.deleteLoan(deleteId);
            toast.success('Loan deleted successfully');
            fetchLoans();
        } catch (error) {
            toast.error('Failed to delete loan');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleMarkComplete = useCallback(async (id: string) => {
        try {
            await adminApi.updateLoan(id, { status: 'COMPLETED' });
            toast.success('Loan marked as completed');
            fetchLoans();
        } catch (error) {
            toast.error('Failed to update loan');
        }
    }, [fetchLoans]);

    const handleExportLoan = useCallback(async (id: string) => {
        try {
            await exportApi.downloadLoanPDF(id, true); // Pass true for admin
            toast.success('PDF downloaded');
        } catch (error) {
            toast.error('Failed to export loan');
        }
    }, []);

    const handleExportCSV = async () => {
        try {
            await adminApi.downloadAllLoansCSV({
                userId: userId || undefined,
                status: status || undefined,
            });
            toast.success('CSV downloaded');
        } catch (error) {
            toast.error('Failed to export');
        }
    };

    const handleExportPDF = async () => {
        try {
            await adminApi.downloadAllLoansPDF({
                userId: userId || undefined,
                status: status || undefined,
            });
            toast.success('PDF downloaded');
        } catch (error) {
            toast.error('Failed to export');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Loans</h1>
                    <p className="text-sm text-gray-500">Manage loans across all users</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        leftIcon={<FiDownload className="w-4 h-4" />}
                    >
                        <span className="hidden sm:inline">CSV</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        leftIcon={<FiDownload className="w-4 h-4" />}
                    >
                        <span className="hidden sm:inline">PDF</span>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by borrower name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative flex-shrink-0">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value as LoanStatus | '')}
                        className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white min-w-[150px]"
                    >
                        <option value="">All Status</option>
                        {LOAN_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* User Filter Badge */}
                {userId && (
                    <Button
                        variant="outline"
                        onClick={handleClearUserId}
                        rightIcon={<FiX className="w-4 h-4" />}
                        className="flex-shrink-0"
                    >
                        User Filter
                    </Button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <PageLoader />
            ) : loans.length === 0 ? (
                <EmptyState
                    title="No loans found"
                    description={
                        search || status || userId
                            ? 'Try adjusting your filters'
                            : 'No loans in the system yet'
                    }
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {loans.map((loan) => (
                            <LoanCard
                                key={loan._id}
                                loan={loan}
                                onDelete={(id) => setDeleteId(id)}
                                onMarkComplete={handleMarkComplete}
                                onExport={handleExportLoan}
                                isAdmin={true}
                                basePath="/admin/loans"
                                showAllActions={true}
                            />
                        ))}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <Pagination pagination={pagination} onPageChange={setPage} />
                    )}
                </>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Loan"
                message="Are you sure you want to delete this loan? This action cannot be undone and all history will be lost."
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}