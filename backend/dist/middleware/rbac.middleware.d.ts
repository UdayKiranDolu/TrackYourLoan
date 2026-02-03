import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
export declare function authorize(...allowedRoles: UserRole[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare function isAdmin(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=rbac.middleware.d.ts.map