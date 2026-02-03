"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const forcePasswordReset_middleware_1 = require("../middleware/forcePasswordReset.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
router.use(forcePasswordReset_middleware_1.checkForcePasswordReset);
router.get('/', notification_controller_1.NotificationController.getAll);
router.get('/unread-count', notification_controller_1.NotificationController.getUnreadCount);
router.patch('/read-all', notification_controller_1.NotificationController.markAllAsRead);
router.patch('/:id/read', notification_controller_1.NotificationController.markAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map