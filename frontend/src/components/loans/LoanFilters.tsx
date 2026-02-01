import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { LoanStatus } from '../../types';
import { LOAN_STATUS_OPTIONS } from '../../utils/constants';

interface LoanFiltersProps {
    search: string;
    status: LoanStatus | '';
    onSearchChange: (value: string) => void;
    onStatusChange: (value: LoanStatus | '') => void;
}

export default function LoanFilters({
    search,
    status,
    onSearchChange,
    onStatusChange,
}: LoanFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by borrower name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 truncate"
                />
            </div>

            {/* Status filter */}
            <div className="relative flex-shrink-0">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value as LoanStatus | '')}
                    className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white min-w-[140px]"
                >
                    <option value="">All Status</option>
                    {LOAN_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}