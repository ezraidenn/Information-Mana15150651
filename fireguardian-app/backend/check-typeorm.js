// Script para verificar la conexión de TypeORM y los usuarios
require('dotenv').config();
const { AppDataSource } = require('./dist/database/config');
const { Usuario } = require('./dist/models/Usuario');

async function main() {
  try {
    console.log('Iniciando conexión con TypeORM...');
    
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log('✅ Conexión TypeORM inicializada correctamente');
    
    // Verificar usuarios
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuarios = await usuarioRepo.find();
    
    console.log(`\n=== USUARIOS EN LA BASE DE DATOS (${usuarios.length}) ===`);
    usuarios.forEach(usuario => {
      console.log(`ID: ${usuario.id}, Nombre: ${usuario.nombre}, Email: ${usuario.email}, Rol: ${usuario.rol}, Activo: ${usuario.activo ? 'Sí' : 'No'}`);
    });
    
    // Buscar específicamente el usuario admin@fireguardian.com
    const adminUser = await usuarioRepo.findOne({ 
      where: { email: 'admin@fireguardian.com', activo: true } 
    });
    
    console.log('\n=== BÚSQUEDA ESPECÍFICA ===');
    if (adminUser) {
      console.log(`✅ Usuario admin@fireguardian.com encontrado con ID: ${adminUser.id}`);
    } else {
      console.log('❌ Usuario admin@fireguardian.com NO encontrado');
    }
    
    // Cerrar la conexión
    await AppDataSource.destroy();
    console.log('\nConexión cerrada correctamente');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
