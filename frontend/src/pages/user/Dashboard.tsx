import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiDollarSign,
    FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiPlus,
    FiTrendingUp,
    FiDownload,
    FiChevronDown,
} from 'react-icons/fi';
import { useDashboard, useLoans } from '../../hooks/useLoans';
import { exportApi } from '../../api/export.api';
import { formatCurrency } from '../../utils/formatCurrency';
import SummaryCard from '../../components/dashboard/SummaryCard';
import LoanCard from '../../components/loans/LoanCard';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/Modal';
import { loanApi } from '../../api/loan.api';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const navigate = useNavigate();
    const { stats, isLoading: statsLoading, refetch: refetchStats } = useDashboard();
    const { loans, isLoading: loansLoading, refetch: refetchLoans } = useLoans({ limit: 6 });

    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Close export menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setShowExportMenu(false);
        if (showExportMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showExportMenu]);

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            await exportApi.downloadCSV({});
            toast.success('CSV downloaded successfully');
        } catch (error) {
            toast.error('Failed to export CSV');
        } finally {
            setIsExporting(false);
            setShowExportMenu(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await exportApi.downloadPDF({});
            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
            setShowExportMenu(false);
        }
    };

    const handleExportLoan = async (id: string) => {
        try {
            await exportApi.downloadLoanPDF(id, false);
            toast.success('Loan PDF downloaded');
        } catch (error) {
            toast.error('Failed to export loan');
        }
    };

    const handleMarkComplete = async (id: string) => {
        try {
            await loanApi.markCompleted(id);
            toast.success('Loan marked as completed');
            refetchLoans();
            refetchStats();
        } catch (error) {
            toast.error('Failed to update loan');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await loanApi.delete(deleteId);
            toast.success('Loan deleted successfully');
            refetchLoans();
            refetchStats();
        } catch (error) {
            toast.error('Failed to delete loan');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    if (statsLoading) {
        return <PageLoader />;
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview of your loan portfolio</p>
                </div>
                <div className="flex items-center gap-2">
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
                            disabled={isExporting || !stats || stats.totalLoans === 0}
                        >
                            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
                        </Button>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportCSV();
                                    }}
                                    disabled={isExporting}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FiDownload className="w-4 h-4" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleExportPDF();
                                    }}
                                    disabled={isExporting}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FiDownload className="w-4 h-4" />
                                    Export as PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <Link to="/loans/new">
                        <Button leftIcon={<FiPlus className="w-4 h-4" />}>
                            <span className="hidden sm:inline">Add New Loan</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <SummaryCard
                    title="Total Loans"
                    value={stats?.totalLoans || 0}
                    icon={<FiDollarSign className="w-5 h-5" />}
                    color="blue"
                />
                <SummaryCard
                    title="Active Loans"
                    value={stats?.activeLoans || 0}
                    icon={<FiClock className="w-5 h-5" />}
                    color="yellow"
                />
                <SummaryCard
                    title="Overdue Loans"
                    value={stats?.overdueLoans || 0}
                    icon={<FiAlertCircle className="w-5 h-5" />}
                    color="red"
                />
                <SummaryCard
                    title="Completed"
                    value={stats?.completedLoans || 0}
                    icon={<FiCheckCircle className="w-5 h-5" />}
                    color="green"
                />
            </div>

            {/* Amount Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
                            <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Total Principal</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                {formatCurrency(stats?.totalAmount || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-50 text-green-600">
                            <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Total Interest</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                {formatCurrency(stats?.totalInterest || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                            <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-500">Grand Total</p>
                            <p className="text-lg sm:text-2xl font-bold text-primary-600 truncate">
                                {formatCurrency((stats?.totalAmount || 0) + (stats?.totalInterest || 0))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Loans */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Loans</h2>
                    {loans.length > 0 && (
                        <Link
                            to="/loans"
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            View all →
                        </Link>
                    )}
                </div>

                {loansLoading ? (
                    <PageLoader />
                ) : loans.length === 0 ? (
                    <EmptyState
                        title="No loans yet"
                        description="Start by adding your first loan to track."
                        action={{
                            label: 'Add New Loan',
                            onClick: () => navigate('/loans/new'),
                        }}
                    />
                ) : (
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
                )}
            </div>

            {/* Delete Confirmation Modal */}
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