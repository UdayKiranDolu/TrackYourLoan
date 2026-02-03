"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const export_controller_1 = require("../controllers/export.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const forcePasswordReset_middleware_1 = require("../middleware/forcePasswordReset.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
router.use(forcePasswordReset_middleware_1.checkForcePasswordReset);
router.get('/loans/csv', export_controller_1.ExportController.exportCSV);
router.get('/loans/pdf', export_controller_1.ExportController.exportPDF);
router.get('/loans/:id/pdf', export_controller_1.ExportController.exportLoanPDF);
exports.default = router;
//# sourceMappingURL=export.routes.js.map