/**
 * Script para verificar los datos en la base de datos
 * FireGuardian - YCC Extintores
 */

const { createConnection } = require('typeorm');
const path = require('path');
const { Sede } = require('./dist/models/Sede');
const { Ubicacion } = require('./dist/models/Ubicacion');
const { TipoExtintor } = require('./dist/models/TipoExtintor');
const { Usuario } = require('./dist/models/Usuario');
const { Extintor } = require('./dist/models/Extintor');
const { Mantenimiento } = require('./dist/models/Mantenimiento');

// Configuración de la conexión
const config = {
  type: 'sqlite',
  database: path.join(__dirname, 'fireguardian.db'),
  entities: [
    Sede,
    Ubicacion,
    TipoExtintor,
    Usuario,
    Extintor,
    Mantenimiento
  ],
  synchronize: false,
  logging: false
};

// Función principal para verificar los datos
async function checkDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    const connection = await createConnection(config);
    console.log('Conexión establecida. Verificando datos...\n');

    // Verificar sedes
    const sedesCount = await connection.getRepository(Sede).count();
    console.log(`Sedes: ${sedesCount}`);
    
    if (sedesCount > 0) {
      const sedes = await connection.getRepository(Sede).find();
      console.log('Nombres de sedes:');
      sedes.forEach(sede => console.log(`- ${sede.nombre}`));
      console.log('');
    }

    // Verificar ubicaciones
    const ubicacionesCount = await connection.getRepository(Ubicacion).count();
    console.log(`Ubicaciones: ${ubicacionesCount}`);
    
    if (ubicacionesCount > 0) {
      const ubicacionesPorSede = await connection.getRepository(Ubicacion)
        .createQueryBuilder('ubicacion')
        .select('sede_id')
        .addSelect('COUNT(*)', 'count')
        .groupBy('sede_id')
        .getRawMany();
      
      console.log('Ubicaciones por sede:');
      ubicacionesPorSede.forEach(item => console.log(`- Sede ID ${item.sede_id}: ${item.count} ubicaciones`));
      console.log('');
    }

    // Verificar tipos de extintores
    const tiposCount = await connection.getRepository(TipoExtintor).count();
    console.log(`Tipos de extintores: ${tiposCount}`);
    
    if (tiposCount > 0) {
      const tipos = await connection.getRepository(TipoExtintor).find();
      console.log('Tipos disponibles:');
      tipos.forEach(tipo => console.log(`- ${tipo.id}: ${tipo.nombre}`));
      console.log('');
    }

    // Verificar usuarios
    const usuariosCount = await connection.getRepository(Usuario).count();
    console.log(`Usuarios: ${usuariosCount}`);
    
    if (usuariosCount > 0) {
      const usuarios = await connection.getRepository(Usuario).find();
      console.log('Usuarios por rol:');
      const roleCount = {};
      usuarios.forEach(usuario => {
        roleCount[usuario.rol] = (roleCount[usuario.rol] || 0) + 1;
      });
      Object.keys(roleCount).forEach(rol => console.log(`- ${rol}: ${roleCount[rol]}`));
      console.log('');
    }

    // Verificar extintores
    const extintoresCount = await connection.getRepository(Extintor).count();
    console.log(`Extintores: ${extintoresCount}`);
    
    if (extintoresCount > 0) {
      const extintoresPorTipo = await connection.getRepository(Extintor)
        .createQueryBuilder('extintor')
        .select('tipo_id')
        .addSelect('COUNT(*)', 'count')
        .groupBy('tipo_id')
        .getRawMany();
      
      console.log('Extintores por tipo:');
      extintoresPorTipo.forEach(item => console.log(`- Tipo ${item.tipo_id}: ${item.count} extintores`));
      
      // Verificar distribución de fechas de vencimiento
      const hoy = new Date();
      const extintoresVencidos = await connection.getRepository(Extintor)
        .createQueryBuilder('extintor')
        .where('extintor.fecha_vencimiento < :hoy', { hoy })
        .getCount();
      
      const extintoresVigentes = extintoresCount - extintoresVencidos;
      console.log(`\nEstado de vencimiento:`);
      console.log(`- Extintores vigentes: ${extintoresVigentes} (${Math.round(extintoresVigentes/extintoresCount*100)}%)`);
      console.log(`- Extintores vencidos: ${extintoresVencidos} (${Math.round(extintoresVencidos/extintoresCount*100)}%)`);
      console.log('');
    }

    // Verificar mantenimientos
    const mantenimientosCount = await connection.getRepository(Mantenimiento).count();
    console.log(`Mantenimientos: ${mantenimientosCount}`);
    
    if (mantenimientosCount > 0) {
      const mantenimientosPorTipo = await connection.getRepository(Mantenimiento)
        .createQueryBuilder('mantenimiento')
        .select('tipo_evento')
        .addSelect('COUNT(*)', 'count')
        .groupBy('tipo_evento')
        .getRawMany();
      
      console.log('Mantenimientos por tipo:');
      mantenimientosPorTipo.forEach(item => console.log(`- ${item.tipo_evento}: ${item.count}`));
      console.log('');
    }

    console.log('Verificación completada.');
    await connection.close();
    console.log('Conexión cerrada');

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  }
}

// Ejecutar la función principal
checkDatabase();
