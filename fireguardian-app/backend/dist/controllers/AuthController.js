"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../database/config");
const Usuario_1 = require("../models/Usuario");
const helpers_1 = require("../utils/helpers");
const auth_1 = require("../middleware/auth");
const logging_1 = require("../middleware/logging");
class AuthController {
    /**
     * Iniciar sesión
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            console.log('🔍 Login intento - Body recibido:', req.body);
            // Validar que existan email y password
            if (!email || !password) {
                console.log('❌ Login fallido - Campos faltantes:', { email: !!email, password: !!password });
                return res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Email y password son requeridos'));
            }
            console.log('🔍 Buscando usuario con email:', email);
            const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
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
                }
                else {
                    console.log('⚠️ No se encontró ningún usuario con este email, activo o inactivo');
                }
                return res.status(401).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Credenciales inválidas'));
            }
            console.log('✅ Usuario encontrado:', { id: usuario.id, email: usuario.email });
            console.log('🔐 Verificando contraseña...');
            // Verificar si el campo password existe
            if (!usuario.password) {
                console.log('❌ Error: El campo password no existe en el usuario');
                res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error en la configuración del usuario'));
                return;
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, usuario.password);
            console.log('🔑 Resultado de verificación de contraseña:', isValidPassword);
            if (!isValidPassword) {
                console.log('❌ Login fallido - Contraseña incorrecta para usuario:', usuario.email);
                res.status(401).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Credenciales inválidas'));
                return;
            }
            // Actualizar último login
            usuario.ultimo_acceso = new Date();
            await usuarioRepo.save(usuario);
            // Generar token
            const token = (0, auth_1.generateToken)(usuario);
            // Registrar log de login
            await (0, logging_1.createLog)(usuario.id, 'login', 'sistema', undefined, `Login exitoso para usuario: ${email}`, req.ip, req.get('User-Agent'));
            res.json((0, helpers_1.createApiResponse)(true, {
                user: usuario.toJSON(),
                token,
                expires_in: '24h'
            }, 'Login exitoso'));
        }
        catch (error) {
            console.error('Error en login:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Cerrar sesión
     */
    static async logout(req, res) {
        try {
            if (req.user) {
                await (0, logging_1.createLog)(req.user.id, 'logout', 'sistema', undefined, `Logout para usuario: ${req.user.email}`, req.ip, req.get('User-Agent'));
            }
            res.json((0, helpers_1.createApiResponse)(true, undefined, 'Sesión cerrada exitosamente'));
        }
        catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Obtener perfil del usuario actual
     */
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Usuario no autenticado'));
                return;
            }
            const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
            const usuario = await usuarioRepo.findOne({
                where: { id: req.user.id }
            });
            if (!usuario) {
                res.status(404).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Usuario no encontrado'));
                return;
            }
            res.json((0, helpers_1.createApiResponse)(true, usuario.toJSON(), 'Perfil obtenido exitosamente'));
        }
        catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Cambiar contraseña
     */
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!req.user) {
                res.status(401).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Usuario no autenticado'));
                return;
            }
            if (!currentPassword || !newPassword) {
                res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Contraseña actual y nueva son requeridas'));
                return;
            }
            if (newPassword.length < 6) {
                res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'La nueva contraseña debe tener al menos 6 caracteres'));
                return;
            }
            const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
            const usuario = await usuarioRepo.findOne({
                where: { id: req.user.id }
            });
            if (!usuario) {
                res.status(404).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Usuario no encontrado'));
                return;
            }
            // Verificar contraseña actual
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, usuario.password);
            if (!isValidPassword) {
                res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Contraseña actual incorrecta'));
                return;
            }
            // Encriptar nueva contraseña
            const saltRounds = 10;
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
            // Actualizar contraseña
            usuario.password = hashedPassword;
            await usuarioRepo.save(usuario);
            // Registrar log
            await (0, logging_1.createLog)(usuario.id, 'editar', 'usuarios', usuario.id, 'Cambio de contraseña', req.ip, req.get('User-Agent'));
            res.json((0, helpers_1.createApiResponse)(true, undefined, 'Contraseña cambiada exitosamente'));
        }
        catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Verificar token (para validación del frontend)
     */
    static async verifyToken(req, res) {
        try {
            if (!req.user) {
                res.status(401).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Token inválido'));
                return;
            }
            res.json((0, helpers_1.createApiResponse)(true, {
                valid: true,
                user: req.user.toJSON()
            }, 'Token válido'));
        }
        catch (error) {
            console.error('Error al verificar token:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
    /**
     * Registrar nuevo usuario (solo para admins)
     */
    static async register(req, res) {
        try {
            const { nombre, email, password, rol } = req.body;
            if (!req.user || req.user.rol !== 'admin') {
                res.status(403).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Solo los administradores pueden crear usuarios'));
                return;
            }
            const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
            // Verificar si el email ya existe
            const existingUser = await usuarioRepo.findOne({ where: { email } });
            if (existingUser) {
                res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'El correo electrónico ya está registrado'));
                return;
            }
            // Encriptar contraseña
            const saltRounds = 10;
            const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
            // Crear nuevo usuario
            const nuevoUsuario = new Usuario_1.Usuario();
            nuevoUsuario.nombre = nombre;
            nuevoUsuario.email = email;
            nuevoUsuario.password = hashedPassword;
            nuevoUsuario.rol = rol;
            nuevoUsuario.activo = true;
            await usuarioRepo.save(nuevoUsuario);
            // Registrar log
            await (0, logging_1.createLog)(req.user.id, 'crear', 'usuarios', nuevoUsuario.id, `Usuario creado: ${email} (${rol})`, req.ip, req.get('User-Agent'));
            res.status(201).json((0, helpers_1.createApiResponse)(true, nuevoUsuario.toJSON(), 'Usuario creado exitosamente'));
        }
        catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error interno del servidor'));
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map