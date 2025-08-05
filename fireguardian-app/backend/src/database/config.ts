import { DataSource } from 'typeorm';
import * as path from 'path';
import { Extintor } from '../models/Extintor';
import { TipoExtintor } from '../models/TipoExtintor';
import { Ubicacion } from '../models/Ubicacion';
import { Sede } from '../models/Sede';
import { Usuario } from '../models/Usuario';
import { Mantenimiento } from '../models/Mantenimiento';
import { Log } from '../models/Log';

// Obtener la ruta absoluta a la base de datos
const dbPath = path.resolve(__dirname, '../../../fireguardian.db');

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: dbPath,
  synchronize: true, // Solo para desarrollo
  logging: process.env.NODE_ENV === 'development',
  entities: [
    Extintor,
    TipoExtintor,
    Ubicacion,
    Sede,
    Usuario,
    Mantenimiento,
    Log
  ],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('🗄️  Base de datos inicializada correctamente');
    
    // Ejecutar seed si es necesario
    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
};

const seedDatabase = async (): Promise<void> => {
  try {
    const tipoExtintorRepo = AppDataSource.getRepository(TipoExtintor);
    const sedeRepo = AppDataSource.getRepository(Sede);
    const ubicacionRepo = AppDataSource.getRepository(Ubicacion);
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const extintorRepo = AppDataSource.getRepository(Extintor);
    const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
    
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
    const hashPassword = async (password: string) => await bcrypt.hash(password, 10);
    
    const usuarios = [
      {
        nombre: 'Administrador',
        email: 'admin@fireguardian.com',
        password: await hashPassword('admin123'),
        rol: 'admin' as const,
        activo: true
      },
      {
        nombre: 'Técnico de Mantenimiento',
        email: 'tecnico@fireguardian.com',
        password: await hashPassword('tecnico123'),
        rol: 'tecnico' as const,
        activo: true
      },
      {
        nombre: 'Usuario de Consulta',
        email: 'consulta@fireguardian.com',
        password: await hashPassword('consulta123'),
        rol: 'consulta' as const,
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
        tipo_evento: 'inspeccion' as const,
        descripcion: 'Inspección rutinaria',
        tecnico_id: usuariosCreados[1].id
      },
      {
        extintor_id: extintoresCreados[1].id,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 3, fechaActual.getDate()),
        tipo_evento: 'recarga' as const,
        descripcion: 'Recarga programada',
        tecnico_id: usuariosCreados[1].id
      },
      {
        extintor_id: extintoresCreados[2].id,
        fecha: new Date(fechaActual.getFullYear() - 1, fechaActual.getMonth() - 6, fechaActual.getDate()),
        tipo_evento: 'reparacion' as const,
        descripcion: 'Cambio de manómetro',
        tecnico_id: usuariosCreados[1].id
      }
    ];
    
    for (const mantenimiento of mantenimientos) {
      await mantenimientoRepo.save(mantenimiento);
    }
    
    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el seed de la base de datos:', error);
    throw error;
  }
};
