import { z } from 'zod';

export const updateUserSchema = z.object({
    body: z.object({
        role: z.enum(['USER', 'ADMIN']).optional(),
        forcePasswordReset: z.boolean().optional(),
    }),
    params: z.object({
        id: z.string({ required_error: 'User ID is required' }),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        tempPassword: z
            .string({ required_error: 'Temporary password is required' })
            .min(6, 'Password must be at least 6 characters'),
    }),
    params: z.object({
        id: z.string({ required_error: 'User ID is required' }),
    }),
});

export const userIdParamSchema = z.object({
    params: z.object({
        id: z.string({ required_error: 'User ID is required' }),
    }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];