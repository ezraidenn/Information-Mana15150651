import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database/config';
import { Usuario } from '../models/Usuario';
import { createApiResponse } from '../utils/helpers';
import { generateToken } from '../middleware/auth';
import { createLog } from '../middleware/logging';
import { AuthRequest, CreateUsuarioDTO } from '../types';

export class AuthController {
  
  /**
   * Endpoint temporal para crear un usuario administrador
   */
  static async createAdmin(req: Request, res: Response): Promise<any> {
    try {
      console.log('🔧 Creando usuario administrador temporal...');
      
      const usuarioRepo = AppDataSource.getRepository(Usuario);
      
      // Verificar si ya existe un admin
      const existingAdmin = await usuarioRepo.findOne({ where: { email: 'admin@fireguardian.com' } });
      
      if (existingAdmin) {
        console.log('⚠️ Ya existe un usuario admin, actualizando contraseña...');
        existingAdmin.password = await bcrypt.hash('admin123', 10);
        existingAdmin.activo = true;
        await usuarioRepo.save(existingAdmin);
        
        return res.status(200).json(createApiResponse(
          true,
          { id: existingAdmin.id, email: existingAdmin.email },
          undefined,
          'Usuario administrador actualizado correctamente'
        ));
      }
      
      // Crear nuevo admin
      const newAdmin = new Usuario();
      newAdmin.nombre = 'Administrador';
      newAdmin.email = 'admin@fireguardian.com';
      newAdmin.password = await bcrypt.hash('admin123', 10);
      newAdmin.rol = 'admin';
      newAdmin.activo = true;
      newAdmin.creado_en = new Date();
      newAdmin.actualizado_en = new Date();
      
      const savedAdmin = await usuarioRepo.save(newAdmin);
      console.log('✅ Usuario administrador creado:', { id: savedAdmin.id, email: savedAdmin.email });
      
      return res.status(201).json(createApiResponse(
        true,
        { id: savedAdmin.id, email: savedAdmin.email },
        undefined,
        'Usuario administrador creado correctamente'
      ));
    } catch (error) {
      console.error('❌ Error al crear usuario administrador:', error);
      return res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error al crear usuario administrador'
      ));
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, password } = req.body;
      console.log('🔍 Login intento - Body recibido:', req.body);

      // Validar que existan email y password
      if (!email || !password) {
        console.log('❌ Login fallido - Campos faltantes:', { email: !!email, password: !!password });
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Email y password son requeridos'
        ));
      }

      console.log('🔍 Buscando usuario con email:', email);
      const usuarioRepo = AppDataSource.getRepository(Usuario);
      
      // Listar todos los usuarios para depuración
      console.log('🔍 Listando todos los usuarios en la base de datos:');
      const allUsers = await usuarioRepo.find();
      allUsers.forEach(u => {
        console.log(`ID: ${u.id}, Email: ${u.email}, Activo: ${u.activo}`);
      });
      
      // Intentar buscar el usuario específico
      console.log(`🔍 Ejecutando findOne con where: { email: "${email}", activo: true }`);
      const usuario = await usuarioRepo.findOne({ where: { email, activo: true } });

      // Verificar si existe el usuario
      if (!usuario) {
        console.log('❌ Login fallido - Usuario no encontrado con email:', email);
        
        // Intentar buscar sin el filtro de activo para depuración
        const usuarioInactivo = await usuarioRepo.findOne({ where: { email } });
        if (usuarioInactivo) {
          console.log(`⚠️ Se encontró el usuario pero está inactivo: ${usuarioInactivo.id}, activo: ${usuarioInactivo.activo}`);
        } else {
          console.log('⚠️ No se encontró ningún usuario con este email, activo o inactivo');
        }
        
        return res.status(401).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Credenciales inválidas'
        ));
      }
      
      console.log('✅ Usuario encontrado:', { id: usuario.id, email: usuario.email });
      console.log('🔐 Verificando contraseña...');
      
      // Verificar si el campo password existe
      if (!usuario.password) {
        console.log('❌ Error: El campo password no existe en el usuario');
        res.status(500).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Error en la configuración del usuario'
        ));
        return;
      }

      const isValidPassword = await bcrypt.compare(password, usuario.password);
      console.log('🔑 Resultado de verificación de contraseña:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Login fallido - Contraseña incorrecta para usuario:', usuario.email);
        res.status(401).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Credenciales inválidas'
        ));
        return;
      }

      // Actualizar último login
      usuario.ultimo_acceso = new Date();
      await usuarioRepo.save(usuario);

      // Generar token
      const token = generateToken(usuario);

      // Registrar log de login
      await createLog(
        usuario.id,
        'login',
        'sistema',
        undefined,
        `Login exitoso para usuario: ${email}`,
        req.ip,
        req.get('User-Agent')
      );

      res.json(createApiResponse(
        true,
        {
          user: usuario.toJSON(),
          token,
          expires_in: '24h'
        },
        'Login exitoso'
      ));

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user) {
        await createLog(
          req.user.id,
          'logout',
          'sistema',
          undefined,
          `Logout para usuario: ${req.user.email}`,
          req.ip,
          req.get('User-Agent')
        );
      }

      res.json(createApiResponse(
        true,
        undefined,
        'Sesión cerrada exitosamente'
      ));

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Obtener perfil del usuario actual
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Usuario no autenticado'
        ));
        return;
      }

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ 
        where: { id: req.user.id } 
      });

      if (!usuario) {
        res.status(404).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Usuario no encontrado'
        ));
        return;
      }

      res.json(createApiResponse(
        true,
        usuario.toJSON(),
        'Perfil obtenido exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!req.user) {
        res.status(401).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Usuario no autenticado'
        ));
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Contraseña actual y nueva son requeridas'
        ));
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          'La nueva contraseña debe tener al menos 6 caracteres'
        ));
        return;
      }

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ 
        where: { id: req.user.id } 
      });

      if (!usuario) {
        res.status(404).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Usuario no encontrado'
        ));
        return;
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, usuario.password);
      if (!isValidPassword) {
        res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Contraseña actual incorrecta'
        ));
        return;
      }

      // Encriptar nueva contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      usuario.password = hashedPassword;
      await usuarioRepo.save(usuario);

      // Registrar log
      await createLog(
        usuario.id,
        'editar',
        'usuarios',
        usuario.id,
        'Cambio de contraseña',
        req.ip,
        req.get('User-Agent')
      );

      res.json(createApiResponse(
        true,
        undefined,
        'Contraseña cambiada exitosamente'
      ));

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Verificar token (para validación del frontend)
   */
  static async verifyToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Token inválido'
        ));
        return;
      }

      res.json(createApiResponse(
        true,
        {
          valid: true,
          user: req.user.toJSON()
        },
        'Token válido'
      ));

    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Registrar nuevo usuario (solo para admins)
   */
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre, email, password, rol }: CreateUsuarioDTO = req.body;

      if (!req.user || req.user.rol !== 'admin') {
        res.status(403).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Solo los administradores pueden crear usuarios'
        ));
        return;
      }

      const usuarioRepo = AppDataSource.getRepository(Usuario);

      // Verificar si el email ya existe
      const existingUser = await usuarioRepo.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          'El correo electrónico ya está registrado'
        ));
        return;
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear nuevo usuario
      const nuevoUsuario = new Usuario();
      nuevoUsuario.nombre = nombre;
      nuevoUsuario.email = email;
      nuevoUsuario.password = hashedPassword;
      nuevoUsuario.rol = rol;
      nuevoUsuario.activo = true;

      await usuarioRepo.save(nuevoUsuario);

      // Registrar log
      await createLog(
        req.user.id,
        'crear',
        'usuarios',
        nuevoUsuario.id,
        `Usuario creado: ${email} (${rol})`,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json(createApiResponse(
        true,
        nuevoUsuario.toJSON(),
        'Usuario creado exitosamente'
      ));

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }
}
