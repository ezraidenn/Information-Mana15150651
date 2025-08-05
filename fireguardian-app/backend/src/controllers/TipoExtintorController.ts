import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { TipoExtintor } from '../models/TipoExtintor';
import { AuthRequest } from '../types';
import { createApiResponse } from '../utils/helpers';
import { createLog } from '../middleware/logging';

export class TipoExtintorController {
  /**
   * Obtener todos los tipos de extintores
   */
  async getAll(req: Request, res: Response) {
    try {
      const tipoExtintorRepo = AppDataSource.getRepository(TipoExtintor);
      const tiposExtintores = await tipoExtintorRepo.find({
        order: { nombre: 'ASC' }
      });

      return res.json(createApiResponse(true, tiposExtintores));
    } catch (error: any) {
      console.error('Error al obtener tipos de extintores:', error);
      return res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al obtener tipos de extintores')
      );
    }
  }

  /**
   * Obtener un tipo de extintor por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tipoExtintorRepo = AppDataSource.getRepository(TipoExtintor);
      
      const tipoExtintor = await tipoExtintorRepo.findOne({
        where: { id },
        relations: ['extintores']
      });

      if (!tipoExtintor) {
        return res.status(404).json(
          createApiResponse(false, undefined, undefined, 'Tipo de extintor no encontrado')
        );
      }

      return res.json(createApiResponse(true, tipoExtintor));
    } catch (error: any) {
      console.error('Error al obtener tipo de extintor:', error);
      return res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al obtener tipo de extintor')
      );
    }
  }

  /**
   * Crear un nuevo tipo de extintor
   */
  async create(req: AuthRequest, res: Response) {
    try {
      const { id, nombre, descripcion, uso_recomendado, color_hex, icono_path, clase_fuego } = req.body;
      const tipoExtintorRepo = AppDataSource.getRepository(TipoExtintor);
      
      // Verificar si ya existe un tipo con el mismo ID
      const existingTipo = await tipoExtintorRepo.findOne({
        where: { id }
      });

      if (existingTipo) {
        return res.status(400).json(
          createApiResponse(false, undefined, undefined, 'Ya existe un tipo de extintor con ese ID')
        );
      }

      // Verificar si ya existe un tipo con el mismo nombre
      const existingNombre = await tipoExtintorRepo.findOne({
        where: { nombre }
      });

      if (existingNombre) {
        return res.status(400).json(
          createApiResponse(false, undefined, undefined, 'Ya existe un tipo de extintor con ese nombre')
        );
      }

      // Crear nuevo tipo de extintor
      const nuevoTipoExtintor = tipoExtintorRepo.create({
        id,
        nombre,
        descripcion,
        uso_recomendado,
        color_hex,
        icono_path,
        clase_fuego
      });

      await tipoExtintorRepo.save(nuevoTipoExtintor);

      // Registrar acción del usuario
      await createLog(
        req.user?.id,
        'crear',
        'tipos_extintores',
        undefined,
        `Creó tipo de extintor: ${nombre}`,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      );

      return res.status(201).json(
        createApiResponse(true, nuevoTipoExtintor, 'Tipo de extintor creado correctamente')
      );
    } catch (error: any) {
      console.error('Error al crear tipo de extintor:', error);
      return res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al crear tipo de extintor')
      );
    }
  }

  /**
   * Actualizar un tipo de extintor existente
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, uso_recomendado, color_hex, icono_path, clase_fuego } = req.body;
      const tipoExtintorRepo = AppDataSource.getRepository(TipoExtintor);
      
      // Verificar si existe el tipo de extintor
      const tipoExtintor = await tipoExtintorRepo.findOne({
        where: { id }
      });

      if (!tipoExtintor) {
        return res.status(404).json(
          createApiResponse(false, undefined, undefined, 'Tipo de extintor no encontrado')
        );
      }

      // Verificar si ya existe otro tipo con el mismo nombre
      if (nombre && nombre !== tipoExtintor.nombre) {
        const existingNombre = await tipoExtintorRepo.findOne({
          where: { nombre }
        });

        if (existingNombre) {
          return res.status(400).json(
            createApiResponse(false, undefined, undefined, 'Ya existe otro tipo de extintor con ese nombre')
          );
        }
      }

      // Actualizar campos
      if (nombre) tipoExtintor.nombre = nombre;
      if (descripcion !== undefined) tipoExtintor.descripcion = descripcion;
      if (uso_recomendado !== undefined) tipoExtintor.uso_recomendado = uso_recomendado;
      if (color_hex !== undefined) tipoExtintor.color_hex = color_hex;
      if (icono_path !== undefined) tipoExtintor.icono_path = icono_path;
      if (clase_fuego !== undefined) tipoExtintor.clase_fuego = clase_fuego;

      await tipoExtintorRepo.save(tipoExtintor);

      // Registrar acción del usuario
      await createLog(
        req.user?.id,
        'editar',
        'tipos_extintores',
        undefined,
        `Actualizó tipo de extintor: ${tipoExtintor.nombre}`,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      );

      return res.json(
        createApiResponse(true, tipoExtintor, 'Tipo de extintor actualizado correctamente')
      );
    } catch (error: any) {
      console.error('Error al actualizar tipo de extintor:', error);
      return res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al actualizar tipo de extintor')
      );
    }
  }

  /**
   * Eliminar un tipo de extintor
   */
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const tipoExtintorRepo = AppDataSource.getRepository(TipoExtintor);
      
      // Verificar si existe el tipo de extintor
      const tipoExtintor = await tipoExtintorRepo.findOne({
        where: { id },
        relations: ['extintores']
      });

      if (!tipoExtintor) {
        return res.status(404).json(
          createApiResponse(false, undefined, undefined, 'Tipo de extintor no encontrado')
        );
      }

      // Verificar si hay extintores asociados a este tipo
      if (tipoExtintor.extintores && tipoExtintor.extintores.length > 0) {
        return res.status(400).json(
          createApiResponse(
            false, 
            undefined, 
            undefined, 
            `No se puede eliminar el tipo de extintor porque está asociado a ${tipoExtintor.extintores.length} extintores`
          )
        );
      }

      // Eliminar tipo de extintor
      await tipoExtintorRepo.remove(tipoExtintor);

      // Registrar acción del usuario
      await createLog(
        req.user?.id,
        'eliminar',
        'tipos_extintores',
        undefined,
        `Eliminó tipo de extintor: ${tipoExtintor.nombre}`,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      );

      return res.json(
        createApiResponse(true, undefined, 'Tipo de extintor eliminado correctamente')
      );
    } catch (error: any) {
      console.error('Error al eliminar tipo de extintor:', error);
      return res.status(500).json(
        createApiResponse(false, undefined, undefined, 'Error al eliminar tipo de extintor')
      );
    }
  }
}
