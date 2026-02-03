import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare class ExportController {
    static exportCSV(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static exportPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    static exportLoanPDF(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=export.controller.d.ts.map