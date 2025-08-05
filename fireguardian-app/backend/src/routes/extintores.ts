import { Router } from 'express';
import multer from 'multer';
import { ExtintorController } from '../controllers/ExtintorController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateExtintor, validateImageFile } from '../middleware/validation';

const router = Router();

// Configuración de multer para subida de imágenes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

/**
 * @route GET /api/extintores
 * @desc Obtener todos los extintores con filtros y paginación
 * @access Private
 * @query tipo_id, ubicacion_id, sede_id, estado_vencimiento, requiere_mantenimiento, search, page, limit, sort_by, sort_order
 */
router.get('/', authenticateToken, ExtintorController.getAll);

/**
 * @route GET /api/extintores/:id
 * @desc Obtener un extintor por ID
 * @access Private
 */
router.get('/:id', authenticateToken, ExtintorController.getById);

/**
 * @route POST /api/extintores
 * @desc Crear un nuevo extintor
 * @access Private (Admin, Técnico)
 */
router.post('/', [
  authenticateToken,
  requireRole(['admin', 'tecnico']),
  upload.single('imagen'),
  validateImageFile,
  ...validateExtintor
], ExtintorController.create);

/**
 * @route PUT /api/extintores/:id
 * @desc Actualizar un extintor
 * @access Private (Admin, Técnico)
 */
router.put('/:id', [
  authenticateToken,
  requireRole(['admin', 'tecnico']),
  upload.single('imagen'),
  validateImageFile
], ExtintorController.update);

/**
 * @route DELETE /api/extintores/:id
 * @desc Eliminar un extintor
 * @access Private (Admin only)
 */
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], ExtintorController.delete);

/**
 * @route GET /api/extintores/ubicacion/:ubicacionId
 * @desc Obtener extintores por ubicación
 * @access Private
 */
router.get('/ubicacion/:ubicacionId', authenticateToken, ExtintorController.getByLocation);

export default router;
