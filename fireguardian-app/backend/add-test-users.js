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

// Función para hashear contraseñas
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Usuarios a insertar
const users = [
  {
    nombre: 'Admin',
    email: 'admin@fireguardian.com',
    password: 'admin123',
    rol: 'admin',
    activo: 1
  },
  {
    nombre: 'Técnico',
    email: 'tecnico@fireguardian.com',
    password: 'tecnico123',
    rol: 'tecnico',
    activo: 1
  },
  {
    nombre: 'Consulta',
    email: 'consulta@fireguardian.com',
    password: 'consulta123',
    rol: 'consulta',
    activo: 1
  }
];

// Iniciar transacción
db.serialize(async () => {
  db.run('BEGIN TRANSACTION');

  try {
    // Eliminar usuarios existentes con los mismos emails
    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM usuarios WHERE email = ?', [user.email], function(err) {
          if (err) reject(err);
          else {
            console.log(`Eliminado usuario existente con email: ${user.email} (si existía)`);
            resolve();
          }
        });
      });
    }

    // Insertar los usuarios con contraseñas hasheadas
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO usuarios (nombre, email, password, rol, activo, creado_en, actualizado_en)
           VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [user.nombre, user.email, hashedPassword, user.rol, user.activo],
          function(err) {
            if (err) {
              console.error(`Error al insertar usuario ${user.email}:`, err.message);
              reject(err);
            } else {
              console.log(`✅ Usuario insertado: ${user.email} (${user.rol}) con contraseña: ${user.password}`);
              resolve();
            }
          }
        );
      });
    }

    // Confirmar transacción
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Error al confirmar la transacción:', err.message);
      } else {
        console.log('✅ Transacción completada correctamente');
      }
      
      // Verificar usuarios insertados
      db.all('SELECT id, nombre, email, rol, activo FROM usuarios', [], (err, rows) => {
        if (err) {
          console.error('Error al consultar usuarios:', err.message);
        } else {
          console.log('\n=== USUARIOS EN LA BASE DE DATOS ===');
          rows.forEach(row => {
            console.log(`ID: ${row.id}, Nombre: ${row.nombre}, Email: ${row.email}, Rol: ${row.rol}, Activo: ${row.activo ? 'Sí' : 'No'}`);
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
  } catch (error) {
    console.error('Error en la transacción:', error);
    db.run('ROLLBACK');
    db.close();
  }
});
