"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post('/login', [
    (0, validation_1.validateRequired)(['email', 'password']),
    (0, validation_1.validateStringLength)('email', 3, 50),
    (0, validation_1.validateStringLength)('password', 1, 100)
], AuthController_1.AuthController.login);
/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión
 * @access Private
 */
router.post('/logout', auth_1.authenticateToken, AuthController_1.AuthController.logout);
/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario actual
 * @access Private
 */
router.get('/profile', auth_1.authenticateToken, AuthController_1.AuthController.getProfile);
/**
 * @route POST /api/auth/change-password
 * @desc Cambiar contraseña del usuario actual
 * @access Private
 */
router.post('/change-password', [
    auth_1.authenticateToken,
    (0, validation_1.validateRequired)(['currentPassword', 'newPassword']),
    (0, validation_1.validateStringLength)('newPassword', 6, 100)
], AuthController_1.AuthController.changePassword);
/**
 * @route GET /api/auth/verify
 * @desc Verificar token de autenticación
 * @access Private
 */
router.get('/verify', auth_1.authenticateToken, AuthController_1.AuthController.verifyToken);
/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario (solo admins)
 * @access Private (Admin only)
 */
router.post('/register', [
    auth_1.authenticateToken,
    (0, auth_1.requireRole)(['admin']),
    (0, validation_1.validateRequired)(['nombre', 'email', 'password', 'rol']),
    (0, validation_1.validateStringLength)('nombre', 2, 100),
    (0, validation_1.validateStringLength)('email', 3, 50),
    (0, validation_1.validateStringLength)('password', 6, 100),
    (0, validation_1.validateEnum)('rol', ['admin', 'tecnico', 'consulta'])
], AuthController_1.AuthController.register);
exports.default = router;
//# sourceMappingURL=auth.js.map