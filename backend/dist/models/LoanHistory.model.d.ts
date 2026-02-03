import { Document, Types } from 'mongoose';
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
export declare const LoanHistory: import("mongoose").Model<ILoanHistory, {}, {}, {}, Document<unknown, {}, ILoanHistory, {}, {}> & ILoanHistory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LoanHistory.model.d.ts.map