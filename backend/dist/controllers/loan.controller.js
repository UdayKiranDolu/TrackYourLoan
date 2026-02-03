"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanController = void 0;
const loan_service_1 = require("../services/loan.service");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
class LoanController {
    static async create(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const loan = await loan_service_1.LoanService.create(req.user.userId, req.body);
            (0, apiResponse_1.sendSuccess)(res, { loan }, 'Loan created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAll(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const { page, limit, skip } = (0, pagination_1.getPagination)(req.query.page, req.query.limit);
            const filters = {
                status: req.query.status,
                search: req.query.search,
                page,
                limit,
                skip,
            };
            const { loans, total } = await loan_service_1.LoanService.findByUser(req.user.userId, filters);
            (0, apiResponse_1.sendPaginated)(res, loans, total, page, limit);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const { loan, history } = await loan_service_1.LoanService.findByIdWithHistory(req.params.id, req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, { loan, history });
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const loan = await loan_service_1.LoanService.update(req.params.id, req.body, req.user.userId, false);
            (0, apiResponse_1.sendSuccess)(res, { loan }, 'Loan updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async markCompleted(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const loan = await loan_service_1.LoanService.markCompleted(req.params.id, req.user.userId, false);
            (0, apiResponse_1.sendSuccess)(res, { loan }, 'Loan marked as completed');
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            await loan_service_1.LoanService.delete(req.params.id, req.user.userId, false);
            (0, apiResponse_1.sendSuccess)(res, null, 'Loan deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getDashboard(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const stats = await loan_service_1.LoanService.getDashboardStats(req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    static async getHistory(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const { history } = await loan_service_1.LoanService.findByIdWithHistory(req.params.id, req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, { history });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LoanController = LoanController;
//# sourceMappingURL=loan.controller.js.map