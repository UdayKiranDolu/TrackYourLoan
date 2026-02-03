"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const loan_service_1 = require("../services/loan.service");
const export_service_1 = require("../services/export.service");
const apiResponse_1 = require("../utils/apiResponse");
const pagination_1 = require("../utils/pagination");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
const models_1 = require("../models");
class AdminController {
    /**
     * Get admin dashboard stats
     */
    static async getDashboard(req, res, next) {
        try {
            const stats = await loan_service_1.LoanService.getAdminDashboardStats();
            (0, apiResponse_1.sendSuccess)(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get all users
     */
    static async getUsers(req, res, next) {
        try {
            const { page, limit, skip } = (0, pagination_1.getPagination)(req.query.page, req.query.limit);
            const filters = {
                search: req.query.search,
                page,
                limit,
                skip,
            };
            const { users, total } = await admin_service_1.AdminService.getUsers(filters);
            (0, apiResponse_1.sendPaginated)(res, users, total, page, limit);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get user by ID
     */
    static async getUserById(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.getUserById(req.params.id);
            (0, apiResponse_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update user
     */
    static async updateUser(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const user = await admin_service_1.AdminService.updateUser(req.params.id, req.body, req.user.userId, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            });
            (0, apiResponse_1.sendSuccess)(res, { user }, 'User updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reset user password
     */
    static async resetPassword(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            await admin_service_1.AdminService.resetPassword(req.params.id, req.body.tempPassword, req.user.userId, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            });
            (0, apiResponse_1.sendSuccess)(res, null, 'Password reset successfully. User must change password on next login.');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Impersonate a user
     */
    static async impersonate(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const result = await admin_service_1.AdminService.impersonate(req.params.id, req.user.userId, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            });
            (0, apiResponse_1.sendSuccess)(res, result, 'Impersonation started');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Stop impersonation
     */
    static async stopImpersonation(req, res, next) {
        try {
            if (!req.user || !req.user.isImpersonating || !req.user.originalAdminId) {
                throw new errorHandler_middleware_1.AppError('Not currently impersonating', 400);
            }
            const result = await admin_service_1.AdminService.stopImpersonation(req.user.originalAdminId, req.user.userId, {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            });
            (0, apiResponse_1.sendSuccess)(res, result, 'Impersonation ended');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get all loans (system-wide)
     */
    static async getAllLoans(req, res, next) {
        try {
            const { page, limit, skip } = (0, pagination_1.getPagination)(req.query.page, req.query.limit);
            const filters = {
                userId: req.query.userId,
                status: req.query.status,
                search: req.query.search,
                page,
                limit,
                skip,
            };
            const { loans, total } = await loan_service_1.LoanService.findAll(filters);
            (0, apiResponse_1.sendPaginated)(res, loans, total, page, limit);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get loan by ID (admin view)
     */
    static async getLoanById(req, res, next) {
        try {
            const { loan, history } = await loan_service_1.LoanService.findByIdWithHistory(req.params.id);
            const owner = await models_1.User.findById(loan.ownerUserId).select('email');
            (0, apiResponse_1.sendSuccess)(res, { loan, history, owner });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update loan (admin)
     */
    static async updateLoan(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const loan = await loan_service_1.LoanService.update(req.params.id, req.body, req.user.userId, true, // isAdmin
            {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            });
            (0, apiResponse_1.sendSuccess)(res, { loan }, 'Loan updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete loan (admin)
     */
    static async deleteLoan(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            await loan_service_1.LoanService.delete(req.params.id, req.user.userId, true, // isAdmin
            {
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            });
            (0, apiResponse_1.sendSuccess)(res, null, 'Loan deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Export all loans as CSV (admin)
     */
    static async exportAllLoansCSV(req, res, next) {
        try {
            const loans = await export_service_1.ExportService.getLoansForExport({
                userId: req.query.userId,
                status: req.query.status,
            });
            const csv = export_service_1.ExportService.generateCSV(loans);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=all_loans_${Date.now()}.csv`);
            res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Export all loans as PDF (admin)
     */
    static async exportAllLoansPDF(req, res, next) {
        try {
            const loans = await export_service_1.ExportService.getLoansForExport({
                userId: req.query.userId,
                status: req.query.status,
            });
            await export_service_1.ExportService.generatePDF(loans, res);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Export single loan as PDF (admin) - No user restriction
     */
    static async exportSingleLoanPDF(req, res, next) {
        try {
            // Pass null for userId to indicate admin access (no user restriction)
            await export_service_1.ExportService.generateLoanDetailPDF(req.params.id, null, res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map