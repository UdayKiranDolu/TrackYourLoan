"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, message, statusCode = 200) {
    const response = {
        success: true,
        data,
        message,
    };
    return res.status(statusCode).json(response);
}
function sendError(res, error, statusCode = 400) {
    const response = {
        success: false,
        error,
    };
    return res.status(statusCode).json(response);
}
function sendPaginated(res, data, total, page, limit) {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
    });
}
//# sourceMappingURL=apiResponse.js.map