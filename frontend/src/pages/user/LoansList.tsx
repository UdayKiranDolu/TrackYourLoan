import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiDownload, FiChevronDown } from 'react-icons/fi';
import { useLoans } from '../../hooks/useLoans';
import { loanApi } from '../../api/loan.api';
import { exportApi } from '../../api/export.api';
import { LoanStatus } from '../../types';
import LoanCard from '../../components/loans/LoanCard';
import LoanFilters from '../../components/loans/LoanFilters';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function LoansList() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<LoanStatus | ''>('');
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const { loans, pagination, isLoading, refetch } = useLoans({
        search,
        status: status || undefined,
        page,
        limit: 9,
    });

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowExportMenu(false);
        if (showExportMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showExportMenu]);

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        setPage(1);
    }, []);

    const handleStatusChange = useCallback((value: LoanStatus | '') => {
        setStatus(value);
        setPage(1);
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await loanApi.delete(deleteId);
            toast.success('Loan deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete loan');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleMarkComplete = useCallback(async (id: string) => {
        try {
            await loanApi.markCompleted(id);
            toast.success('Loan marked as completed');
            refetch();
        } catch (error) {
            toast.error('Failed to update loan');
        }
    }, [refetch]);

    const handleExportLoan = useCallback(async (id: string) => {
        try {
            await exportApi.downloadLoanPDF(id);
            toast.success('PDF downloaded');
        } catch (error) {
            toast.error('Failed to export loan');
        }
    }, []);

    const handleExportAll = async (format: 'csv' | 'pdf') => {
        try {
            if (format === 'csv') {
                await exportApi.downloadCSV({ status: status || undefined });
            } else {
                await exportApi.downloadPDF({ status: status || undefined });
            }
            toast.success(`${format.toUpperCase()} downloaded`);
        } catch (error) {
            toast.error('Failed to export');
        }
        setShowExportMenu(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Loans</h1>
                    <p className="text-sm text-gray-500 truncate">Manage all your loans in one place</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Export Dropdown */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            leftIcon={<FiDownload className="w-4 h-4" />}
                            rightIcon={<FiChevronDown className="w-4 h-4" />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowExportMenu(!showExportMenu);
                            }}
                        >
                            <span className="hidden sm:inline">Export</span>
                        </Button>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportAll('csv');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportAll('pdf');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Export PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <Link to="/loans/new">
                        <Button leftIcon={<FiPlus className="w-4 h-4" />}>
                            <span className="hidden sm:inline">Add Loan</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <LoanFilters
                search={search}
                status={status}
                onSearchChange={handleSearchChange}
                onStatusChange={handleStatusChange}
            />

            {/* Content */}
            {isLoading ? (
                <PageLoader />
            ) : loans.length === 0 ? (
                <EmptyState
                    title="No loans found"
                    description={
                        search || status
                            ? 'Try adjusting your filters'
                            : 'Add your first loan to get started'
                    }
                    action={
                        !search && !status
                            ? {
                                label: 'Add New Loan',
                                onClick: () => navigate('/loans/new'),
                            }
                            : undefined
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
                message="Are you sure you want to delete this loan? This action cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}