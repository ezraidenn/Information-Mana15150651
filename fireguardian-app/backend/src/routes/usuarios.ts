import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { 
  validateRequired, 
  validateEmail, 
  validateEnum,
  validateStringLength 
} from '../middleware/validation';

const router = Router();
const usuarioController = new UsuarioController();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @route GET /api/usuarios
 * @desc Obtener todos los usuarios (solo admins)
 * @access Admin
 */
router.get(
  '/',
  requireRole(['admin']),
  usuarioController.getAll.bind(usuarioController)
);

/**
 * @route GET /api/usuarios/stats
 * @desc Obtener estadísticas de usuarios (solo admins)
 * @access Admin
 */
router.get(
  '/stats',
  requireRole(['admin']),
  usuarioController.getStats.bind(usuarioController)
);

/**
 * @route GET /api/usuarios/recent-activity
 * @desc Obtener actividad reciente de usuarios (solo admins)
 * @access Admin
 */
router.get(
  '/recent-activity',
  requireRole(['admin']),
  usuarioController.getRecentActivity.bind(usuarioController)
);

/**
 * @route GET /api/usuarios/:id
 * @desc Obtener usuario por ID (solo admins)
 * @access Admin
 */
router.get(
  '/:id',
  requireRole(['admin']),
  usuarioController.getById.bind(usuarioController)
);

/**
 * @route POST /api/usuarios
 * @desc Crear nuevo usuario (solo admins)
 * @access Admin
 */
router.post(
  '/',
  requireRole(['admin']),
  [
    validateRequired(['nombre', 'email', 'password']),
    validateEmail('email'),
    validateStringLength('password', 6, 255),
    validateEnum('rol', ['admin', 'tecnico', 'consulta'], false) // opcional
  ],
  usuarioController.create.bind(usuarioController)
);

/**
 * @route PUT /api/usuarios/:id
 * @desc Actualizar usuario (solo admins)
 * @access Admin
 */
router.put(
  '/:id',
  requireRole(['admin']),
  [
    validateEmail('email'), // opcional
    validateEnum('rol', ['admin', 'tecnico', 'consulta'], false) // opcional
  ],
  usuarioController.update.bind(usuarioController)
);

/**
 * @route PUT /api/usuarios/:id/password
 * @desc Cambiar contraseña de usuario (solo admins)
 * @access Admin
 */
router.put(
  '/:id/password',
  requireRole(['admin']),
  [
    validateRequired(['newPassword']),
    validateStringLength('newPassword', 6, 255)
  ],
  usuarioController.changePassword.bind(usuarioController)
);

/**
 * @route PUT /api/usuarios/:id/toggle-active
 * @desc Activar/Desactivar usuario (solo admins)
 * @access Admin
 */
router.put(
  '/:id/toggle-active',
  requireRole(['admin']),
  usuarioController.toggleActive.bind(usuarioController)
);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Eliminar usuario (soft delete) (solo admins)
 * @access Admin
 */
router.delete(
  '/:id',
  requireRole(['admin']),
  usuarioController.delete.bind(usuarioController)
);

export default router;
