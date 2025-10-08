import { Router } from 'express';
import { MantenimientoController } from '../controllers/MantenimientoController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/mantenimientos
 * @desc    Obtener todos los mantenimientos con filtros
 * @access  Todos los usuarios autenticados
 */
router.get('/', MantenimientoController.getAll);

/**
 * @route   GET /api/mantenimientos/stats
 * @desc    Obtener estadísticas de mantenimientos
 * @access  Todos los usuarios autenticados
 */
router.get('/stats', MantenimientoController.getStats);

/**
 * @route   GET /api/mantenimientos/:id
 * @desc    Obtener un mantenimiento específico por ID
 * @access  Todos los usuarios autenticados
 */
router.get('/:id', MantenimientoController.getById);

/**
 * @route   GET /api/mantenimientos/extintor/:extintor_id
 * @desc    Obtener historial de mantenimientos de un extintor
 * @access  Todos los usuarios autenticados
 */
router.get('/extintor/:extintor_id', MantenimientoController.getByExtintor);

/**
 * @route   POST /api/mantenimientos
 * @desc    Crear un nuevo mantenimiento
 * @access  Admin y Técnico
 */
router.post(
  '/',
  requireRole(['admin', 'tecnico']),
  MantenimientoController.create
);

/**
 * @route   PUT /api/mantenimientos/:id
 * @desc    Actualizar un mantenimiento existente
 * @access  Admin y Técnico
 */
router.put(
  '/:id',
  requireRole(['admin', 'tecnico']),
  MantenimientoController.update
);

/**
 * @route   DELETE /api/mantenimientos/:id
 * @desc    Eliminar un mantenimiento
 * @access  Solo Admin
 */
router.delete(
  '/:id',
  requireRole(['admin']),
  MantenimientoController.delete
);

export default router;
