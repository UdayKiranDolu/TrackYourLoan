import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class AuthController {
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map