import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔧 Iniciando servidor de prueba...');

const app = express();
const PORT = process.env.PORT || 9999;

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de prueba ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Prueba: http://localhost:${PORT}/api/test`);
});

console.log('🚀 Servidor de prueba configurado');
