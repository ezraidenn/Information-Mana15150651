/**
 * Script simplificado para corregir la base de datos FireGuardian
 * Enfocado en arreglar tipos de extintores, usuarios y estados
 */

const { createConnection } = require('typeorm');
const bcrypt = require('bcrypt');
const path = require('path');

// Importamos solo los modelos necesarios
const { TipoExtintor } = require('./dist/models/TipoExtintor');
const { Usuario } = require('./dist/models/Usuario');

// Configuración de la conexión
const config = {
  type: 'sqlite',
  database: path.join(__dirname, 'fireguardian.db'),
  entities: [
    require('./dist/models/Sede').Sede,
    require('./dist/models/Ubicacion').Ubicacion,
    require('./dist/models/TipoExtintor').TipoExtintor,
    require('./dist/models/Usuario').Usuario,
    require('./dist/models/Extintor').Extintor,
    require('./dist/models/Mantenimiento').Mantenimiento
  ],
  synchronize: false,
  logging: true
};

// Función principal para corregir la base de datos
async function fixDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    const connection = await createConnection(config);
    console.log('Conexión establecida. Iniciando correcciones...');

    // 1. Corregir tipos de extintores
    console.log('Corrigiendo tipos de extintores...');
    
    // Primero eliminamos los tipos existentes
    await connection.query('DELETE FROM tipos_extintores');
    
    // Definimos los tipos correctos con rutas de iconos adecuadas
    const tiposExtintores = [
      {
        id: 'ABC',
        nombre: 'Polvo Químico Seco ABC',
        descripcion: 'Extintor multipropósito para fuegos clase A, B y C',
        uso_recomendado: 'Áreas generales, oficinas, almacenes',
        color_hex: '#FF5733',
        clase_fuego: ['A', 'B', 'C'],
        icono_path: [
          '/assets/icons/extintores/clases/class-A.png',
          '/assets/icons/extintores/clases/class-B.png',
          '/assets/icons/extintores/clases/class-C.png'
        ],
        agente_extintor: 'Polvo Químico Seco'
      },
      {
        id: 'CO2',
        nombre: 'Dióxido de Carbono',
        descripcion: 'Extintor para fuegos clase B y C, ideal para equipos eléctricos',
        uso_recomendado: 'Salas de servidores, laboratorios, áreas con equipos electrónicos',
        color_hex: '#3366FF',
        clase_fuego: ['B', 'C'],
        icono_path: [
          '/assets/icons/extintores/clases/class-B.png',
          '/assets/icons/extintores/clases/class-C.png'
        ],
        agente_extintor: 'Dióxido de Carbono (CO₂)'
      },
      {
        id: 'H2O',
        nombre: 'Agua a Presión',
        descripcion: 'Extintor para fuegos clase A',
        uso_recomendado: 'Áreas con materiales sólidos combustibles',
        color_hex: '#33FF57',
        clase_fuego: ['A'],
        icono_path: [
          '/assets/icons/extintores/clases/class-A.png'
        ],
        agente_extintor: 'Agua'
      },
      {
        id: 'K',
        nombre: 'Clase K',
        descripcion: 'Extintor para fuegos de aceites y grasas de cocina',
        uso_recomendado: 'Cocinas comerciales, restaurantes',
        color_hex: '#FFFF33',
        clase_fuego: ['K'],
        icono_path: [
          '/assets/icons/extintores/clases/class-K.png'
        ],
        agente_extintor: 'Acetato de Potasio'
      },
      {
        id: 'AFFF',
        nombre: 'Espuma AFFF',
        descripcion: 'Extintor de espuma formadora de película acuosa',
        uso_recomendado: 'Áreas con líquidos inflamables',
        color_hex: '#33FFFF',
        clase_fuego: ['A', 'B'],
        icono_path: [
          '/assets/icons/extintores/clases/class-A.png',
          '/assets/icons/extintores/clases/class-B.png'
        ],
        agente_extintor: 'Espuma AFFF'
      },
      {
        id: 'D',
        nombre: 'Polvo para Metales',
        descripcion: 'Extintor para fuegos de metales combustibles',
        uso_recomendado: 'Laboratorios, áreas de trabajo con metales',
        color_hex: '#F59E0B',
        clase_fuego: ['D'],
        icono_path: [
          '/assets/icons/extintores/clases/class-D.png'
        ],
        agente_extintor: 'Polvo Especial para Metales'
      }
    ];

    // Insertamos los tipos corregidos
    for (const tipo of tiposExtintores) {
      const tipoExtintor = new TipoExtintor();
      Object.assign(tipoExtintor, tipo);
      await connection.manager.save(tipoExtintor);
    }
    console.log(`✅ ${tiposExtintores.length} tipos de extintores corregidos`);

    // 2. Corregir usuarios base
    console.log('Corrigiendo usuarios base...');
    
    // Verificamos si existen los usuarios base
    const adminUser = await connection.manager.findOne(Usuario, { where: { email: 'admin@fireguardian.com' } });
    const tecnicoUser = await connection.manager.findOne(Usuario, { where: { email: 'tecnico@fireguardian.com' } });
    const consultaUser = await connection.manager.findOne(Usuario, { where: { email: 'consulta@fireguardian.com' } });
    
    // Si no existen, los creamos
    if (!adminUser) {
      const admin = new Usuario();
      admin.nombre = 'Administrador';
      admin.email = 'admin@fireguardian.com';
      admin.password = await bcrypt.hash('admin123', 10);
      admin.rol = 'admin';
      admin.activo = true;
      await connection.manager.save(admin);
      console.log('✅ Usuario admin creado');
    }
    
    if (!tecnicoUser) {
      const tecnico = new Usuario();
      tecnico.nombre = 'Técnico';
      tecnico.email = 'tecnico@fireguardian.com';
      tecnico.password = await bcrypt.hash('tecnico123', 10);
      tecnico.rol = 'tecnico';
      tecnico.activo = true;
      await connection.manager.save(tecnico);
      console.log('✅ Usuario técnico creado');
    }
    
    if (!consultaUser) {
      const consulta = new Usuario();
      consulta.nombre = 'Consulta';
      consulta.email = 'consulta@fireguardian.com';
      consulta.password = await bcrypt.hash('consulta123', 10);
      consulta.rol = 'consulta';
      consulta.activo = true;
      await connection.manager.save(consulta);
      console.log('✅ Usuario consulta creado');
    }

    // 3. Corregir estados de extintores
    console.log('Corrigiendo estados de extintores...');
    
    // Actualizamos los estados de los extintores según las fechas de vencimiento
    await connection.query(`
      UPDATE extintores
      SET estado = CASE
        WHEN date(fecha_vencimiento) < date('now') THEN 'VENCIDO'
        WHEN date(fecha_vencimiento) > date('now', '+30 days') THEN 'ACTIVO'
        ELSE 'MANTENIMIENTO'
      END
      WHERE estado IS NULL OR estado = ''
    `);
    
    console.log('✅ Estados de extintores corregidos');

    console.log('✅✅✅ Base de datos corregida exitosamente');
    await connection.close();
    console.log('Conexión cerrada');

  } catch (error) {
    console.error('❌ Error al corregir la base de datos:', error);
  }
}

// Ejecutar la función principal
fixDatabase();
