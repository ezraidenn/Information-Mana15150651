/**
 * Script simplificado para agregar sedes, ubicaciones y extintores
 * FireGuardian - YCC Extintores
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');
const db = new sqlite3.Database(dbPath);

// Función para ejecutar consultas SQL con promesas
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Función para consultar datos
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Función para consultar múltiples filas
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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
    console.log('Conectando a la base de datos...');
    
    // Verificar si hay tipos de extintores y usuarios
    const tiposCount = await get('SELECT COUNT(*) as count FROM tipos_extintores');
    const usuariosCount = await get('SELECT COUNT(*) as count FROM usuarios');
    
    if (tiposCount.count === 0) {
      console.log('❌ Error: No hay tipos de extintores en la base de datos.');
      console.log('Por favor, asegúrate de que la tabla tipos_extintores tenga datos antes de continuar.');
      return;
    }
    
    if (usuariosCount.count === 0) {
      console.log('❌ Error: No hay usuarios en la base de datos.');
      console.log('Por favor, asegúrate de que la tabla usuarios tenga datos antes de continuar.');
      return;
    }
    
    console.log('Tipos de extintores y usuarios verificados. Continuando...');
    
    // Obtener los tipos de extintores existentes
    const tiposExtintores = await all('SELECT id FROM tipos_extintores');
    const tiposIds = tiposExtintores.map(t => t.id);
    
    // Obtener los usuarios técnicos existentes
    const tecnicos = await all('SELECT id FROM usuarios WHERE rol = "tecnico" AND activo = 1');
    const tecnicosIds = tecnicos.map(t => t.id);
    
    if (tecnicosIds.length === 0) {
      console.log('❌ Error: No hay usuarios técnicos activos en la base de datos.');
      return;
    }
    
    // Limpiar tablas existentes (excepto tipos_extintores y usuarios)
    await run('DELETE FROM extintores');
    await run('DELETE FROM ubicaciones');
    await run('DELETE FROM sedes');
    
    console.log('Tablas limpiadas. Insertando nuevos datos...');

    // 1. Crear sedes
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
    }
    console.log(`✅ ${sedes.length} sedes creadas`);

    // 2. Crear ubicaciones para cada sede
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
          'INSERT INTO ubicaciones (nombre_area, descripcion, sede_id, creado_en, actualizado_en) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
          [nombreArea, `${nombreArea} en ${sedes[i].nombre}`, sedeId]
        );
        ubicacionesIds.push(result.lastID);
      }
    }
    console.log(`✅ ${ubicacionesIds.length} ubicaciones creadas`);

    // 3. Crear extintores
    let extintoresCreados = 0;

    // Crear entre 2 y 4 extintores por ubicación
    for (const ubicacionId of ubicacionesIds) {
      const numExtintores = Math.floor(Math.random() * 3) + 2; // 2 a 4 extintores
      
      // Obtener información de la ubicación
      const ubicacion = await get('SELECT id, sede_id, nombre_area FROM ubicaciones WHERE id = ?', [ubicacionId]);
      
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
        
        extintoresCreados++;
      }
    }
    console.log(`✅ ${extintoresCreados} extintores creados`);

    console.log('✅✅✅ Base de datos poblada exitosamente');
    db.close();
    console.log('Conexión cerrada');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    db.close();
  }
}

// Ejecutar la función principal
seedDatabase();
