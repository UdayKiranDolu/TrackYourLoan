"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), auth_controller_1.AuthController.register);
router.post('/login', (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), auth_controller_1.AuthController.login);
router.post('/refresh', (0, validate_middleware_1.validate)(auth_validator_1.refreshTokenSchema), auth_controller_1.AuthController.refresh);
// Protected routes
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.AuthController.logout);
router.post('/change-password', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(auth_validator_1.changePasswordSchema), auth_controller_1.AuthController.changePassword);
router.get('/profile', auth_middleware_1.authenticate, auth_controller_1.AuthController.getProfile);
router.get('/export/loan/:id/pdf', admin_controller_1.AdminController.exportSingleLoanPDF);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map