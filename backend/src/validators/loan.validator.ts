import { z } from 'zod';

export const createLoanSchema = z.object({
    body: z.object({
        borrowerName: z
            .string({ required_error: 'Borrower name is required' })
            .min(1, 'Borrower name is required')
            .max(100, 'Borrower name cannot exceed 100 characters')
            .trim(),
        actualAmount: z
            .number({ required_error: 'Actual amount is required' })
            .min(0, 'Amount cannot be negative'),
        interestAmount: z
            .number({ required_error: 'Interest amount is required' })
            .min(0, 'Interest cannot be negative'),
        givenDate: z.string({ required_error: 'Given date is required' }).refine(
            (val) => !isNaN(Date.parse(val)),
            { message: 'Invalid given date' }
        ),
        dueDate: z.string({ required_error: 'Due date is required' }).refine(
            (val) => !isNaN(Date.parse(val)),
            { message: 'Invalid due date' }
        ),
        notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
        status: z.enum(['ACTIVE', 'OVERDUE', 'COMPLETED']).optional(),
    }),
});

export const updateLoanSchema = z.object({
    body: z.object({
        borrowerName: z
            .string()
            .min(1)
            .max(100, 'Borrower name cannot exceed 100 characters')
            .trim()
            .optional(),
        actualAmount: z.number().min(0, 'Amount cannot be negative').optional(),
        interestAmount: z.number().min(0, 'Interest cannot be negative').optional(),
        givenDate: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid given date' })
            .optional(),
        dueDate: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date' })
            .optional(),
        notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
        status: z.enum(['ACTIVE', 'OVERDUE', 'COMPLETED']).optional(),
    }),
    params: z.object({
        id: z.string({ required_error: 'Loan ID is required' }),
    }),
});

export const loanIdParamSchema = z.object({
    params: z.object({
        id: z.string({ required_error: 'Loan ID is required' }),
    }),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>['body'];
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>['body'];