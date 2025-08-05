/**
 * Script para poblar la base de datos con datos realistas
 * FireGuardian - YCC Extintores
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

// Función para generar una fecha de vencimiento futura
function generateExpirationDate() {
  const today = new Date();
  const futureDate = new Date();
  
  // Fecha entre 1 mes en el pasado y 2 años en el futuro
  const randomMonths = Math.floor(Math.random() * 36) - 1;
  futureDate.setMonth(today.getMonth() + randomMonths);
  
  return futureDate;
}

// Función para generar una fecha de mantenimiento pasada
function generateMaintenanceDate() {
  const today = new Date();
  const pastDate = new Date();
  
  // Fecha entre 1 y 18 meses en el pasado
  const randomMonths = Math.floor(Math.random() * 18) + 1;
  pastDate.setMonth(today.getMonth() - randomMonths);
  
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

    // 1. Crear tipos de extintores
    const tiposExtintores = [
      {
        id: 'ABC',
        nombre: 'Polvo Químico Seco ABC',
        descripcion: 'Extintor multipropósito para fuegos clase A, B y C',
        uso_recomendado: 'Áreas generales, oficinas, almacenes',
        color_hex: '#FF5733',
        icono_path: '/assets/icons/extintor-abc.png'
      },
      {
        id: 'CO2',
        nombre: 'Dióxido de Carbono',
        descripcion: 'Extintor para fuegos clase B y C, ideal para equipos eléctricos',
        uso_recomendado: 'Salas de servidores, laboratorios, áreas con equipos electrónicos',
        color_hex: '#3366FF',
        icono_path: '/assets/icons/extintor-co2.png'
      },
      {
        id: 'H2O',
        nombre: 'Agua a Presión',
        descripcion: 'Extintor para fuegos clase A',
        uso_recomendado: 'Áreas con materiales sólidos combustibles',
        color_hex: '#33FF57',
        icono_path: '/assets/icons/extintor-agua.png'
      },
      {
        id: 'K',
        nombre: 'Clase K',
        descripcion: 'Extintor para fuegos de aceites y grasas de cocina',
        uso_recomendado: 'Cocinas comerciales, restaurantes',
        color_hex: '#FFFF33',
        icono_path: '/assets/icons/extintor-k.png'
      },
      {
        id: 'AFFF',
        nombre: 'Espuma AFFF',
        descripcion: 'Extintor de espuma formadora de película acuosa',
        uso_recomendado: 'Áreas con líquidos inflamables',
        color_hex: '#33FFFF',
        icono_path: '/assets/icons/extintor-afff.png'
      }
    ];

    for (const tipo of tiposExtintores) {
      const tipoExtintor = new TipoExtintor();
      Object.assign(tipoExtintor, tipo);
      await connection.manager.save(tipoExtintor);
    }
    console.log(`✅ ${tiposExtintores.length} tipos de extintores creados`);

    // 2. Crear usuarios
    const usuarios = [
      {
        nombre: 'Administrador',
        email: 'admin@yccextintores.com',
        password: await bcrypt.hash('admin123', 10),
        rol: 'admin',
        activo: true
      },
      {
        nombre: 'Carlos Rodríguez',
        email: 'carlos@yccextintores.com',
        password: await bcrypt.hash('tecnico123', 10),
        rol: 'tecnico',
        activo: true
      },
      {
        nombre: 'Ana Martínez',
        email: 'ana@yccextintores.com',
        password: await bcrypt.hash('tecnico123', 10),
        rol: 'tecnico',
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

    // 5. Crear extintores
    const extintores = [];
    const tiposIds = tiposExtintores.map(t => t.id);
    const responsablesIds = usuariosCreados.filter(u => u.rol === 'tecnico').map(u => u.id);

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
        
        // Fechas
        extintor.fecha_vencimiento = generateExpirationDate();
        extintor.fecha_mantenimiento = generateMaintenanceDate();
        
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
        
        // Tipo de evento aleatorio
        const tipoIndex = Math.floor(Math.random() * tiposMantenimiento.length);
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
        
        // Fecha (entre 1 y 24 meses atrás)
        const today = new Date();
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - (Math.floor(Math.random() * 24) + 1));
        mantenimiento.fecha = pastDate;
        
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
