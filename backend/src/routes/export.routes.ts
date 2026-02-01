import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkForcePasswordReset } from '../middleware/forcePasswordReset.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(checkForcePasswordReset);

router.get('/loans/csv', ExportController.exportCSV);
router.get('/loans/pdf', ExportController.exportPDF);
router.get('/loans/:id/pdf', ExportController.exportLoanPDF);

export default router;