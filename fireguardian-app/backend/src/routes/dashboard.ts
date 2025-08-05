import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/dashboard/stats
 * @desc Obtener estadísticas principales del dashboard
 * @access Private
 */
router.get('/stats', authenticateToken, DashboardController.getStats);

/**
 * @route GET /api/dashboard/recent-activity
 * @desc Obtener actividad reciente
 * @access Private
 */
router.get('/recent-activity', authenticateToken, DashboardController.getRecentActivity);

/**
 * @route GET /api/dashboard/performance
 * @desc Obtener métricas de rendimiento
 * @access Private
 */
router.get('/performance', authenticateToken, DashboardController.getPerformanceMetrics);

/**
 * @route GET /api/dashboard/alerts
 * @desc Obtener alertas y notificaciones
 * @access Private
 */
router.get('/alerts', authenticateToken, DashboardController.getAlerts);

export default router;
