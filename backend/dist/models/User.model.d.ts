import { Document, Types } from 'mongoose';
import { UserRole } from '../types';
export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    passwordHash: string;
    role: UserRole;
    forcePasswordReset: boolean;
    refreshToken?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.model.d.ts.map