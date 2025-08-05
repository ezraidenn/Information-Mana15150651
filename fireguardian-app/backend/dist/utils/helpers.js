"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logUserAction = exports.validateDatabaseConnection = exports.getSystemInfo = exports.cleanupOldLogs = exports.generateFileHash = exports.formatFileSize = exports.isValidImageFormat = exports.decryptText = exports.encryptText = exports.generateCode = exports.sanitizeText = exports.daysBetweenDates = exports.formatDate = exports.safeDeleteFile = exports.ensureDirectoryExists = exports.generateUniqueFileName = exports.errorResponse = exports.successResponse = exports.createApiResponse = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// Función para crear respuestas API consistentes
const createApiResponse = (success, data, message, error) => {
    return {
        success,
        data,
        message,
        error,
        timestamp: new Date().toISOString()
    };
};
exports.createApiResponse = createApiResponse;
// Función para respuestas exitosas
const successResponse = (data, message) => {
    return (0, exports.createApiResponse)(true, data, message);
};
exports.successResponse = successResponse;
// Función para respuestas de error
const errorResponse = (error, data) => {
    return (0, exports.createApiResponse)(false, data, undefined, error);
};
exports.errorResponse = errorResponse;
// Función para generar nombres únicos de archivos
const generateUniqueFileName = (originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    return `${baseName}_${timestamp}_${random}${extension}`;
};
exports.generateUniqueFileName = generateUniqueFileName;
// Función para crear directorios si no existen
const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.access(dirPath);
    }
    catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
};
exports.ensureDirectoryExists = ensureDirectoryExists;
// Función para eliminar archivos de forma segura
const safeDeleteFile = async (filePath) => {
    try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        return true;
    }
    catch {
        return false;
    }
};
exports.safeDeleteFile = safeDeleteFile;
// Función para formatear fechas
const formatDate = (date, format = 'short') => {
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
exports.formatDate = formatDate;
// Función para calcular días entre fechas
const daysBetweenDates = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
exports.daysBetweenDates = daysBetweenDates;
// Función para validar y sanitizar texto
const sanitizeText = (text, maxLength = 255) => {
    if (!text)
        return '';
    return text
        .trim()
        .substring(0, maxLength)
        .replace(/[<>]/g, ''); // Remover caracteres potencialmente peligrosos
};
exports.sanitizeText = sanitizeText;
// Función para generar códigos únicos
const generateCode = (prefix = '', length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateCode = generateCode;
// Función para encriptar texto (para backups)
const encryptText = (text, password) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};
exports.encryptText = encryptText;
// Función para desencriptar texto
const decryptText = (encryptedText, password) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(password, 'salt', 32);
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decryptText = decryptText;
// Función para validar formato de imagen
const isValidImageFormat = (filename) => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const extension = path.extname(filename).toLowerCase();
    return validExtensions.includes(extension);
};
exports.isValidImageFormat = isValidImageFormat;
// Función para obtener el tamaño de archivo en formato legible
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
// Función para generar hash de archivo (para verificar integridad)
const generateFileHash = async (filePath) => {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};
exports.generateFileHash = generateFileHash;
// Función para limpiar y optimizar la base de datos
const cleanupOldLogs = async (daysToKeep = 90) => {
    const { AppDataSource } = await Promise.resolve().then(() => __importStar(require('@/database/config')));
    const { Log } = await Promise.resolve().then(() => __importStar(require('@/models/Log')));
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
exports.cleanupOldLogs = cleanupOldLogs;
// Función para obtener información del sistema
const getSystemInfo = () => {
    const os = require('os');
    return {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: (0, exports.formatFileSize)(os.totalmem()),
        freeMemory: (0, exports.formatFileSize)(os.freemem()),
        uptime: Math.floor(os.uptime()),
        loadAverage: os.loadavg()
    };
};
exports.getSystemInfo = getSystemInfo;
// Función para validar conexión a la base de datos
const validateDatabaseConnection = async () => {
    try {
        const { AppDataSource } = await Promise.resolve().then(() => __importStar(require('../database/config')));
        return AppDataSource.isInitialized;
    }
    catch {
        return false;
    }
};
exports.validateDatabaseConnection = validateDatabaseConnection;
// Función simple para logging de acciones
const logUserAction = async (req, accion, entidad, detalles) => {
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
    }
    catch (error) {
        console.error('Error en logging:', error);
    }
};
exports.logUserAction = logUserAction;
//# sourceMappingURL=helpers.js.map