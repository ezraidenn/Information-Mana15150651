import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequired, validateStringLength, validateEnum } from '../middleware/validation';

const router = Router();

// Ruta temporal para crear un usuario administrador
router.get('/create-admin', AuthController.createAdmin);

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post('/login', [
  validateRequired(['email', 'password']),
  validateStringLength('email', 3, 50),
  validateStringLength('password', 1, 100)
], AuthController.login);

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión
 * @access Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route GET /api/auth/profile
 * @desc Obtener perfil del usuario actual
 * @access Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route POST /api/auth/change-password
 * @desc Cambiar contraseña del usuario actual
 * @access Private
 */
router.post('/change-password', [
  authenticateToken,
  validateRequired(['currentPassword', 'newPassword']),
  validateStringLength('newPassword', 6, 100)
], AuthController.changePassword);

/**
 * @route GET /api/auth/verify
 * @desc Verificar token de autenticación
 * @access Private
 */
router.get('/verify', authenticateToken, AuthController.verifyToken);

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario (solo admins)
 * @access Private (Admin only)
 */
router.post('/register', [
  authenticateToken,
  requireRole(['admin']),
  validateRequired(['nombre', 'email', 'password', 'rol']),
  validateStringLength('nombre', 2, 100),
  validateStringLength('email', 3, 50),
  validateStringLength('password', 6, 100),
  validateEnum('rol', ['admin', 'tecnico', 'consulta'])
], AuthController.register);

export default router;
