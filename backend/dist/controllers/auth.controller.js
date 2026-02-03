"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const apiResponse_1 = require("../utils/apiResponse");
class AuthController {
    static async register(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.register(email, password);
            (0, apiResponse_1.sendSuccess)(res, result, 'Registration successful', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.login(email, password);
            (0, apiResponse_1.sendSuccess)(res, result, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await auth_service_1.AuthService.refresh(refreshToken);
            (0, apiResponse_1.sendSuccess)(res, tokens, 'Tokens refreshed');
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            if (req.user) {
                await auth_service_1.AuthService.logout(req.user.userId);
            }
            (0, apiResponse_1.sendSuccess)(res, null, 'Logout successful');
        }
        catch (error) {
            next(error);
        }
    }
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!req.user) {
                throw new Error('User not authenticated');
            }
            await auth_service_1.AuthService.changePassword(req.user.userId, currentPassword, newPassword);
            (0, apiResponse_1.sendSuccess)(res, null, 'Password changed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }
            const user = await auth_service_1.AuthService.getProfile(req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, { user });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map