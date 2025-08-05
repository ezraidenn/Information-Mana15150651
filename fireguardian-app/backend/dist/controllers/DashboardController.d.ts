import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class DashboardController {
    /**
     * Obtener estadísticas principales del dashboard
     */
    static getStats(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Obtener resumen de actividad reciente
     */
    static getRecentActivity(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Obtener métricas de rendimiento
     */
    static getPerformanceMetrics(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Obtener alertas y notificaciones
     */
    static getAlerts(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=DashboardController.d.ts.map