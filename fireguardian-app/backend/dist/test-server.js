"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
console.log('🔧 Iniciando servidor de prueba...');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 9999;
// Configurar CORS
app.use((0, cors_1.default)({
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
//# sourceMappingURL=test-server.js.map