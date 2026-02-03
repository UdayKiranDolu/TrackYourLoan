import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class AdminController {
    /**
     * Get admin dashboard stats
     */
    static getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all users
     */
    static getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get user by ID
     */
    static getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update user
     */
    static updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reset user password
     */
    static resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Impersonate a user
     */
    static impersonate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Stop impersonation
     */
    static stopImpersonation(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get all loans (system-wide)
     */
    static getAllLoans(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get loan by ID (admin view)
     */
    static getLoanById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update loan (admin)
     */
    static updateLoan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Delete loan (admin)
     */
    static deleteLoan(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Export all loans as CSV (admin)
     */
    static exportAllLoansCSV(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Export all loans as PDF (admin)
     */
    static exportAllLoansPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Export single loan as PDF (admin) - No user restriction
     */
    static exportSingleLoanPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map