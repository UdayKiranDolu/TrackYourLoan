"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.isAdmin = isAdmin;
const errorHandler_middleware_1 = require("./errorHandler.middleware");
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            throw new errorHandler_middleware_1.AppError('Authentication required', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new errorHandler_middleware_1.AppError('Insufficient permissions', 403);
        }
        next();
    };
}
function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        throw new errorHandler_middleware_1.AppError('Admin access required', 403);
    }
    next();
}
//# sourceMappingURL=rbac.middleware.js.map