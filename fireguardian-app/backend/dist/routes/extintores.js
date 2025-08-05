"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const ExtintorController_1 = require("../controllers/ExtintorController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Configuración de multer para subida de imágenes
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
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
router.get('/', auth_1.authenticateToken, ExtintorController_1.ExtintorController.getAll);
/**
 * @route GET /api/extintores/:id
 * @desc Obtener un extintor por ID
 * @access Private
 */
router.get('/:id', auth_1.authenticateToken, ExtintorController_1.ExtintorController.getById);
/**
 * @route POST /api/extintores
 * @desc Crear un nuevo extintor
 * @access Private (Admin, Técnico)
 */
router.post('/', [
    auth_1.authenticateToken,
    (0, auth_1.requireRole)(['admin', 'tecnico']),
    upload.single('imagen'),
    validation_1.validateImageFile,
    ...validation_1.validateExtintor
], ExtintorController_1.ExtintorController.create);
/**
 * @route PUT /api/extintores/:id
 * @desc Actualizar un extintor
 * @access Private (Admin, Técnico)
 */
router.put('/:id', [
    auth_1.authenticateToken,
    (0, auth_1.requireRole)(['admin', 'tecnico']),
    upload.single('imagen'),
    validation_1.validateImageFile
], ExtintorController_1.ExtintorController.update);
/**
 * @route DELETE /api/extintores/:id
 * @desc Eliminar un extintor
 * @access Private (Admin only)
 */
router.delete('/:id', [
    auth_1.authenticateToken,
    (0, auth_1.requireRole)(['admin'])
], ExtintorController_1.ExtintorController.delete);
/**
 * @route GET /api/extintores/ubicacion/:ubicacionId
 * @desc Obtener extintores por ubicación
 * @access Private
 */
router.get('/ubicacion/:ubicacionId', auth_1.authenticateToken, ExtintorController_1.ExtintorController.getByLocation);
exports.default = router;
//# sourceMappingURL=extintores.js.map