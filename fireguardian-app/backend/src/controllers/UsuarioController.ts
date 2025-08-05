import { Request, Response } from 'express';
import { AppDataSource } from '../database/config';
import { Usuario } from '../models/Usuario';
import { successResponse, errorResponse, logUserAction } from '../utils/helpers';
import { logAction } from '../middleware/logging';
import bcrypt from 'bcryptjs';

export class UsuarioController {
  private usuarioRepository = AppDataSource.getRepository(Usuario);

  /**
   * Obtener todos los usuarios
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, search, rol } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const queryBuilder = this.usuarioRepository
        .createQueryBuilder('usuario')
        .select([
          'usuario.id',
          'usuario.nombre',
          'usuario.email',
          'usuario.rol',
          'usuario.activo',
          'usuario.ultimo_acceso',
          'usuario.creado_en',
          'usuario.actualizado_en'
        ]);

      // Filtro por búsqueda
      if (search) {
        queryBuilder.andWhere(
          '(usuario.nombre ILIKE :search OR usuario.email ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Filtro por rol
      if (rol && ['admin', 'tecnico', 'consulta'].includes(String(rol))) {
        queryBuilder.andWhere('usuario.rol = :rol', { rol });
      }

      // Paginación
      const [usuarios, total] = await queryBuilder
        .orderBy('usuario.creado_en', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getManyAndCount();

      res.json(successResponse({
        data: usuarios,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }));

    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const usuario = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .select([
          'usuario.id',
          'usuario.nombre',
          'usuario.email',
          'usuario.rol',
          'usuario.activo',
          'usuario.ultimo_acceso',
          'usuario.creado_en',
          'usuario.actualizado_en'
        ])
        .where('usuario.id = :id', { id })
        .getOne();

      if (!usuario) {
        res.status(404).json(errorResponse('Usuario no encontrado'));
        return;
      }

      res.json(successResponse(usuario));

    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Crear nuevo usuario
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, password, rol = 'consulta' } = req.body;

      // Verificar si el email ya existe
      const existingUser = await this.usuarioRepository.findOne({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json(errorResponse('El email ya está registrado'));
        return;
      }

      // Crear nuevo usuario
      const usuario = new Usuario();
      usuario.nombre = nombre;
      usuario.email = email;
      usuario.password = await bcrypt.hash(password, 10);
      usuario.rol = rol;
      usuario.activo = true;

      const savedUser = await this.usuarioRepository.save(usuario);

      // Log de la acción
      await logUserAction(req, 'CREAR', 'USUARIO', `Usuario creado: ${savedUser.nombre} (${savedUser.email})`);

      // Responder sin la contraseña
      const { password: _, ...userResponse } = savedUser;
      res.status(201).json(successResponse(userResponse));

    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Actualizar usuario
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, email, rol, activo } = req.body;

      const usuario = await this.usuarioRepository.findOne({
        where: { id: Number(id) }
      });

      if (!usuario) {
        res.status(404).json(errorResponse('Usuario no encontrado'));
        return;
      }

      // Verificar si el nuevo email ya existe (si se está cambiando)
      if (email && email !== usuario.email) {
        const existingUser = await this.usuarioRepository.findOne({
          where: { email }
        });

        if (existingUser) {
          res.status(400).json(errorResponse('El email ya está registrado'));
          return;
        }
      }

      // Actualizar campos
      if (nombre) usuario.nombre = nombre;
      if (email) usuario.email = email;
      if (rol && ['admin', 'tecnico', 'consulta'].includes(rol)) {
        usuario.rol = rol;
      }
      if (typeof activo === 'boolean') usuario.activo = activo;

      const updatedUser = await this.usuarioRepository.save(usuario);

      // Log de la acción
      await logUserAction(req, 'ACTUALIZAR', 'USUARIO', `Usuario actualizado: ${updatedUser.nombre} (${updatedUser.email})`);

      // Responder sin la contraseña
      const { password: _, ...userResponse } = updatedUser;
      res.json(successResponse(userResponse));

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Cambiar contraseña de usuario
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        res.status(400).json(errorResponse('La contraseña debe tener al menos 6 caracteres'));
        return;
      }

      const usuario = await this.usuarioRepository.findOne({
        where: { id: Number(id) }
      });

      if (!usuario) {
        res.status(404).json(errorResponse('Usuario no encontrado'));
        return;
      }

      // Actualizar contraseña
      usuario.password = await bcrypt.hash(newPassword, 10);
      await this.usuarioRepository.save(usuario);

      // Log de la acción
      await logUserAction(req, 'CAMBIAR_PASSWORD', 'USUARIO', `Contraseña cambiada para: ${usuario.email}`);

      res.json(successResponse({ message: 'Contraseña actualizada exitosamente' }));

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Activar/Desactivar usuario
   */
  async toggleActive(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const usuario = await this.usuarioRepository.findOne({
        where: { id: Number(id) }
      });

      if (!usuario) {
        res.status(404).json(errorResponse('Usuario no encontrado'));
        return;
      }

      // No permitir desactivar al último admin
      if (usuario.rol === 'admin' && usuario.activo) {
        const activeAdmins = await this.usuarioRepository.count({
          where: { rol: 'admin', activo: true }
        });

        if (activeAdmins <= 1) {
          res.status(400).json(errorResponse('No se puede desactivar al último administrador'));
          return;
        }
      }

      usuario.activo = !usuario.activo;
      const updatedUser = await this.usuarioRepository.save(usuario);

      // Log de la acción
      await logUserAction(req, 'TOGGLE_ACTIVO', 'USUARIO', `Usuario ${usuario.activo ? 'activado' : 'desactivado'}: ${usuario.email}`);

      const { password: _, ...userResponse } = updatedUser;
      res.json(successResponse(userResponse));

    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const usuario = await this.usuarioRepository.findOne({
        where: { id: Number(id) }
      });

      if (!usuario) {
        res.status(404).json(errorResponse('Usuario no encontrado'));
        return;
      }

      // No permitir eliminar al último admin
      if (usuario.rol === 'admin') {
        const activeAdmins = await this.usuarioRepository.count({
          where: { rol: 'admin', activo: true }
        });

        if (activeAdmins <= 1) {
          res.status(400).json(errorResponse('No se puede eliminar al último administrador'));
          return;
        }
      }

      // Soft delete - desactivar usuario
      usuario.activo = false;
      await this.usuarioRepository.save(usuario);

      // Log de la acción
      await logUserAction(req, 'ACTUALIZAR', 'USUARIO', `Usuario actualizado: ${usuario.nombre} (${usuario.email})`);

      res.json(successResponse({ message: 'Usuario eliminado exitosamente' }));

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalUsuarios,
        usuariosActivos,
        administradores,
        tecnicos,
        consultores
      ] = await Promise.all([
        this.usuarioRepository.count(),
        this.usuarioRepository.count({ where: { activo: true } }),
        this.usuarioRepository.count({ where: { rol: 'admin' } }),
        this.usuarioRepository.count({ where: { rol: 'tecnico' } }),
        this.usuarioRepository.count({ where: { rol: 'consulta' } })
      ]);

      const stats = {
        total: totalUsuarios,
        activos: usuariosActivos,
        inactivos: totalUsuarios - usuariosActivos,
        porRol: {
          admin: administradores,
          tecnico: tecnicos,
          consulta: consultores
        }
      };

      res.json(successResponse(stats));

    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }

  /**
   * Obtener actividad reciente de usuarios
   */
  async getRecentActivity(req: Request, res: Response): Promise<void> {
    try {
      const recentUsers = await this.usuarioRepository
        .createQueryBuilder('usuario')
        .select([
          'usuario.id',
          'usuario.nombre',
          'usuario.email',
          'usuario.ultimo_acceso',
          'usuario.creado_en'
        ])
        .where('usuario.activo = :activo', { activo: true })
        .orderBy('usuario.ultimo_acceso', 'DESC')
        .limit(10)
        .getMany();

      res.json(successResponse(recentUsers));

    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      res.status(500).json(errorResponse('Error interno del servidor'));
    }
  }
}
