"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./database/config");
const helpers_1 = require("./utils/helpers");
const logging_1 = require("./middleware/logging");
// Importar rutas
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const extintores_1 = __importDefault(require("./routes/extintores"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const locations_1 = __importDefault(require("./routes/locations"));
const tipos_extintores_1 = __importDefault(require("./routes/tipos-extintores"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
// Configuración de rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requests por IP por ventana
    message: {
        success: false,
        error: 'Demasiadas solicitudes, intente nuevamente más tarde',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Middlewares de seguridad y utilidad
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            scriptSrc: ["'self'"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: '*', // Permitir cualquier origen durante desarrollo
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, compression_1.default)());
app.use(limiter);
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Middleware de logging automático
app.use(logging_1.autoLog);
// Servir archivos estáticos
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../../images')));
app.use('/qr-codes', express_1.default.static(path_1.default.join(__dirname, '../../qr_codes')));
// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    const systemInfo = (0, helpers_1.getSystemInfo)();
    res.json((0, helpers_1.createApiResponse)(true, {
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        system: systemInfo
    }, 'Servidor funcionando correctamente'));
});
// Ruta de información de la API
app.get('/api/info', (req, res) => {
    res.json((0, helpers_1.createApiResponse)(true, {
        name: 'FireGuardian API',
        version: '1.0.0',
        description: 'API para el sistema de inventario de extintores',
        author: 'YCC Extintores',
        endpoints: {
            auth: '/api/auth',
            extintores: '/api/extintores',
            dashboard: '/api/dashboard',
            usuarios: '/api/usuarios',
            ubicaciones: '/api/ubicaciones',
            sedes: '/api/sedes',
            mantenimientos: '/api/mantenimientos',
            reportes: '/api/reportes',
            backup: '/api/backup'
        }
    }));
});
// Registrar rutas de la API
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/extintores', extintores_1.default);
app.use('/api/usuarios', usuarios_1.default);
app.use('/api/tipos-extintores', tipos_extintores_1.default);
app.use('/api', locations_1.default); // Incluye /sedes y /ubicaciones
// Ruta temporal para desarrollo
app.get('/api/test', (req, res) => {
    res.json((0, helpers_1.createApiResponse)(true, {
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    }));
});
// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error en la aplicación:', err);
    // Error de validación de JSON
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'JSON inválido en la solicitud'));
    }
    // Error de base de datos
    if (err.name === 'QueryFailedError') {
        return res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, 'Error en la base de datos'));
    }
    // Error genérico
    res.status(500).json((0, helpers_1.createApiResponse)(false, undefined, undefined, process.env.NODE_ENV === 'development'
        ? err.message
        : 'Error interno del servidor'));
});
// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json((0, helpers_1.createApiResponse)(false, undefined, undefined, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
});
// Función para inicializar el servidor
const startServer = async () => {
    try {
        console.log('🚀 Iniciando FireGuardian API Server...');
        // Inicializar base de datos
        await (0, config_1.initializeDatabase)();
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
            console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📖 Info API: http://localhost:${PORT}/api/info`);
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Modo desarrollo activado');
            }
        });
    }
    catch (error) {
        console.error('❌ Error al inicializar el servidor:', error);
        process.exit(1);
    }
};
// Manejo de señales del sistema
process.on('SIGTERM', () => {
    console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
    process.exit(0);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    console.error('En:', promise);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    process.exit(1);
});
// Inicializar servidor
console.log('🔧 Iniciando servidor...');
startServer().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map