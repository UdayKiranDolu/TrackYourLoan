"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForcePasswordReset = checkForcePasswordReset;
const models_1 = require("../models");
const errorHandler_middleware_1 = require("./errorHandler.middleware");
async function checkForcePasswordReset(req, res, next) {
    try {
        if (!req.user) {
            throw new errorHandler_middleware_1.AppError('Authentication required', 401);
        }
        // Allow password change endpoint
        if (req.path === '/auth/change-password' && req.method === 'POST') {
            return next();
        }
        const user = await models_1.User.findById(req.user.userId);
        if (!user) {
            throw new errorHandler_middleware_1.AppError('User not found', 404);
        }
        if (user.forcePasswordReset) {
            throw new errorHandler_middleware_1.AppError('Password change required', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=forcePasswordReset.middleware.js.map