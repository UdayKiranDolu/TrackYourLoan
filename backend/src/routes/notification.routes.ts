import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { checkForcePasswordReset } from '../middleware/forcePasswordReset.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(checkForcePasswordReset);

router.get('/', NotificationController.getAll);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;