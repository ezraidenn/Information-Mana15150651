require('dotenv').config();
const bcrypt = require('bcryptjs');
const { AppDataSource } = require('./dist/database/config');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function main() {
  try {
    // Inicializar la conexión a la base de datos
    console.log('Inicializando conexión a la base de datos...');
    await AppDataSource.initialize();
    console.log('✅ Conexión inicializada correctamente');

    // Obtener el repositorio de usuarios
    const usuarioRepo = AppDataSource.getRepository('Usuario');
    
    // Usuarios a insertar
    const users = [
      {
        nombre: 'Admin',
        email: 'admin@fireguardian.com',
        password: await hashPassword('admin123'),
        rol: 'admin',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Técnico',
        email: 'tecnico@fireguardian.com',
        password: await hashPassword('tecnico123'),
        rol: 'tecnico',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'Consulta',
        email: 'consulta@fireguardian.com',
        password: await hashPassword('consulta123'),
        rol: 'consulta',
        activo: true,
        creado_en: new Date(),
        actualizado_en: new Date()
      }
    ];

    // Eliminar usuarios existentes con los mismos emails
    console.log('Eliminando usuarios existentes si los hay...');
    for (const user of users) {
      await usuarioRepo.delete({ email: user.email });
      console.log(`Usuario con email ${user.email} eliminado si existía`);
    }

    // Insertar los nuevos usuarios
    console.log('Insertando usuarios...');
    for (const user of users) {
      await usuarioRepo.save(user);
      console.log(`✅ Usuario insertado: ${user.email} (${user.rol})`);
    }

    // Verificar usuarios insertados
    console.log('\nVerificando usuarios insertados:');
    const allUsers = await usuarioRepo.find();
    allUsers.forEach(user => {
      console.log(`ID: ${user.id}, Nombre: ${user.nombre}, Email: ${user.email}, Rol: ${user.rol}, Activo: ${user.activo}`);
    });

    console.log('\n✅ Proceso completado exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar la conexión
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexión cerrada');
    }
  }
}

main();
