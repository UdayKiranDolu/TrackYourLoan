import { Schema, model, Document, Types } from 'mongoose';
import { LoanStatus } from '../types';

export interface ILoan extends Document {
    _id: Types.ObjectId;
    ownerUserId: Types.ObjectId;
    borrowerName: string;
    actualAmount: number;
    interestAmount: number;
    givenDate: Date;
    dueDate: Date;
    notes: string;
    status: LoanStatus;
    createdAt: Date;
    updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
    {
        ownerUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Owner user ID is required'],
            index: true,
        },
        borrowerName: {
            type: String,
            required: [true, 'Borrower name is required'],
            trim: true,
            maxlength: [100, 'Borrower name cannot exceed 100 characters'],
        },
        actualAmount: {
            type: Number,
            required: [true, 'Actual loan amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        interestAmount: {
            type: Number,
            required: [true, 'Interest amount is required'],
            min: [0, 'Interest cannot be negative'],
        },
        givenDate: {
            type: Date,
            required: [true, 'Given date is required'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
            index: true,
        },
        notes: {
            type: String,
            default: '',
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'OVERDUE', 'COMPLETED'],
            default: 'ACTIVE',
            index: true,
        },
    },
    { timestamps: true }
);

// Compound indexes for common queries
loanSchema.index({ ownerUserId: 1, status: 1 });
loanSchema.index({ ownerUserId: 1, dueDate: 1 });
loanSchema.index({ borrowerName: 'text' });

export const Loan = model<ILoan>('Loan', loanSchema);