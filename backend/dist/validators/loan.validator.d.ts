import { z } from 'zod';
export declare const createLoanSchema: z.ZodObject<{
    body: z.ZodObject<{
        borrowerName: z.ZodString;
        actualAmount: z.ZodNumber;
        interestAmount: z.ZodNumber;
        givenDate: z.ZodEffects<z.ZodString, string, string>;
        dueDate: z.ZodEffects<z.ZodString, string, string>;
        notes: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "OVERDUE", "COMPLETED"]>>;
    }, "strip", z.ZodTypeAny, {
        borrowerName: string;
        actualAmount: number;
        interestAmount: number;
        givenDate: string;
        dueDate: string;
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        notes?: string | undefined;
    }, {
        borrowerName: string;
        actualAmount: number;
        interestAmount: number;
        givenDate: string;
        dueDate: string;
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        borrowerName: string;
        actualAmount: number;
        interestAmount: number;
        givenDate: string;
        dueDate: string;
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        notes?: string | undefined;
    };
}, {
    body: {
        borrowerName: string;
        actualAmount: number;
        interestAmount: number;
        givenDate: string;
        dueDate: string;
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        notes?: string | undefined;
    };
}>;
export declare const updateLoanSchema: z.ZodObject<{
    body: z.ZodObject<{
        borrowerName: z.ZodOptional<z.ZodString>;
        actualAmount: z.ZodOptional<z.ZodNumber>;
        interestAmount: z.ZodOptional<z.ZodNumber>;
        givenDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        dueDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        notes: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "OVERDUE", "COMPLETED"]>>;
    }, "strip", z.ZodTypeAny, {
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        borrowerName?: string | undefined;
        actualAmount?: number | undefined;
        interestAmount?: number | undefined;
        givenDate?: string | undefined;
        dueDate?: string | undefined;
        notes?: string | undefined;
    }, {
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        borrowerName?: string | undefined;
        actualAmount?: number | undefined;
        interestAmount?: number | undefined;
        givenDate?: string | undefined;
        dueDate?: string | undefined;
        notes?: string | undefined;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        borrowerName?: string | undefined;
        actualAmount?: number | undefined;
        interestAmount?: number | undefined;
        givenDate?: string | undefined;
        dueDate?: string | undefined;
        notes?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        status?: "ACTIVE" | "OVERDUE" | "COMPLETED" | undefined;
        borrowerName?: string | undefined;
        actualAmount?: number | undefined;
        interestAmount?: number | undefined;
        givenDate?: string | undefined;
        dueDate?: string | undefined;
        notes?: string | undefined;
    };
}>;
export declare const loanIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export type CreateLoanInput = z.infer<typeof createLoanSchema>['body'];
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>['body'];
//# sourceMappingURL=loan.validator.d.ts.map