"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const export_service_1 = require("../services/export.service");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
class ExportController {
    static async exportCSV(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const loans = await export_service_1.ExportService.getLoansForExport({
                userId: req.user.userId,
                status: req.query.status,
            });
            const csv = export_service_1.ExportService.generateCSV(loans);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=loans_${Date.now()}.csv`);
            res.send(csv);
        }
        catch (error) {
            next(error);
        }
    }
    static async exportPDF(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            const loans = await export_service_1.ExportService.getLoansForExport({
                userId: req.user.userId,
                status: req.query.status,
            });
            await export_service_1.ExportService.generatePDF(loans, res);
        }
        catch (error) {
            next(error);
        }
    }
    static async exportLoanPDF(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_middleware_1.AppError('Authentication required', 401);
            }
            await export_service_1.ExportService.generateLoanDetailPDF(req.params.id, req.user.userId, res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ExportController = ExportController;
//# sourceMappingURL=export.controller.js.map