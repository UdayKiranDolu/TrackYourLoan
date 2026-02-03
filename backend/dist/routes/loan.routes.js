"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("../controllers/loan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const forcePasswordReset_middleware_1 = require("../middleware/forcePasswordReset.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const loan_validator_1 = require("../validators/loan.validator");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
router.use(forcePasswordReset_middleware_1.checkForcePasswordReset);
// Dashboard
router.get('/dashboard', loan_controller_1.LoanController.getDashboard);
// CRUD operations
router.post('/', (0, validate_middleware_1.validate)(loan_validator_1.createLoanSchema), loan_controller_1.LoanController.create);
router.get('/', loan_controller_1.LoanController.getAll);
router.get('/:id', (0, validate_middleware_1.validate)(loan_validator_1.loanIdParamSchema), loan_controller_1.LoanController.getById);
router.patch('/:id', (0, validate_middleware_1.validate)(loan_validator_1.updateLoanSchema), loan_controller_1.LoanController.update);
router.delete('/:id', (0, validate_middleware_1.validate)(loan_validator_1.loanIdParamSchema), loan_controller_1.LoanController.delete);
// Special actions
router.patch('/:id/complete', (0, validate_middleware_1.validate)(loan_validator_1.loanIdParamSchema), loan_controller_1.LoanController.markCompleted);
router.get('/:id/history', (0, validate_middleware_1.validate)(loan_validator_1.loanIdParamSchema), loan_controller_1.LoanController.getHistory);
exports.default = router;
//# sourceMappingURL=loan.routes.js.map