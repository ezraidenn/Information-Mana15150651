/**
 * Script mejorado para inicializar la base de datos y poblarla con datos realistas
 * Incluye estados explícitos y clases de fuego para los tipos de extintores
 * FireGuardian - YCC Extintores
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');
const logPath = path.join(__dirname, 'database-init-log.txt');

// Iniciar el archivo de log
fs.writeFileSync(logPath, `Inicio del proceso: ${new Date().toISOString()}\n\n`);

// Función para escribir en el log
function log(message) {
  const logMessage = `${message}\n`;
  fs.appendFileSync(logPath, logMessage);
  console.log(message);
}

// Eliminar la base de datos si existe
if (fs.existsSync(dbPath)) {
  log(`Base de datos existente encontrada en ${dbPath}`);
  log('Haciendo backup de la base de datos existente...');
  const backupPath = `${dbPath}.backup-${Date.now()}`;
  fs.copyFileSync(dbPath, backupPath);
  log(`Backup creado en ${backupPath}`);
  fs.unlinkSync(dbPath);
  log('Base de datos existente eliminada');
}

// Conectar a la base de datos (se creará una nueva)
log('Creando nueva base de datos...');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    log(`❌ Error al crear la base de datos: ${err.message}`);
    return;
  }
  log('✅ Base de datos creada correctamente');
  
  // Iniciar el proceso de creación de tablas
  createTables();
});

// Función para ejecutar consultas SQL con promesas
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        log(`❌ Error en SQL: ${sql}`);
        log(`❌ Error: ${err.message}`);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// Función para crear las tablas
async function createTables() {
  try {
    log('Creando tablas...');
    
    // Tabla de sedes
    log('Creando tabla de sedes...');
    await run(`
      CREATE TABLE IF NOT EXISTS sedes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        direccion TEXT NOT NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log('✅ Tabla de sedes creada');
    
    // Tabla de ubicaciones
    log('Creando tabla de ubicaciones...');
    await run(`
      CREATE TABLE IF NOT EXISTS ubicaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_area TEXT NOT NULL,
        descripcion TEXT,
        sede_id INTEGER NOT NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sede_id) REFERENCES sedes(id)
      )
    `);
    log('✅ Tabla de ubicaciones creada');
    
    // Tabla de tipos de extintores
    log('Creando tabla de tipos de extintores...');
    await run(`
      CREATE TABLE IF NOT EXISTS tipos_extintores (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        uso_recomendado TEXT,
        color_hex TEXT,
        clase_fuego TEXT,
        icono_path TEXT,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log('✅ Tabla de tipos de extintores creada');
    
    // Tabla de usuarios
    log('Creando tabla de usuarios...');
    await run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rol TEXT NOT NULL CHECK(rol IN ('admin', 'tecnico', 'consulta')),
        activo BOOLEAN DEFAULT 1,
        ultimo_acceso DATETIME,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log('✅ Tabla de usuarios creada');
    
    // Tabla de extintores
    log('Creando tabla de extintores...');
    await run(`
      CREATE TABLE IF NOT EXISTS extintores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_interno TEXT UNIQUE NOT NULL,
        tipo_id TEXT NOT NULL,
        descripcion TEXT,
        ubicacion_id INTEGER NOT NULL,
        responsable_id INTEGER,
        fecha_vencimiento DATE,
        fecha_mantenimiento DATE,
        imagen_path TEXT,
        estado TEXT DEFAULT 'ACTIVO',
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tipo_id) REFERENCES tipos_extintores(id),
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
        FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
      )
    `);
    log('✅ Tabla de extintores creada');
    
    // Tabla de mantenimientos
    log('Creando tabla de mantenimientos...');
    await run(`
      CREATE TABLE IF NOT EXISTS mantenimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        extintor_id INTEGER NOT NULL,
        fecha DATE NOT NULL,
        tipo_evento TEXT NOT NULL CHECK(tipo_evento IN ('inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo')),
        descripcion TEXT,
        tecnico_id INTEGER,
        evidencia_path TEXT,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (extintor_id) REFERENCES extintores(id) ON DELETE CASCADE,
        FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
      )
    `);
    log('✅ Tabla de mantenimientos creada');
    
    // Tabla de logs
    log('Creando tabla de logs...');
    await run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        accion TEXT NOT NULL,
        entidad TEXT NOT NULL,
        entidad_id INTEGER,
        descripcion TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);
    log('✅ Tabla de logs creada');
    
    // Iniciar la población de datos
    log('Tablas creadas correctamente. Iniciando población de datos...');
    await seedDatabase();
    
  } catch (error) {
    log(`❌ Error al crear las tablas: ${error.message}`);
    log(error.stack);
    db.close();
    log('Conexión cerrada debido a error');
  }
}

// Función para generar una fecha aleatoria entre dos fechas
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para generar una fecha de vencimiento futura o pasada
function generateExpirationDate(vencido = false) {
  const today = new Date();
  const futureDate = new Date();
  
  if (vencido) {
    // Fecha entre 1 y 12 meses en el pasado
    const randomMonths = Math.floor(Math.random() * 12) + 1;
    futureDate.setMonth(today.getMonth() - randomMonths);
  } else {
    // Fecha entre 1 mes y 2 años en el futuro
    const randomMonths = Math.floor(Math.random() * 24) + 1;
    futureDate.setMonth(today.getMonth() + randomMonths);
  }
  
  return futureDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Función para generar una fecha de mantenimiento pasada
function generateMaintenanceDate(reciente = false) {
  const today = new Date();
  const pastDate = new Date();
  
  if (reciente) {
    // Fecha entre 1 y 3 meses en el pasado
    const randomMonths = Math.floor(Math.random() * 3) + 1;
    pastDate.setMonth(today.getMonth() - randomMonths);
  } else {
    // Fecha entre 6 y 18 meses en el pasado
    const randomMonths = Math.floor(Math.random() * 12) + 6;
    pastDate.setMonth(today.getMonth() - randomMonths);
  }
  
  return pastDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Función para poblar la base de datos
async function seedDatabase() {
  try {
    // 1. Crear tipos de extintores con clases de fuego
    log('Creando tipos de extintores...');
    const tiposExtintores = [
      {
        id: 'ABC',
        nombre: 'Polvo Químico Seco ABC',
        descripcion: 'Extintor multipropósito para fuegos clase A, B y C',
        uso_recomendado: 'Áreas generales, oficinas, almacenes',
        color_hex: '#FF5733',
        clase_fuego: 'A,B,C',
        icono_path: '/assets/icons/extintores/clases/class-A.png,/assets/icons/extintores/clases/class-B.png,/assets/icons/extintores/clases/class-C.png'
      },
      {
        id: 'CO2',
        nombre: 'Dióxido de Carbono',
        descripcion: 'Extintor para fuegos clase B y C, ideal para equipos eléctricos',
        uso_recomendado: 'Salas de servidores, laboratorios, áreas con equipos electrónicos',
        color_hex: '#3366FF',
        clase_fuego: 'B,C',
        icono_path: '/assets/icons/extintores/clases/class-B.png,/assets/icons/extintores/clases/class-C.png'
      },
      {
        id: 'H2O',
        nombre: 'Agua a Presión',
        descripcion: 'Extintor para fuegos clase A',
        uso_recomendado: 'Áreas con materiales sólidos combustibles',
        color_hex: '#33FF57',
        clase_fuego: 'A',
        icono_path: '/assets/icons/extintores/clases/class-A.png'
      },
      {
        id: 'K',
        nombre: 'Clase K',
        descripcion: 'Extintor para fuegos de aceites y grasas de cocina',
        uso_recomendado: 'Cocinas comerciales, restaurantes',
        color_hex: '#FFFF33',
        clase_fuego: 'K',
        icono_path: '/assets/icons/extintores/clases/class-K.png'
      },
      {
        id: 'AFFF',
        nombre: 'Espuma AFFF',
        descripcion: 'Extintor de espuma formadora de película acuosa',
        uso_recomendado: 'Áreas con líquidos inflamables',
        color_hex: '#33FFFF',
        clase_fuego: 'A,B',
        icono_path: '/assets/icons/extintores/clases/class-A.png,/assets/icons/extintores/clases/class-B.png'
      }
    ];

    for (const tipo of tiposExtintores) {
      await run(
        'INSERT INTO tipos_extintores (id, nombre, descripcion, uso_recomendado, color_hex, clase_fuego, icono_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [tipo.id, tipo.nombre, tipo.descripcion, tipo.uso_recomendado, tipo.color_hex, tipo.clase_fuego, tipo.icono_path]
      );
    }
    log(`✅ ${tiposExtintores.length} tipos de extintores creados`);

    // 2. Crear usuarios
    log('Creando usuarios...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const usuarios = [
      {
        nombre: 'Administrador',
        email: 'admin@yccextintores.com',
        password: passwordHash,
        rol: 'admin',
        activo: 1
      },
      {
        nombre: 'Carlos Rodríguez',
        email: 'carlos@yccextintores.com',
        password: passwordHash,
        rol: 'tecnico',
        activo: 1
      },
      {
        nombre: 'Ana Martínez',
        email: 'ana@yccextintores.com',
        password: passwordHash,
        rol: 'tecnico',
        activo: 1
      },
      {
        nombre: 'Roberto Sánchez',
        email: 'roberto@yccextintores.com',
        password: passwordHash,
        rol: 'consulta',
        activo: 1
      }
    ];

    const usuariosIds = [];
    for (const usuario of usuarios) {
      const result = await run(
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
        [usuario.nombre, usuario.email, usuario.password, usuario.rol, usuario.activo]
      );
      usuariosIds.push(result.lastID);
    }
    log(`✅ ${usuarios.length} usuarios creados`);

    // 3. Crear sedes
    log('Creando sedes...');
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

    const sedesIds = [];
    for (const sede of sedes) {
      const result = await run(
        'INSERT INTO sedes (nombre, direccion) VALUES (?, ?)',
        [sede.nombre, sede.direccion]
      );
      sedesIds.push(result.lastID);
    }
    log(`✅ ${sedes.length} sedes creadas`);

    // 4. Crear ubicaciones para cada sede
    log('Creando ubicaciones...');
    const ubicacionesPorSede = {
      0: [
        'Recepción', 'Sala de Juntas', 'Oficinas Administrativas', 
        'Área de Ventas', 'Comedor', 'Estacionamiento', 'Almacén'
      ],
      1: [
        'Andén de Carga', 'Almacén Principal', 'Oficina de Logística', 
        'Área de Empaque', 'Comedor', 'Vestidores', 'Estacionamiento'
      ],
      2: [
        'Recepción', 'Sala de Conferencias', 'Oficina Presidencial', 
        'Departamento Legal', 'Recursos Humanos', 'Cafetería', 'Terraza'
      ],
      3: [
        'Línea de Producción A', 'Línea de Producción B', 'Control de Calidad', 
        'Almacén de Materias Primas', 'Comedor Industrial', 'Vestidores', 'Oficina de Planta'
      ],
      4: [
        'Entrada Principal', 'Área de Comidas', 'Tienda Departamental', 
        'Cines', 'Estacionamiento Nivel 1', 'Estacionamiento Nivel 2', 'Oficinas Administrativas'
      ]
    };

    const ubicacionesIds = [];
    for (let i = 0; i < sedesIds.length; i++) {
      const sedeId = sedesIds[i];
      const ubicacionesNombres = ubicacionesPorSede[i];
      
      for (const nombreArea of ubicacionesNombres) {
        const result = await run(
          'INSERT INTO ubicaciones (nombre_area, descripcion, sede_id) VALUES (?, ?, ?)',
          [nombreArea, `${nombreArea} en ${sedes[i].nombre}`, sedeId]
        );
        ubicacionesIds.push(result.lastID);
      }
    }
    log(`✅ ${ubicacionesIds.length} ubicaciones creadas`);

    // 5. Crear extintores con diferentes estados
    log('Creando extintores...');
    const tiposIds = tiposExtintores.map(t => t.id);
    const tecnicosIds = usuariosIds.filter((_, index) => usuarios[index].rol === 'tecnico');
    const estados = ['ACTIVO', 'MANTENIMIENTO', 'VENCIDO', 'BAJA'];
    
    let extintoresCreados = 0;
    const extintoresIds = [];

    // Crear entre 2 y 4 extintores por ubicación
    for (const ubicacionId of ubicacionesIds) {
      const numExtintores = Math.floor(Math.random() * 3) + 2; // 2 a 4 extintores
      
      for (let i = 0; i < numExtintores; i++) {
        // Generar código único
        const codigoBase = `EXT-${ubicacionId}`;
        const codigoInterno = `${codigoBase}-${i+1}`;
        
        // Asignar tipo aleatorio
        const tipoIndex = Math.floor(Math.random() * tiposIds.length);
        const tipoId = tiposIds[tipoIndex];
        
        // Descripción
        const descripcion = `Extintor ${tipoId} ubicado en ubicación ${ubicacionId}`;
        
        // Responsable (técnico aleatorio)
        const respIndex = Math.floor(Math.random() * tecnicosIds.length);
        const responsableId = tecnicosIds[respIndex];
        
        // Estado aleatorio con distribución controlada
        let estado;
        const estadoRandom = Math.random();
        if (estadoRandom < 0.6) {
          estado = 'ACTIVO';
        } else if (estadoRandom < 0.8) {
          estado = 'MANTENIMIENTO';
        } else if (estadoRandom < 0.95) {
          estado = 'VENCIDO';
        } else {
          estado = 'BAJA';
        }
        
        // Fechas según el estado
        let fechaVencimiento, fechaMantenimiento;
        
        switch (estado) {
          case 'ACTIVO':
            fechaVencimiento = generateExpirationDate(false);
            fechaMantenimiento = generateMaintenanceDate(true);
            break;
          case 'MANTENIMIENTO':
            fechaVencimiento = generateExpirationDate(false);
            fechaMantenimiento = generateMaintenanceDate(false);
            break;
          case 'VENCIDO':
            fechaVencimiento = generateExpirationDate(true);
            fechaMantenimiento = generateMaintenanceDate(false);
            break;
          case 'BAJA':
            fechaVencimiento = generateExpirationDate(true);
            fechaMantenimiento = generateMaintenanceDate(false);
            break;
        }
        
        // Guardar extintor
        const result = await run(
          'INSERT INTO extintores (codigo_interno, tipo_id, descripcion, ubicacion_id, responsable_id, fecha_vencimiento, fecha_mantenimiento, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [codigoInterno, tipoId, descripcion, ubicacionId, responsableId, fechaVencimiento, fechaMantenimiento, estado]
        );
        
        extintoresIds.push(result.lastID);
        extintoresCreados++;
      }
    }
    log(`✅ ${extintoresCreados} extintores creados`);

    // 6. Crear mantenimientos
    log('Creando mantenimientos...');
    const tiposMantenimiento = ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo'];
    let mantenimientosCreados = 0;

    // Crear entre 1 y 3 mantenimientos por extintor
    for (const extintorId of extintoresIds) {
      const numMantenimientos = Math.floor(Math.random() * 3) + 1; // 1 a 3 mantenimientos
      
      for (let i = 0; i < numMantenimientos; i++) {
        // Tipo de evento aleatorio
        const tipoIndex = Math.floor(Math.random() * tiposMantenimiento.length);
        const tipoEvento = tiposMantenimiento[tipoIndex];
        
        // Descripción según tipo
        let descripcion = '';
        switch (tipoEvento) {
          case 'inspeccion':
            descripcion = 'Inspección rutinaria. Extintor en buen estado.';
            break;
          case 'recarga':
            descripcion = 'Recarga completa del agente extintor.';
            break;
          case 'reparacion':
            descripcion = 'Reparación de válvula y manómetro.';
            break;
          case 'incidente':
            descripcion = 'Extintor utilizado en incidente menor.';
            break;
          case 'reemplazo':
            descripcion = 'Reemplazo de extintor por fin de vida útil.';
            break;
        }
        
        // Fecha (entre 1 y 24 meses atrás)
        const today = new Date();
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - (Math.floor(Math.random() * 24) + 1));
        const fecha = pastDate.toISOString().split('T')[0];
        
        // Técnico aleatorio
        const tecnicoIndex = Math.floor(Math.random() * tecnicosIds.length);
        const tecnicoId = tecnicosIds[tecnicoIndex];
        
        // Guardar mantenimiento
        await run(
          'INSERT INTO mantenimientos (extintor_id, fecha, tipo_evento, descripcion, tecnico_id) VALUES (?, ?, ?, ?, ?)',
          [extintorId, fecha, tipoEvento, descripcion, tecnicoId]
        );
        
        mantenimientosCreados++;
      }
    }
    log(`✅ ${mantenimientosCreados} mantenimientos creados`);

    log('✅✅✅ Base de datos inicializada y poblada exitosamente');
    db.close();
    log('Conexión cerrada');
    log(`\nProceso completado: ${new Date().toISOString()}`);

  } catch (error) {
    log(`❌ Error al poblar la base de datos: ${error.message}`);
    log(error.stack);
    db.close();
    log('Conexión cerrada debido a error');
  }
}
