import { Document, Types } from 'mongoose';
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
export declare const Loan: import("mongoose").Model<ILoan, {}, {}, {}, Document<unknown, {}, ILoan, {}, {}> & ILoan & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Loan.model.d.ts.map