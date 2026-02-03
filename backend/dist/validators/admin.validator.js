"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdParamSchema = exports.resetPasswordSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(['USER', 'ADMIN']).optional(),
        forcePasswordReset: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'User ID is required' }),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        tempPassword: zod_1.z
            .string({ required_error: 'Temporary password is required' })
            .min(6, 'Password must be at least 6 characters'),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'User ID is required' }),
    }),
});
exports.userIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'User ID is required' }),
    }),
});
//# sourceMappingURL=admin.validator.js.map