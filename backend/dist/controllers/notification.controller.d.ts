import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class NotificationController {
    static getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static getUnreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=notification.controller.d.ts.map