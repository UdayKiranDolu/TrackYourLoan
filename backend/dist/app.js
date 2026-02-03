"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
// Import routes (we'll create these next)
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const loan_routes_1 = __importDefault(require("./routes/loan.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
// Import scheduler
const notificationScheduler_1 = require("./jobs/notificationScheduler");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: env_1.env.appBaseUrl,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/loans', loan_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/export', export_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Error handler (must be last)
app.use(errorHandler_middleware_1.errorHandler);
// Start server
async function startServer() {
    try {
        (0, env_1.validateEnv)();
        await (0, db_1.connectDB)();
        // Start notification scheduler
        (0, notificationScheduler_1.startNotificationScheduler)();
        app.listen(env_1.env.port, () => {
            console.log(`🚀 Server running on port ${env_1.env.port}`);
            console.log(`📍 Environment: ${env_1.env.nodeEnv}`);
            console.log(`🌐 API URL: ${env_1.env.apiBaseUrl}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map