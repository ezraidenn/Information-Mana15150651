"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TipoExtintorController_1 = require("../controllers/TipoExtintorController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const tipoExtintorController = new TipoExtintorController_1.TipoExtintorController();
// Middleware de autenticación para todas las rutas
router.use(auth_1.authenticateToken);
/**
 * @route GET /api/tipos-extintores
 * @desc Obtener todos los tipos de extintores
 * @access Authenticated
 */
router.get('/', tipoExtintorController.getAll.bind(tipoExtintorController));
/**
 * @route GET /api/tipos-extintores/:id
 * @desc Obtener tipo de extintor por ID
 * @access Authenticated
 */
router.get('/:id', tipoExtintorController.getById.bind(tipoExtintorController));
/**
 * @route POST /api/tipos-extintores
 * @desc Crear nuevo tipo de extintor
 * @access Admin, Tecnico
 */
router.post('/', (0, auth_1.requireRole)(['admin', 'tecnico']), [
    (0, validation_1.validateRequired)(['id', 'nombre'])
], tipoExtintorController.create.bind(tipoExtintorController));
/**
 * @route PUT /api/tipos-extintores/:id
 * @desc Actualizar tipo de extintor
 * @access Admin, Tecnico
 */
router.put('/:id', (0, auth_1.requireRole)(['admin', 'tecnico']), tipoExtintorController.update.bind(tipoExtintorController));
/**
 * @route DELETE /api/tipos-extintores/:id
 * @desc Eliminar tipo de extintor
 * @access Admin
 */
router.delete('/:id', (0, auth_1.requireRole)(['admin']), tipoExtintorController.delete.bind(tipoExtintorController));
exports.default = router;
//# sourceMappingURL=tipos-extintores.js.map