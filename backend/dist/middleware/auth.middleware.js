"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const errorHandler_middleware_1 = require("./errorHandler.middleware");
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_middleware_1.AppError('Access token required', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_middleware_1.AppError) {
            next(error);
        }
        else {
            next(new errorHandler_middleware_1.AppError('Invalid or expired token', 401));
        }
    }
}
//# sourceMappingURL=auth.middleware.js.map