/**
 * Script para verificar los datos en la base de datos
 * FireGuardian - YCC Extintores
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');
const logPath = path.join(__dirname, 'verify-data-log.txt');

// Iniciar el archivo de log
fs.writeFileSync(logPath, `Verificación de datos: ${new Date().toISOString()}\n\n`);

// Función para escribir en el log
function log(message) {
  const logMessage = `${message}\n`;
  fs.appendFileSync(logPath, logMessage);
  console.log(message);
}

// Conectar a la base de datos
log('Conectando a la base de datos...');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    log(`❌ Error al conectar a la base de datos: ${err.message}`);
    return;
  }
  log('✅ Conexión establecida correctamente');
  
  // Iniciar la verificación
  verifyData();
});

// Función para consultar datos
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

// Función para contar registros
function count(tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
      if (err) {
        log(`❌ Error al contar registros en ${tableName}: ${err.message}`);
        reject(err);
      } else {
        resolve(result.count);
      }
    });
  });
}

// Función para verificar los datos
async function verifyData() {
  try {
    log('Iniciando verificación de datos...\n');
    
    // Verificar tablas
    const tables = ['sedes', 'ubicaciones', 'tipos_extintores', 'usuarios', 'extintores', 'mantenimientos', 'logs'];
    
    log('=== RESUMEN DE TABLAS ===');
    for (const table of tables) {
      try {
        const rowCount = await count(table);
        log(`✅ Tabla ${table}: ${rowCount} registros`);
      } catch (error) {
        log(`❌ Error al verificar tabla ${table}: ${error.message}`);
      }
    }
    
    // Verificar tipos de extintores
    log('\n=== TIPOS DE EXTINTORES ===');
    const tiposExtintores = await all('SELECT id, nombre FROM tipos_extintores');
    tiposExtintores.forEach(tipo => {
      log(`- ${tipo.id}: ${tipo.nombre}`);
    });
    
    // Verificar usuarios
    log('\n=== USUARIOS ===');
    const usuarios = await all('SELECT id, nombre, email, rol, activo FROM usuarios');
    usuarios.forEach(usuario => {
      log(`- ID ${usuario.id}: ${usuario.nombre} (${usuario.email}) - Rol: ${usuario.rol}, Activo: ${usuario.activo}`);
    });
    
    // Verificar sedes
    log('\n=== SEDES ===');
    const sedes = await all('SELECT id, nombre, direccion FROM sedes');
    for (const sede of sedes) {
      log(`- ID ${sede.id}: ${sede.nombre} (${sede.direccion})`);
      
      // Contar ubicaciones por sede
      const ubicacionesCount = await count('ubicaciones WHERE sede_id = ' + sede.id);
      log(`  * Ubicaciones: ${ubicacionesCount}`);
      
      // Contar extintores por sede
      const extintoressCount = await all(`
        SELECT COUNT(*) as count 
        FROM extintores e 
        JOIN ubicaciones u ON e.ubicacion_id = u.id 
        WHERE u.sede_id = ?
      `, [sede.id]);
      log(`  * Extintores: ${extintoressCount[0].count}`);
    }
    
    // Verificar distribución de extintores por tipo
    log('\n=== DISTRIBUCIÓN DE EXTINTORES POR TIPO ===');
    const extintoresPorTipo = await all(`
      SELECT t.id, t.nombre, COUNT(*) as cantidad
      FROM extintores e
      JOIN tipos_extintores t ON e.tipo_id = t.id
      GROUP BY t.id
      ORDER BY cantidad DESC
    `);
    extintoresPorTipo.forEach(item => {
      log(`- ${item.id} (${item.nombre}): ${item.cantidad} extintores`);
    });
    
    // Verificar distribución de mantenimientos por tipo
    log('\n=== DISTRIBUCIÓN DE MANTENIMIENTOS POR TIPO ===');
    const mantenimientosPorTipo = await all(`
      SELECT tipo_evento, COUNT(*) as cantidad
      FROM mantenimientos
      GROUP BY tipo_evento
      ORDER BY cantidad DESC
    `);
    mantenimientosPorTipo.forEach(item => {
      log(`- ${item.tipo_evento}: ${item.cantidad} registros`);
    });
    
    // Verificar extintores próximos a vencer
    const hoy = new Date().toISOString().split('T')[0];
    log('\n=== EXTINTORES PRÓXIMOS A VENCER (3 MESES) ===');
    const tresMesesDespues = new Date();
    tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3);
    const fechaLimite = tresMesesDespues.toISOString().split('T')[0];
    
    const extintoresProximosVencer = await all(`
      SELECT e.id, e.codigo_interno, e.fecha_vencimiento, t.nombre as tipo, u.nombre_area, s.nombre as sede
      FROM extintores e
      JOIN tipos_extintores t ON e.tipo_id = t.id
      JOIN ubicaciones u ON e.ubicacion_id = u.id
      JOIN sedes s ON u.sede_id = s.id
      WHERE e.fecha_vencimiento BETWEEN ? AND ?
      ORDER BY e.fecha_vencimiento
      LIMIT 10
    `, [hoy, fechaLimite]);
    
    if (extintoresProximosVencer.length > 0) {
      extintoresProximosVencer.forEach(ext => {
        log(`- ${ext.codigo_interno} (${ext.tipo}): Vence el ${ext.fecha_vencimiento} - ${ext.nombre_area} en ${ext.sede}`);
      });
    } else {
      log('No hay extintores próximos a vencer en los próximos 3 meses.');
    }
    
    // Verificar últimos mantenimientos
    log('\n=== ÚLTIMOS MANTENIMIENTOS REGISTRADOS ===');
    const ultimosMantenimientos = await all(`
      SELECT m.id, m.fecha, m.tipo_evento, e.codigo_interno, u.nombre as tecnico
      FROM mantenimientos m
      JOIN extintores e ON m.extintor_id = e.id
      JOIN usuarios u ON m.tecnico_id = u.id
      ORDER BY m.fecha DESC
      LIMIT 10
    `);
    
    ultimosMantenimientos.forEach(mant => {
      log(`- ${mant.fecha}: ${mant.tipo_evento} al extintor ${mant.codigo_interno} por ${mant.tecnico}`);
    });
    
    log('\n✅✅✅ Verificación de datos completada');
    db.close();
    log('Conexión cerrada');
    log(`\nProceso completado: ${new Date().toISOString()}`);

  } catch (error) {
    log(`❌ Error durante la verificación: ${error.message}`);
    log(error.stack);
    db.close();
    log('Conexión cerrada debido a error');
  }
}
