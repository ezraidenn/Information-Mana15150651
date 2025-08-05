/**
 * Script simplificado para agregar sedes, ubicaciones y extintores
 * Con registro de actividad en archivo de texto
 * FireGuardian - YCC Extintores
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');
const logPath = path.join(__dirname, 'seed-log.txt');

// Iniciar el archivo de log
fs.writeFileSync(logPath, `Inicio del proceso: ${new Date().toISOString()}\n\n`);

// Función para escribir en el log
function log(message) {
  const logMessage = `${message}\n`;
  fs.appendFileSync(logPath, logMessage);
  console.log(message);
}

// Conectar a la base de datos
log('Conectando a la base de datos...');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    log(`❌ Error al conectar a la base de datos: ${err.message}`);
    return;
  }
  log('✅ Conexión establecida correctamente');
  
  // Iniciar el proceso
  seedDatabase();
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

// Función para consultar datos
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) {
        log(`❌ Error en SQL: ${sql}`);
        log(`❌ Error: ${err.message}`);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Función para consultar múltiples filas
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        log(`❌ Error en SQL: ${sql}`);
        log(`❌ Error: ${err.message}`);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

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
  
  return futureDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Función para generar una fecha de mantenimiento pasada
function generateMaintenanceDate() {
  const today = new Date();
  const pastDate = new Date();
  
  // Fecha entre 1 y 18 meses en el pasado
  const randomMonths = Math.floor(Math.random() * 18) + 1;
  pastDate.setMonth(today.getMonth() - randomMonths);
  
  return pastDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Función principal para poblar la base de datos
async function seedDatabase() {
  try {
    log('Iniciando población de la base de datos...');
    
    // Verificar si hay tipos de extintores y usuarios
    log('Verificando tipos de extintores...');
    const tiposResult = await get('SELECT COUNT(*) as count FROM tipos_extintores');
    log(`Tipos de extintores encontrados: ${tiposResult ? tiposResult.count : 0}`);
    
    log('Verificando usuarios...');
    const usuariosResult = await get('SELECT COUNT(*) as count FROM usuarios');
    log(`Usuarios encontrados: ${usuariosResult ? usuariosResult.count : 0}`);
    
    if (!tiposResult || tiposResult.count === 0) {
      log('❌ Error: No hay tipos de extintores en la base de datos.');
      log('Por favor, asegúrate de que la tabla tipos_extintores tenga datos antes de continuar.');
      
      // Crear tipos de extintores básicos
      log('Creando tipos de extintores básicos...');
      
      const tiposExtintores = [
        {
          id: 'ABC',
          nombre: 'Polvo Químico Seco ABC',
          descripcion: 'Extintor multipropósito para fuegos clase A, B y C',
          uso_recomendado: 'Áreas generales, oficinas, almacenes',
          color_hex: '#FF5733'
        },
        {
          id: 'CO2',
          nombre: 'Dióxido de Carbono',
          descripcion: 'Extintor para fuegos clase B y C, ideal para equipos eléctricos',
          uso_recomendado: 'Salas de servidores, laboratorios, áreas con equipos electrónicos',
          color_hex: '#3366FF'
        },
        {
          id: 'H2O',
          nombre: 'Agua a Presión',
          descripcion: 'Extintor para fuegos clase A',
          uso_recomendado: 'Áreas con materiales sólidos combustibles',
          color_hex: '#33FF57'
        }
      ];
      
      for (const tipo of tiposExtintores) {
        await run(
          'INSERT INTO tipos_extintores (id, nombre, descripcion, uso_recomendado, color_hex, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
          [tipo.id, tipo.nombre, tipo.descripcion, tipo.uso_recomendado, tipo.color_hex]
        );
      }
      
      log(`✅ ${tiposExtintores.length} tipos de extintores básicos creados`);
    }
    
    if (!usuariosResult || usuariosResult.count === 0) {
      log('❌ Error: No hay usuarios en la base de datos.');
      log('Por favor, asegúrate de que la tabla usuarios tenga datos antes de continuar.');
      
      // Crear un usuario administrador básico
      log('Creando usuario administrador básico...');
      
      await run(
        'INSERT INTO usuarios (nombre, email, password, rol, activo, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
        ['Administrador', 'admin@yccextintores.com', '$2b$10$XFE0pOzZ5wvqyTjpXhAUVuJzrMzJfQdtg9UGzOD5yxUL6NcNbcbwq', 'admin', 1]
      );
      
      log('✅ Usuario administrador básico creado');
    }
    
    // Obtener los tipos de extintores existentes
    log('Obteniendo tipos de extintores...');
    const tiposExtintores = await all('SELECT id FROM tipos_extintores');
    const tiposIds = tiposExtintores.map(t => t.id);
    log(`Tipos de extintores disponibles: ${tiposIds.join(', ')}`);
    
    // Obtener los usuarios técnicos existentes
    log('Obteniendo usuarios técnicos...');
    const tecnicos = await all('SELECT id FROM usuarios WHERE rol = "tecnico" AND activo = 1');
    let tecnicosIds = tecnicos.map(t => t.id);
    
    // Si no hay técnicos, usar cualquier usuario activo
    if (tecnicosIds.length === 0) {
      log('⚠️ No hay usuarios técnicos activos, usando cualquier usuario activo');
      const usuariosActivos = await all('SELECT id FROM usuarios WHERE activo = 1');
      tecnicosIds = usuariosActivos.map(u => u.id);
    }
    
    log(`Usuarios técnicos/activos disponibles: ${tecnicosIds.join(', ')}`);
    
    if (tecnicosIds.length === 0) {
      log('❌ Error: No hay usuarios activos en la base de datos.');
      return;
    }
    
    // Limpiar tablas existentes (excepto tipos_extintores y usuarios)
    log('Limpiando tablas existentes...');
    await run('DELETE FROM extintores');
    await run('DELETE FROM ubicaciones');
    await run('DELETE FROM sedes');
    log('✅ Tablas limpiadas correctamente');
    
    // 1. Crear sedes
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
        'INSERT INTO sedes (nombre, direccion, creado_en, actualizado_en) VALUES (?, ?, datetime("now"), datetime("now"))',
        [sede.nombre, sede.direccion]
      );
      sedesIds.push(result.lastID);
      log(`  - Sede creada: ${sede.nombre} (ID: ${result.lastID})`);
    }
    log(`✅ ${sedes.length} sedes creadas`);

    // 2. Crear ubicaciones para cada sede
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
      
      log(`  - Creando ubicaciones para sede ID ${sedeId} (${sedes[i].nombre}):`);
      for (const nombreArea of ubicacionesNombres) {
        const result = await run(
          'INSERT INTO ubicaciones (nombre_area, descripcion, sede_id, creado_en, actualizado_en) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
          [nombreArea, `${nombreArea} en ${sedes[i].nombre}`, sedeId]
        );
        ubicacionesIds.push(result.lastID);
        log(`    * Ubicación creada: ${nombreArea} (ID: ${result.lastID})`);
      }
    }
    log(`✅ ${ubicacionesIds.length} ubicaciones creadas`);

    // 3. Crear extintores
    log('Creando extintores...');
    let extintoresCreados = 0;

    // Crear entre 2 y 4 extintores por ubicación
    for (const ubicacionId of ubicacionesIds) {
      const numExtintores = Math.floor(Math.random() * 3) + 2; // 2 a 4 extintores
      
      // Obtener información de la ubicación
      const ubicacion = await get('SELECT id, sede_id, nombre_area FROM ubicaciones WHERE id = ?', [ubicacionId]);
      log(`  - Creando ${numExtintores} extintores para ubicación ID ${ubicacionId} (${ubicacion.nombre_area}):`);
      
      for (let i = 0; i < numExtintores; i++) {
        // Generar código único
        const codigoBase = `EXT-${ubicacion.sede_id}${ubicacion.id}`;
        const codigoInterno = `${codigoBase}-${i+1}`;
        
        // Asignar tipo aleatorio
        const tipoIndex = Math.floor(Math.random() * tiposIds.length);
        const tipoId = tiposIds[tipoIndex];
        
        // Descripción
        const descripcion = `Extintor ${tipoId} ubicado en ${ubicacion.nombre_area}`;
        
        // Responsable (técnico aleatorio)
        const respIndex = Math.floor(Math.random() * tecnicosIds.length);
        const responsableId = tecnicosIds[respIndex];
        
        // Fechas
        const fechaVencimiento = generateExpirationDate();
        const fechaMantenimiento = generateMaintenanceDate();
        
        // Guardar extintor
        await run(
          'INSERT INTO extintores (codigo_interno, tipo_id, descripcion, ubicacion_id, responsable_id, fecha_vencimiento, fecha_mantenimiento, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))',
          [codigoInterno, tipoId, descripcion, ubicacionId, responsableId, fechaVencimiento, fechaMantenimiento]
        );
        
        log(`    * Extintor creado: ${codigoInterno} (Tipo: ${tipoId})`);
        extintoresCreados++;
      }
    }
    log(`✅ ${extintoresCreados} extintores creados`);

    log('✅✅✅ Base de datos poblada exitosamente');
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
