import { Response } from 'express';
import { ILoan } from '../models';
import { LoanStatus } from '../types';
interface ExportFilters {
    userId?: string;
    status?: LoanStatus;
}
export declare class ExportService {
    /**
     * Get loans for export
     */
    static getLoansForExport(filters: ExportFilters): Promise<ILoan[]>;
    /**
     * Generate CSV content
     */
    static generateCSV(loans: ILoan[]): string;
    /**
     * Format currency in Indian format
     */
    private static formatCurrency;
    /**
     * Format date in Indian format
     */
    private static formatDate;
    /**
     * Get status color
     */
    private static getStatusColor;
    /**
     * Get status background color
     */
    private static getStatusBgColor;
    /**
     * Draw horizontal line
     */
    private static drawLine;
    /**
     * Draw status badge - FIXED: Added lineBreak: false
     */
    private static drawStatusBadge;
    /**
     * Draw compact summary card - FIXED: Added lineBreak: false
     */
    private static drawCompactCard;
    /**
     * Draw info row - FIXED: Added lineBreak: false
     */
    private static drawInfoRow;
    /**
     * Generate multi-loan PDF report - FIXED: Added lineBreak: false throughout
     */
    static generatePDF(loans: ILoan[], res: Response): Promise<void>;
    /**
     * Generate single loan PDF - FIXED: Added lineBreak: false throughout
     */
    static generateLoanDetailPDF(loanId: string, userId: string | null, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=export.service.d.ts.map