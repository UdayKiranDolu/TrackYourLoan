import { Response, NextFunction } from 'express';
import { LoanService } from '../services/loan.service';
import { AuthRequest, LoanStatus } from '../types';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { getPagination } from '../utils/pagination';
import { AppError } from '../middleware/errorHandler.middleware';

export class LoanController {
    static async create(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const loan = await LoanService.create(req.user.userId, req.body);

            sendSuccess(res, { loan }, 'Loan created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    static async getAll(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const { page, limit, skip } = getPagination(
                req.query.page as string,
                req.query.limit as string
            );

            const filters = {
                status: req.query.status as LoanStatus | undefined,
                search: req.query.search as string | undefined,
                page,
                limit,
                skip,
            };

            const { loans, total } = await LoanService.findByUser(
                req.user.userId,
                filters
            );

            sendPaginated(res, loans, total, page, limit);
        } catch (error) {
            next(error);
        }
    }

    static async getById(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const { loan, history } = await LoanService.findByIdWithHistory(
                req.params.id,
                req.user.userId
            );

            sendSuccess(res, { loan, history });
        } catch (error) {
            next(error);
        }
    }

    static async update(
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
                false
            );

            sendSuccess(res, { loan }, 'Loan updated successfully');
        } catch (error) {
            next(error);
        }
    }

    static async markCompleted(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const loan = await LoanService.markCompleted(
                req.params.id,
                req.user.userId,
                false
            );

            sendSuccess(res, { loan }, 'Loan marked as completed');
        } catch (error) {
            next(error);
        }
    }

    static async delete(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            await LoanService.delete(req.params.id, req.user.userId, false);

            sendSuccess(res, null, 'Loan deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getDashboard(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const stats = await LoanService.getDashboardStats(req.user.userId);

            sendSuccess(res, stats);
        } catch (error) {
            next(error);
        }
    }

    static async getHistory(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const { history } = await LoanService.findByIdWithHistory(
                req.params.id,
                req.user.userId
            );

            sendSuccess(res, { history });
        } catch (error) {
            next(error);
        }
    }
}