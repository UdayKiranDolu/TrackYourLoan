"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const forcePasswordReset_middleware_1 = require("../middleware/forcePasswordReset.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const admin_validator_1 = require("../validators/admin.validator");
const loan_validator_1 = require("../validators/loan.validator");
const router = (0, express_1.Router)();
// All routes require authentication + admin role
router.use(auth_middleware_1.authenticate);
router.use(forcePasswordReset_middleware_1.checkForcePasswordReset);
router.use(rbac_middleware_1.isAdmin);
// Dashboard
router.get('/dashboard', admin_controller_1.AdminController.getDashboard);
// Users
router.get('/users', admin_controller_1.AdminController.getUsers);
router.get('/users/:id', (0, validate_middleware_1.validate)(admin_validator_1.userIdParamSchema), admin_controller_1.AdminController.getUserById);
router.patch('/users/:id', (0, validate_middleware_1.validate)(admin_validator_1.updateUserSchema), admin_controller_1.AdminController.updateUser);
router.post('/users/:id/reset-password', (0, validate_middleware_1.validate)(admin_validator_1.resetPasswordSchema), admin_controller_1.AdminController.resetPassword);
router.post('/users/:id/impersonate', (0, validate_middleware_1.validate)(admin_validator_1.userIdParamSchema), admin_controller_1.AdminController.impersonate);
router.post('/stop-impersonation', admin_controller_1.AdminController.stopImpersonation);
// Loans (system-wide)
router.get('/loans', admin_controller_1.AdminController.getAllLoans);
router.get('/loans/:id', (0, validate_middleware_1.validate)(loan_validator_1.loanIdParamSchema), admin_controller_1.AdminController.getLoanById);
router.patch('/loans/:id', (0, validate_middleware_1.validate)(loan_validator_1.updateLoanSchema), admin_controller_1.AdminController.updateLoan);
router.delete('/loans/:id', (0, validate_middleware_1.validate)(loan_validator_1.loanIdParamSchema), admin_controller_1.AdminController.deleteLoan);
// Exports (system-wide)
router.get('/export/loans/csv', admin_controller_1.AdminController.exportAllLoansCSV);
router.get('/export/loans/pdf', admin_controller_1.AdminController.exportAllLoansPDF);
router.get('/export/loan/:id/pdf', (0, validate_middleware_1.validate)(loan_validator_1.loanIdParamSchema), admin_controller_1.AdminController.exportSingleLoanPDF);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map