# Requisitos del Sistema FireGuardian

*Actualizado: 4 de Agosto, 2025*

## Requisitos de Sistema

- **Node.js**: v18.0 o superior
- **npm**: v9.0 o superior
- **Sistema Operativo**: Windows 10/11 (recomendado)
- **Navegador**: Chrome, Firefox, Edge (versiones recientes)
- **Espacio en disco**: Mínimo 500MB para la aplicación y base de datos

## Dependencias Backend

### Principales
- **express**: ^4.18.2 - Framework web
- **typeorm**: ^0.3.17 - ORM para base de datos
- **sqlite3**: ^5.1.6 - Base de datos embebida
- **bcryptjs**: ^2.4.3 - Encriptación de contraseñas
- **jsonwebtoken**: ^9.0.2 - Autenticación JWT
- **cors**: ^2.8.5 - Manejo de CORS
- **helmet**: ^7.1.0 - Seguridad HTTP
- **morgan**: ^1.10.0 - Logging de solicitudes HTTP
- **multer**: ^1.4.5-lts.1 - Manejo de archivos
- **express-rate-limit**: ^7.1.5 - Limitación de solicitudes
- **compression**: ^1.7.4 - Compresión de respuestas
- **qrcode**: ^1.5.3 - Generación de códigos QR
- **exceljs**: ^4.4.0 - Exportación a Excel
- **pdfkit**: ^0.13.0 - Generación de PDF
- **node-cron**: ^3.0.3 - Tareas programadas

### Desarrollo
- **typescript**: ^5.3.3
- **ts-node**: ^10.9.2
- **nodemon**: ^3.0.2
- **@types/express**: ^4.17.21
- **@types/cors**: ^2.8.17
- **@types/morgan**: ^1.9.9
- **@types/bcryptjs**: ^2.4.6
- **@types/jsonwebtoken**: ^9.0.5
- **@types/multer**: ^1.4.11

## Dependencias Frontend

### Principales
- **react**: ^18.2.0
- **react-dom**: ^18.2.0
- **react-router-dom**: ^6.20.1
- **@tanstack/react-query**: ^5.8.4
- **axios**: ^1.6.2
- **framer-motion**: ^10.16.16
- **tailwindcss**: ^3.3.6
- **date-fns**: ^4.1.0
- **lucide-react**: ^0.294.0
- **react-hot-toast**: ^2.4.1

### Desarrollo
- **typescript**: ^5.2.2
- **vite**: ^5.0.0
- **@vitejs/plugin-react**: ^4.1.1
- **@types/react**: ^18.2.37
- **@types/react-dom**: ^18.2.15
- **autoprefixer**: ^10.4.16
- **postcss**: ^8.4.32

## Configuración de Variables de Entorno

### Backend (.env)
```
PORT=3002
JWT_SECRET=your-secret-key
DB_PATH=../fireguardian.db
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3002
VITE_APP_NAME=FireGuardian
```

## Cambios Recientes (Agosto 2025)

### Correcciones de Autenticación
- Solucionado problema de campos inconsistentes en login (email vs username)
- Mejorado sistema de logging para depuración de autenticación
- Corregida inicialización de usuarios en base de datos

### Mejoras de Configuración
- Implementación de variables de entorno (.env) en backend y frontend
- Eliminados valores hardcodeados de puertos y URLs
- Configuración flexible de puertos para evitar conflictos (actualizado a puerto 3002)

### Mejoras de UI
- Implementado navbar fijo
- Mejorado sistema de tooltips global
- Optimizado formulario de extintores en dos columnas
- Actualizados iconos de clases de fuego a PNG

## Instrucciones de Instalación

1. Clonar el repositorio
2. Configurar archivos .env en backend y frontend
3. Instalar dependencias:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Iniciar servidores:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

## Notas Importantes

- El sistema utiliza el campo `email` para la autenticación de usuarios
- La base de datos SQLite se crea automáticamente en la primera ejecución
- Se inicializan datos de prueba en modo desarrollo
- Para producción, cambiar NODE_ENV a "production" en el archivo .env del backend
- El puerto predeterminado del backend es 3002 para evitar conflictos con otros servicios
