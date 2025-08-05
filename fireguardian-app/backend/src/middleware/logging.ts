import { Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config';
import { Log, AccionTipo, EntidadTipo } from '../models/Log';
import { AuthRequest } from '../types';

export const logAction = (accion: AccionTipo, entidad: EntidadTipo, descripcion?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Ejecutar la acción original
      next();

      // Después de que la respuesta sea exitosa, registrar el log
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const logRepo = AppDataSource.getRepository(Log);
            
            const logEntry = new Log();
            logEntry.usuario_id = req.user?.id;
            logEntry.accion = accion;
            logEntry.entidad = entidad;
            logEntry.entidad_id = req.params.id ? parseInt(req.params.id) : undefined;
            logEntry.descripcion = descripcion || `${accion} ${entidad}`;
            logEntry.ip_address = req.ip || req.connection.remoteAddress;
            logEntry.user_agent = req.get('User-Agent');

            await logRepo.save(logEntry);
          } catch (error) {
            console.error('Error al registrar log:', error);
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };
};

// Middleware para registrar automáticamente acciones CRUD
export const autoLog = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Solo registrar si la respuesta es exitosa
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Determinar acción basada en el método HTTP
      let accion: AccionTipo;
      switch (req.method) {
        case 'POST':
          accion = 'crear';
          break;
        case 'PUT':
        case 'PATCH':
          accion = 'editar';
          break;
        case 'DELETE':
          accion = 'eliminar';
          break;
        default:
          return originalSend.call(this, data);
      }

      // Determinar entidad basada en la ruta
      let entidad: EntidadTipo = 'sistema';
      const path = req.path.toLowerCase();
      
      if (path.includes('/tipos-extintores')) entidad = 'tipos_extintores';
      else if (path.includes('/extintores')) entidad = 'extintores';
      else if (path.includes('/usuarios')) entidad = 'usuarios';
      else if (path.includes('/ubicaciones')) entidad = 'ubicaciones';
      else if (path.includes('/sedes')) entidad = 'sedes';
      else if (path.includes('/mantenimientos')) entidad = 'mantenimientos';

      // Registrar el log de forma asíncrona
      setImmediate(async () => {
        try {
          const logRepo = AppDataSource.getRepository(Log);
          
          const logEntry = new Log();
          logEntry.usuario_id = req.user?.id;
          logEntry.accion = accion;
          logEntry.entidad = entidad;
          logEntry.entidad_id = req.params.id ? parseInt(req.params.id) : undefined;
          logEntry.descripcion = `${accion} ${entidad} vía API`;
          logEntry.ip_address = req.ip || req.connection.remoteAddress;
          logEntry.user_agent = req.get('User-Agent');

          await logRepo.save(logEntry);
        } catch (error) {
          console.error('Error al registrar log automático:', error);
        }
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Función utilitaria para registrar logs manualmente
export const createLog = async (
  usuario_id: number | undefined,
  accion: AccionTipo,
  entidad: EntidadTipo,
  entidad_id?: number,
  descripcion?: string,
  ip_address?: string,
  user_agent?: string
): Promise<void> => {
  try {
    const logRepo = AppDataSource.getRepository(Log);
    
    const logEntry = new Log();
    logEntry.usuario_id = usuario_id;
    logEntry.accion = accion;
    logEntry.entidad = entidad;
    logEntry.entidad_id = entidad_id;
    logEntry.descripcion = descripcion;
    logEntry.ip_address = ip_address;
    logEntry.user_agent = user_agent;

    await logRepo.save(logEntry);
  } catch (error) {
    console.error('Error al crear log manual:', error);
  }
};
