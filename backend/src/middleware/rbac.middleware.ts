import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { AppError } from './errorHandler.middleware';

export function authorize(...allowedRoles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError('Insufficient permissions', 403);
        }

        next();
    };
}

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user || req.user.role !== 'ADMIN') {
        throw new AppError('Admin access required', 403);
    }
    next();
}