import { Response } from 'express';
import { AppDataSource } from '../database/config';
import { Extintor } from '../models/Extintor';
import { TipoExtintor } from '../models/TipoExtintor';
import { Ubicacion } from '../models/Ubicacion';
import { Usuario } from '../models/Usuario';
import { createApiResponse, generateUniqueFileName, ensureDirectoryExists, safeDeleteFile } from '../utils/helpers';
import { AuthRequest, CreateExtintorDTO, UpdateExtintorDTO, ExtintorFilters } from '../types';
import * as path from 'path';
import * as fs from 'fs/promises';

export class ExtintorController {

  /**
   * Obtener todos los extintores con filtros y paginación
   */
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        tipo_id,
        ubicacion_id,
        sede_id,
        estado,
        estado_vencimiento,
        requiere_mantenimiento,
        search,
        page = 1,
        limit = 20,
        sort_by = 'creado_en',
        sort_order = 'DESC'
      } = req.query as any;

      const extintorRepo = AppDataSource.getRepository(Extintor);
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
        query = query.andWhere(
          '(extintor.codigo_interno LIKE :search OR extintor.descripcion LIKE :search OR tipo.nombre LIKE :search OR ubicacion.nombre_area LIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Aplicar ordenamiento
      const validSortFields = ['fecha_vencimiento', 'fecha_mantenimiento', 'creado_en'];
      const sortField = validSortFields.includes(sort_by) ? sort_by : 'creado_en';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      query = query.orderBy(`extintor.${sortField}`, sortDirection as 'ASC' | 'DESC');

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
        if (estado === 'VENCIDO') {
          // Para el estado VENCIDO, aplicamos una lógica especial que incluye la fecha de vencimiento
          // Primero actualizamos todos los extintores vencidos en la base de datos
          const hoy = new Date();
          const extintoresVencidos = await extintorRepo
            .createQueryBuilder('extintor')
            .where('extintor.fecha_vencimiento < :hoy', { hoy })
            .andWhere('extintor.estado != :estado', { estado: 'VENCIDO' })
            .getMany();
          
          // Actualizar el estado de los extintores vencidos
          for (const extintor of extintoresVencidos) {
            extintor.estado = 'VENCIDO';
            await extintorRepo.save(extintor);
          }
          
          // Ahora aplicamos el filtro de VENCIDO directamente en la consulta SQL
          // Esto asegura que la paginación se aplique correctamente
          query = query.andWhere('(extintor.estado = :estado OR extintor.fecha_vencimiento < :hoy)', { 
            estado: 'VENCIDO', 
            hoy: hoy
          });
          
          // Volvemos a ejecutar la consulta con el nuevo filtro
          const total = await query.getCount();
          query = query.skip(offset).take(limitNumber);
          extintoresFiltrados = await query.getMany();
        } else {
          // Para otros estados, filtramos normalmente
          extintoresFiltrados = extintoresFiltrados.filter(e => e.estado === estado);
        }
      }

      // Actualizar automáticamente el estado de los extintores vencidos
      for (const extintor of extintoresFiltrados) {
        // Si la fecha de vencimiento ya pasó y el estado no es VENCIDO, actualizarlo
        if (extintor.estado_vencimiento === 'vencido' && extintor.estado !== 'VENCIDO') {
          extintor.estado = 'VENCIDO';
          // Guardar el cambio en la base de datos
          await extintorRepo.save(extintor);
        }
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

      res.json(createApiResponse(
        true,
        {
          extintores: extintoresFormateados,
          pagination: {
            current_page: pageNumber,
            total_pages: totalPages,
            total_items: total,
            items_per_page: limitNumber,
            has_next: pageNumber < totalPages,
            has_prev: pageNumber > 1
          }
        },
        'Extintores obtenidos exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener extintores:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Obtener un extintor por ID
   */
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const extintorRepo = AppDataSource.getRepository(Extintor);
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
        res.status(404).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Extintor no encontrado'
        ));
        return;
      }
      
      // Actualizar automáticamente el estado si está vencido
      if (extintor.estado_vencimiento === 'vencido' && extintor.estado !== 'VENCIDO') {
        extintor.estado = 'VENCIDO';
        await extintorRepo.save(extintor);
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

      res.json(createApiResponse(
        true,
        extintorDetallado,
        'Extintor obtenido exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener extintor:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Crear un nuevo extintor
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const extintorData: CreateExtintorDTO = req.body;

      // Validar que existan las entidades relacionadas
      const tipoRepo = AppDataSource.getRepository(TipoExtintor);
      const ubicacionRepo = AppDataSource.getRepository(Ubicacion);
      const usuarioRepo = AppDataSource.getRepository(Usuario);

      const tipo = await tipoRepo.findOne({ where: { id: extintorData.tipo_id } });
      if (!tipo) {
        res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Tipo de extintor no encontrado'
        ));
        return;
      }

      const ubicacion = await ubicacionRepo.findOne({ where: { id: extintorData.ubicacion_id } });
      if (!ubicacion) {
        res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Ubicación no encontrada'
        ));
        return;
      }

      if (extintorData.responsable_id) {
        const responsable = await usuarioRepo.findOne({ where: { id: extintorData.responsable_id } });
        if (!responsable) {
          res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'Responsable no encontrado'
          ));
          return;
        }
      }

      // Verificar código interno único si se proporciona
      const extintorRepo = AppDataSource.getRepository(Extintor);
      if (extintorData.codigo_interno) {
        const existingExtintor = await extintorRepo.findOne({
          where: { codigo_interno: extintorData.codigo_interno }
        });
        if (existingExtintor) {
          res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'El código interno ya existe'
          ));
          return;
        }
      }

      // Procesar imagen si se subió
      let imagenPath: string | undefined;
      if (req.file) {
        const imagesDir = path.join(__dirname, '../../../images');
        await ensureDirectoryExists(imagesDir);
        
        const fileName = generateUniqueFileName(req.file.originalname);
        const filePath = path.join(imagesDir, fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        imagenPath = `/images/${fileName}`;
      }

      // Crear extintor
      const nuevoExtintor = new Extintor();
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

      res.status(201).json(createApiResponse(
        true,
        extintorCompleto,
        'Extintor creado exitosamente'
      ));

    } catch (error) {
      console.error('Error al crear extintor:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Actualizar un extintor
   */
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateExtintorDTO = req.body;

      const extintorRepo = AppDataSource.getRepository(Extintor);
      const extintor = await extintorRepo.findOne({ where: { id: parseInt(id) } });

      if (!extintor) {
        res.status(404).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Extintor no encontrado'
        ));
        return;
      }

      // Validar entidades relacionadas si se actualizan
      if (updateData.tipo_id) {
        const tipoRepo = AppDataSource.getRepository(TipoExtintor);
        const tipo = await tipoRepo.findOne({ where: { id: updateData.tipo_id } });
        if (!tipo) {
          res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'Tipo de extintor no encontrado'
          ));
          return;
        }
      }

      if (updateData.ubicacion_id) {
        const ubicacionRepo = AppDataSource.getRepository(Ubicacion);
        const ubicacion = await ubicacionRepo.findOne({ where: { id: updateData.ubicacion_id } });
        if (!ubicacion) {
          res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'Ubicación no encontrada'
          ));
          return;
        }
      }

      if (updateData.responsable_id) {
        const usuarioRepo = AppDataSource.getRepository(Usuario);
        const responsable = await usuarioRepo.findOne({ where: { id: updateData.responsable_id } });
        if (!responsable) {
          res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'Responsable no encontrado'
          ));
          return;
        }
      }

      // Verificar código interno único si se actualiza
      if (updateData.codigo_interno && updateData.codigo_interno !== extintor.codigo_interno) {
        const existingExtintor = await extintorRepo.findOne({
          where: { codigo_interno: updateData.codigo_interno }
        });
        if (existingExtintor) {
          res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'El código interno ya existe'
          ));
          return;
        }
      }

      // Procesar nueva imagen si se subió
      if (req.file) {
        // Eliminar imagen anterior si existe
        if (extintor.imagen_path) {
          const oldImagePath = path.join(__dirname, '../../../', extintor.imagen_path);
          await safeDeleteFile(oldImagePath);
        }

        const imagesDir = path.join(__dirname, '../../../images');
        await ensureDirectoryExists(imagesDir);
        
        const fileName = generateUniqueFileName(req.file.originalname);
        const filePath = path.join(imagesDir, fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        updateData.imagen_path = `/images/${fileName}`;
      }

      // Actualizar campos
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateExtintorDTO] !== undefined) {
          if (key === 'fecha_vencimiento' || key === 'fecha_mantenimiento') {
            (extintor as any)[key] = new Date(updateData[key as keyof UpdateExtintorDTO] as string);
          } else {
            (extintor as any)[key] = updateData[key as keyof UpdateExtintorDTO];
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

      res.json(createApiResponse(
        true,
        extintorActualizado,
        'Extintor actualizado exitosamente'
      ));

    } catch (error) {
      console.error('Error al actualizar extintor:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Eliminar un extintor
   */
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const extintorRepo = AppDataSource.getRepository(Extintor);
      const extintor = await extintorRepo.findOne({ where: { id: parseInt(id) } });

      if (!extintor) {
        res.status(404).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Extintor no encontrado'
        ));
        return;
      }

      // Eliminar imagen si existe
      if (extintor.imagen_path) {
        const imagePath = path.join(__dirname, '../../../', extintor.imagen_path);
        await safeDeleteFile(imagePath);
      }

      await extintorRepo.remove(extintor);

      res.json(createApiResponse(
        true,
        undefined,
        'Extintor eliminado exitosamente'
      ));

    } catch (error) {
      console.error('Error al eliminar extintor:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Obtener extintores por ubicación
   */
  static async getByLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ubicacionId } = req.params;

      const extintorRepo = AppDataSource.getRepository(Extintor);
      const extintores = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .leftJoinAndSelect('extintor.responsable', 'responsable')
        .where('extintor.ubicacion_id = :ubicacionId', { ubicacionId })
        .orderBy('extintor.codigo_interno', 'ASC')
        .getMany();
        
      // Actualizar automáticamente el estado de los extintores vencidos
      for (const extintor of extintores) {
        // Si la fecha de vencimiento ya pasó y el estado no es VENCIDO, actualizarlo
        if (extintor.estado_vencimiento === 'vencido' && extintor.estado !== 'VENCIDO') {
          extintor.estado = 'VENCIDO';
          // Guardar el cambio en la base de datos
          await extintorRepo.save(extintor);
        }
      }

      const extintoresFormateados = extintores.map(extintor => ({
        ...extintor,
        dias_para_vencimiento: extintor.dias_para_vencimiento,
        estado_vencimiento: extintor.estado_vencimiento,
        requiere_mantenimiento: extintor.requiere_mantenimiento
      }));

      res.json(createApiResponse(
        true,
        extintoresFormateados,
        'Extintores por ubicación obtenidos exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener extintores por ubicación:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }
}
