import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Pagination as PaginationType } from '../../types';

interface PaginationProps {
    pagination: PaginationType;
    onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
    const { page, totalPages, hasPrev, hasNext, total } = pagination;

    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (page <= 3) {
            for (let i = 1; i <= Math.min(4, totalPages); i++) pages.push(i);
            if (totalPages > 4) {
                pages.push('...');
                pages.push(totalPages);
            }
        } else if (page >= totalPages - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = Math.max(totalPages - 3, 2); i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = page - 1; i <= page + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-4 py-3 border-t bg-white rounded-b-lg">
            {/* Info text */}
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
                <span className="hidden sm:inline"> ({total} items)</span>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrev}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label="Previous page"
                >
                    <FiChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                    {pages.map((p, i) =>
                        typeof p === 'number' ? (
                            <button
                                key={i}
                                onClick={() => onPageChange(p)}
                                className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${p === page
                                        ? 'bg-primary-600 text-white'
                                        : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ) : (
                            <span key={i} className="px-1 text-gray-400 text-sm">
                                {p}
                            </span>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNext}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    aria-label="Next page"
                >
                    <FiChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}