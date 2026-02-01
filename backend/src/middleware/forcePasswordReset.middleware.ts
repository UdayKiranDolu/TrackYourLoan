import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { User } from '../models';
import { AppError } from './errorHandler.middleware';

export async function checkForcePasswordReset(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        // Allow password change endpoint
        if (req.path === '/auth/change-password' && req.method === 'POST') {
            return next();
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.forcePasswordReset) {
            throw new AppError('Password change required', 403);
        }

        next();
    } catch (error) {
        next(error);
    }
}