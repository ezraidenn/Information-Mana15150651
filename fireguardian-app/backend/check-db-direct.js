const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');
console.log(`Intentando conectar a la base de datos en: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('Conectado a la base de datos SQLite.');
});

// Verificar la estructura de la tabla usuarios
db.all(`PRAGMA table_info(usuarios)`, [], (err, columns) => {
  if (err) {
    console.error('Error al obtener estructura de la tabla:', err.message);
  } else {
    console.log('\n=== ESTRUCTURA DE LA TABLA USUARIOS ===');
    columns.forEach(col => {
      console.log(`${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
  }

  // Verificar usuarios en la base de datos
  db.all(`SELECT * FROM usuarios`, [], (err, rows) => {
    if (err) {
      console.error('Error al consultar usuarios:', err.message);
    } else {
      console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
      rows.forEach(row => {
        console.log(`ID: ${row.id}, Nombre: ${row.nombre}, Email: ${row.email}, Rol: ${row.rol}, Activo: ${row.activo ? 'Sí' : 'No'}`);
      });
      
      // Buscar específicamente el usuario admin@fireguardian.com
      db.get(`SELECT * FROM usuarios WHERE email = ? AND activo = 1`, ['admin@fireguardian.com'], (err, row) => {
        if (err) {
          console.error('Error al buscar usuario específico:', err.message);
        } else {
          console.log('\n=== BÚSQUEDA ESPECÍFICA ===');
          if (row) {
            console.log(`✅ Usuario admin@fireguardian.com encontrado con ID: ${row.id}`);
            console.log('Datos completos:', JSON.stringify(row, null, 2));
          } else {
            console.log('❌ Usuario admin@fireguardian.com NO encontrado');
          }
        }
        
        // Cerrar la conexión
        db.close((err) => {
          if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
          } else {
            console.log('\nConexión cerrada correctamente');
          }
        });
      });
    }
  });
});
