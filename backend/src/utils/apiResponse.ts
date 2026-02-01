import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
): Response {
    const response: ApiResponse<T> = {
        success: true,
        data,
        message,
    };
    return res.status(statusCode).json(response);
}

export function sendError(
    res: Response,
    error: string,
    statusCode = 400
): Response {
    const response: ApiResponse = {
        success: false,
        error,
    };
    return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number
): Response {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    });
}