"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPagination = getPagination;
function getPagination(pageStr, limitStr) {
    const page = Math.max(1, parseInt(pageStr || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr || '10', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
//# sourceMappingURL=pagination.js.map