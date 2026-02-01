import { Schema, model, Document, Types } from 'mongoose';

export interface ILoanChange {
    field: 'dueDate' | 'interestAmount';
    oldValue: Date | number;
    newValue: Date | number;
}

export interface ILoanHistory extends Document {
    _id: Types.ObjectId;
    loanId: Types.ObjectId;
    changedByUserId: Types.ObjectId;
    changedAt: Date;
    changes: ILoanChange[];
    note: string;
}

const loanHistorySchema = new Schema<ILoanHistory>(
    {
        loanId: {
            type: Schema.Types.ObjectId,
            ref: 'Loan',
            required: true,
            index: true,
        },
        changedByUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        changedAt: {
            type: Date,
            default: Date.now,
        },
        changes: [
            {
                field: {
                    type: String,
                    enum: ['dueDate', 'interestAmount'],
                    required: true,
                },
                oldValue: {
                    type: Schema.Types.Mixed,
                    required: true,
                },
                newValue: {
                    type: Schema.Types.Mixed,
                    required: true,
                },
            },
        ],
        note: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

loanHistorySchema.index({ loanId: 1, changedAt: -1 });

export const LoanHistory = model<ILoanHistory>('LoanHistory', loanHistorySchema);