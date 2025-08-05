import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { Sede } from '../models/Sede';
import { Ubicacion } from '../models/Ubicacion';
import { successResponse, errorResponse, logUserAction } from '../utils/helpers';

export class LocationController {
  private sedeRepository = AppDataSource.getRepository(Sede);
  private ubicacionRepository = AppDataSource.getRepository(Ubicacion);

  // ==================== SEDES ====================

  /**
   * Obtener todas las sedes
   */
  async getAllSedes(req: Request, res: Response): Promise<void> {
    try {
      const sedes = await this.sedeRepository
        .createQueryBuilder('sede')
        .leftJoinAndSelect('sede.ubicaciones', 'ubicacion')
        .leftJoinAndSelect('ubicacion.extintores', 'extintor')
        .select([
          'sede.id',
          'sede.nombre',
          'sede.direccion',
          'sede.creado_en',
          'sede.actualizado_en',
          'ubicacion.id',
          'ubicacion.nombre_area',
          'extintor.id'
        ])
        .orderBy('sede.nombre', 'ASC')
        .addOrderBy('ubicacion.nombre_area', 'ASC')
        .getMany();

      // Agregar contadores
      const sedesWithCounts = sedes.map(sede => ({
        ...sede,
        totalUbicaciones: sede.ubicaciones?.length || 0,
        totalExtintores: sede.ubicaciones?.reduce((total, ubicacion) => 
          total + (ubicacion.extintores?.length || 0), 0) || 0
      }));

      res.json(successResponse(sedesWithCounts));

    } catch (error) {
      console.error('Error obteniendo sedes:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtener sede por ID
   */
  async getSedeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const sede = await this.sedeRepository
        .createQueryBuilder('sede')
        .leftJoinAndSelect('sede.ubicaciones', 'ubicacion')
        .leftJoinAndSelect('ubicacion.extintores', 'extintor')
        .where('sede.id = :id', { id })
        .getOne();

      if (!sede) {
        res.status(404).json(errorResponse('Sede no encontrada'));
        return;
      }

      res.json(successResponse(sede));

    } catch (error) {
      console.error('Error obteniendo sede:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Crear nueva sede
   */
  async createSede(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, direccion } = req.body;

      // Verificar si ya existe una sede con el mismo nombre
      const existingSede = await this.sedeRepository.findOne({
        where: { nombre }
      });

      if (existingSede) {
        res.status(400).json(errorResponse('Ya existe una sede con ese nombre'));
        return;
      }

      const sede = new Sede();
      sede.nombre = nombre;
      sede.direccion = direccion;

      const savedSede = await this.sedeRepository.save(sede);

      // Log de la acción
      await logUserAction(req, 'CREAR', 'SEDE', `Sede creada: ${savedSede.nombre}`);

      res.status(201).json(successResponse(savedSede));

    } catch (error) {
      console.error('Error creando sede:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Actualizar sede
   */
  async updateSede(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, direccion } = req.body;

      const sede = await this.sedeRepository.findOne({
        where: { id: Number(id) }
      });

      if (!sede) {
        res.status(404).json(errorResponse('Sede no encontrada'));
        return;
      }

      // Verificar si el nuevo nombre ya existe (si se está cambiando)
      if (nombre && nombre !== sede.nombre) {
        const existingSede = await this.sedeRepository.findOne({
          where: { nombre }
        });

        if (existingSede) {
          res.status(400).json(errorResponse('Ya existe una sede con ese nombre'));
          return;
        }
      }

      if (nombre) sede.nombre = nombre;
      if (direccion !== undefined) sede.direccion = direccion;

      const updatedSede = await this.sedeRepository.save(sede);

      // Log de la acción
      await logUserAction(req, 'ACTUALIZAR', 'SEDE', `Sede actualizada: ${updatedSede.nombre}`);

      res.json(successResponse(updatedSede));

    } catch (error) {
      console.error('Error actualizando sede:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Eliminar sede
   */
  async deleteSede(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const sede = await this.sedeRepository
        .createQueryBuilder('sede')
        .leftJoinAndSelect('sede.ubicaciones', 'ubicacion')
        .leftJoinAndSelect('ubicacion.extintores', 'extintor')
        .where('sede.id = :id', { id })
        .getOne();

      if (!sede) {
        res.status(404).json(errorResponse('Sede no encontrada'));
        return;
      }

      // Verificar si tiene extintores asociados
      const hasExtintores = sede.ubicaciones?.some(ubicacion => 
        ubicacion.extintores && ubicacion.extintores.length > 0
      );

      if (hasExtintores) {
        res.status(400).json(errorResponse(
          'No se puede eliminar la sede porque tiene extintores asociados'
        ));
        return;
      }

      await this.sedeRepository.remove(sede);

      // Log de la acción
      await logUserAction(req, 'ELIMINAR', 'SEDE', `Sede eliminada: ${sede.nombre}`);

      res.json(successResponse({ message: 'Sede eliminada exitosamente' }));

    } catch (error) {
      console.error('Error eliminando sede:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  // ==================== UBICACIONES ====================

  /**
   * Obtener todas las ubicaciones
   */
  async getAllUbicaciones(req: Request, res: Response): Promise<void> {
    try {
      const { sede_id } = req.query;

      const queryBuilder = this.ubicacionRepository
        .createQueryBuilder('ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .leftJoinAndSelect('ubicacion.extintores', 'extintor')
        .select([
          'ubicacion.id',
          'ubicacion.nombre_area',
          'ubicacion.descripcion',
          'ubicacion.creado_en',
          'ubicacion.actualizado_en',
          'sede.id',
          'sede.nombre',
          'extintor.id'
        ]);

      if (sede_id) {
        queryBuilder.where('ubicacion.sede_id = :sede_id', { sede_id });
      }

      const ubicaciones = await queryBuilder
        .orderBy('sede.nombre', 'ASC')
        .addOrderBy('ubicacion.nombre_area', 'ASC')
        .getMany();

      // Agregar contador de extintores
      const ubicacionesWithCounts = ubicaciones.map(ubicacion => ({
        ...ubicacion,
        totalExtintores: ubicacion.extintores?.length || 0
      }));

      res.json(successResponse(ubicacionesWithCounts));

    } catch (error) {
      console.error('Error obteniendo ubicaciones:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtener ubicaciones por sede
   */
  async getUbicacionesBySede(req: Request, res: Response): Promise<void> {
    try {
      const { sedeId } = req.params;

      const ubicaciones = await this.ubicacionRepository
        .createQueryBuilder('ubicacion')
        .leftJoinAndSelect('ubicacion.extintores', 'extintor')
        .where('ubicacion.sede_id = :sedeId', { sedeId })
        .orderBy('ubicacion.nombre_area', 'ASC')
        .getMany();

      const ubicacionesWithCounts = ubicaciones.map(ubicacion => ({
        ...ubicacion,
        totalExtintores: ubicacion.extintores?.length || 0
      }));

      res.json(successResponse(ubicacionesWithCounts));

    } catch (error) {
      console.error('Error obteniendo ubicaciones por sede:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtener ubicación por ID
   */
  async getUbicacionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ubicacion = await this.ubicacionRepository
        .createQueryBuilder('ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .leftJoinAndSelect('ubicacion.extintores', 'extintor')
        .where('ubicacion.id = :id', { id })
        .getOne();

      if (!ubicacion) {
        res.status(404).json(errorResponse('Ubicación no encontrada'));
        return;
      }

      res.json(successResponse(ubicacion));

    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Crear nueva ubicación
   */
  async createUbicacion(req: Request, res: Response): Promise<void> {
    try {
      const { nombre_area, descripcion, sede_id } = req.body;

      // Verificar que la sede existe
      const sede = await this.sedeRepository.findOne({
        where: { id: sede_id }
      });

      if (!sede) {
        res.status(400).json(errorResponse('La sede especificada no existe'));
        return;
      }

      // Verificar si ya existe una ubicación con el mismo nombre en la misma sede
      const existingUbicacion = await this.ubicacionRepository.findOne({
        where: { 
          nombre_area,
          sede: { id: sede_id }
        }
      });

      if (existingUbicacion) {
        res.status(400).json(errorResponse(
          'Ya existe una ubicación con ese nombre en la sede seleccionada'
        ));
        return;
      }

      const ubicacion = new Ubicacion();
      ubicacion.nombre_area = nombre_area;
      ubicacion.descripcion = descripcion;
      ubicacion.sede = sede;

      const savedUbicacion = await this.ubicacionRepository.save(ubicacion);

      // Cargar la ubicación completa con la sede
      const fullUbicacion = await this.ubicacionRepository
        .createQueryBuilder('ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .where('ubicacion.id = :id', { id: savedUbicacion.id })
        .getOne();

      // Log de la acción
      await logUserAction(req, 'CREAR', 'UBICACION', `Ubicación creada: ${savedUbicacion.nombre_area} en ${sede.nombre}`);

      res.status(201).json(successResponse(fullUbicacion));

    } catch (error) {
      console.error('Error creando ubicación:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Actualizar ubicación
   */
  async updateUbicacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre_area, descripcion, sede_id } = req.body;

      const ubicacion = await this.ubicacionRepository
        .createQueryBuilder('ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .where('ubicacion.id = :id', { id })
        .getOne();

      if (!ubicacion) {
        res.status(404).json(errorResponse('Ubicación no encontrada'));
        return;
      }

      // Si se está cambiando la sede, verificar que existe
      if (sede_id && sede_id !== ubicacion.sede.id) {
        const nuevaSede = await this.sedeRepository.findOne({
          where: { id: sede_id }
        });

        if (!nuevaSede) {
          res.status(400).json(errorResponse('La sede especificada no existe'));
          return;
        }

        ubicacion.sede = nuevaSede;
      }

      // Verificar nombre único en la sede
      if (nombre_area && (nombre_area !== ubicacion.nombre_area || sede_id)) {
        const sedeIdToCheck = sede_id || ubicacion.sede.id;
        const existingUbicacion = await this.ubicacionRepository
          .createQueryBuilder('ubicacion')
          .where('ubicacion.nombre_area = :nombre_area', { nombre_area })
          .andWhere('ubicacion.sede_id = :sedeId', { sedeId: sedeIdToCheck })
          .andWhere('ubicacion.id != :id', { id })
          .getOne();

        if (existingUbicacion) {
          res.status(400).json(errorResponse(
            'Ya existe una ubicación con ese nombre en la sede seleccionada'
          ));
          return;
        }
      }

      if (nombre_area) ubicacion.nombre_area = nombre_area;
      if (descripcion !== undefined) ubicacion.descripcion = descripcion;

      const updatedUbicacion = await this.ubicacionRepository.save(ubicacion);

      // Cargar la ubicación completa
      const fullUbicacion = await this.ubicacionRepository
        .createQueryBuilder('ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .where('ubicacion.id = :id', { id: updatedUbicacion.id })
        .getOne();

      // Log de la acción
      await logUserAction(req, 'ACTUALIZAR', 'UBICACION', `Ubicación actualizada: ${updatedUbicacion.nombre_area}`);

      res.json(successResponse(fullUbicacion));

    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Eliminar ubicación
   */
  async deleteUbicacion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ubicacion = await this.ubicacionRepository
        .createQueryBuilder('ubicacion')
        .leftJoinAndSelect('ubicacion.extintores', 'extintor')
        .where('ubicacion.id = :id', { id })
        .getOne();

      if (!ubicacion) {
        res.status(404).json(errorResponse('Ubicación no encontrada'));
        return;
      }

      // Verificar si tiene extintores asociados
      if (ubicacion.extintores && ubicacion.extintores.length > 0) {
        res.status(400).json(errorResponse(
          'No se puede eliminar la ubicación porque tiene extintores asociados'
        ));
        return;
      }

      await this.ubicacionRepository.remove(ubicacion);

      // Log de la acción
      await logUserAction(req, 'ELIMINAR', 'UBICACION', `Ubicación eliminada: ${ubicacion.nombre_area}`);

      res.json(successResponse({ message: 'Ubicación eliminada exitosamente' }));

    } catch (error) {
      console.error('Error eliminando ubicación:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }
}
