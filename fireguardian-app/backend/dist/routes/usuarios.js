"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UsuarioController_1 = require("../controllers/UsuarioController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const usuarioController = new UsuarioController_1.UsuarioController();
// Middleware de autenticación para todas las rutas
router.use(auth_1.authenticateToken);
/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios (solo admins)
 * @access Admin
 */
router.get('/', (0, auth_1.requireRole)(['admin']), usuarioController.getAll.bind(usuarioController));
/**
 * @route GET /api/usuarios/stats
 * @desc Obtener estadísticas de usuarios (solo admins)
 * @access Admin
 */
router.get('/stats', (0, auth_1.requireRole)(['admin']), usuarioController.getStats.bind(usuarioController));
/**
 * @route GET /api/usuarios/recent-activity
 * @desc Obtener actividad reciente de usuarios (solo admins)
 * @access Admin
 */
router.get('/recent-activity', (0, auth_1.requireRole)(['admin']), usuarioController.getRecentActivity.bind(usuarioController));
/**
 * @route GET /api/usuarios/:id
 * @desc Obtener usuario por ID (solo admins)
 * @access Admin
 */
router.get('/:id', (0, auth_1.requireRole)(['admin']), usuarioController.getById.bind(usuarioController));
/**
 * @route POST /api/usuarios
 * @desc Crear nuevo usuario (solo admins)
 * @access Admin
 */
router.post('/', (0, auth_1.requireRole)(['admin']), [
    (0, validation_1.validateRequired)(['nombre', 'email', 'password']),
    (0, validation_1.validateEmail)('email'),
    (0, validation_1.validateStringLength)('password', 6, 255),
    (0, validation_1.validateEnum)('rol', ['admin', 'tecnico', 'consulta'], false) // opcional
], usuarioController.create.bind(usuarioController));
/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar usuario (solo admins)
 * @access Admin
 */
router.put('/:id', (0, auth_1.requireRole)(['admin']), [
    (0, validation_1.validateEmail)('email'), // opcional
    (0, validation_1.validateEnum)('rol', ['admin', 'tecnico', 'consulta'], false) // opcional
], usuarioController.update.bind(usuarioController));
/**
 * @route PUT /api/usuarios/:id/password
 * @desc Cambiar contraseña de usuario (solo admins)
 * @access Admin
 */
router.put('/:id/password', (0, auth_1.requireRole)(['admin']), [
    (0, validation_1.validateRequired)(['newPassword']),
    (0, validation_1.validateStringLength)('newPassword', 6, 255)
], usuarioController.changePassword.bind(usuarioController));
/**
 * @route PUT /api/usuarios/:id/toggle-active
 * @desc Activar/Desactivar usuario (solo admins)
 * @access Admin
 */
router.put('/:id/toggle-active', (0, auth_1.requireRole)(['admin']), usuarioController.toggleActive.bind(usuarioController));
/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar usuario (soft delete) (solo admins)
 * @access Admin
 */
router.delete('/:id', (0, auth_1.requireRole)(['admin']), usuarioController.delete.bind(usuarioController));
exports.default = router;
//# sourceMappingURL=usuarios.js.map