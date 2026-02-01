import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiDownload,
    FiArrowLeft,
    FiCalendar,
    FiUser,
    FiClock,
} from 'react-icons/fi';
import { loanApi } from '../../api/loan.api';
import { exportApi } from '../../api/export.api';
import { Loan, LoanHistory } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, getDaysUntilDue } from '../../utils/formatDate';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import { ConfirmModal } from '../../components/common/Modal';
import LoanHistoryTimeline from '../../components/loans/LoanHistoryTimeline';
import toast from 'react-hot-toast';

export default function LoanDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [history, setHistory] = useState<LoanHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchLoan = async () => {
            if (!id) return;

            try {
                const data = await loanApi.getById(id);
                setLoan(data.loan);
                setHistory(data.history);
            } catch (error) {
                toast.error('Failed to load loan details');
                navigate('/loans');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLoan();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            await loanApi.delete(id);
            toast.success('Loan deleted successfully');
            navigate('/loans');
        } catch (error) {
            toast.error('Failed to delete loan');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!id) return;

        try {
            const updated = await loanApi.markCompleted(id);
            setLoan(updated);
            toast.success('Loan marked as completed');
        } catch (error) {
            toast.error('Failed to update loan');
        }
    };

    const handleExport = async () => {
        if (!id) return;

        try {
            await exportApi.downloadLoanPDF(id);
            toast.success('PDF downloaded');
        } catch (error) {
            toast.error('Failed to export loan');
        }
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (!loan) {
        return null;
    }

    const daysUntilDue = getDaysUntilDue(loan.dueDate);
    const totalAmount = loan.actualAmount + loan.interestAmount;

    const getStatusBadge = () => {
        switch (loan.status) {
            case 'ACTIVE':
                return <Badge variant="info" size="md">Active</Badge>;
            case 'OVERDUE':
                return <Badge variant="danger" size="md">Overdue</Badge>;
            case 'COMPLETED':
                return <Badge variant="success" size="md">Completed</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/loans')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="page-title">{loan.borrowerName}</h1>
                        {getStatusBadge()}
                    </div>
                    <p className="page-subtitle">Loan Details</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        leftIcon={<FiDownload className="w-4 h-4" />}
                    >
                        Export
                    </Button>
                    {loan.status !== 'COMPLETED' && (
                        <Button
                            variant="success"
                            onClick={handleMarkComplete}
                            leftIcon={<FiCheckCircle className="w-4 h-4" />}
                        >
                            Mark Complete
                        </Button>
                    )}
                    <Link to={`/loans/${id}/edit`}>
                        <Button variant="outline" leftIcon={<FiEdit2 className="w-4 h-4" />}>
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                        leftIcon={<FiTrash2 className="w-4 h-4" />}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Amount Card */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Amount Details
                        </h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Principal Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(loan.actualAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Interest Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(loan.interestAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {formatCurrency(totalAmount)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    {loan.notes && (
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{loan.notes}</p>
                        </Card>
                    )}

                    {/* History */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Change History
                        </h3>
                        <LoanHistoryTimeline history={history} />
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Dates */}
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <FiCalendar className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Given Date</p>
                                    <p className="font-medium">{formatDate(loan.givenDate)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-lg ${loan.status === 'COMPLETED'
                                            ? 'bg-gray-100'
                                            : daysUntilDue < 0
                                                ? 'bg-red-100'
                                                : daysUntilDue <= 3
                                                    ? 'bg-yellow-100'
                                                    : 'bg-gray-100'
                                        }`}
                                >
                                    <FiClock
                                        className={`w-4 h-4 ${loan.status === 'COMPLETED'
                                                ? 'text-gray-600'
                                                : daysUntilDue < 0
                                                    ? 'text-red-600'
                                                    : daysUntilDue <= 3
                                                        ? 'text-yellow-600'
                                                        : 'text-gray-600'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Due Date</p>
                                    <p className="font-medium">{formatDate(loan.dueDate)}</p>
                                    {loan.status !== 'COMPLETED' && (
                                        <p
                                            className={`text-xs ${daysUntilDue < 0
                                                    ? 'text-red-600'
                                                    : daysUntilDue <= 3
                                                        ? 'text-yellow-600'
                                                        : 'text-gray-500'
                                                }`}
                                        >
                                            {daysUntilDue < 0
                                                ? `${Math.abs(daysUntilDue)} days overdue`
                                                : daysUntilDue === 0
                                                    ? 'Due today'
                                                    : `${daysUntilDue} days remaining`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Created */}
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FiUser className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-medium">{formatDate(loan.createdAt)}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Loan"
                message="Are you sure you want to delete this loan? This action cannot be undone and all history will be lost."
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}