/**
 * Script para verificar los datos en la base de datos y guardar resultados en un archivo
 * FireGuardian - YCC Extintores
 */

const { createConnection } = require('typeorm');
const path = require('path');
const fs = require('fs');
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

// Archivo de salida
const outputFile = path.join(__dirname, 'database-report.txt');
let output = '';

// Función para escribir en el archivo y en la consola
function log(message) {
  output += message + '\n';
  console.log(message);
}

// Función principal para verificar los datos
async function checkDatabase() {
  try {
    log('Conectando a la base de datos...');
    const connection = await createConnection(config);
    log('Conexión establecida. Verificando datos...\n');

    // Verificar sedes
    const sedesCount = await connection.getRepository(Sede).count();
    log(`Sedes: ${sedesCount}`);
    
    if (sedesCount > 0) {
      const sedes = await connection.getRepository(Sede).find();
      log('Nombres de sedes:');
      sedes.forEach(sede => log(`- ${sede.nombre}`));
      log('');
    }

    // Verificar ubicaciones
    const ubicacionesCount = await connection.getRepository(Ubicacion).count();
    log(`Ubicaciones: ${ubicacionesCount}`);
    
    if (ubicacionesCount > 0) {
      const ubicacionesPorSede = await connection.getRepository(Ubicacion)
        .createQueryBuilder('ubicacion')
        .select('sede_id')
        .addSelect('COUNT(*)', 'count')
        .groupBy('sede_id')
        .getRawMany();
      
      log('Ubicaciones por sede:');
      ubicacionesPorSede.forEach(item => log(`- Sede ID ${item.sede_id}: ${item.count} ubicaciones`));
      log('');
    }

    // Verificar tipos de extintores
    const tiposCount = await connection.getRepository(TipoExtintor).count();
    log(`Tipos de extintores: ${tiposCount}`);
    
    if (tiposCount > 0) {
      const tipos = await connection.getRepository(TipoExtintor).find();
      log('Tipos disponibles:');
      tipos.forEach(tipo => log(`- ${tipo.id}: ${tipo.nombre}`));
      log('');
    }

    // Verificar usuarios
    const usuariosCount = await connection.getRepository(Usuario).count();
    log(`Usuarios: ${usuariosCount}`);
    
    if (usuariosCount > 0) {
      const usuarios = await connection.getRepository(Usuario).find();
      log('Usuarios por rol:');
      const roleCount = {};
      usuarios.forEach(usuario => {
        roleCount[usuario.rol] = (roleCount[usuario.rol] || 0) + 1;
      });
      Object.keys(roleCount).forEach(rol => log(`- ${rol}: ${roleCount[rol]}`));
      log('');
    }

    // Verificar extintores
    const extintoresCount = await connection.getRepository(Extintor).count();
    log(`Extintores: ${extintoresCount}`);
    
    if (extintoresCount > 0) {
      const extintoresPorTipo = await connection.getRepository(Extintor)
        .createQueryBuilder('extintor')
        .select('tipo_id')
        .addSelect('COUNT(*)', 'count')
        .groupBy('tipo_id')
        .getRawMany();
      
      log('Extintores por tipo:');
      extintoresPorTipo.forEach(item => log(`- Tipo ${item.tipo_id}: ${item.count} extintores`));
      
      // Verificar distribución de fechas de vencimiento
      const hoy = new Date();
      const extintoresVencidos = await connection.getRepository(Extintor)
        .createQueryBuilder('extintor')
        .where('extintor.fecha_vencimiento < :hoy', { hoy })
        .getCount();
      
      const extintoresVigentes = extintoresCount - extintoresVencidos;
      log(`\nEstado de vencimiento:`);
      log(`- Extintores vigentes: ${extintoresVigentes} (${Math.round(extintoresVigentes/extintoresCount*100)}%)`);
      log(`- Extintores vencidos: ${extintoresVencidos} (${Math.round(extintoresVencidos/extintoresCount*100)}%)`);
      log('');
    }

    // Verificar mantenimientos
    const mantenimientosCount = await connection.getRepository(Mantenimiento).count();
    log(`Mantenimientos: ${mantenimientosCount}`);
    
    if (mantenimientosCount > 0) {
      const mantenimientosPorTipo = await connection.getRepository(Mantenimiento)
        .createQueryBuilder('mantenimiento')
        .select('tipo_evento')
        .addSelect('COUNT(*)', 'count')
        .groupBy('tipo_evento')
        .getRawMany();
      
      log('Mantenimientos por tipo:');
      mantenimientosPorTipo.forEach(item => log(`- ${item.tipo_evento}: ${item.count}`));
      log('');
    }

    log('Verificación completada.');
    await connection.close();
    log('Conexión cerrada');

    // Guardar resultados en archivo
    fs.writeFileSync(outputFile, output);
    console.log(`\nReporte guardado en: ${outputFile}`);

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
    // Guardar el error en el archivo también
    output += `\n❌ Error: ${error.message}\n${error.stack}`;
    fs.writeFileSync(outputFile, output);
  }
}

// Ejecutar la función principal
checkDatabase();
