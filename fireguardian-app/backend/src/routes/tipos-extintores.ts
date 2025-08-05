import { Router } from 'express';
import { TipoExtintorController } from '../controllers/TipoExtintorController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequired } from '../middleware/validation';

const router = Router();
const tipoExtintorController = new TipoExtintorController();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @route GET /api/tipos-extintores
 * @desc Obtener todos los tipos de extintores
 * @access Authenticated
 */
router.get(
  '/',
  tipoExtintorController.getAll.bind(tipoExtintorController)
);

/**
 * @route GET /api/tipos-extintores/:id
 * @desc Obtener tipo de extintor por ID
 * @access Authenticated
 */
router.get(
  '/:id',
  tipoExtintorController.getById.bind(tipoExtintorController)
);

/**
 * @route POST /api/tipos-extintores
 * @desc Crear nuevo tipo de extintor
 * @access Admin, Tecnico
 */
router.post(
  '/',
  requireRole(['admin', 'tecnico']),
  [
    validateRequired(['id', 'nombre'])
  ],
  tipoExtintorController.create.bind(tipoExtintorController)
);

/**
 * @route PUT /api/tipos-extintores/:id
 * @desc Actualizar tipo de extintor
 * @access Admin, Tecnico
 */
router.put(
  '/:id',
  requireRole(['admin', 'tecnico']),
  tipoExtintorController.update.bind(tipoExtintorController)
);

/**
 * @route DELETE /api/tipos-extintores/:id
 * @desc Eliminar tipo de extintor
 * @access Admin
 */
router.delete(
  '/:id',
  requireRole(['admin']),
  tipoExtintorController.delete.bind(tipoExtintorController)
);

export default router;
