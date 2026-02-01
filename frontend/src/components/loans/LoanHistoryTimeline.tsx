import React from 'react';
import { FiClock, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { LoanHistory } from '../../types';
import { formatDateTime, formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

interface LoanHistoryTimelineProps {
    history: LoanHistory[];
}

export default function LoanHistoryTimeline({ history }: LoanHistoryTimelineProps) {
    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FiClock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No changes have been made to this loan yet.</p>
            </div>
        );
    }

    const getChangeIcon = (field: string) => {
        switch (field) {
            case 'dueDate':
                return <FiCalendar className="w-4 h-4" />;
            case 'interestAmount':
                return <FiDollarSign className="w-4 h-4" />;
            default:
                return <FiClock className="w-4 h-4" />;
        }
    };

    const formatChangeValue = (field: string, value: string | number | Date) => {
        if (field === 'dueDate') {
            return formatDate(value as string);
        }
        if (field === 'interestAmount') {
            return formatCurrency(value as number);
        }
        return String(value);
    };

    const getChangeLabel = (field: string) => {
        switch (field) {
            case 'dueDate':
                return 'Due Date';
            case 'interestAmount':
                return 'Interest Amount';
            default:
                return field;
        }
    };

    return (
        <div className="space-y-4">
            {history.map((entry, index) => {
                const changedBy =
                    typeof entry.changedByUserId === 'object'
                        ? entry.changedByUserId.email
                        : 'Unknown';

                return (
                    <div key={entry._id} className="relative pl-8">
                        {/* Timeline line */}
                        {index < history.length - 1 && (
                            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-200" />
                        )}

                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary-600 rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                    Changes by {changedBy}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDateTime(entry.changedAt)}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {entry.changes.map((change, changeIndex) => (
                                    <div
                                        key={changeIndex}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <div className="text-gray-400">{getChangeIcon(change.field)}</div>
                                        <span className="text-gray-600">
                                            {getChangeLabel(change.field)}:
                                        </span>
                                        <span className="text-red-600 line-through">
                                            {formatChangeValue(change.field, change.oldValue)}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-green-600 font-medium">
                                            {formatChangeValue(change.field, change.newValue)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {entry.note && (
                                <p className="mt-2 text-sm text-gray-500 italic">{entry.note}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}