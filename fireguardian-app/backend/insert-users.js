const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Conectar a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('Conectado a la base de datos SQLite.');
});

// Contraseña hasheada para todos los usuarios (admin123, tecnico123, consulta123)
const password = '$2b$10$XFE0UENoBOUJhwOXwdQUO.bW.ENMQHxd9yb6tNHXLzQfUdA0JzGjS';

// Usuarios a insertar
const users = [
  {
    nombre: 'Administrador',
    email: 'admin@fireguardian.com',
    password: password,
    rol: 'admin',
    activo: 1
  },
  {
    nombre: 'Técnico',
    email: 'tecnico@fireguardian.com',
    password: password,
    rol: 'tecnico',
    activo: 1
  },
  {
    nombre: 'Consulta',
    email: 'consulta@fireguardian.com',
    password: password,
    rol: 'consulta',
    activo: 1
  }
];

// Iniciar transacción
db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  // Verificar si los usuarios ya existen y eliminarlos si es necesario
  const checkAndDeleteStmt = db.prepare('DELETE FROM usuarios WHERE email = ?');
  
  users.forEach(user => {
    checkAndDeleteStmt.run(user.email);
    console.log(`Eliminado usuario existente con email: ${user.email} (si existía)`);
  });
  
  checkAndDeleteStmt.finalize();

  // Insertar los usuarios
  const insertStmt = db.prepare(`
    INSERT INTO usuarios (nombre, email, password, rol, activo, creado_en, actualizado_en)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  users.forEach(user => {
    insertStmt.run(
      user.nombre,
      user.email,
      user.password,
      user.rol,
      user.activo,
      (err) => {
        if (err) {
          console.error(`Error al insertar usuario ${user.email}:`, err.message);
        } else {
          console.log(`✅ Usuario insertado: ${user.email} (${user.rol})`);
        }
      }
    );
  });
  
  insertStmt.finalize();

  // Confirmar transacción
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error al confirmar la transacción:', err.message);
    } else {
      console.log('✅ Transacción completada correctamente');
    }
    
    // Verificar usuarios insertados
    db.all('SELECT id, nombre, email, rol FROM usuarios', [], (err, rows) => {
      if (err) {
        console.error('Error al consultar usuarios:', err.message);
      } else {
        console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
        rows.forEach(row => {
          console.log(`ID: ${row.id}, Nombre: ${row.nombre}, Email: ${row.email}, Rol: ${row.rol}`);
        });
      }
      
      // Cerrar la conexión
      db.close((err) => {
        if (err) {
          console.error('Error al cerrar la base de datos:', err.message);
        } else {
          console.log('Conexión cerrada correctamente');
        }
      });
    });
  });
});
