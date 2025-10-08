import { Response } from 'express';
import { AppDataSource } from '../database/config';
import { Mantenimiento } from '../models/Mantenimiento';
import { Extintor } from '../models/Extintor';
import { Usuario } from '../models/Usuario';
import { AuthRequest } from '../types';
import { createApiResponse } from '../utils/helpers';

export class MantenimientoController {
  /**
   * Obtener todos los mantenimientos con filtros opcionales
   */
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { search, tipo, estado, extintor_id, page = 1, limit = 20 } = req.query;

      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
      const queryBuilder = mantenimientoRepo
        .createQueryBuilder('mantenimiento')
        .leftJoinAndSelect('mantenimiento.extintor', 'extintor')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .leftJoinAndSelect('extintor.tipo', 'tipoExtintor')
        .leftJoinAndSelect('mantenimiento.tecnico', 'tecnico');

      // Filtro por búsqueda
      if (search) {
        queryBuilder.andWhere(
          '(extintor.codigo_interno LIKE :search OR extintor.codigo LIKE :search OR mantenimiento.observaciones LIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Filtro por tipo de mantenimiento
      if (tipo) {
        queryBuilder.andWhere('mantenimiento.tipo_evento = :tipo', { tipo });
      }

      // Filtro por estado
      if (estado) {
        queryBuilder.andWhere('mantenimiento.estado = :estado', { estado });
      }

      // Filtro por extintor específico
      if (extintor_id) {
        queryBuilder.andWhere('mantenimiento.extintor_id = :extintor_id', { extintor_id });
      }

      // Ordenar por fecha descendente (más recientes primero)
      queryBuilder.orderBy('mantenimiento.fecha', 'DESC');

      // Paginación
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      queryBuilder.skip(skip).take(limitNumber);

      // Ejecutar query
      const [mantenimientos, total] = await queryBuilder.getManyAndCount();

      // Formatear respuesta
      const formattedMantenimientos = mantenimientos.map(m => ({
        id: m.id,
        extintor_id: m.extintor_id,
        extintor_codigo: m.extintor?.codigo_interno || 'N/A',
        extintor_ubicacion: m.extintor?.ubicacion
          ? `${m.extintor.ubicacion.nombre_area} - ${m.extintor.ubicacion.sede?.nombre || 'N/A'}`
          : 'N/A',
        tipo: m.tipo_evento.toUpperCase(),
        fecha: m.fecha,
        descripcion: m.descripcion || '',
        tecnico_id: m.tecnico_id,
        tecnico: m.tecnico?.nombre || 'N/A',
        evidencia_path: m.evidencia_path,
        estado: 'COMPLETADO', // Por ahora todos los mantenimientos están completados
        created_at: m.creado_en,
        updated_at: m.creado_en
      }));

      res.json(
        createApiResponse(true, {
          data: formattedMantenimientos,
          pagination: {
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber)
          }
        })
      );
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error);
      res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al obtener mantenimientos')
      );
    }
  }

  /**
   * Obtener un mantenimiento específico por ID
   */
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
      const mantenimiento = await mantenimientoRepo.findOne({
        where: { id: parseInt(id) },
        relations: ['extintor', 'extintor.ubicacion', 'extintor.ubicacion.sede', 'extintor.tipo', 'tecnico']
      });

      if (!mantenimiento) {
        res.status(404).json(
          createApiResponse(false, undefined, undefined, 'Mantenimiento no encontrado')
        );
        return;
      }

      const formatted = {
        id: mantenimiento.id,
        extintor_id: mantenimiento.extintor_id,
        extintor_codigo: mantenimiento.extintor?.codigo_interno || 'N/A',
        extintor_tipo: mantenimiento.extintor?.tipo?.nombre || 'N/A',
        extintor_ubicacion: mantenimiento.extintor?.ubicacion
          ? `${mantenimiento.extintor.ubicacion.nombre_area} - ${mantenimiento.extintor.ubicacion.sede?.nombre || 'N/A'}`
          : 'N/A',
        tipo: mantenimiento.tipo_evento,
        fecha: mantenimiento.fecha,
        descripcion: mantenimiento.descripcion || '',
        tecnico_id: mantenimiento.tecnico_id,
        tecnico: mantenimiento.tecnico?.nombre || 'N/A',
        evidencia_path: mantenimiento.evidencia_path,
        estado: 'COMPLETADO',
        created_at: mantenimiento.creado_en
      };

      res.json(createApiResponse(true, formatted));
    } catch (error) {
      console.error('Error al obtener mantenimiento:', error);
      res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al obtener mantenimiento')
      );
    }
  }

  /**
   * Crear un nuevo mantenimiento
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { extintor_id, tipo_evento, fecha, descripcion, tecnico_id } = req.body;

      // Validaciones
      if (!extintor_id || !tipo_evento || !fecha) {
        res.status(400).json(
          createApiResponse(false, undefined, undefined, 'Faltan campos obligatorios')
        );
        return;
      }

      // Validar tipo de evento
      const tiposValidos = ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo'];
      if (!tiposValidos.includes(tipo_evento)) {
        res.status(400).json(
          createApiResponse(false, undefined, undefined, 'Tipo de evento inválido')
        );
        return;
      }

      // Verificar que el extintor existe
      const extintorRepo = AppDataSource.getRepository(Extintor);
      const extintor = await extintorRepo.findOne({ where: { id: extintor_id } });

      if (!extintor) {
        res.status(404).json(
          createApiResponse(false, undefined, undefined, 'Extintor no encontrado')
        );
        return;
      }

      // Verificar que el técnico existe (si se proporciona)
      if (tecnico_id) {
        const usuarioRepo = AppDataSource.getRepository(Usuario);
        const tecnico = await usuarioRepo.findOne({ where: { id: tecnico_id } });

        if (!tecnico) {
          res.status(404).json(
            createApiResponse(false, undefined, undefined, 'Técnico no encontrado')
          );
          return;
        }
      }

      // Crear mantenimiento
      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
      const nuevoMantenimiento = mantenimientoRepo.create({
        extintor_id,
        tipo_evento,
        fecha: new Date(fecha),
        descripcion: descripcion || '',
        tecnico_id: tecnico_id || req.user?.id
      });

      await mantenimientoRepo.save(nuevoMantenimiento);

      // Si el mantenimiento es una recarga o mantenimiento, actualizar la fecha de mantenimiento del extintor
      if (tipo_evento === 'recarga' || tipo_evento === 'inspeccion') {
        extintor.fecha_mantenimiento = new Date(fecha);
        await extintorRepo.save(extintor);
      }

      // Cargar el mantenimiento con relaciones para la respuesta
      const mantenimientoCreado = await mantenimientoRepo.findOne({
        where: { id: nuevoMantenimiento.id },
        relations: ['extintor', 'extintor.ubicacion', 'extintor.ubicacion.sede', 'tecnico']
      });

      res.status(201).json(
        createApiResponse(true, mantenimientoCreado, 'Mantenimiento registrado exitosamente')
      );
    } catch (error) {
      console.error('Error al crear mantenimiento:', error);
      res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al crear mantenimiento')
      );
    }
  }

  /**
   * Actualizar un mantenimiento existente
   */
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { tipo_evento, fecha, descripcion, tecnico_id } = req.body;

      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
      const mantenimiento = await mantenimientoRepo.findOne({
        where: { id: parseInt(id) }
      });

      if (!mantenimiento) {
        res.status(404).json(
          createApiResponse(false, undefined, undefined, 'Mantenimiento no encontrado')
        );
        return;
      }

      // Validar tipo de evento si se proporciona
      if (tipo_evento) {
        const tiposValidos = ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo'];
        if (!tiposValidos.includes(tipo_evento)) {
          res.status(400).json(
            createApiResponse(false, undefined, undefined, 'Tipo de evento inválido')
          );
          return;
        }
        mantenimiento.tipo_evento = tipo_evento;
      }

      // Actualizar campos
      if (fecha) mantenimiento.fecha = new Date(fecha);
      if (descripcion !== undefined) mantenimiento.descripcion = descripcion;
      if (tecnico_id !== undefined) mantenimiento.tecnico_id = tecnico_id;

      await mantenimientoRepo.save(mantenimiento);

      // Cargar el mantenimiento actualizado con relaciones
      const mantenimientoActualizado = await mantenimientoRepo.findOne({
        where: { id: parseInt(id) },
        relations: ['extintor', 'extintor.ubicacion', 'extintor.ubicacion.sede', 'tecnico']
      });

      res.json(
        createApiResponse(true, mantenimientoActualizado, 'Mantenimiento actualizado exitosamente')
      );
    } catch (error) {
      console.error('Error al actualizar mantenimiento:', error);
      res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al actualizar mantenimiento')
      );
    }
  }

  /**
   * Eliminar un mantenimiento
   */
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
      const mantenimiento = await mantenimientoRepo.findOne({
        where: { id: parseInt(id) }
      });

      if (!mantenimiento) {
        res.status(404).json(
          createApiResponse(false, undefined, undefined, 'Mantenimiento no encontrado')
        );
        return;
      }

      await mantenimientoRepo.remove(mantenimiento);

      res.json(createApiResponse(true, undefined, 'Mantenimiento eliminado exitosamente'));
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
      res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al eliminar mantenimiento')
      );
    }
  }

  /**
   * Obtener historial de mantenimientos de un extintor específico
   */
  static async getByExtintor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { extintor_id } = req.params;

      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
      const mantenimientos = await mantenimientoRepo.find({
        where: { extintor_id: parseInt(extintor_id) },
        relations: ['tecnico'],
        order: { fecha: 'DESC' }
      });

      const formatted = mantenimientos.map(m => ({
        id: m.id,
        tipo: m.tipo_evento,
        fecha: m.fecha,
        descripcion: m.descripcion || '',
        tecnico: m.tecnico?.nombre || 'N/A',
        evidencia_path: m.evidencia_path,
        created_at: m.creado_en
      }));

      res.json(createApiResponse(true, formatted));
    } catch (error) {
      console.error('Error al obtener historial de mantenimientos:', error);
      res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al obtener historial')
      );
    }
  }

  /**
   * Obtener estadísticas de mantenimientos
   */
  static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);

      // Total de mantenimientos
      const total = await mantenimientoRepo.count();

      // Mantenimientos por tipo
      const porTipo = await mantenimientoRepo
        .createQueryBuilder('mantenimiento')
        .select('mantenimiento.tipo_evento', 'tipo')
        .addSelect('COUNT(*)', 'cantidad')
        .groupBy('mantenimiento.tipo_evento')
        .getRawMany();

      // Mantenimientos recientes (últimos 30 días)
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const recientes = await mantenimientoRepo
        .createQueryBuilder('mantenimiento')
        .where('mantenimiento.fecha >= :fecha', { fecha: hace30Dias })
        .getCount();

      res.json(
        createApiResponse(true, {
          total,
          por_tipo: porTipo,
          recientes_30_dias: recientes
        })
      );
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al obtener estadísticas')
      );
    }
  }
}
