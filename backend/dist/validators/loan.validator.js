"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanIdParamSchema = exports.updateLoanSchema = exports.createLoanSchema = void 0;
const zod_1 = require("zod");
exports.createLoanSchema = zod_1.z.object({
    body: zod_1.z.object({
        borrowerName: zod_1.z
            .string({ required_error: 'Borrower name is required' })
            .min(1, 'Borrower name is required')
            .max(100, 'Borrower name cannot exceed 100 characters')
            .trim(),
        actualAmount: zod_1.z
            .number({ required_error: 'Actual amount is required' })
            .min(0, 'Amount cannot be negative'),
        interestAmount: zod_1.z
            .number({ required_error: 'Interest amount is required' })
            .min(0, 'Interest cannot be negative'),
        givenDate: zod_1.z.string({ required_error: 'Given date is required' }).refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid given date' }),
        dueDate: zod_1.z.string({ required_error: 'Due date is required' }).refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date' }),
        notes: zod_1.z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
        status: zod_1.z.enum(['ACTIVE', 'OVERDUE', 'COMPLETED']).optional(),
    }),
});
exports.updateLoanSchema = zod_1.z.object({
    body: zod_1.z.object({
        borrowerName: zod_1.z
            .string()
            .min(1)
            .max(100, 'Borrower name cannot exceed 100 characters')
            .trim()
            .optional(),
        actualAmount: zod_1.z.number().min(0, 'Amount cannot be negative').optional(),
        interestAmount: zod_1.z.number().min(0, 'Interest cannot be negative').optional(),
        givenDate: zod_1.z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid given date' })
            .optional(),
        dueDate: zod_1.z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid due date' })
            .optional(),
        notes: zod_1.z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
        status: zod_1.z.enum(['ACTIVE', 'OVERDUE', 'COMPLETED']).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'Loan ID is required' }),
    }),
});
exports.loanIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'Loan ID is required' }),
    }),
});
//# sourceMappingURL=loan.validator.js.map