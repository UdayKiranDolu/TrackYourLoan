import { Schema, model, Document, Types } from 'mongoose';
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

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER',
        },
        forcePasswordReset: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);


// Index for faster lookups
// userSchema.index({ email: 1 });
// userSchema.index({ role: 1 });

export const User = model<IUser>('User', userSchema);