import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    constructor(message: string, statusCode: number, code?: string);
}
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Response;
//# sourceMappingURL=errorHandler.middleware.d.ts.map