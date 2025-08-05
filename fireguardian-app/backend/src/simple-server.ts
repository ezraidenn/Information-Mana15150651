console.log('🔧 Iniciando servidor simple...');

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

console.log('📦 Configurando middleware...');

// Middleware básico
app.use(cors());
app.use(express.json());

console.log('🛣️ Configurando rutas...');

// Ruta de prueba
app.get('/api/health', (req, res) => {
  console.log('📞 Solicitud recibida en /api/health');
  res.json({ 
    success: true, 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  console.log('📞 Solicitud recibida en /api/test');
  res.json({ 
    message: 'API funcionando', 
    timestamp: new Date().toISOString() 
  });
});

console.log('🚀 Iniciando servidor...');

const server = app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
});

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
});

console.log('✨ Configuración completa');

// Mantener el proceso vivo
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close();
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  server.close();
});
