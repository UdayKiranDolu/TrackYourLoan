import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/apiResponse';

export class AuthController {
    static async register(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await AuthService.register(email, password);

            sendSuccess(res, result, 'Registration successful', 201);
        } catch (error) {
            next(error);
        }
    }

    static async login(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

            sendSuccess(res, result, 'Login successful');
        } catch (error) {
            next(error);
        }
    }

    static async refresh(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { refreshToken } = req.body;
            const tokens = await AuthService.refresh(refreshToken);

            sendSuccess(res, tokens, 'Tokens refreshed');
        } catch (error) {
            next(error);
        }
    }

    static async logout(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (req.user) {
                await AuthService.logout(req.user.userId);
            }

            sendSuccess(res, null, 'Logout successful');
        } catch (error) {
            next(error);
        }
    }

    static async changePassword(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!req.user) {
                throw new Error('User not authenticated');
            }

            await AuthService.changePassword(
                req.user.userId,
                currentPassword,
                newPassword
            );

            sendSuccess(res, null, 'Password changed successfully');
        } catch (error) {
            next(error);
        }
    }

    static async getProfile(
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const user = await AuthService.getProfile(req.user.userId);

            sendSuccess(res, { user });
        } catch (error) {
            next(error);
        }
    }
}