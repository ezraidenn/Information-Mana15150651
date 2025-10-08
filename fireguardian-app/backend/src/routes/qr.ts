import { Router } from 'express';
import { QRController } from '../controllers/QRController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/qr/scan
 * @desc Escanear una imagen QR y buscar el extintor correspondiente
 * @access Private
 */
router.post('/scan', authenticateToken, QRController.scanQR);

/**
 * @route GET /api/qr/generate/:id
 * @desc Generar un código QR para un extintor
 * @access Private
 */
router.get('/generate/:id', authenticateToken, QRController.generateQR);

export default router;
