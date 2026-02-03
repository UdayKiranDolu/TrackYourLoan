import { z } from 'zod';
export declare const updateUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        role: z.ZodOptional<z.ZodEnum<["USER", "ADMIN"]>>;
        forcePasswordReset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        role?: "USER" | "ADMIN" | undefined;
        forcePasswordReset?: boolean | undefined;
    }, {
        role?: "USER" | "ADMIN" | undefined;
        forcePasswordReset?: boolean | undefined;
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
        role?: "USER" | "ADMIN" | undefined;
        forcePasswordReset?: boolean | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        role?: "USER" | "ADMIN" | undefined;
        forcePasswordReset?: boolean | undefined;
    };
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        tempPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tempPassword: string;
    }, {
        tempPassword: string;
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
        tempPassword: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        tempPassword: string;
    };
}>;
export declare const userIdParamSchema: z.ZodObject<{
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
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
//# sourceMappingURL=admin.validator.d.ts.map