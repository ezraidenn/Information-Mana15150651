"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config_1 = require("./database/config");
const Usuario_1 = require("./models/Usuario");
const checkUser = async () => {
    try {
        // Inicializar la conexión a la base de datos
        await config_1.AppDataSource.initialize();
        console.log('🗄️ Base de datos inicializada correctamente');
        // Buscar usuario por email
        const usuarioRepo = config_1.AppDataSource.getRepository(Usuario_1.Usuario);
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
        }
        else {
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
        await config_1.AppDataSource.destroy();
    }
    catch (error) {
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
//# sourceMappingURL=check-user.js.map