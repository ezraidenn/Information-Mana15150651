"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMantenimiento = exports.validateUsuario = exports.validateExtintor = exports.validateImageFile = exports.validateEnum = exports.validateStringLength = exports.validatePositiveInteger = exports.validateDate = exports.validateEmail = exports.validateRequired = void 0;
// Validador genérico para campos requeridos
const validateRequired = (fields) => {
    return (req, res, next) => {
        const missingFields = [];
        for (const field of fields) {
            if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
                missingFields.push(field);
            }
        }
        if (missingFields.length > 0) {
            const response = {
                success: false,
                error: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
                timestamp: new Date().toISOString()
            };
            return res.status(400).json(response);
        }
        next();
    };
};
exports.validateRequired = validateRequired;
// Validador para formato de email
const validateEmail = (field = 'email') => {
    return (req, res, next) => {
        const email = req.body[field];
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                const response = {
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
exports.validateEmail = validateEmail;
// Validador para fechas
const validateDate = (field, required = true) => {
    return (req, res, next) => {
        const dateValue = req.body[field];
        if (!dateValue && required) {
            const response = {
                success: false,
                error: `Campo de fecha requerido: ${field}`,
                timestamp: new Date().toISOString()
            };
            return res.status(400).json(response);
        }
        if (dateValue) {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                const response = {
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
exports.validateDate = validateDate;
// Validador para números enteros positivos
const validatePositiveInteger = (field, required = true) => {
    return (req, res, next) => {
        const value = req.body[field];
        if (value === undefined || value === null) {
            if (required) {
                const response = {
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
            const response = {
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
exports.validatePositiveInteger = validatePositiveInteger;
// Validador para longitud de cadenas
const validateStringLength = (field, minLength = 0, maxLength = 255) => {
    return (req, res, next) => {
        const value = req.body[field];
        if (value && typeof value === 'string') {
            if (value.length < minLength || value.length > maxLength) {
                const response = {
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
exports.validateStringLength = validateStringLength;
// Validador para valores enum
const validateEnum = (field, allowedValues, required = true) => {
    return (req, res, next) => {
        const value = req.body[field];
        if (!value && required) {
            const response = {
                success: false,
                error: `Campo requerido: ${field}`,
                timestamp: new Date().toISOString()
            };
            return res.status(400).json(response);
        }
        if (value && !allowedValues.includes(value)) {
            const response = {
                success: false,
                error: `Valor inválido para ${field}. Valores permitidos: ${allowedValues.join(', ')}`,
                timestamp: new Date().toISOString()
            };
            return res.status(400).json(response);
        }
        next();
    };
};
exports.validateEnum = validateEnum;
// Validador para archivos de imagen
const validateImageFile = (req, res, next) => {
    if (req.file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (!allowedTypes.includes(req.file.mimetype)) {
            const response = {
                success: false,
                error: 'Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP',
                timestamp: new Date().toISOString()
            };
            return res.status(400).json(response);
        }
        if (req.file.size > maxSize) {
            const response = {
                success: false,
                error: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
                timestamp: new Date().toISOString()
            };
            return res.status(400).json(response);
        }
    }
    next();
};
exports.validateImageFile = validateImageFile;
// Validador compuesto para extintores
exports.validateExtintor = [
    (0, exports.validateRequired)(['tipo_id', 'ubicacion_id', 'fecha_vencimiento']),
    (0, exports.validateDate)('fecha_vencimiento'),
    (0, exports.validateDate)('fecha_mantenimiento', false),
    (0, exports.validatePositiveInteger)('ubicacion_id'),
    (0, exports.validatePositiveInteger)('responsable_id', false),
    (0, exports.validateStringLength)('codigo_interno', 0, 50),
    (0, exports.validateStringLength)('descripcion', 0, 500)
];
// Validador compuesto para usuarios
exports.validateUsuario = [
    (0, exports.validateRequired)(['nombre', 'email', 'rol']),
    (0, exports.validateStringLength)('nombre', 2, 100),
    (0, exports.validateStringLength)('email', 3, 50),
    (0, exports.validateEmail)('email'),
    (0, exports.validateEnum)('rol', ['admin', 'tecnico', 'consulta'])
];
// Validador compuesto para mantenimientos
exports.validateMantenimiento = [
    (0, exports.validateRequired)(['extintor_id', 'fecha', 'tipo_evento']),
    (0, exports.validatePositiveInteger)('extintor_id'),
    (0, exports.validateDate)('fecha'),
    (0, exports.validateEnum)('tipo_evento', ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo']),
    (0, exports.validateStringLength)('descripcion', 0, 1000)
];
//# sourceMappingURL=validation.js.map