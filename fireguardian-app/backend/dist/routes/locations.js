"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LocationController_1 = require("../controllers/LocationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const locationController = new LocationController_1.LocationController();
// Middleware de autenticación para todas las rutas
router.use(auth_1.authenticateToken);
// ==================== RUTAS DE SEDES ====================
/**
 * @route GET /api/sedes
 * @desc Obtener todas las sedes
 * @access Authenticated
 */
router.get('/sedes', locationController.getAllSedes.bind(locationController));
/**
 * @route GET /api/sedes/:id
 * @desc Obtener sede por ID
 * @access Authenticated
 */
router.get('/sedes/:id', locationController.getSedeById.bind(locationController));
/**
 * @route POST /api/sedes
 * @desc Crear nueva sede
 * @access Admin, Tecnico
 */
router.post('/sedes', (0, auth_1.requireRole)(['admin', 'tecnico']), [
    (0, validation_1.validateRequired)(['nombre'])
], locationController.createSede.bind(locationController));
/**
 * @route PUT /api/sedes/:id
 * @desc Actualizar sede
 * @access Admin, Tecnico
 */
router.put('/sedes/:id', (0, auth_1.requireRole)(['admin', 'tecnico']), locationController.updateSede.bind(locationController));
/**
 * @route DELETE /api/sedes/:id
 * @desc Eliminar sede
 * @access Admin
 */
router.delete('/sedes/:id', (0, auth_1.requireRole)(['admin']), locationController.deleteSede.bind(locationController));
// ==================== RUTAS DE UBICACIONES ====================
/**
 * @route GET /api/ubicaciones
 * @desc Obtener todas las ubicaciones (con filtro opcional por sede)
 * @access Authenticated
 */
router.get('/ubicaciones', locationController.getAllUbicaciones.bind(locationController));
/**
 * @route GET /api/ubicaciones/sede/:sedeId
 * @desc Obtener ubicaciones por sede
 * @access Authenticated
 */
router.get('/ubicaciones/sede/:sedeId', locationController.getUbicacionesBySede.bind(locationController));
/**
 * @route GET /api/ubicaciones/:id
 * @desc Obtener ubicación por ID
 * @access Authenticated
 */
router.get('/ubicaciones/:id', locationController.getUbicacionById.bind(locationController));
/**
 * @route POST /api/ubicaciones
 * @desc Crear nueva ubicación
 * @access Admin, Tecnico
 */
router.post('/ubicaciones', (0, auth_1.requireRole)(['admin', 'tecnico']), [
    (0, validation_1.validateRequired)(['nombre_area', 'sede_id']),
    (0, validation_1.validatePositiveInteger)('sede_id')
], locationController.createUbicacion.bind(locationController));
/**
 * @route PUT /api/ubicaciones/:id
 * @desc Actualizar ubicación
 * @access Admin, Tecnico
 */
router.put('/ubicaciones/:id', (0, auth_1.requireRole)(['admin', 'tecnico']), [
    (0, validation_1.validatePositiveInteger)('sede_id', false) // opcional
], locationController.updateUbicacion.bind(locationController));
/**
 * @route DELETE /api/ubicaciones/:id
 * @desc Eliminar ubicación
 * @access Admin
 */
router.delete('/ubicaciones/:id', (0, auth_1.requireRole)(['admin']), locationController.deleteUbicacion.bind(locationController));
exports.default = router;
//# sourceMappingURL=locations.js.map