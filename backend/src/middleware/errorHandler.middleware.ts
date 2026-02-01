// import { Request, Response, NextFunction } from 'express';
// import { ZodError } from 'zod';
// import mongoose from 'mongoose';

// export class AppError extends Error {
//     statusCode: number;
//     isOperational: boolean;

//     constructor(message: string, statusCode: number) {
//         super(message);
//         this.statusCode = statusCode;
//         this.isOperational = true;
//         Error.captureStackTrace(this, this.constructor);
//     }
// }

// export function errorHandler(
//     err: Error,
//     req: Request,
//     res: Response,
//     _next: NextFunction
// ): Response {
//     console.error('Error:', err);

//     // Zod validation error
//     if (err instanceof ZodError) {
//         const errors = err.errors.map((e) => ({
//             field: e.path.join('.'),
//             message: e.message,
//         }));
//         return res.status(400).json({
//             success: false,
//             error: 'Validation failed',
//             details: errors,
//         });
//     }

//     // Custom app error
//     if (err instanceof AppError) {
//         return res.status(err.statusCode).json({
//             success: false,
//             error: err.message,
//         });
//     }

//     // Mongoose validation error
//     if (err instanceof mongoose.Error.ValidationError) {
//         const errors = Object.values(err.errors).map((e) => ({
//             field: e.path,
//             message: e.message,
//         }));
//         return res.status(400).json({
//             success: false,
//             error: 'Validation failed',
//             details: errors,
//         });
//     }

//     // Mongoose duplicate key error
//     if (err.name === 'MongoServerError' && (err as any).code === 11000) {
//         const field = Object.keys((err as any).keyValue)[0];
//         return res.status(409).json({
//             success: false,
//             error: `${field} already exists`,
//         });
//     }

//     // Mongoose cast error (invalid ObjectId)
//     if (err instanceof mongoose.Error.CastError) {
//         return res.status(400).json({
//             success: false,
//             error: `Invalid ${err.path}: ${err.value}`,
//         });
//     }

//     // JWT errors
//     if (err.name === 'JsonWebTokenError') {
//         return res.status(401).json({
//             success: false,
//             error: 'Invalid token',
//         });
//     }

//     if (err.name === 'TokenExpiredError') {
//         return res.status(401).json({
//             success: false,
//             error: 'Token expired',
//         });
//     }

//     // Default server error
//     return res.status(500).json({
//         success: false,
//         error: 'Internal server error',
//     });
// }














// backend/src/middleware/errorHandler.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;

    constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): Response {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Zod validation error
    if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
        });
    }

    // Custom app error
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code || 'APP_ERROR',
        });
    }

    // Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
        });
    }

    // Mongoose duplicate key error
    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        const field = Object.keys((err as any).keyValue)[0];
        return res.status(409).json({
            success: false,
            error: `${field} already exists`,
            code: 'DUPLICATE_ERROR',
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            success: false,
            error: `Invalid ${err.path}: ${err.value}`,
            code: 'CAST_ERROR',
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            code: 'INVALID_TOKEN',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired',
            code: 'TOKEN_EXPIRED',
        });
    }

    // Default server error
    return res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        code: 'INTERNAL_ERROR',
    });
}