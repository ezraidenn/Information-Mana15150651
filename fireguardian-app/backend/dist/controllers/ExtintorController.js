"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtintorController = void 0;
const config_1 = require("../database/config");
const Extintor_1 = require("../models/Extintor");
const TipoExtintor_1 = require("../models/TipoExtintor");
const Ubicacion_1 = require("../models/Ubicacion");
const Usuario_1 = require("../models/Usuario");
const helpers_1 = require("../utils/helpers");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
class ExtintorController {
    /**
     * Obtener todos los extintores con filtros y paginación
     */
    static async getAll(req, res) {
        try {
            const { tipo_id, ubicacion_id, sede_id, estado, estado_vencimiento, requiere_mantenimiento, search, page = 1, limit = 20, sort_by = 'creado_en', sort_order = 'DESC' } = req.query;
            const extintorRepo = config_1.AppDataSource.getRepository(Extintor_1.Extintor);
            let query = extintorRepo
                .createQueryBuilder('extintor')
                .leftJoinAndSelect('extintor.tipo', 'tipo')
                .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
                .leftJoinAndSelect('ubicacion.sede', 'sede')
                .leftJoinAndSelect('extintor.responsable', 'responsable');
            // Aplicar filtros
            if (tipo_id) {
                query = query.andWhere('extintor.tipo_id = :tipo_id', { tipo_id });
            }
            if (ubicacion_id) {
                query = query.andWhere('extintor.ubicacion_id = :ubicacion_id', { ubicacion_id });
            }
            if (sede_id) {
                query = query.andWhere('sede.id = :sede_id', { sede_id });
            }
            if (search) {
                query = query.andWhere('(extintor.codigo_interno LIKE :search OR extintor.descripcion LIKE :search OR tipo.nombre LIKE :search OR ubicacion.nombre_area LIKE :search)', { search: `%${search}%` });
            }
            // Aplicar ordenamiento
            const validSortFields = ['fecha_vencimiento', 'fecha_mantenimiento', 'creado_en'];
            const sortField = validSortFields.includes(sort_by) ? sort_by : 'creado_en';
            const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            query = query.orderBy(`extintor.${sortField}`, sortDirection);
            // Obtener total para paginación
            const total = await query.getCount();
            // Aplicar paginación
            const pageNumber = Math.max(1, parseInt(page));
            const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));
            const offset = (pageNumber - 1) * limitNumber;
            query = query.skip(offset).take(limitNumber);
            const extintores = await query.getMany();
            // Aplicar filtros post-consulta (para campos calculados)
            let extintoresFiltrados = extintores;
            if (estado_vencimiento) {
                extintoresFiltrados = extintores.filter(e => e.estado_vencimiento === estado_vencimiento);
            }
            if (requiere_mantenimiento !== undefined) {
                const requiereMantenimientoBool = requiere_mantenimiento === 'true';
                extintoresFiltrados = extintoresFiltrados.filter(e => e.requiere_mantenimiento === requiereMantenimientoBool);
            }
            // Aplicar filtro de estado - SOLO usar el campo estado explícito
            if (estado) {
                // Filtrar SOLO por el campo estado explícito, ignorando completamente las propiedades calculadas
                extintoresFiltrados = extintoresFiltrados.filter(e => e.estado === estado);
                // Si no hay resultados, es posible que sea porque los extintores antiguos no tienen el campo estado
                // En ese caso, no hacemos nada y simplemente devolvemos una lista vacía
                // Esto fuerza al usuario a asignar explícitamente el estado a través del formulario
            }
            // Formatear respuesta manteniendo las propiedades calculadas originales
            const extintoresFormateados = extintoresFiltrados.map(extintor => {
                // Mantener las propiedades calculadas originales sin modificarlas
                // para evitar inconsistencias con el estado explícito
                return {
                    ...extintor,
                    dias_para_vencimiento: extintor.dias_para_vencimiento,
                    estado_vencimiento: extintor.estado_vencimiento,
                    requiere_mantenimiento: extintor.requiere_mantenimiento,
                    ubicacion_completa: `${extintor.ubicacion.nombre_area} - ${extintor.ubicacion.sede.nombre}`
                };
            });
            const totalPages = Math.ceil(total / limitNumber);
            res.json((0, helpers_1.createApiResponse)(true, {
                extintores: extintoresFormateados,
                pagination: {
                    current_page: pageNumber,
                    total_pages: totalPages,
                    total_items: total,
                    items_per_page: limitNumber,
                    has_next: pageNumber < totalPages,
                    has_prev: pageNumber > 1
                }
            }, 'Extintores obtenidos exitosamente'));
        }
        catch (error) {
            console.error('Error al obtener extintores:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Obtener un extintor por ID
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const extintorRepo = config_1.AppDataSource.getRepository(Extintor_1.Extintor);
            const extintor = await extintorRepo
                .createQueryBuilder('extintor')
                .leftJoinAndSelect('extintor.tipo', 'tipo')
                .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
                .leftJoinAndSelect('ubicacion.sede', 'sede')
                .leftJoinAndSelect('extintor.responsable', 'responsable')
                .leftJoinAndSelect('extintor.mantenimientos', 'mantenimientos')
                .leftJoinAndSelect('mantenimientos.tecnico', 'tecnico')
                .where('extintor.id = :id', { id })
                .orderBy('mantenimientos.fecha', 'DESC')
                .getOne();
            if (!extintor) {
                res.status(404).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Extintor no encontrado'));
                return;
            }
            const extintorDetallado = {
                ...extintor,
                dias_para_vencimiento: extintor.dias_para_vencimiento,
                estado_vencimiento: extintor.estado_vencimiento,
                requiere_mantenimiento: extintor.requiere_mantenimiento,
                ubicacion_completa: `${extintor.ubicacion.nombre_area} - ${extintor.ubicacion.sede.nombre}`,
                mantenimientos: extintor.mantenimientos.map(m => ({
                    ...m,
                    icono_evento: m.icono_evento,
                    color_evento: m.color_evento
                }))
            };
            res.json((0, helpers_1.createApiResponse)(true, extintorDetallado, 'Extintor obtenido exitosamente'));
        }
        catch (error) {
            console.error('Error al obtener extintor:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Crear un nuevo extintor
     */
    static async create(req, res) {
        try {
            const extintorData = req.body;
            // Validar que existan las entidades relacionadas
            const tipoRepo = config_1.AppDataSource.getRepository(TipoExtintor_1.TipoExtintor);
            const ubicacionRepo = config_1.AppDataSource.getRepository(Ubicacion_1.Ubicacion);
            const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
            const tipo = await tipoRepo.findOne({ where: { id: extintorData.tipo_id } });
            if (!tipo) {
                res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Tipo de extintor no encontrado'));
                return;
            }
            const ubicacion = await ubicacionRepo.findOne({ where: { id: extintorData.ubicacion_id } });
            if (!ubicacion) {
                res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Ubicación no encontrada'));
                return;
            }
            if (extintorData.responsable_id) {
                const responsable = await usuarioRepo.findOne({ where: { id: extintorData.responsable_id } });
                if (!responsable) {
                    res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Responsable no encontrado'));
                    return;
                }
            }
            // Verificar código interno único si se proporciona
            const extintorRepo = config_1.AppDataSource.getRepository(Extintor_1.Extintor);
            if (extintorData.codigo_interno) {
                const existingExtintor = await extintorRepo.findOne({
                    where: { codigo_interno: extintorData.codigo_interno }
                });
                if (existingExtintor) {
                    res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'El código interno ya existe'));
                    return;
                }
            }
            // Procesar imagen si se subió
            let imagenPath;
            if (req.file) {
                const imagesDir = path.join(__dirname, '../../../images');
                await (0, helpers_1.ensureDirectoryExists)(imagesDir);
                const fileName = (0, helpers_1.generateUniqueFileName)(req.file.originalname);
                const filePath = path.join(imagesDir, fileName);
                await fs.writeFile(filePath, req.file.buffer);
                imagenPath = `/images/${fileName}`;
            }
            // Crear extintor
            const nuevoExtintor = new Extintor_1.Extintor();
            nuevoExtintor.codigo_interno = extintorData.codigo_interno;
            nuevoExtintor.tipo_id = extintorData.tipo_id;
            nuevoExtintor.descripcion = extintorData.descripcion;
            nuevoExtintor.ubicacion_id = extintorData.ubicacion_id;
            nuevoExtintor.responsable_id = extintorData.responsable_id;
            nuevoExtintor.fecha_vencimiento = new Date(extintorData.fecha_vencimiento);
            nuevoExtintor.fecha_mantenimiento = extintorData.fecha_mantenimiento
                ? new Date(extintorData.fecha_mantenimiento)
                : undefined;
            nuevoExtintor.imagen_path = imagenPath;
            nuevoExtintor.estado = extintorData.estado || 'ACTIVO'; // Establecer estado explícito
            await extintorRepo.save(nuevoExtintor);
            // Obtener el extintor completo con relaciones
            const extintorCompleto = await extintorRepo
                .createQueryBuilder('extintor')
                .leftJoinAndSelect('extintor.tipo', 'tipo')
                .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
                .leftJoinAndSelect('ubicacion.sede', 'sede')
                .leftJoinAndSelect('extintor.responsable', 'responsable')
                .where('extintor.id = :id', { id: nuevoExtintor.id })
                .getOne();
            res.status(201).json((0, helpers_1.createApiResponse)(true, extintorCompleto, 'Extintor creado exitosamente'));
        }
        catch (error) {
            console.error('Error al crear extintor:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Actualizar un extintor
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const extintorRepo = config_1.AppDataSource.getRepository(Extintor_1.Extintor);
            const extintor = await extintorRepo.findOne({ where: { id: parseInt(id) } });
            if (!extintor) {
                res.status(404).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Extintor no encontrado'));
                return;
            }
            // Validar entidades relacionadas si se actualizan
            if (updateData.tipo_id) {
                const tipoRepo = config_1.AppDataSource.getRepository(TipoExtintor_1.TipoExtintor);
                const tipo = await tipoRepo.findOne({ where: { id: updateData.tipo_id } });
                if (!tipo) {
                    res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Tipo de extintor no encontrado'));
                    return;
                }
            }
            if (updateData.ubicacion_id) {
                const ubicacionRepo = config_1.AppDataSource.getRepository(Ubicacion_1.Ubicacion);
                const ubicacion = await ubicacionRepo.findOne({ where: { id: updateData.ubicacion_id } });
                if (!ubicacion) {
                    res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Ubicación no encontrada'));
                    return;
                }
            }
            if (updateData.responsable_id) {
                const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
                const responsable = await usuarioRepo.findOne({ where: { id: updateData.responsable_id } });
                if (!responsable) {
                    res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Responsable no encontrado'));
                    return;
                }
            }
            // Verificar código interno único si se actualiza
            if (updateData.codigo_interno && updateData.codigo_interno !== extintor.codigo_interno) {
                const existingExtintor = await extintorRepo.findOne({
                    where: { codigo_interno: updateData.codigo_interno }
                });
                if (existingExtintor) {
                    res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'El código interno ya existe'));
                    return;
                }
            }
            // Procesar nueva imagen si se subió
            if (req.file) {
                // Eliminar imagen anterior si existe
                if (extintor.imagen_path) {
                    const oldImagePath = path.join(__dirname, '../../../', extintor.imagen_path);
                    await (0, helpers_1.safeDeleteFile)(oldImagePath);
                }
                const imagesDir = path.join(__dirname, '../../../images');
                await (0, helpers_1.ensureDirectoryExists)(imagesDir);
                const fileName = (0, helpers_1.generateUniqueFileName)(req.file.originalname);
                const filePath = path.join(imagesDir, fileName);
                await fs.writeFile(filePath, req.file.buffer);
                updateData.imagen_path = `/images/${fileName}`;
            }
            // Actualizar campos
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    if (key === 'fecha_vencimiento' || key === 'fecha_mantenimiento') {
                        extintor[key] = new Date(updateData[key]);
                    }
                    else {
                        extintor[key] = updateData[key];
                    }
                }
            });
            await extintorRepo.save(extintor);
            // Obtener el extintor actualizado con relaciones
            const extintorActualizado = await extintorRepo
                .createQueryBuilder('extintor')
                .leftJoinAndSelect('extintor.tipo', 'tipo')
                .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
                .leftJoinAndSelect('ubicacion.sede', 'sede')
                .leftJoinAndSelect('extintor.responsable', 'responsable')
                .where('extintor.id = :id', { id })
                .getOne();
            res.json((0, helpers_1.createApiResponse)(true, extintorActualizado, 'Extintor actualizado exitosamente'));
        }
        catch (error) {
            console.error('Error al actualizar extintor:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Eliminar un extintor
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const extintorRepo = config_1.AppDataSource.getRepository(Extintor_1.Extintor);
            const extintor = await extintorRepo.findOne({ where: { id: parseInt(id) } });
            if (!extintor) {
                res.status(404).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Extintor no encontrado'));
                return;
            }
            // Eliminar imagen si existe
            if (extintor.imagen_path) {
                const imagePath = path.join(__dirname, '../../../', extintor.imagen_path);
                await (0, helpers_1.safeDeleteFile)(imagePath);
            }
            await extintorRepo.remove(extintor);
            res.json((0, helpers_1.createApiResponse)(true, undefined, 'Extintor eliminado exitosamente'));
        }
        catch (error) {
            console.error('Error al eliminar extintor:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Obtener extintores por ubicación
     */
    static async getByLocation(req, res) {
        try {
            const { ubicacionId } = req.params;
            const extintorRepo = config_1.AppDataSource.getRepository(Extintor_1.Extintor);
            const extintores = await extintorRepo
                .createQueryBuilder('extintor')
                .leftJoinAndSelect('extintor.tipo', 'tipo')
                .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
                .leftJoinAndSelect('ubicacion.sede', 'sede')
                .leftJoinAndSelect('extintor.responsable', 'responsable')
                .where('extintor.ubicacion_id = :ubicacionId', { ubicacionId })
                .orderBy('extintor.codigo_interno', 'ASC')
                .getMany();
            const extintoresFormateados = extintores.map(extintor => ({
                ...extintor,
                dias_para_vencimiento: extintor.dias_para_vencimiento,
                estado_vencimiento: extintor.estado_vencimiento,
                requiere_mantenimiento: extintor.requiere_mantenimiento
            }));
            res.json((0, helpers_1.createApiResponse)(true, extintoresFormateados, 'Extintores por ubicación obtenidos exitosamente'));
        }
        catch (error) {
            console.error('Error al obtener extintores por ubicación:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
}
exports.ExtintorController = ExtintorController;
//# sourceMappingURL=ExtintorController.js.map