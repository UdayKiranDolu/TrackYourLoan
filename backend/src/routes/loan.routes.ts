import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkForcePasswordReset } from '../middleware/forcePasswordReset.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    createLoanSchema,
    updateLoanSchema,
    loanIdParamSchema,
} from '../validators/loan.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(checkForcePasswordReset);

// Dashboard
router.get('/dashboard', LoanController.getDashboard);

// CRUD operations
router.post('/', validate(createLoanSchema), LoanController.create);
router.get('/', LoanController.getAll);
router.get('/:id', validate(loanIdParamSchema), LoanController.getById);
router.patch('/:id', validate(updateLoanSchema), LoanController.update);
router.delete('/:id', validate(loanIdParamSchema), LoanController.delete);

// Special actions
router.patch(
    '/:id/complete',
    validate(loanIdParamSchema),
    LoanController.markCompleted
);
router.get(
    '/:id/history',
    validate(loanIdParamSchema),
    LoanController.getHistory
);

export default router;