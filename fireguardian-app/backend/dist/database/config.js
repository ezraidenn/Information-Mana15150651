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
exports.initializeDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const path = __importStar(require("path"));
const Extintor_1 = require("../models/Extintor");
const TipoExtintor_1 = require("../models/TipoExtintor");
const Ubicacion_1 = require("../models/Ubicacion");
const Sede_1 = require("../models/Sede");
const Usuario_1 = require("../models/Usuario");
const Mantenimiento_1 = require("../models/Mantenimiento");
const Log_1 = require("../models/Log");
// Obtener la ruta absoluta a la base de datos
const dbPath = path.resolve(__dirname, '../../../fireguardian.db');
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: dbPath,
    synchronize: true, // Solo para desarrollo
    logging: process.env.NODE_ENV === 'development',
    entities: [
        Extintor_1.Extintor,
        TipoExtintor_1.TipoExtintor,
        Ubicacion_1.Ubicacion,
        Sede_1.Sede,
        Usuario_1.Usuario,
        Mantenimiento_1.Mantenimiento,
        Log_1.Log
    ],
    migrations: ['src/database/migrations/*.ts'],
    subscribers: ['src/database/subscribers/*.ts'],
});
const initializeDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        console.log('🗄️  Base de datos inicializada correctamente');
        // Ejecutar seed si es necesario
        if (process.env.NODE_ENV === 'development') {
            await seedDatabase();
        }
    }
    catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
const seedDatabase = async () => {
    try {
        const tipoExtintorRepo = exports.AppDataSource.getRepository(TipoExtintor_1.TipoExtintor);
        const sedeRepo = exports.AppDataSource.getRepository(Sede_1.Sede);
        const ubicacionRepo = exports.AppDataSource.getRepository(Ubicacion_1.Ubicacion);
        const usuarioRepo = exports.AppDataSource.getRepository(Usuario_1.Usuario);
        const extintorRepo = exports.AppDataSource.getRepository(Extintor_1.Extintor);
        const mantenimientoRepo = exports.AppDataSource.getRepository(Mantenimiento_1.Mantenimiento);
        // Verificar si ya hay datos
        const tiposCount = await tipoExtintorRepo.count();
        if (tiposCount > 0) {
            console.log('💡 La base de datos ya tiene datos, omitiendo seed');
            return;
        }
        console.log('🌱 Ejecutando seed de datos iniciales...');
        // 1. Tipos de extintores con colores específicos
        console.log('📋 Creando tipos de extintores...');
        const tiposExtintores = [
            {
                id: 'ABC',
                nombre: 'Polvo Químico Seco ABC',
                descripcion: 'Para fuegos de clase A, B y C',
                uso_recomendado: 'Sólidos, líquidos y gases inflamables',
                color_hex: '#DC2626', // Rojo
                clase_fuego: ['A', 'B', 'C'],
                icono_path: ['/assets/icons/extintores/clases/class-A.png', '/assets/icons/extintores/clases/class-B.png', '/assets/icons/extintores/clases/class-C.png'],
                agente_extintor: 'Polvo Químico Seco'
            },
            {
                id: 'CO2',
                nombre: 'Dióxido de Carbono',
                descripcion: 'Para fuegos de clase B y C',
                uso_recomendado: 'Equipos eléctricos y líquidos inflamables',
                color_hex: '#1F2937', // Gris oscuro
                clase_fuego: ['B', 'C'],
                icono_path: ['/assets/icons/extintores/clases/class-B.png', '/assets/icons/extintores/clases/class-C.png'],
                agente_extintor: 'Dióxido de Carbono (CO₂)'
            },
            {
                id: 'H2O',
                nombre: 'Agua',
                descripcion: 'Para fuegos de clase A',
                uso_recomendado: 'Materiales sólidos combustibles',
                color_hex: '#3B82F6', // Azul
                clase_fuego: ['A'],
                icono_path: ['/assets/icons/extintores/clases/class-A.png'],
                agente_extintor: 'Agua'
            },
            {
                id: 'FOAM',
                nombre: 'Espuma',
                descripcion: 'Para fuegos de clase A y B',
                uso_recomendado: 'Líquidos inflamables y sólidos',
                color_hex: '#F59E0B', // Amarillo
                clase_fuego: ['A', 'B'],
                icono_path: ['/assets/icons/extintores/clases/class-A.png', '/assets/icons/extintores/clases/class-B.png'],
                agente_extintor: 'Espuma AFFF'
            },
            {
                id: 'K',
                nombre: 'Acetato de Potasio',
                descripcion: 'Para fuegos de clase K',
                uso_recomendado: 'Aceites y grasas de cocina',
                color_hex: '#7C3AED', // Púrpura
                clase_fuego: ['K'],
                icono_path: ['/assets/icons/extintores/clases/class-K.png'],
                agente_extintor: 'Acetato de Potasio'
            }
        ];
        for (const tipo of tiposExtintores) {
            await tipoExtintorRepo.save(tipo);
        }
        // 2. Sedes
        console.log('🏢 Creando sedes...');
        const sedes = [
            {
                nombre: 'Planta Principal',
                direccion: 'Av. Industrial #1234, Zona Industrial'
            },
            {
                nombre: 'Oficinas Administrativas',
                direccion: 'Calle Comercial #567, Centro Empresarial'
            }
        ];
        const sedesCreadas = [];
        for (const sede of sedes) {
            sedesCreadas.push(await sedeRepo.save(sede));
        }
        // 3. Ubicaciones
        console.log('📍 Creando ubicaciones...');
        const ubicaciones = [
            {
                nombre_area: 'Almacén General',
                descripcion: 'Área de almacenamiento de materias primas',
                sede_id: sedesCreadas[0].id
            },
            {
                nombre_area: 'Producción',
                descripcion: 'Línea de producción principal',
                sede_id: sedesCreadas[0].id
            },
            {
                nombre_area: 'Oficinas',
                descripcion: 'Área administrativa',
                sede_id: sedesCreadas[1].id
            },
            {
                nombre_area: 'Sala de Juntas',
                descripcion: 'Sala de reuniones ejecutivas',
                sede_id: sedesCreadas[1].id
            }
        ];
        const ubicacionesCreadas = [];
        for (const ubicacion of ubicaciones) {
            ubicacionesCreadas.push(await ubicacionRepo.save(ubicacion));
        }
        // 4. Usuarios
        console.log('👤 Creando usuarios...');
        const bcrypt = require('bcryptjs');
        const hashPassword = async (password) => await bcrypt.hash(password, 10);
        const usuarios = [
            {
                nombre: 'Administrador',
                email: 'admin@fireguardian.com',
                password: await hashPassword('admin123'),
                rol: 'admin',
                activo: true
            },
            {
                nombre: 'Técnico de Mantenimiento',
                email: 'tecnico@fireguardian.com',
                password: await hashPassword('tecnico123'),
                rol: 'tecnico',
                activo: true
            },
            {
                nombre: 'Usuario de Consulta',
                email: 'consulta@fireguardian.com',
                password: await hashPassword('consulta123'),
                rol: 'consulta',
                activo: true
            }
        ];
        const usuariosCreados = [];
        for (const usuario of usuarios) {
            usuariosCreados.push(await usuarioRepo.save(usuario));
        }
        // 5. Extintores
        console.log('🧯 Creando extintores de prueba...');
        const fechaActual = new Date();
        const extintores = [
            {
                codigo_interno: 'EXT-001',
                tipo_id: 'ABC',
                descripcion: 'Extintor principal entrada',
                ubicacion_id: ubicacionesCreadas[0].id,
                responsable_id: usuariosCreados[1].id,
                fecha_vencimiento: new Date(fechaActual.getFullYear() + 1, fechaActual.getMonth(), fechaActual.getDate()),
                fecha_mantenimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 2, fechaActual.getDate()),
                estado: 'ACTIVO'
            },
            {
                codigo_interno: 'EXT-002',
                tipo_id: 'CO2',
                descripcion: 'Extintor sala de servidores',
                ubicacion_id: ubicacionesCreadas[2].id,
                responsable_id: usuariosCreados[1].id,
                fecha_vencimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, fechaActual.getDate()),
                fecha_mantenimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 3, fechaActual.getDate()),
                estado: 'ACTIVO'
            },
            {
                codigo_interno: 'EXT-003',
                tipo_id: 'ABC',
                descripcion: 'Extintor área de producción',
                ubicacion_id: ubicacionesCreadas[1].id,
                responsable_id: usuariosCreados[1].id,
                fecha_vencimiento: new Date(fechaActual.getFullYear() - 1, fechaActual.getMonth(), fechaActual.getDate()),
                fecha_mantenimiento: new Date(fechaActual.getFullYear() - 1, fechaActual.getMonth() - 6, fechaActual.getDate()),
                estado: 'VENCIDO'
            },
            {
                codigo_interno: 'EXT-004',
                tipo_id: 'FOAM',
                descripcion: 'Extintor cocina',
                ubicacion_id: ubicacionesCreadas[3].id,
                responsable_id: usuariosCreados[1].id,
                fecha_vencimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 8, fechaActual.getDate()),
                fecha_mantenimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, fechaActual.getDate()),
                estado: 'MANTENIMIENTO'
            }
        ];
        const extintoresCreados = [];
        for (const extintor of extintores) {
            extintoresCreados.push(await extintorRepo.save(extintor));
        }
        // 6. Mantenimientos
        console.log('🔧 Creando historial de mantenimientos...');
        const mantenimientos = [
            {
                extintor_id: extintoresCreados[0].id,
                fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 2, fechaActual.getDate()),
                tipo_evento: 'inspeccion',
                descripcion: 'Inspección rutinaria',
                tecnico_id: usuariosCreados[1].id
            },
            {
                extintor_id: extintoresCreados[1].id,
                fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 3, fechaActual.getDate()),
                tipo_evento: 'recarga',
                descripcion: 'Recarga programada',
                tecnico_id: usuariosCreados[1].id
            },
            {
                extintor_id: extintoresCreados[2].id,
                fecha: new Date(fechaActual.getFullYear() - 1, fechaActual.getMonth() - 6, fechaActual.getDate()),
                tipo_evento: 'reparacion',
                descripcion: 'Cambio de manómetro',
                tecnico_id: usuariosCreados[1].id
            }
        ];
        for (const mantenimiento of mantenimientos) {
            await mantenimientoRepo.save(mantenimiento);
        }
        console.log('✅ Seed completado exitosamente');
    }
    catch (error) {
        console.error('❌ Error durante el seed de la base de datos:', error);
        throw error;
    }
};
//# sourceMappingURL=config.js.map