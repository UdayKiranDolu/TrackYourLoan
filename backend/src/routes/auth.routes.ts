import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    refreshTokenSchema,
} from '../validators/auth.validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post(
    '/change-password',
    authenticate,
    validate(changePasswordSchema),
    AuthController.changePassword
);
router.get('/profile', authenticate, AuthController.getProfile);
router.get('/export/loan/:id/pdf', AdminController.exportSingleLoanPDF);

export default router;