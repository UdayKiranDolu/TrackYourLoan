import { Schema, model, Document, Types } from 'mongoose';
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

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        loanId: {
            type: Schema.Types.ObjectId,
            ref: 'Loan',
            index: true,
        },
        type: {
            type: String,
            enum: ['DUE_SOON', 'OVERDUE'],
            required: true,
        },
        channel: {
            type: String,
            enum: ['IN_APP', 'EMAIL'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        readAt: {
            type: Date,
            default: null,
        },
        emailStatus: {
            type: String,
            enum: ['PENDING', 'SENT', 'FAILED'],
        },
    },
    { timestamps: true }
);

// Compound unique index to prevent duplicate notifications
notificationSchema.index(
    { loanId: 1, type: 1, channel: 1 },
    {
        unique: true,
        partialFilterExpression: { loanId: { $exists: true, $ne: null } },
    }
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);