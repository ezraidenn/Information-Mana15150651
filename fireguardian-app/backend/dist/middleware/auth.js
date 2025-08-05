"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.generateToken = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../database/config");
const Usuario_1 = require("../models/Usuario");
const JWT_SECRET = process.env.JWT_SECRET || 'fireguardian-secret-key-2025';
const authenticateToken = async (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
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
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Token inválido',
            timestamp: new Date().toISOString()
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
const generateToken = (usuario) => {
    return jsonwebtoken_1.default.sign({
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol
    }, JWT_SECRET, { expiresIn: '24h' });
};
exports.generateToken = generateToken;
// Middleware opcional para rutas que pueden funcionar sin autenticación
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
            const usuario = await usuarioRepo.findOne({
                where: { id: decoded.userId, activo: true }
            });
            if (usuario) {
                req.user = usuario;
            }
        }
        next();
    }
    catch (error) {
        // Si hay error en el token opcional, continuamos sin usuario
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map