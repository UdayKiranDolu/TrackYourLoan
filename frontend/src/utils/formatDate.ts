import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return format(d, 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return format(d, 'dd MMM yyyy, hh:mm a');
}

export function formatRelative(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateForInput(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
}

export function isOverdue(dueDate: string | Date): boolean {
    const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    return d < new Date();
}

export function getDaysUntilDue(dueDate: string | Date): number {
    const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}