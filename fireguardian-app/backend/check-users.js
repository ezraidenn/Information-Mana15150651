/**
 * Script para verificar los usuarios en la base de datos FireGuardian
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');

// Función para verificar los usuarios
async function checkUsers() {
  try {
    console.log('Conectando a la base de datos...');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        return;
      }
      console.log('Conexión establecida con la base de datos SQLite.');
      
      // Consultar usuarios
      db.all('SELECT id, nombre, email, rol, activo FROM usuarios', [], (err, rows) => {
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
    console.error('Error al verificar usuarios:', error);
  }
}

// Ejecutar la función principal
checkUsers();
