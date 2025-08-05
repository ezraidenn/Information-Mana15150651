// Archivo de prueba para verificar la conexión con el backend
console.log('Iniciando prueba de API...');

// URL de la API desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9999';
console.log(`URL de la API: ${API_URL}`);

// Función para probar la conexión
async function testApiConnection() {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data;
  } catch (error) {
    console.error('Error al conectar con el API:', error);
    return { error: error.message };
  }
}

// Exportar la función para usarla en otros archivos
export { testApiConnection };
