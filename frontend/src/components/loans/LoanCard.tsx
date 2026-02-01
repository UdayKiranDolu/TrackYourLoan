import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiDownload,
    FiCalendar,
    FiUser,
} from 'react-icons/fi';
import { Loan } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, getDaysUntilDue } from '../../utils/formatDate';
import Badge from '../common/Badge';

interface LoanCardProps {
    loan: Loan;
    onDelete?: (id: string) => void;
    onMarkComplete?: (id: string) => void;
    onExport?: (id: string) => void;
    isAdmin?: boolean;
    basePath?: string;
    showAllActions?: boolean; // New prop to force show all actions
}

export default function LoanCard({
    loan,
    onDelete,
    onMarkComplete,
    onExport,
    isAdmin = false,
    basePath = '/loans',
    showAllActions = true, // Default to true
}: LoanCardProps) {
    const daysUntilDue = getDaysUntilDue(loan.dueDate);
    const totalAmount = loan.actualAmount + loan.interestAmount;

    const getStatusBadge = () => {
        switch (loan.status) {
            case 'ACTIVE':
                return <Badge variant="info">Active</Badge>;
            case 'OVERDUE':
                return <Badge variant="danger">Overdue</Badge>;
            case 'COMPLETED':
                return <Badge variant="success">Completed</Badge>;
            default:
                return null;
        }
    };

    const getDueDateColor = () => {
        if (loan.status === 'COMPLETED') return 'text-gray-500';
        if (daysUntilDue < 0) return 'text-red-600';
        if (daysUntilDue <= 3) return 'text-yellow-600';
        return 'text-gray-600';
    };

    // Determine the correct edit path
    const editPath = isAdmin ? `${basePath}/${loan._id}` : `${basePath}/${loan._id}/edit`;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate" title={loan.borrowerName}>
                            {loan.borrowerName}
                        </h3>
                        {isAdmin && typeof loan.ownerUserId === 'object' && loan.ownerUserId?.email && (
                            <p className="text-xs text-gray-500 truncate" title={loan.ownerUserId.email}>
                                Owner: {loan.ownerUserId.email}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0">
                    {getStatusBadge()}
                </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">Principal</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate" title={formatCurrency(loan.actualAmount)}>
                        {formatCurrency(loan.actualAmount)}
                    </p>
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">Interest</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate" title={formatCurrency(loan.interestAmount)}>
                        {formatCurrency(loan.interestAmount)}
                    </p>
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">Total</p>
                    <p className="font-semibold text-primary-600 text-sm sm:text-base truncate" title={formatCurrency(totalAmount)}>
                        {formatCurrency(totalAmount)}
                    </p>
                </div>
            </div>

            {/* Dates */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm mb-4">
                <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
                    <FiCalendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Given: {formatDate(loan.givenDate)}</span>
                </div>
                <div className={`flex items-center gap-1.5 min-w-0 ${getDueDateColor()}`}>
                    <FiCalendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        Due: {formatDate(loan.dueDate)}
                        {loan.status !== 'COMPLETED' && daysUntilDue <= 7 && daysUntilDue > 0 && (
                            <span className="text-xs ml-1">({daysUntilDue}d)</span>
                        )}
                    </span>
                </div>
            </div>

            {/* Notes */}
            {loan.notes && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 break-words" title={loan.notes}>
                    {loan.notes}
                </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-4 border-t">
                {/* View */}
                <Link
                    to={`${basePath}/${loan._id}`}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>View</span>
                </Link>

                {/* Edit */}
                <Link
                    to={editPath}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Edit</span>
                </Link>

                {/* Export - Always show if showAllActions is true */}
                {showAllActions && (
                    <button
                        onClick={() => onExport?.(loan._id)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                )}

                {/* Mark Complete - Show if loan is not completed and showAllActions is true */}
                {showAllActions && loan.status !== 'COMPLETED' && (
                    <button
                        onClick={() => onMarkComplete?.(loan._id)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                        <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Complete</span>
                    </button>
                )}

                {/* Delete - Always show if showAllActions is true */}
                {showAllActions && (
                    <button
                        onClick={() => onDelete?.(loan._id)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                    >
                        <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Delete</span>
                    </button>
                )}
            </div>
        </div>
    );
}