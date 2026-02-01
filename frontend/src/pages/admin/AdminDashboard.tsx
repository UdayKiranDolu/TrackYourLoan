import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiUsers,
    FiDollarSign,
    FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiTrendingUp,
    FiDownload,
    FiChevronDown,
} from 'react-icons/fi';
import { adminApi } from '../../api/admin.api';
import { AdminDashboardStats } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import SummaryCard from '../../components/dashboard/SummaryCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminApi.getDashboard();
                setStats(data);
            } catch (error) {
                toast.error('Failed to load dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowExportMenu(false);
        if (showExportMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showExportMenu]);

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            await adminApi.downloadAllLoansCSV({});
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
            await adminApi.downloadAllLoansPDF({});
            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
            setShowExportMenu(false);
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500">System-wide overview and management</p>
                </div>

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
                        {isExporting ? 'Exporting...' : 'Export All'}
                    </Button>

                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
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
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <SummaryCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<FiUsers className="w-5 h-5" />}
                    color="purple"
                />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card>
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
                </Card>

                <Card>
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
                </Card>

                <Card>
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
                </Card>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        View and manage all registered users, reset passwords, and impersonate users for support.
                    </p>
                    <Link to="/admin/users">
                        <Button leftIcon={<FiUsers className="w-4 h-4" />}>
                            Manage Users
                        </Button>
                    </Link>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Loans</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        View and manage all loans across the system. Edit, delete, or export loan data.
                    </p>
                    <Link to="/admin/loans">
                        <Button leftIcon={<FiDollarSign className="w-4 h-4" />}>
                            View All Loans
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}