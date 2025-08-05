import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// Validador genérico para campos requeridos
export const validateRequired = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];
    
    for (const field of fields) {
      if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      const response: ApiResponse = {
        success: false,
        error: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    next();
  };
};

// Validador para formato de email
export const validateEmail = (field: string = 'email') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body[field];
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse = {
          success: false,
          error: `Formato de email inválido en campo: ${field}`,
          timestamp: new Date().toISOString()
        };
        return res.status(400).json(response);
      }
    }
    next();
  };
};

// Validador para fechas
export const validateDate = (field: string, required: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dateValue = req.body[field];
    
    if (!dateValue && required) {
      const response: ApiResponse = {
        success: false,
        error: `Campo de fecha requerido: ${field}`,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    if (dateValue) {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        const response: ApiResponse = {
          success: false,
          error: `Formato de fecha inválido en campo: ${field}. Use formato YYYY-MM-DD`,
          timestamp: new Date().toISOString()
        };
        return res.status(400).json(response);
      }
    }
    
    next();
  };
};

// Validador para números enteros positivos
export const validatePositiveInteger = (field: string, required: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    
    if (value === undefined || value === null) {
      if (required) {
        const response: ApiResponse = {
          success: false,
          error: `Campo numérico requerido: ${field}`,
          timestamp: new Date().toISOString()
        };
        return res.status(400).json(response);
      }
      return next();
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) {
      const response: ApiResponse = {
        success: false,
        error: `El campo ${field} debe ser un número entero positivo`,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    // Convertir a número para facilitar el uso posterior
    req.body[field] = numValue;
    next();
  };
};

// Validador para longitud de cadenas
export const validateStringLength = (field: string, minLength: number = 0, maxLength: number = 255) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    
    if (value && typeof value === 'string') {
      if (value.length < minLength || value.length > maxLength) {
        const response: ApiResponse = {
          success: false,
          error: `El campo ${field} debe tener entre ${minLength} y ${maxLength} caracteres`,
          timestamp: new Date().toISOString()
        };
        return res.status(400).json(response);
      }
    }
    
    next();
  };
};

// Validador para valores enum
export const validateEnum = (field: string, allowedValues: string[], required: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    
    if (!value && required) {
      const response: ApiResponse = {
        success: false,
        error: `Campo requerido: ${field}`,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    if (value && !allowedValues.includes(value)) {
      const response: ApiResponse = {
        success: false,
        error: `Valor inválido para ${field}. Valores permitidos: ${allowedValues.join(', ')}`,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    next();
  };
};

// Validador para archivos de imagen
export const validateImageFile = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      const response: ApiResponse = {
        success: false,
        error: 'Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    if (req.file.size > maxSize) {
      const response: ApiResponse = {
        success: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
  }
  
  next();
};

// Validador compuesto para extintores
export const validateExtintor = [
  validateRequired(['tipo_id', 'ubicacion_id', 'fecha_vencimiento']),
  validateDate('fecha_vencimiento'),
  validateDate('fecha_mantenimiento', false),
  validatePositiveInteger('ubicacion_id'),
  validatePositiveInteger('responsable_id', false),
  validateStringLength('codigo_interno', 0, 50),
  validateStringLength('descripcion', 0, 500)
];

// Validador compuesto para usuarios
export const validateUsuario = [
  validateRequired(['nombre', 'email', 'rol']),
  validateStringLength('nombre', 2, 100),
  validateStringLength('email', 3, 50),
  validateEmail('email'),
  validateEnum('rol', ['admin', 'tecnico', 'consulta'])
];

// Validador compuesto para mantenimientos
export const validateMantenimiento = [
  validateRequired(['extintor_id', 'fecha', 'tipo_evento']),
  validatePositiveInteger('extintor_id'),
  validateDate('fecha'),
  validateEnum('tipo_evento', ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo']),
  validateStringLength('descripcion', 0, 1000)
];
