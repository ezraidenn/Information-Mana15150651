/**
 * Script para probar la autenticación en la base de datos FireGuardian
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');

// Función para verificar los usuarios y probar la autenticación
async function testAuth() {
  try {
    console.log('Conectando a la base de datos...');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        return;
      }
      console.log('Conexión establecida con la base de datos SQLite.');
      
      // Consultar usuarios
      db.all('SELECT id, nombre, email, password, rol, activo FROM usuarios', [], (err, rows) => {
        if (err) {
          console.error('Error al consultar usuarios:', err.message);
          return;
        }
        
        console.log('=== USUARIOS EN LA BASE DE DATOS ===');
        if (rows.length === 0) {
          console.log('No hay usuarios en la base de datos.');
        } else {
          rows.forEach((row) => {
            console.log(`ID: ${row.id}, Nombre: ${row.nombre}, Email: ${row.email}, Rol: ${row.rol}, Activo: ${row.activo ? 'Sí' : 'No'}`);
            console.log(`Password hash: ${row.password ? row.password.substring(0, 20) + '...' : 'No disponible'}`);
            console.log('---');
          });
          
          // Probar autenticación con el usuario admin
          const adminUser = rows.find(user => user.email === 'admin@fireguardian.com');
          if (adminUser) {
            console.log('=== PRUEBA DE AUTENTICACIÓN ===');
            console.log('Probando autenticación para admin@fireguardian.com...');
            
            // La contraseña en texto plano que debería coincidir con el hash
            const plainPassword = 'admin123';
            
            // Verificar si la contraseña coincide con el hash
            bcrypt.compare(plainPassword, adminUser.password, (err, result) => {
              if (err) {
                console.error('Error al comparar contraseñas:', err.message);
              } else if (result) {
                console.log('✅ Autenticación exitosa! La contraseña coincide.');
              } else {
                console.log('❌ Autenticación fallida! La contraseña no coincide.');
                
                // Generar un nuevo hash para esta contraseña
                console.log('Generando nuevo hash para "admin123"...');
                bcrypt.hash(plainPassword, 10, (err, hash) => {
                  if (err) {
                    console.error('Error al generar hash:', err.message);
                  } else {
                    console.log(`Nuevo hash generado: ${hash}`);
                    console.log('Puedes usar este hash para actualizar la contraseña en la base de datos.');
                    
                    // Actualizar la contraseña en la base de datos
                    console.log('Actualizando contraseña en la base de datos...');
                    db.run('UPDATE usuarios SET password = ? WHERE email = ?', [hash, adminUser.email], function(err) {
                      if (err) {
                        console.error('Error al actualizar contraseña:', err.message);
                      } else {
                        console.log(`✅ Contraseña actualizada correctamente para ${adminUser.email}`);
                      }
                      
                      // Hacer lo mismo para los otros usuarios
                      updateUserPassword(db, 'tecnico@fireguardian.com', plainPassword);
                      updateUserPassword(db, 'consulta@fireguardian.com', plainPassword);
                    });
                  }
                });
              }
            });
          } else {
            console.log('No se encontró el usuario admin@fireguardian.com');
          }
        }
      });
    });
  } catch (error) {
    console.error('Error al verificar usuarios:', error);
  }
}

// Función para actualizar la contraseña de un usuario
function updateUserPassword(db, email, plainPassword) {
  bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
      console.error(`Error al generar hash para ${email}:`, err.message);
    } else {
      db.run('UPDATE usuarios SET password = ? WHERE email = ?', [hash, email], function(err) {
        if (err) {
          console.error(`Error al actualizar contraseña para ${email}:`, err.message);
        } else {
          console.log(`✅ Contraseña actualizada correctamente para ${email}`);
        }
      });
    }
  });
}

// Ejecutar la función principal
testAuth();
