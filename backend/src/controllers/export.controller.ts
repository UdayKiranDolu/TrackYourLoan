import { Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';
import { AuthRequest, LoanStatus } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';

export class ExportController {
    static async exportCSV(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const loans = await ExportService.getLoansForExport({
                userId: req.user.userId,
                status: req.query.status as LoanStatus | undefined,
            });

            const csv = ExportService.generateCSV(loans);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=loans_${Date.now()}.csv`
            );
            res.send(csv);
        } catch (error) {
            next(error);
        }
    }

    static async exportPDF(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const loans = await ExportService.getLoansForExport({
                userId: req.user.userId,
                status: req.query.status as LoanStatus | undefined,
            });

            await ExportService.generatePDF(loans, res);
        } catch (error) {
            next(error);
        }
    }

    static async exportLoanPDF(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            await ExportService.generateLoanDetailPDF(
                req.params.id,
                req.user.userId,
                res
            );
        } catch (error) {
            next(error);
        }
    }
}