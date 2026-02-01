export const LOAN_STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'COMPLETED', label: 'Completed' },
] as const;

export const LOAN_STATUS_COLORS = {
    ACTIVE: 'bg-blue-100 text-blue-800',
    OVERDUE: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-green-100 text-green-800',
} as const;

export const NOTIFICATION_TYPE_COLORS = {
    DUE_SOON: 'bg-yellow-100 text-yellow-800',
    OVERDUE: 'bg-red-100 text-red-800',
} as const;