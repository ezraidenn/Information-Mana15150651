import { Router } from 'express';
import { LocationController } from '../controllers/LocationController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequired, validatePositiveInteger } from '../middleware/validation';

const router = Router();
const locationController = new LocationController();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ==================== RUTAS DE SEDES ====================

/**
 * @route GET /api/sedes
 * @desc Obtener todas las sedes
 * @access Authenticated
 */
router.get(
  '/sedes',
  locationController.getAllSedes.bind(locationController)
);

/**
 * @route GET /api/sedes/:id
 * @desc Obtener sede por ID
 * @access Authenticated
 */
router.get(
  '/sedes/:id',
  locationController.getSedeById.bind(locationController)
);

/**
 * @route POST /api/sedes
 * @desc Crear nueva sede
 * @access Admin, Tecnico
 */
router.post(
  '/sedes',
  requireRole(['admin', 'tecnico']),
  [
    validateRequired(['nombre'])
  ],
  locationController.createSede.bind(locationController)
);

/**
 * @route PUT /api/sedes/:id
 * @desc Actualizar sede
 * @access Admin, Tecnico
 */
router.put(
  '/sedes/:id',
  requireRole(['admin', 'tecnico']),
  locationController.updateSede.bind(locationController)
);

/**
 * @route DELETE /api/sedes/:id
 * @desc Eliminar sede
 * @access Admin
 */
router.delete(
  '/sedes/:id',
  requireRole(['admin']),
  locationController.deleteSede.bind(locationController)
);

// ==================== RUTAS DE UBICACIONES ====================

/**
 * @route GET /api/ubicaciones
 * @desc Obtener todas las ubicaciones (con filtro opcional por sede)
 * @access Authenticated
 */
router.get(
  '/ubicaciones',
  locationController.getAllUbicaciones.bind(locationController)
);

/**
 * @route GET /api/ubicaciones/sede/:sedeId
 * @desc Obtener ubicaciones por sede
 * @access Authenticated
 */
router.get(
  '/ubicaciones/sede/:sedeId',
  locationController.getUbicacionesBySede.bind(locationController)
);

/**
 * @route GET /api/ubicaciones/:id
 * @desc Obtener ubicación por ID
 * @access Authenticated
 */
router.get(
  '/ubicaciones/:id',
  locationController.getUbicacionById.bind(locationController)
);

/**
 * @route POST /api/ubicaciones
 * @desc Crear nueva ubicación
 * @access Admin, Tecnico
 */
router.post(
  '/ubicaciones',
  requireRole(['admin', 'tecnico']),
  [
    validateRequired(['nombre_area', 'sede_id']),
    validatePositiveInteger('sede_id')
  ],
  locationController.createUbicacion.bind(locationController)
);

/**
 * @route PUT /api/ubicaciones/:id
 * @desc Actualizar ubicación
 * @access Admin, Tecnico
 */
router.put(
  '/ubicaciones/:id',
  requireRole(['admin', 'tecnico']),
  [
    validatePositiveInteger('sede_id', false) // opcional
  ],
  locationController.updateUbicacion.bind(locationController)
);

/**
 * @route DELETE /api/ubicaciones/:id
 * @desc Eliminar ubicación
 * @access Admin
 */
router.delete(
  '/ubicaciones/:id',
  requireRole(['admin']),
  locationController.deleteUbicacion.bind(locationController)
);

export default router;
