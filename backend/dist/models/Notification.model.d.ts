import { Document, Types } from 'mongoose';
import { NotificationType, NotificationChannel } from '../types';
export interface INotification extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    loanId?: Types.ObjectId;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    message: string;
    readAt?: Date;
    emailStatus?: 'PENDING' | 'SENT' | 'FAILED';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: import("mongoose").Model<INotification, {}, {}, {}, Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.model.d.ts.map