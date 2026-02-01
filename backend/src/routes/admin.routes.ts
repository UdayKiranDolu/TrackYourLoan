import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/rbac.middleware';
import { checkForcePasswordReset } from '../middleware/forcePasswordReset.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    updateUserSchema,
    resetPasswordSchema,
    userIdParamSchema,
} from '../validators/admin.validator';
import { updateLoanSchema, loanIdParamSchema } from '../validators/loan.validator';

const router = Router();

// All routes require authentication + admin role
router.use(authenticate);
router.use(checkForcePasswordReset);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Users
router.get('/users', AdminController.getUsers);
router.get('/users/:id', validate(userIdParamSchema), AdminController.getUserById);
router.patch('/users/:id', validate(updateUserSchema), AdminController.updateUser);
router.post(
    '/users/:id/reset-password',
    validate(resetPasswordSchema),
    AdminController.resetPassword
);
router.post(
    '/users/:id/impersonate',
    validate(userIdParamSchema),
    AdminController.impersonate
);
router.post('/stop-impersonation', AdminController.stopImpersonation);

// Loans (system-wide)
router.get('/loans', AdminController.getAllLoans);
router.get('/loans/:id', validate(loanIdParamSchema), AdminController.getLoanById);
router.patch('/loans/:id', validate(updateLoanSchema), AdminController.updateLoan);
router.delete('/loans/:id', validate(loanIdParamSchema), AdminController.deleteLoan);

// Exports (system-wide)
router.get('/export/loans/csv', AdminController.exportAllLoansCSV);
router.get('/export/loans/pdf', AdminController.exportAllLoansPDF);
router.get('/export/loan/:id/pdf', validate(loanIdParamSchema), AdminController.exportSingleLoanPDF);

export default router;