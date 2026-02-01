import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { LoanService } from '../services/loan.service';
import { ExportService } from '../services/export.service';
import { AuthRequest, LoanStatus } from '../types';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler.middleware';
import { User } from '../models';

export class AdminController {
    /**
     * Get admin dashboard stats
     */
    static async getDashboard(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const stats = await LoanService.getAdminDashboardStats();
            sendSuccess(res, stats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all users
     */
    static async getUsers(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { page, limit, skip } = getPagination(
                req.query.page as string,
                req.query.limit as string
            );

            const filters = {
                search: req.query.search as string | undefined,
                page,
                limit,
                skip,
            };

            const { users, total } = await AdminService.getUsers(filters);
            sendPaginated(res, users, total, page, limit);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await AdminService.getUserById(req.params.id);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user
     */
    static async updateUser(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const user = await AdminService.updateUser(
                req.params.id,
                req.body,
                req.user.userId,
                {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                }
            );

            sendSuccess(res, { user }, 'User updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset user password
     */
    static async resetPassword(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            await AdminService.resetPassword(
                req.params.id,
                req.body.tempPassword,
                req.user.userId,
                {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                }
            );

            sendSuccess(
                res,
                null,
                'Password reset successfully. User must change password on next login.'
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Impersonate a user
     */
    static async impersonate(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const result = await AdminService.impersonate(
                req.params.id,
                req.user.userId,
                {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                }
            );

            sendSuccess(res, result, 'Impersonation started');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Stop impersonation
     */
    static async stopImpersonation(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user || !req.user.isImpersonating || !req.user.originalAdminId) {
                throw new AppError('Not currently impersonating', 400);
            }

            const result = await AdminService.stopImpersonation(
                req.user.originalAdminId,
                req.user.userId,
                {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                }
            );

            sendSuccess(res, result, 'Impersonation ended');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all loans (system-wide)
     */
    static async getAllLoans(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { page, limit, skip } = getPagination(
                req.query.page as string,
                req.query.limit as string
            );

            const filters = {
                userId: req.query.userId as string | undefined,
                status: req.query.status as LoanStatus | undefined,
                search: req.query.search as string | undefined,
                page,
                limit,
                skip,
            };

            const { loans, total } = await LoanService.findAll(filters);
            sendPaginated(res, loans, total, page, limit);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get loan by ID (admin view)
     */
    static async getLoanById(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { loan, history } = await LoanService.findByIdWithHistory(
                req.params.id
            );

            const owner = await User.findById(loan.ownerUserId).select('email');

            sendSuccess(res, { loan, history, owner });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update loan (admin)
     */
    static async updateLoan(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const loan = await LoanService.update(
                req.params.id,
                req.body,
                req.user.userId,
                true, // isAdmin
                {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                }
            );

            sendSuccess(res, { loan }, 'Loan updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete loan (admin)
     */
    static async deleteLoan(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            await LoanService.delete(
                req.params.id,
                req.user.userId,
                true, // isAdmin
                {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                }
            );

            sendSuccess(res, null, 'Loan deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export all loans as CSV (admin)
     */
    static async exportAllLoansCSV(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const loans = await ExportService.getLoansForExport({
                userId: req.query.userId as string | undefined,
                status: req.query.status as LoanStatus | undefined,
            });

            const csv = ExportService.generateCSV(loans);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=all_loans_${Date.now()}.csv`
            );
            res.send(csv);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export all loans as PDF (admin)
     */
    static async exportAllLoansPDF(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const loans = await ExportService.getLoansForExport({
                userId: req.query.userId as string | undefined,
                status: req.query.status as LoanStatus | undefined,
            });

            await ExportService.generatePDF(loans, res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export single loan as PDF (admin) - No user restriction
     */
    static async exportSingleLoanPDF(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            // Pass null for userId to indicate admin access (no user restriction)
            await ExportService.generateLoanDetailPDF(
                req.params.id,
                null,
                res
            );
        } catch (error) {
            next(error);
        }
    }
}