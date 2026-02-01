import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiArrowLeft,
    FiCalendar,
    FiUser,
    FiClock,
    FiMail,
} from 'react-icons/fi';
import { adminApi } from '../../api/admin.api';
import { Loan, LoanHistory } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, getDaysUntilDue } from '../../utils/formatDate';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { PageLoader } from '../../components/common/Loader';
import { ConfirmModal } from '../../components/common/Modal';
import LoanHistoryTimeline from '../../components/loans/LoanHistoryTimeline';
import { LOAN_STATUS_OPTIONS } from '../../utils/constants';
import { formatDateForInput } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function AdminLoanDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loan, setLoan] = useState<Loan | null>(null);
    const [history, setHistory] = useState<LoanHistory[]>([]);
    const [owner, setOwner] = useState<{ email: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState<Partial<Loan>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLoan = async () => {
        if (!id) return;

        try {
            const data = await adminApi.getLoanById(id);
            setLoan(data.loan);
            setHistory(data.history);
            setOwner(data.owner);
        } catch (error) {
            toast.error('Failed to load loan details');
            navigate('/admin/loans');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLoan();
    }, [id, navigate]);

    const handleOpenEdit = () => {
        if (!loan) return;
        setEditData({
            borrowerName: loan.borrowerName,
            actualAmount: loan.actualAmount,
            interestAmount: loan.interestAmount,
            givenDate: formatDateForInput(loan.givenDate),
            dueDate: formatDateForInput(loan.dueDate),
            notes: loan.notes,
            status: loan.status,
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!id) return;

        setIsSaving(true);
        try {
            await adminApi.updateLoan(id, editData);
            toast.success('Loan updated successfully');
            setShowEditModal(false);
            fetchLoan();
        } catch (error) {
            toast.error('Failed to update loan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            await adminApi.deleteLoan(id);
            toast.success('Loan deleted successfully');
            navigate('/admin/loans');
        } catch (error) {
            toast.error('Failed to delete loan');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!id) return;

        try {
            await adminApi.updateLoan(id, { status: 'COMPLETED' });
            toast.success('Loan marked as completed');
            fetchLoan();
        } catch (error) {
            toast.error('Failed to update loan');
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
                    onClick={() => navigate('/admin/loans')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="page-title">{loan.borrowerName}</h1>
                        {getStatusBadge()}
                    </div>
                    <p className="page-subtitle">Admin View - Loan Details</p>
                </div>
                <div className="flex items-center gap-2">
                    {loan.status !== 'COMPLETED' && (
                        <Button
                            variant="success"
                            onClick={handleMarkComplete}
                            leftIcon={<FiCheckCircle className="w-4 h-4" />}
                        >
                            Mark Complete
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleOpenEdit}
                        leftIcon={<FiEdit2 className="w-4 h-4" />}
                    >
                        Edit
                    </Button>
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
                    {/* Owner Info */}
                    <Card>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FiUser className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Loan Owner</p>
                                <div className="flex items-center gap-2">
                                    <FiMail className="w-4 h-4 text-gray-400" />
                                    <p className="font-medium">{owner?.email || 'Unknown'}</p>
                                </div>
                            </div>
                            {owner && (
                                <Link
                                    to={`/admin/users/${typeof loan.ownerUserId === 'object' ? loan.ownerUserId._id : loan.ownerUserId}`}
                                    className="ml-auto"
                                >
                                    <Button variant="outline" size="sm">
                                        View User
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>

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

                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FiCalendar className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="font-medium">{formatDate(loan.createdAt)}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Loan"
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} isLoading={isSaving}>
                            Save Changes
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Borrower Name"
                        value={editData.borrowerName || ''}
                        onChange={(e) =>
                            setEditData((prev) => ({ ...prev, borrowerName: e.target.value }))
                        }
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Principal Amount (₹)"
                            type="number"
                            value={editData.actualAmount || 0}
                            onChange={(e) =>
                                setEditData((prev) => ({
                                    ...prev,
                                    actualAmount: parseFloat(e.target.value) || 0,
                                }))
                            }
                        />
                        <Input
                            label="Interest Amount (₹)"
                            type="number"
                            value={editData.interestAmount || 0}
                            onChange={(e) =>
                                setEditData((prev) => ({
                                    ...prev,
                                    interestAmount: parseFloat(e.target.value) || 0,
                                }))
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Given Date"
                            type="date"
                            value={editData.givenDate || ''}
                            onChange={(e) =>
                                setEditData((prev) => ({ ...prev, givenDate: e.target.value }))
                            }
                        />
                        <Input
                            label="Due Date"
                            type="date"
                            value={editData.dueDate || ''}
                            onChange={(e) =>
                                setEditData((prev) => ({ ...prev, dueDate: e.target.value }))
                            }
                        />
                    </div>

                    <Select
                        label="Status"
                        value={editData.status || 'ACTIVE'}
                        onChange={(e) =>
                            setEditData((prev) => ({
                                ...prev,
                                status: e.target.value as any,
                            }))
                        }
                        options={LOAN_STATUS_OPTIONS as unknown as { value: string; label: string }[]}
                    />

                    <Textarea
                        label="Notes"
                        value={editData.notes || ''}
                        onChange={(e) =>
                            setEditData((prev) => ({ ...prev, notes: e.target.value }))
                        }
                    />

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Changes to Due Date or Interest Amount will be recorded in the loan history.
                        </p>
                    </div>
                </div>
            </Modal>

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