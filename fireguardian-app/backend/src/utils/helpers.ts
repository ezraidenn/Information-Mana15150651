import { ApiResponse } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

// Función para crear respuestas API consistentes
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    data,
    message,
    error,
    timestamp: new Date().toISOString()
  };
};

// Función para respuestas exitosas
export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return createApiResponse(true, data, message);
};

// Función para respuestas de error
export const errorResponse = (error: string, data?: any): ApiResponse<any> => {
  return createApiResponse(false, data, undefined, error);
};

// Función para generar nombres únicos de archivos
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  return `${baseName}_${timestamp}_${random}${extension}`;
};

// Función para crear directorios si no existen
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Función para eliminar archivos de forma segura
export const safeDeleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
};

// Función para formatear fechas
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string => {
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('es-ES');
    case 'long':
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return d.toISOString().split('T')[0];
    default:
      return d.toLocaleDateString('es-ES');
  }
};

// Función para calcular días entre fechas
export const daysBetweenDates = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para validar y sanitizar texto
export const sanitizeText = (text: string, maxLength: number = 255): string => {
  if (!text) return '';
  
  return text
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remover caracteres potencialmente peligrosos
};

// Función para generar códigos únicos
export const generateCode = (prefix: string = '', length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

// Función para encriptar texto (para backups)
export const encryptText = (text: string, password: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Función para desencriptar texto
export const decryptText = (encryptedText: string, password: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encrypted = textParts.join(':');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Función para validar formato de imagen
export const isValidImageFormat = (filename: string): boolean => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = path.extname(filename).toLowerCase();
  return validExtensions.includes(extension);
};

// Función para obtener el tamaño de archivo en formato legible
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función para generar hash de archivo (para verificar integridad)
export const generateFileHash = async (filePath: string): Promise<string> => {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

// Función para limpiar y optimizar la base de datos
export const cleanupOldLogs = async (daysToKeep: number = 90): Promise<number> => {
  const { AppDataSource } = await import('@/database/config');
  const { Log } = await import('@/models/Log');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const logRepo = AppDataSource.getRepository(Log);
  const result = await logRepo
    .createQueryBuilder()
    .delete()
    .where('timestamp < :cutoffDate', { cutoffDate })
    .execute();
  
  return result.affected || 0;
};

// Función para obtener información del sistema
export const getSystemInfo = () => {
  const os = require('os');
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    totalMemory: formatFileSize(os.totalmem()),
    freeMemory: formatFileSize(os.freemem()),
    uptime: Math.floor(os.uptime()),
    loadAverage: os.loadavg()
  };
};

// Función para validar conexión a la base de datos
export const validateDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { AppDataSource } = await import('../database/config');
    return AppDataSource.isInitialized;
  } catch {
    return false;
  }
};

// Función simple para logging de acciones
export const logUserAction = async (req: any, accion: string, entidad: string, detalles?: string) => {
  try {
    // Por ahora solo log en consola, después implementaremos base de datos
    const logData = {
      usuario: req.user?.email || 'Sistema',
      accion,
      entidad,
      detalles,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection?.remoteAddress
    };
    
    console.log('[LOG]', JSON.stringify(logData, null, 2));
  } catch (error) {
    console.error('Error en logging:', error);
  }
};
