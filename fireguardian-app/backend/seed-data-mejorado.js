/**
 * Script mejorado para poblar la base de datos con datos realistas
 * FireGuardian - YCC Extintores
 * Versión: 1.2 - 04/08/2025
 */

const { createConnection } = require('typeorm');
const bcrypt = require('bcrypt');
const path = require('path');
const { Sede } = require('./dist/models/Sede');
const { Ubicacion } = require('./dist/models/Ubicacion');
const { TipoExtintor } = require('./dist/models/TipoExtintor');
const { Usuario } = require('./dist/models/Usuario');
const { Extintor } = require('./dist/models/Extintor');
const { Mantenimiento } = require('./dist/models/Mantenimiento');

// Configuración de la conexión
const config = {
  type: 'sqlite',
  database: path.join(__dirname, 'fireguardian.db'),
  entities: [
    Sede,
    Ubicacion,
    TipoExtintor,
    Usuario,
    Extintor,
    Mantenimiento
  ],
  synchronize: true,
  logging: true
};

// Función para generar una fecha aleatoria entre dos fechas
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para generar una fecha de vencimiento con estado específico
function generateExpirationDate(estado) {
  const today = new Date();
  const futureDate = new Date();
  
  switch (estado) {
    case 'VENCIDO':
      // Fecha entre 1 y 12 meses en el pasado
      const pastMonths = Math.floor(Math.random() * 12) + 1;
      futureDate.setMonth(today.getMonth() - pastMonths);
      break;
    case 'MANTENIMIENTO':
      // Fecha entre 1 y 2 meses en el futuro
      const nearFutureMonths = Math.floor(Math.random() * 2) + 1;
      futureDate.setMonth(today.getMonth() + nearFutureMonths);
      break;
    case 'ACTIVO':
      // Fecha entre 3 y 24 meses en el futuro
      const futureMonths = Math.floor(Math.random() * 22) + 3;
      futureDate.setMonth(today.getMonth() + futureMonths);
      break;
    case 'BAJA':
      // Fecha entre 12 y 24 meses en el pasado
      const oldMonths = Math.floor(Math.random() * 12) + 12;
      futureDate.setMonth(today.getMonth() - oldMonths);
      break;
    default:
      // Fecha entre 1 y 24 meses en el futuro por defecto
      const defaultMonths = Math.floor(Math.random() * 24) + 1;
      futureDate.setMonth(today.getMonth() + defaultMonths);
  }
  
  return futureDate;
}

// Función para generar una fecha de mantenimiento según el estado
function generateMaintenanceDate(estado) {
  const today = new Date();
  const pastDate = new Date();
  
  switch (estado) {
    case 'MANTENIMIENTO':
      // Fecha entre 6 y 12 meses en el pasado
      const maintenanceMonths = Math.floor(Math.random() * 6) + 6;
      pastDate.setMonth(today.getMonth() - maintenanceMonths);
      break;
    case 'ACTIVO':
      // Fecha entre 1 y 3 meses en el pasado
      const activeMonths = Math.floor(Math.random() * 3) + 1;
      pastDate.setMonth(today.getMonth() - activeMonths);
      break;
    case 'VENCIDO':
      // Fecha entre 12 y 18 meses en el pasado
      const expiredMonths = Math.floor(Math.random() * 6) + 12;
      pastDate.setMonth(today.getMonth() - expiredMonths);
      break;
    case 'BAJA':
      // Fecha entre 18 y 24 meses en el pasado
      const retiredMonths = Math.floor(Math.random() * 6) + 18;
      pastDate.setMonth(today.getMonth() - retiredMonths);
      break;
    default:
      // Fecha entre 1 y 12 meses en el pasado por defecto
      const defaultMonths = Math.floor(Math.random() * 12) + 1;
      pastDate.setMonth(today.getMonth() - defaultMonths);
  }
  
  return pastDate;
}

// Función principal para poblar la base de datos
async function seedDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    const connection = await createConnection(config);
    console.log('Conexión establecida. Iniciando población de datos...');

    // Limpiar tablas existentes
    await connection.query('DELETE FROM mantenimientos');
    await connection.query('DELETE FROM extintores');
    await connection.query('DELETE FROM ubicaciones');
    await connection.query('DELETE FROM sedes');
    await connection.query('DELETE FROM tipos_extintores');
    await connection.query('DELETE FROM usuarios');

    console.log('Tablas limpiadas. Insertando nuevos datos...');

    // 1. Crear tipos de extintores con clases de fuego correctas
    const tiposExtintores = [
      {
        id: 'ABC',
        nombre: 'Polvo Químico Seco ABC',
        descripcion: 'Extintor multipropósito para fuegos clase A, B y C',
        uso_recomendado: 'Áreas generales, oficinas, almacenes',
        color_hex: '#FF5733',
        clase_fuego: ['A', 'B', 'C'],
        icono_path: [
          '/assets/icons/extintores/clases/class-A.png',
          '/assets/icons/extintores/clases/class-B.png',
          '/assets/icons/extintores/clases/class-C.png'
        ],
        agente_extintor: 'Polvo Químico Seco'
      },
      {
        id: 'CO2',
        nombre: 'Dióxido de Carbono',
        descripcion: 'Extintor para fuegos clase B y C, ideal para equipos eléctricos',
        uso_recomendado: 'Salas de servidores, laboratorios, áreas con equipos electrónicos',
        color_hex: '#3366FF',
        clase_fuego: ['B', 'C'],
        icono_path: [
          '/assets/icons/extintores/clases/class-B.png',
          '/assets/icons/extintores/clases/class-C.png'
        ],
        agente_extintor: 'Dióxido de Carbono (CO₂)'
      },
      {
        id: 'H2O',
        nombre: 'Agua a Presión',
        descripcion: 'Extintor para fuegos clase A',
        uso_recomendado: 'Áreas con materiales sólidos combustibles',
        color_hex: '#33FF57',
        clase_fuego: ['A'],
        icono_path: [
          '/assets/icons/extintores/clases/class-A.png'
        ],
        agente_extintor: 'Agua'
      },
      {
        id: 'K',
        nombre: 'Clase K',
        descripcion: 'Extintor para fuegos de aceites y grasas de cocina',
        uso_recomendado: 'Cocinas comerciales, restaurantes',
        color_hex: '#FFFF33',
        clase_fuego: ['K'],
        icono_path: [
          '/assets/icons/extintores/clases/class-K.png'
        ],
        agente_extintor: 'Acetato de Potasio'
      },
      {
        id: 'AFFF',
        nombre: 'Espuma AFFF',
        descripcion: 'Extintor de espuma formadora de película acuosa',
        uso_recomendado: 'Áreas con líquidos inflamables',
        color_hex: '#33FFFF',
        clase_fuego: ['A', 'B'],
        icono_path: [
          '/assets/icons/extintores/clases/class-A.png',
          '/assets/icons/extintores/clases/class-B.png'
        ],
        agente_extintor: 'Espuma AFFF'
      },
      {
        id: 'D',
        nombre: 'Polvo para Metales',
        descripcion: 'Extintor para fuegos de metales combustibles',
        uso_recomendado: 'Laboratorios, áreas de trabajo con metales',
        color_hex: '#F59E0B',
        clase_fuego: ['D'],
        icono_path: [
          '/assets/icons/extintores/clases/class-D.png'
        ],
        agente_extintor: 'Polvo Especial para Metales'
      }
    ];

    for (const tipo of tiposExtintores) {
      const tipoExtintor = new TipoExtintor();
      Object.assign(tipoExtintor, tipo);
      await connection.manager.save(tipoExtintor);
    }
    console.log(`✅ ${tiposExtintores.length} tipos de extintores creados`);

    // 2. Crear usuarios con email en lugar de username
    const usuarios = [
      {
        nombre: 'Administrador',
        email: 'admin@fireguardian.com',
        password: await bcrypt.hash('admin123', 10),
        rol: 'admin',
        activo: true
      },
      {
        nombre: 'Carlos Rodríguez',
        email: 'tecnico@fireguardian.com',
        password: await bcrypt.hash('tecnico123', 10),
        rol: 'tecnico',
        activo: true
      },
      {
        nombre: 'Ana Martínez',
        email: 'consulta@fireguardian.com',
        password: await bcrypt.hash('consulta123', 10),
        rol: 'consulta',
        activo: true
      },
      {
        nombre: 'Roberto Sánchez',
        email: 'roberto@yccextintores.com',
        password: await bcrypt.hash('consulta123', 10),
        rol: 'consulta',
        activo: true
      },
      {
        nombre: 'María López',
        email: 'maria@yccextintores.com',
        password: await bcrypt.hash('tecnico123', 10),
        rol: 'tecnico',
        activo: false
      }
    ];

    const usuariosCreados = [];
    for (const user of usuarios) {
      const usuario = new Usuario();
      Object.assign(usuario, user);
      const savedUser = await connection.manager.save(usuario);
      usuariosCreados.push(savedUser);
    }
    console.log(`✅ ${usuarios.length} usuarios creados`);

    // 3. Crear sedes
    const sedes = [
      {
        nombre: 'Sede Principal',
        direccion: 'Av. Insurgentes Sur 1602, Ciudad de México'
      },
      {
        nombre: 'Centro de Distribución Norte',
        direccion: 'Blvd. Manuel Ávila Camacho 2250, Tlalnepantla'
      },
      {
        nombre: 'Oficinas Corporativas',
        direccion: 'Paseo de la Reforma 222, Ciudad de México'
      },
      {
        nombre: 'Planta de Producción',
        direccion: 'Carretera Federal México-Puebla Km 15.5, Iztapalapa'
      },
      {
        nombre: 'Centro Comercial',
        direccion: 'Av. Universidad 1000, Coyoacán, Ciudad de México'
      }
    ];

    const sedesCreadas = [];
    for (const sede of sedes) {
      const nuevaSede = new Sede();
      Object.assign(nuevaSede, sede);
      const savedSede = await connection.manager.save(nuevaSede);
      sedesCreadas.push(savedSede);
    }
    console.log(`✅ ${sedes.length} sedes creadas`);

    // 4. Crear ubicaciones para cada sede
    const ubicacionesPorSede = {
      'Sede Principal': [
        'Recepción', 'Sala de Juntas', 'Oficinas Administrativas', 
        'Área de Ventas', 'Comedor', 'Estacionamiento', 'Almacén'
      ],
      'Centro de Distribución Norte': [
        'Andén de Carga', 'Almacén Principal', 'Oficina de Logística', 
        'Área de Empaque', 'Comedor', 'Vestidores', 'Estacionamiento'
      ],
      'Oficinas Corporativas': [
        'Recepción', 'Sala de Conferencias', 'Oficina Presidencial', 
        'Departamento Legal', 'Recursos Humanos', 'Cafetería', 'Terraza'
      ],
      'Planta de Producción': [
        'Línea de Producción A', 'Línea de Producción B', 'Control de Calidad', 
        'Almacén de Materias Primas', 'Comedor Industrial', 'Vestidores', 'Oficina de Planta'
      ],
      'Centro Comercial': [
        'Entrada Principal', 'Área de Comidas', 'Tienda Departamental', 
        'Cines', 'Estacionamiento Nivel 1', 'Estacionamiento Nivel 2', 'Oficinas Administrativas'
      ]
    };

    const ubicacionesCreadas = [];
    for (const sede of sedesCreadas) {
      const ubicacionesNombres = ubicacionesPorSede[sede.nombre];
      for (const nombreArea of ubicacionesNombres) {
        const ubicacion = new Ubicacion();
        ubicacion.nombre_area = nombreArea;
        ubicacion.descripcion = `${nombreArea} en ${sede.nombre}`;
        ubicacion.sede_id = sede.id;
        ubicacion.sede = sede;
        const savedUbicacion = await connection.manager.save(ubicacion);
        ubicacionesCreadas.push(savedUbicacion);
      }
    }
    console.log(`✅ ${ubicacionesCreadas.length} ubicaciones creadas`);

    // 5. Crear extintores con estados explícitos
    const extintores = [];
    const tiposIds = tiposExtintores.map(t => t.id);
    const responsablesIds = usuariosCreados.filter(u => u.rol === 'tecnico').map(u => u.id);
    const estados = ['ACTIVO', 'MANTENIMIENTO', 'VENCIDO', 'BAJA'];

    // Crear entre 2 y 4 extintores por ubicación
    for (const ubicacion of ubicacionesCreadas) {
      const numExtintores = Math.floor(Math.random() * 3) + 2; // 2 a 4 extintores
      
      for (let i = 0; i < numExtintores; i++) {
        const extintor = new Extintor();
        
        // Generar código único
        const codigoBase = `EXT-${ubicacion.sede_id}${ubicacion.id}`;
        extintor.codigo_interno = `${codigoBase}-${i+1}`;
        
        // Asignar tipo aleatorio
        const tipoIndex = Math.floor(Math.random() * tiposIds.length);
        extintor.tipo_id = tiposIds[tipoIndex];
        
        // Descripción
        extintor.descripcion = `Extintor ${tiposIds[tipoIndex]} ubicado en ${ubicacion.nombre_area}`;
        
        // Ubicación
        extintor.ubicacion_id = ubicacion.id;
        extintor.ubicacion = ubicacion;
        
        // Responsable (técnico aleatorio)
        const respIndex = Math.floor(Math.random() * responsablesIds.length);
        extintor.responsable_id = responsablesIds[respIndex];
        
        // Estado explícito (distribuir uniformemente)
        const estadoIndex = (i + ubicacion.id) % estados.length;
        extintor.estado = estados[estadoIndex];
        
        // Fechas según el estado
        extintor.fecha_vencimiento = generateExpirationDate(extintor.estado);
        extintor.fecha_mantenimiento = generateMaintenanceDate(extintor.estado);
        
        // Capacidad aleatoria
        const capacidades = ['2.5 kg', '4.5 kg', '6 kg', '9 kg', '10 kg', '20 kg'];
        extintor.capacidad = capacidades[Math.floor(Math.random() * capacidades.length)];
        
        // Guardar extintor
        const savedExtintor = await connection.manager.save(extintor);
        extintores.push(savedExtintor);
      }
    }
    console.log(`✅ ${extintores.length} extintores creados`);

    // 6. Crear mantenimientos
    const tiposMantenimiento = ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo'];
    const mantenimientos = [];

    // Crear entre 1 y 3 mantenimientos por extintor
    for (const extintor of extintores) {
      const numMantenimientos = Math.floor(Math.random() * 3) + 1; // 1 a 3 mantenimientos
      
      for (let i = 0; i < numMantenimientos; i++) {
        const mantenimiento = new Mantenimiento();
        
        // Asignar extintor
        mantenimiento.extintor_id = extintor.id;
        mantenimiento.extintor = extintor;
        
        // Tipo de evento según estado del extintor
        let tipoIndex;
        switch (extintor.estado) {
          case 'MANTENIMIENTO':
            // Más probable que sea recarga o reparación
            tipoIndex = Math.floor(Math.random() * 2) + 1; // recarga o reparacion
            break;
          case 'VENCIDO':
            // Más probable que sea inspección o incidente
            tipoIndex = Math.random() < 0.7 ? 0 : 3; // inspeccion o incidente
            break;
          case 'BAJA':
            // Más probable que sea reemplazo
            tipoIndex = 4; // reemplazo
            break;
          default:
            // Aleatorio para ACTIVO
            tipoIndex = Math.floor(Math.random() * tiposMantenimiento.length);
        }
        mantenimiento.tipo_evento = tiposMantenimiento[tipoIndex];
        
        // Descripción según tipo
        switch (mantenimiento.tipo_evento) {
          case 'inspeccion':
            mantenimiento.descripcion = 'Inspección rutinaria. Extintor en buen estado.';
            break;
          case 'recarga':
            mantenimiento.descripcion = 'Recarga completa del agente extintor.';
            break;
          case 'reparacion':
            mantenimiento.descripcion = 'Reparación de válvula y manómetro.';
            break;
          case 'incidente':
            mantenimiento.descripcion = 'Extintor utilizado en incidente menor.';
            break;
          case 'reemplazo':
            mantenimiento.descripcion = 'Reemplazo de extintor por fin de vida útil.';
            break;
        }
        
        // Fecha coherente con el estado del extintor
        let fechaMantenimiento;
        const today = new Date();
        const pastDate = new Date();
        
        if (extintor.estado === 'MANTENIMIENTO' && mantenimiento.tipo_evento === 'recarga') {
          // Mantenimiento reciente para extintores en mantenimiento
          const daysAgo = Math.floor(Math.random() * 30) + 1;
          pastDate.setDate(today.getDate() - daysAgo);
          fechaMantenimiento = pastDate;
        } else {
          // Fecha entre 1 y 24 meses atrás para otros casos
          const monthsAgo = Math.floor(Math.random() * 24) + 1;
          pastDate.setMonth(today.getMonth() - monthsAgo);
          fechaMantenimiento = pastDate;
        }
        
        mantenimiento.fecha = fechaMantenimiento;
        
        // Técnico aleatorio
        const tecnicoIndex = Math.floor(Math.random() * responsablesIds.length);
        mantenimiento.tecnico_id = responsablesIds[tecnicoIndex];
        
        // Guardar mantenimiento
        const savedMantenimiento = await connection.manager.save(mantenimiento);
        mantenimientos.push(savedMantenimiento);
      }
    }
    console.log(`✅ ${mantenimientos.length} mantenimientos creados`);

    console.log('✅✅✅ Base de datos poblada exitosamente');
    await connection.close();
    console.log('Conexión cerrada');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  }
}

// Ejecutar la función principal
seedDatabase();
