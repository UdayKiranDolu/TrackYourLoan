import { Response } from 'express';
export declare function sendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
export declare function sendError(res: Response, error: string, statusCode?: number): Response;
export declare function sendPaginated<T>(res: Response, data: T[], total: number, page: number, limit: number): Response;
//# sourceMappingURL=apiResponse.d.ts.map