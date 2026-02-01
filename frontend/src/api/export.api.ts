import api from './axios';
import { LoanStatus } from '../types';

interface ExportFilters {
    status?: LoanStatus;
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export const exportApi = {
    /**
     * Download all loans as CSV
     */
    downloadCSV: async (filters: ExportFilters = {}): Promise<void> => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);

            const response = await api.get(`/export/loans/csv?${params.toString()}`, {
                responseType: 'blob',
            });

            downloadBlob(response.data, `loans_${Date.now()}.csv`);
        } catch (error) {
            console.error('CSV export error:', error);
            throw error;
        }
    },

    /**
     * Download all loans as PDF
     */
    downloadPDF: async (filters: ExportFilters = {}): Promise<void> => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);

            const response = await api.get(`/export/loans/pdf?${params.toString()}`, {
                responseType: 'blob',
            });

            downloadBlob(response.data, `loans_report_${Date.now()}.pdf`);
        } catch (error) {
            console.error('PDF export error:', error);
            throw error;
        }
    },

    /**
     * Download single loan as PDF
     */
    downloadLoanPDF: async (loanId: string, isAdmin: boolean = false): Promise<void> => {
        try {
            const endpoint = isAdmin
                ? `/admin/export/loan/${loanId}/pdf`
                : `/export/loans/${loanId}/pdf`;

            const response = await api.get(endpoint, {
                responseType: 'blob',
            });

            downloadBlob(response.data, `loan_${loanId}_${Date.now()}.pdf`);
        } catch (error: any) {
            // If user endpoint fails, try admin endpoint (for impersonation cases)
            if (!isAdmin && (error.response?.status === 404 || error.response?.status === 403)) {
                try {
                    const response = await api.get(`/admin/export/loan/${loanId}/pdf`, {
                        responseType: 'blob',
                    });
                    downloadBlob(response.data, `loan_${loanId}_${Date.now()}.pdf`);
                    return;
                } catch (adminError) {
                    console.error('Admin export fallback failed:', adminError);
                }
            }
            console.error('Loan PDF export error:', error);
            throw error;
        }
    },
};