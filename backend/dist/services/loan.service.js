"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const errorHandler_middleware_1 = require("../middleware/errorHandler.middleware");
const audit_service_1 = require("./audit.service");
class LoanService {
    static async create(userId, data, actorUserId, auditInfo) {
        const loan = await models_1.Loan.create({
            ownerUserId: new mongoose_1.Types.ObjectId(userId),
            borrowerName: data.borrowerName,
            actualAmount: data.actualAmount,
            interestAmount: data.interestAmount,
            givenDate: new Date(data.givenDate),
            dueDate: new Date(data.dueDate),
            notes: data.notes || '',
            status: data.status || 'ACTIVE',
        });
        // Audit log for admin actions
        if (actorUserId && actorUserId !== userId) {
            await audit_service_1.AuditService.log({
                actorUserId,
                action: 'LOAN_CREATE',
                targetType: 'LOAN',
                targetId: loan._id.toString(),
                details: { ownerUserId: userId, borrowerName: data.borrowerName },
                ...auditInfo,
            });
        }
        return loan;
    }
    static async findByUser(userId, filters) {
        const query = {
            ownerUserId: new mongoose_1.Types.ObjectId(userId),
        };
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.search) {
            query.borrowerName = { $regex: filters.search, $options: 'i' };
        }
        const [loans, total] = await Promise.all([
            models_1.Loan.find(query)
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit),
            models_1.Loan.countDocuments(query),
        ]);
        return { loans, total };
    }
    static async findAll(filters) {
        const query = {};
        if (filters.userId) {
            query.ownerUserId = new mongoose_1.Types.ObjectId(filters.userId);
        }
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.search) {
            query.borrowerName = { $regex: filters.search, $options: 'i' };
        }
        const [loans, total] = await Promise.all([
            models_1.Loan.find(query)
                .populate('ownerUserId', 'email')
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit),
            models_1.Loan.countDocuments(query),
        ]);
        return { loans, total };
    }
    static async findById(loanId, userId) {
        const query = { _id: new mongoose_1.Types.ObjectId(loanId) };
        // If userId provided, enforce ownership
        if (userId) {
            query.ownerUserId = new mongoose_1.Types.ObjectId(userId);
        }
        const loan = await models_1.Loan.findOne(query);
        if (!loan) {
            throw new errorHandler_middleware_1.AppError('Loan not found', 404);
        }
        return loan;
    }
    static async findByIdWithHistory(loanId, userId) {
        const loan = await this.findById(loanId, userId);
        const history = await models_1.LoanHistory.find({
            loanId: new mongoose_1.Types.ObjectId(loanId),
        })
            .sort({ changedAt: -1 })
            .populate('changedByUserId', 'email');
        return { loan, history };
    }
    static async update(loanId, data, userId, isAdmin = false, auditInfo) {
        // Find existing loan
        const existingLoan = isAdmin
            ? await this.findById(loanId)
            : await this.findById(loanId, userId);
        // Track changes for history (dueDate and interestAmount only)
        const changes = [];
        if (data.dueDate) {
            const newDueDate = new Date(data.dueDate);
            if (existingLoan.dueDate.getTime() !== newDueDate.getTime()) {
                changes.push({
                    field: 'dueDate',
                    oldValue: existingLoan.dueDate,
                    newValue: newDueDate,
                });
            }
        }
        if (data.interestAmount !== undefined) {
            if (existingLoan.interestAmount !== data.interestAmount) {
                changes.push({
                    field: 'interestAmount',
                    oldValue: existingLoan.interestAmount,
                    newValue: data.interestAmount,
                });
            }
        }
        // Create history entry if there are tracked changes
        if (changes.length > 0) {
            await models_1.LoanHistory.create({
                loanId: existingLoan._id,
                changedByUserId: new mongoose_1.Types.ObjectId(userId),
                changedAt: new Date(),
                changes,
                note: '',
            });
        }
        // Update loan
        const updateData = {};
        if (data.borrowerName)
            updateData.borrowerName = data.borrowerName;
        if (data.actualAmount !== undefined)
            updateData.actualAmount = data.actualAmount;
        if (data.interestAmount !== undefined)
            updateData.interestAmount = data.interestAmount;
        if (data.givenDate)
            updateData.givenDate = new Date(data.givenDate);
        if (data.dueDate)
            updateData.dueDate = new Date(data.dueDate);
        if (data.notes !== undefined)
            updateData.notes = data.notes;
        if (data.status)
            updateData.status = data.status;
        const updatedLoan = await models_1.Loan.findByIdAndUpdate(loanId, { $set: updateData }, { new: true, runValidators: true });
        if (!updatedLoan) {
            throw new errorHandler_middleware_1.AppError('Failed to update loan', 500);
        }
        // Audit log for admin actions
        if (isAdmin) {
            await audit_service_1.AuditService.log({
                actorUserId: userId,
                action: 'LOAN_UPDATE',
                targetType: 'LOAN',
                targetId: loanId,
                details: {
                    changes: data,
                    ownerUserId: existingLoan.ownerUserId.toString(),
                },
                ...auditInfo,
            });
        }
        return updatedLoan;
    }
    static async markCompleted(loanId, userId, isAdmin = false) {
        return this.update(loanId, { status: 'COMPLETED' }, userId, isAdmin);
    }
    static async delete(loanId, userId, isAdmin = false, auditInfo) {
        // Find loan first to verify ownership
        const loan = isAdmin
            ? await this.findById(loanId)
            : await this.findById(loanId, userId);
        // Delete loan history
        await models_1.LoanHistory.deleteMany({ loanId: loan._id });
        // Delete loan
        await models_1.Loan.findByIdAndDelete(loanId);
        // Audit log for admin actions
        if (isAdmin) {
            await audit_service_1.AuditService.log({
                actorUserId: userId,
                action: 'LOAN_DELETE',
                targetType: 'LOAN',
                targetId: loanId,
                details: {
                    borrowerName: loan.borrowerName,
                    ownerUserId: loan.ownerUserId.toString(),
                },
                ...auditInfo,
            });
        }
    }
    static async getDashboardStats(userId) {
        const baseQuery = { ownerUserId: new mongoose_1.Types.ObjectId(userId) };
        const [total, active, overdue, completed, amounts] = await Promise.all([
            models_1.Loan.countDocuments(baseQuery),
            models_1.Loan.countDocuments({ ...baseQuery, status: 'ACTIVE' }),
            models_1.Loan.countDocuments({ ...baseQuery, status: 'OVERDUE' }),
            models_1.Loan.countDocuments({ ...baseQuery, status: 'COMPLETED' }),
            models_1.Loan.aggregate([
                { $match: baseQuery },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$actualAmount' },
                        totalInterest: { $sum: '$interestAmount' },
                    },
                },
            ]),
        ]);
        return {
            totalLoans: total,
            activeLoans: active,
            overdueLoans: overdue,
            completedLoans: completed,
            totalAmount: amounts[0]?.totalAmount || 0,
            totalInterest: amounts[0]?.totalInterest || 0,
        };
    }
    static async getAdminDashboardStats() {
        const User = require('../models').User;
        const [totalUsers, total, active, overdue, completed, amounts] = await Promise.all([
            User.countDocuments({ role: 'USER' }),
            models_1.Loan.countDocuments(),
            models_1.Loan.countDocuments({ status: 'ACTIVE' }),
            models_1.Loan.countDocuments({ status: 'OVERDUE' }),
            models_1.Loan.countDocuments({ status: 'COMPLETED' }),
            models_1.Loan.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$actualAmount' },
                        totalInterest: { $sum: '$interestAmount' },
                    },
                },
            ]),
        ]);
        return {
            totalUsers,
            totalLoans: total,
            activeLoans: active,
            overdueLoans: overdue,
            completedLoans: completed,
            totalAmount: amounts[0]?.totalAmount || 0,
            totalInterest: amounts[0]?.totalInterest || 0,
        };
    }
}
exports.LoanService = LoanService;
//# sourceMappingURL=loan.service.js.map