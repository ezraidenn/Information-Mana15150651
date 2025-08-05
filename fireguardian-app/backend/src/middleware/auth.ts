import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/config';
import { Usuario, UsuarioRol } from '../models/Usuario';
import { AuthRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fireguardian-secret-key-2025';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido',
        timestamp: new Date().toISOString()
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepo.findOne({ 
      where: { id: decoded.userId, activo: true } 
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no válido o inactivo',
        timestamp: new Date().toISOString()
      });
    }

    req.user = usuario;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido',
      timestamp: new Date().toISOString()
    });
  }
};

export const requireRole = (roles: UsuarioRol[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
        timestamp: new Date().toISOString()
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

export const generateToken = (usuario: Usuario): string => {
  return jwt.sign(
    { 
      userId: usuario.id, 
      email: usuario.email,
      rol: usuario.rol 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Middleware opcional para rutas que pueden funcionar sin autenticación
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepo.findOne({ 
        where: { id: decoded.userId, activo: true } 
      });
      
      if (usuario) {
        req.user = usuario;
      }
    }
    
    next();
  } catch (error) {
    // Si hay error en el token opcional, continuamos sin usuario
    next();
  }
};
