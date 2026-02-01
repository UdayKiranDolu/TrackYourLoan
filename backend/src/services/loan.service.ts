import { Types, FilterQuery } from 'mongoose';
import { Loan, ILoan, LoanHistory, ILoanChange } from '../models';
import { LoanStatus } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';
import { AuditService } from './audit.service';

interface CreateLoanData {
    borrowerName: string;
    actualAmount: number;
    interestAmount: number;
    givenDate: string;
    dueDate: string;
    notes?: string;
    status?: LoanStatus;
}

interface UpdateLoanData {
    borrowerName?: string;
    actualAmount?: number;
    interestAmount?: number;
    givenDate?: string;
    dueDate?: string;
    notes?: string;
    status?: LoanStatus;
}

interface LoanFilters {
    status?: LoanStatus;
    search?: string;
    page: number;
    limit: number;
    skip: number;
}

interface LoanWithHistory extends ILoan {
    history?: ILoanChange[];
}

export class LoanService {
    static async create(
        userId: string,
        data: CreateLoanData,
        actorUserId?: string,
        auditInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<ILoan> {
        const loan = await Loan.create({
            ownerUserId: new Types.ObjectId(userId),
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
            await AuditService.log({
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

    static async findByUser(
        userId: string,
        filters: LoanFilters
    ): Promise<{ loans: ILoan[]; total: number }> {
        const query: FilterQuery<ILoan> = {
            ownerUserId: new Types.ObjectId(userId),
        };

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.search) {
            query.borrowerName = { $regex: filters.search, $options: 'i' };
        }

        const [loans, total] = await Promise.all([
            Loan.find(query)
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit),
            Loan.countDocuments(query),
        ]);

        return { loans, total };
    }

    static async findAll(
        filters: LoanFilters & { userId?: string }
    ): Promise<{ loans: ILoan[]; total: number }> {
        const query: FilterQuery<ILoan> = {};

        if (filters.userId) {
            query.ownerUserId = new Types.ObjectId(filters.userId);
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.search) {
            query.borrowerName = { $regex: filters.search, $options: 'i' };
        }

        const [loans, total] = await Promise.all([
            Loan.find(query)
                .populate('ownerUserId', 'email')
                .sort({ createdAt: -1 })
                .skip(filters.skip)
                .limit(filters.limit),
            Loan.countDocuments(query),
        ]);

        return { loans, total };
    }

    static async findById(loanId: string, userId?: string): Promise<ILoan> {
        const query: FilterQuery<ILoan> = { _id: new Types.ObjectId(loanId) };

        // If userId provided, enforce ownership
        if (userId) {
            query.ownerUserId = new Types.ObjectId(userId);
        }

        const loan = await Loan.findOne(query);

        if (!loan) {
            throw new AppError('Loan not found', 404);
        }

        return loan;
    }

    static async findByIdWithHistory(
        loanId: string,
        userId?: string
    ): Promise<{ loan: ILoan; history: any[] }> {
        const loan = await this.findById(loanId, userId);

        const history = await LoanHistory.find({
            loanId: new Types.ObjectId(loanId),
        })
            .sort({ changedAt: -1 })
            .populate('changedByUserId', 'email');

        return { loan, history };
    }

    static async update(
        loanId: string,
        data: UpdateLoanData,
        userId: string,
        isAdmin = false,
        auditInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<ILoan> {
        // Find existing loan
        const existingLoan = isAdmin
            ? await this.findById(loanId)
            : await this.findById(loanId, userId);

        // Track changes for history (dueDate and interestAmount only)
        const changes: ILoanChange[] = [];

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
            await LoanHistory.create({
                loanId: existingLoan._id,
                changedByUserId: new Types.ObjectId(userId),
                changedAt: new Date(),
                changes,
                note: '',
            });
        }

        // Update loan
        const updateData: Partial<ILoan> = {};
        if (data.borrowerName) updateData.borrowerName = data.borrowerName;
        if (data.actualAmount !== undefined) updateData.actualAmount = data.actualAmount;
        if (data.interestAmount !== undefined) updateData.interestAmount = data.interestAmount;
        if (data.givenDate) updateData.givenDate = new Date(data.givenDate);
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.status) updateData.status = data.status;

        const updatedLoan = await Loan.findByIdAndUpdate(
            loanId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedLoan) {
            throw new AppError('Failed to update loan', 500);
        }

        // Audit log for admin actions
        if (isAdmin) {
            await AuditService.log({
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

    static async markCompleted(
        loanId: string,
        userId: string,
        isAdmin = false
    ): Promise<ILoan> {
        return this.update(loanId, { status: 'COMPLETED' }, userId, isAdmin);
    }

    static async delete(
        loanId: string,
        userId: string,
        isAdmin = false,
        auditInfo?: { ipAddress?: string; userAgent?: string }
    ): Promise<void> {
        // Find loan first to verify ownership
        const loan = isAdmin
            ? await this.findById(loanId)
            : await this.findById(loanId, userId);

        // Delete loan history
        await LoanHistory.deleteMany({ loanId: loan._id });

        // Delete loan
        await Loan.findByIdAndDelete(loanId);

        // Audit log for admin actions
        if (isAdmin) {
            await AuditService.log({
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

    static async getDashboardStats(userId: string): Promise<{
        totalLoans: number;
        activeLoans: number;
        overdueLoans: number;
        completedLoans: number;
        totalAmount: number;
        totalInterest: number;
    }> {
        const baseQuery = { ownerUserId: new Types.ObjectId(userId) };

        const [total, active, overdue, completed, amounts] = await Promise.all([
            Loan.countDocuments(baseQuery),
            Loan.countDocuments({ ...baseQuery, status: 'ACTIVE' }),
            Loan.countDocuments({ ...baseQuery, status: 'OVERDUE' }),
            Loan.countDocuments({ ...baseQuery, status: 'COMPLETED' }),
            Loan.aggregate([
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

    static async getAdminDashboardStats(): Promise<{
        totalUsers: number;
        totalLoans: number;
        activeLoans: number;
        overdueLoans: number;
        completedLoans: number;
        totalAmount: number;
        totalInterest: number;
    }> {
        const User = require('../models').User;

        const [totalUsers, total, active, overdue, completed, amounts] = await Promise.all([
            User.countDocuments({ role: 'USER' }),
            Loan.countDocuments(),
            Loan.countDocuments({ status: 'ACTIVE' }),
            Loan.countDocuments({ status: 'OVERDUE' }),
            Loan.countDocuments({ status: 'COMPLETED' }),
            Loan.aggregate([
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