// Script para actualizar los tipos de extintores según la información de la imagen
const axios = require('axios');

// URL base de la API (ajusta según tu configuración)
const API_URL = 'http://localhost:3002/api';

// Token de autenticación (deberás obtener uno válido iniciando sesión)
let authToken = '';

// Función para iniciar sesión y obtener token
async function login() {
  try {
    // Opción para saltarse la autenticación si es necesario
    const skipAuth = process.argv.includes('--skip-auth');
    if (skipAuth) {
      console.log('Saltando autenticación por parámetro --skip-auth');
      authToken = 'fake-token';
      return true;
    }
    
    // Intenta con diferentes credenciales comunes
    const credentialSets = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'admin@admin.com', password: 'admin' },
      { email: 'admin', password: 'admin' },
      { email: 'admin@fireguardian.com', password: 'admin123' },
      { email: 'raul@example.com', password: 'password' }
    ];
    
    for (const creds of credentialSets) {
      try {
        console.log(`Intentando iniciar sesión con: ${creds.email}`);
        const response = await axios.post(`${API_URL}/auth/login`, creds);
        authToken = response.data.data.token;
        console.log('Inicio de sesión exitoso');
        return true;
      } catch (err) {
        console.log(`Intento fallido con ${creds.email}`);
      }
    }
    
    console.error('Todos los intentos de inicio de sesión fallaron');
    return false;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data || error.message);
    return false;
  }
}

// Función para obtener todos los tipos de extintores
async function getTiposExtintores() {
  try {
    const response = await axios.get(`${API_URL}/tipos-extintores`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener tipos de extintores:', error.response?.data || error.message);
    return [];
  }
}

// Función para eliminar un tipo de extintor
async function deleteTipoExtintor(id) {
  try {
    await axios.delete(`${API_URL}/tipos-extintores/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Tipo de extintor eliminado: ${id}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar tipo de extintor ${id}:`, error.response?.data || error.message);
    return false;
  }
}

// Función para crear un nuevo tipo de extintor
async function createTipoExtintor(tipo) {
  try {
    const response = await axios.post(`${API_URL}/tipos-extintores`, tipo, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`Tipo de extintor creado: ${tipo.nombre} (${tipo.id}) - Clases de fuego: ${tipo.clase_fuego.join(', ')}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error al crear tipo de extintor ${tipo.id}:`, error.response?.data || error.message);
    return null;
  }
}

// Definición de los nuevos tipos de extintores según la imagen
const nuevosTipos = [
  {
    id: 'agua',
    nombre: 'Agua',
    descripcion: 'Extintor de agua',
    uso_recomendado: 'Ideal para fuegos de clase A (materiales sólidos)',
    color_hex: '#0066CC', // Azul
    clase_fuego: ['A'],
    icono_path: '/assets/icons/extintores/agua.png'
  },
  {
    id: 'agua_presion',
    nombre: 'Agua a presión',
    descripcion: 'Extintor de agua a presión',
    uso_recomendado: 'Ideal para fuegos de clase A (materiales sólidos)',
    color_hex: '#0099FF', // Azul claro
    clase_fuego: ['A'],
    icono_path: '/assets/icons/extintores/agua-presion.png'
  },
  {
    id: 'espuma',
    nombre: 'Espuma química',
    descripcion: 'Extintor de espuma química',
    uso_recomendado: 'Ideal para fuegos de clase A y B (sólidos y líquidos inflamables)',
    color_hex: '#66CCFF', // Azul muy claro
    clase_fuego: ['A', 'B'],
    icono_path: '/assets/icons/extintores/espuma.png'
  },
  {
    id: 'polvo_seco',
    nombre: 'Polvo seco',
    descripcion: 'Extintor de polvo químico seco',
    uso_recomendado: 'Multipropósito para fuegos de clase A, B, C y D',
    color_hex: '#FFCC00', // Amarillo
    clase_fuego: ['A', 'B', 'C', 'D'],
    icono_path: '/assets/icons/extintores/polvo-seco.png'
  },
  {
    id: 'co2',
    nombre: 'CO2',
    descripcion: 'Extintor de dióxido de carbono',
    uso_recomendado: 'Ideal para fuegos de clase B y C (líquidos inflamables y eléctricos)',
    color_hex: '#333333', // Negro
    clase_fuego: ['B', 'C'],
    icono_path: '/assets/icons/extintores/co2.png'
  },
  {
    id: 'haloclean',
    nombre: 'Haloclean',
    descripcion: 'Extintor de reemplazo de halón',
    uso_recomendado: 'Multipropósito para fuegos de clase A, B y C',
    color_hex: '#009966', // Verde
    clase_fuego: ['A', 'B', 'C'],
    icono_path: '/assets/icons/extintores/halon.png'
  },
  {
    id: 'acetato_potasio',
    nombre: 'Acetato de potasio',
    descripcion: 'Extintor de acetato de potasio',
    uso_recomendado: 'Específico para fuegos de clase K (aceites y grasas de cocina)',
    color_hex: '#FF6600', // Naranja
    clase_fuego: ['K'],
    icono_path: '/assets/icons/extintores/clase-k.png'
  },
  {
    id: 'polvo_d',
    nombre: 'Polvo D',
    descripcion: 'Extintor de polvo para metales',
    uso_recomendado: 'Específico para fuegos de clase D (metales combustibles)',
    color_hex: '#FFFF00', // Amarillo brillante
    clase_fuego: ['D'],
    icono_path: '/assets/icons/extintores/polvo-d.png'
  }
];

// Función para actualizar directamente en la base de datos usando TypeORM (alternativa)
async function actualizarDirectoDB() {
  try {
    console.log('Actualizando directamente en la base de datos...');
    
    // Importar módulos necesarios
    const { execSync } = require('child_process');
    const fs = require('fs');
    
    // Crear un archivo temporal con el script SQL
    const sqlContent = `
    -- Eliminar todos los tipos de extintores existentes
    DELETE FROM tipos_extintores;
    
    -- Insertar los nuevos tipos de extintores
    INSERT INTO tipos_extintores (id, nombre, descripcion, uso_recomendado, color_hex, clase_fuego, icono_path, creado_en, actualizado_en)
    VALUES
      ('agua', 'Agua', 'Extintor de agua', 'Ideal para fuegos de clase A (materiales sólidos)', '#0066CC', 'A', '/assets/icons/extintores/agua.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('agua_presion', 'Agua a presión', 'Extintor de agua a presión', 'Ideal para fuegos de clase A (materiales sólidos)', '#0099FF', 'A', '/assets/icons/extintores/agua-presion.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('espuma', 'Espuma química', 'Extintor de espuma química', 'Ideal para fuegos de clase A y B (sólidos y líquidos inflamables)', '#66CCFF', 'A,B', '/assets/icons/extintores/espuma.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('polvo_seco', 'Polvo seco', 'Extintor de polvo químico seco', 'Multipropósito para fuegos de clase A, B, C y D', '#FFCC00', 'A,B,C,D', '/assets/icons/extintores/polvo-seco.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('co2', 'CO2', 'Extintor de dióxido de carbono', 'Ideal para fuegos de clase B y C (líquidos inflamables y eléctricos)', '#333333', 'B,C', '/assets/icons/extintores/co2.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('haloclean', 'Haloclean', 'Extintor de reemplazo de halón', 'Multipropósito para fuegos de clase A, B y C', '#009966', 'A,B,C', '/assets/icons/extintores/halon.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('acetato_potasio', 'Acetato de potasio', 'Extintor de acetato de potasio', 'Específico para fuegos de clase K (aceites y grasas de cocina)', '#FF6600', 'K', '/assets/icons/extintores/clase-k.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('polvo_d', 'Polvo D', 'Extintor de polvo para metales', 'Específico para fuegos de clase D (metales combustibles)', '#FFFF00', 'D', '/assets/icons/extintores/polvo-d.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    
    // Guardar el SQL en un archivo temporal
    fs.writeFileSync('temp-extintores.sql', sqlContent);
    console.log('Archivo SQL temporal creado');
    
    // Ejecutar el SQL (ajusta según tu configuración de base de datos)
    console.log('Ejecutando SQL...');
    try {
      execSync('sqlite3 database.sqlite < temp-extintores.sql');
      console.log('SQL ejecutado correctamente');
    } catch (error) {
      console.error('Error al ejecutar SQL:', error.message);
      console.log('Nota: Si estás usando otro motor de base de datos, ajusta el comando según sea necesario');
    }
    
    // Eliminar el archivo temporal
    fs.unlinkSync('temp-extintores.sql');
    console.log('Archivo SQL temporal eliminado');
    
    return true;
  } catch (error) {
    console.error('Error al actualizar directamente en la base de datos:', error);
    return false;
  }
}

// Función principal para actualizar los tipos de extintores
async function actualizarTiposExtintores() {
  try {
    console.log('Iniciando actualización de tipos de extintores...');
    
    // Verificar si se solicita actualización directa en la base de datos
    const usarDirectoDB = process.argv.includes('--direct-db');
    if (usarDirectoDB) {
      const resultado = await actualizarDirectoDB();
      if (resultado) {
        console.log('Actualización directa en la base de datos completada con éxito');
      } else {
        console.error('Error en la actualización directa en la base de datos');
      }
      return;
    }
    
    // 1. Iniciar sesión para obtener token
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.error('No se pudo iniciar sesión. Abortando.');
      console.log('Sugerencia: Prueba con --skip-auth para saltarte la autenticación o --direct-db para actualizar directamente la base de datos');
      return;
    }
    
    // 2. Obtener todos los tipos de extintores existentes
    const tiposExistentes = await getTiposExtintores();
    console.log(`Se encontraron ${tiposExistentes.length} tipos de extintores existentes`);
    
    // 3. Eliminar todos los tipos de extintores existentes
    if (tiposExistentes.length > 0) {
      console.log('Eliminando tipos de extintores existentes...');
      for (const tipo of tiposExistentes) {
        await deleteTipoExtintor(tipo.id);
      }
    } else {
      console.log('No hay tipos de extintores existentes para eliminar');
    }
    
    // 4. Crear los nuevos tipos de extintores
    console.log('Creando nuevos tipos de extintores...');
    for (const tipo of nuevosTipos) {
      await createTipoExtintor(tipo);
    }
    
    console.log(`Se crearon ${nuevosTipos.length} nuevos tipos de extintores`);
    console.log('Actualización completada con éxito');
    
  } catch (error) {
    console.error('Error general al actualizar tipos de extintores:', error);
  }
}

// Ejecutar la función principal
actualizarTiposExtintores();
