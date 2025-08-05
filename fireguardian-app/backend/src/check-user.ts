import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from './database/config';
import { Usuario } from './models/Usuario';

const checkUser = async () => {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('🗄️ Base de datos inicializada correctamente');
    
    // Buscar usuario por email
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuario = await usuarioRepo.findOne({ 
      where: { email: 'admin@fireguardian.com' } 
    });
    
    if (usuario) {
      console.log('✅ Usuario encontrado:');
      console.log({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
      });
    } else {
      console.log('❌ Usuario no encontrado');
      
      // Crear usuario administrador
      console.log('🔧 Creando usuario administrador...');
      const bcrypt = require('bcryptjs');
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await usuarioRepo.save({
        nombre: 'Administrador',
        email: 'admin@fireguardian.com',
        password: adminPassword,
        rol: 'admin',
        activo: true
      });
      
      console.log('✅ Usuario administrador creado:', newAdmin.id);
    }
    
    // Cerrar la conexión
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Ejecutar la función
checkUser().then(() => {
  console.log('🏁 Verificación completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
