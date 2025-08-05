/**
 * Script para ejecutar comandos SQL en la base de datos FireGuardian
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'fireguardian.db');
// Ruta al archivo SQL
const sqlPath = path.join(__dirname, 'fix-database.sql');

// Función para ejecutar el script SQL
async function executeSqlScript() {
  try {
    console.log('Leyendo archivo SQL...');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Conectando a la base de datos...');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        return;
      }
      console.log('Conexión establecida con la base de datos SQLite.');
      
      // Dividir el script en comandos individuales
      const commands = sqlScript
        .split(';')
        .map(command => command.trim())
        .filter(command => command.length > 0);
      
      console.log(`Ejecutando ${commands.length} comandos SQL...`);
      
      // Ejecutar cada comando en una transacción
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;');
        
        commands.forEach((command, index) => {
          db.run(`${command};`, (err) => {
            if (err) {
              console.error(`Error en comando #${index + 1}:`, err.message);
              console.error('Comando:', command);
            } else {
              console.log(`✅ Comando #${index + 1} ejecutado correctamente`);
            }
          });
        });
        
        db.run('COMMIT;', (err) => {
          if (err) {
            console.error('Error al confirmar la transacción:', err.message);
          } else {
            console.log('✅ Transacción confirmada correctamente');
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
  } catch (error) {
    console.error('Error al ejecutar el script SQL:', error);
  }
}

// Ejecutar la función principal
executeSqlScript();
