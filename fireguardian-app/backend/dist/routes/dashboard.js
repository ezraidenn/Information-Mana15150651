"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DashboardController_1 = require("../controllers/DashboardController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route GET /api/dashboard/stats
 * @desc Obtener estadísticas principales del dashboard
 * @access Private
 */
router.get('/stats', auth_1.authenticateToken, DashboardController_1.DashboardController.getStats);
/**
 * @route GET /api/dashboard/recent-activity
 * @desc Obtener actividad reciente
 * @access Private
 */
router.get('/recent-activity', auth_1.authenticateToken, DashboardController_1.DashboardController.getRecentActivity);
/**
 * @route GET /api/dashboard/performance
 * @desc Obtener métricas de rendimiento
 * @access Private
 */
router.get('/performance', auth_1.authenticateToken, DashboardController_1.DashboardController.getPerformanceMetrics);
/**
 * @route GET /api/dashboard/alerts
 * @desc Obtener alertas y notificaciones
 * @access Private
 */
router.get('/alerts', auth_1.authenticateToken, DashboardController_1.DashboardController.getAlerts);
exports.default = router;
//# sourceMappingURL=dashboard.js.map