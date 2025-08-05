import 'reflect-metadata';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { initializeDatabase } from './database/config';
import { createApiResponse, getSystemInfo } from './utils/helpers';
import { autoLog } from './middleware/logging';

// Importar rutas
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import extintorRoutes from './routes/extintores';
import usuarioRoutes from './routes/usuarios';
import locationRoutes from './routes/locations';
import tiposExtintoresRoutes from './routes/tipos-extintores';

const app = express();
const PORT = process.env.PORT || 3002;

// Configuración de rate limiting
const limiter = rateLimit({
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
app.use(helmet({
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

app.use(cors({
  origin: '*', // Permitir cualquier origen durante desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging automático
app.use(autoLog);

// Servir archivos estáticos
app.use('/images', express.static(path.join(__dirname, '../../images')));
app.use('/qr-codes', express.static(path.join(__dirname, '../../qr_codes')));

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  const systemInfo = getSystemInfo();
  
  res.json(createApiResponse(true, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    system: systemInfo
  }, 'Servidor funcionando correctamente'));
});

// Ruta de información de la API
app.get('/api/info', (req, res) => {
  res.json(createApiResponse(true, {
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
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/extintores', extintorRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tipos-extintores', tiposExtintoresRoutes);
app.use('/api', locationRoutes); // Incluye /sedes y /ubicaciones

// Ruta temporal para desarrollo
app.get('/api/test', (req, res) => {
  res.json(createApiResponse(true, {
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  }));
});

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error en la aplicación:', err);
  
  // Error de validación de JSON
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json(createApiResponse(
      false,
      undefined,
      undefined,
      'JSON inválido en la solicitud'
    ));
  }
  
  // Error de base de datos
  if (err.name === 'QueryFailedError') {
    return res.status(500).json(createApiResponse(
      false,
      undefined,
      undefined,
      'Error en la base de datos'
    ));
  }
  
  // Error genérico
  res.status(500).json(createApiResponse(
    false,
    undefined,
    undefined,
    process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error interno del servidor'
  ));
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json(createApiResponse(
    false,
    undefined,
    undefined,
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  ));
});

// Función para inicializar el servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando FireGuardian API Server...');
    
    // Inicializar base de datos
    await initializeDatabase();
    
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
    
  } catch (error) {
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

export default app;
