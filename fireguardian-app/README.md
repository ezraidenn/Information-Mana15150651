# 🔥 FireGuardian - Sistema de Inventario de Extintores

Sistema profesional de gestión de inventario para extintores industriales desarrollado para YCC Extintores.

**Última actualización:** 2 de agosto de 2025

## 🔍 Estado del Proyecto

### 🚧 Cambios Recientes (Agosto 2025)
- **Mejora en formulario de extintores**
  - ✅ Implementada selección en cascada de sede y ubicación
  - ✅ Campo de ubicación inicialmente deshabilitado hasta seleccionar sede
  - ✅ Filtrado automático de ubicaciones según sede seleccionada
  - ✅ Preselección automática de sede al editar extintores existentes
  - ✅ Corrección de errores de TypeScript en componentes relacionados
  - ✅ Documentación completa del formulario creada (ver FORMULARIO_EXTINTORES.md)

- **Mejoras en componente ExtintorVirtualLabel**
  - ✅ Corregido comportamiento inconsistente de tooltips
  - ✅ Implementado sistema de modos para tooltips ('hover' | 'click')
  - ✅ Mejorada la experiencia de usuario con tiempos de espera optimizados
  - ✅ Corregidos errores de sintaxis y TypeScript
  - ✅ Documentación completa del componente creada

### 🚧 Cambios Anteriores (Julio 2025)
- **Correcciones de autenticación**
  - ✅ Solucionado problema de campos inconsistentes en login (email vs username)
  - ✅ Mejorado sistema de logging para depuración de autenticación
  - ✅ Corregida inicialización de usuarios en base de datos
- **Mejoras de configuración**
  - ✅ Implementación de variables de entorno (.env) en backend y frontend
  - ✅ Eliminados valores hardcodeados de puertos y URLs
  - ✅ Configuración flexible de puertos para evitar conflictos
- **Correcciones de la página de usuarios**
  - ✅ Solucionado problema de carga de usuarios en UsuariosPage
  - ✅ Corregida estructura de datos en la respuesta de la API
  - ✅ Mejorado manejo de filtros y paginación
  - ✅ Optimizado rendimiento con React Query

### ✅ Completado
- **Backend API** (Node.js + Express + TypeORM + SQLite)
  - ✅ Modelos de base de datos (7 tablas)
  - ✅ Controladores principales (Auth, Dashboard, Extintores, Usuarios, Ubicaciones)
  - ✅ Middleware de seguridad y validación
  - ✅ Sistema de autenticación JWT
  - ✅ Logging automático de acciones
  - ✅ Rutas API completas

- **Frontend Web** (React + TypeScript + Tailwind CSS)
  - ✅ Configuración base con Vite
  - ✅ Sistema de autenticación
  - ✅ Componentes UI reutilizables
  - ✅ Layout principal con sidebar
  - ✅ Páginas principales (Login, Dashboard)
  - ✅ Cliente API con React Query
  - ✅ Manejo de estado global
  - ✅ Sistema de temas global con paleta de colores corporativa
  - ✅ Implementación de logo oficial y recursos gráficos

### 🚧 En Desarrollo
- **Páginas de gestión**
  - ✅ Extintores (completado)
  - ✅ Usuarios (completado)
  - 🚧 Mantenimientos (en progreso)
  - ⏳ Ubicaciones (pendiente)
  - ⏳ Reportes (pendiente)
- **Funcionalidades avanzadas**
  - 🚧 Formularios dinámicos con validación
  - ⏳ Sistema de QR codes
  - ⏳ Exportación a Excel/PDF
  - ⏳ Personalización dinámica de temas
  - ⏳ Implementación de modo oscuro

### 📖 Documentación

Toda la documentación del proyecto ha sido consolidada en la carpeta `Documentacion` para facilitar su acceso y mantenimiento.

#### Índices de Documentación:
- **Índice General**: `Documentacion/README.md` - Índice completo de todos los documentos disponibles
- **Índice Técnico**: `Documentacion/INDICE_TECNICO.md` - Documentación técnica organizada por categorías

#### Documentos Principales:
- **Estado Actual**: `Documentacion/ESTADO_ACTUAL.md` - Resumen ejecutivo del estado del proyecto
- **Guía de Estilo**: `Documentacion/GUIA_ESTILO.md` - Identidad visual y paleta de colores
- **Sistema de Diseño UI**: `Documentacion/UI_DESIGN_SYSTEM.md` - Especificaciones técnicas de la interfaz
- **Requisitos**: `Documentacion/REQUISITOS.md` - Dependencias y configuración
- **Mejoras Pendientes**: `Documentacion/MEJORAS_PENDIENTES.md` - Hoja de ruta de desarrollo

#### Documentación de Componentes:
- **ExtintorVirtualLabel**: `Documentacion/EXTINTOR_VIRTUAL_LABEL.md` y `Documentacion/MEJORAS_EXTINTOR_VIRTUAL_LABEL.md`
- **Formulario de Extintores**: `Documentacion/FORMULARIO_EXTINTORES.md`
- **Sistema de Tooltips**: `Documentacion/TOOLTIP_CONTEXT.md`

#### Documentación de Páginas:
- **Extintores**: `Documentacion/EXTINTORES_PAGE.md`
- **Usuarios**: `Documentacion/USUARIOS_PAGE.md`

#### Integración:
- **Frontend-Backend**: `Documentacion/INTEGRACION_FRONTEND_BACKEND.md`

## 📋 Requisitos del Sistema

- **Node.js** 18.0 o superior
- **npm** 9.0 o superior
- **Windows** 10/11 (para ejecución local)

## 🛠️ Instalación Rápida

### 1. Clonar e instalar dependencias

```bash
# Navegar al directorio del proyecto
cd "c:\Users\raulc\Documents\Proyecto YCC Extintores\fireguardian-app"

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ..\frontend
npm install
```

### 2. Iniciar la aplicación

**Opción A: Script automático (Windows)**
```bash
# Desde la carpeta raíz del proyecto
start.bat
```

**Opción B: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Documentación**: Ver archivos README en cada carpeta

## 👥 Usuarios de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|---------|
| Admin | admin@fireguardian.com | admin123 | Completos |
| Técnico | tecnico@fireguardian.com | tecnico123 | Gestión operativa |
| Consulta | consulta@fireguardian.com | consulta123 | Solo lectura |

**Nota:** El sistema utiliza el campo `email` para la autenticación de usuarios.

## 🏗️ Arquitectura del Sistema

```
fireguardian-app/
├── backend/                 # API REST con Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos de datos (TypeORM)
│   │   ├── routes/          # Rutas de la API
│   │   ├── middleware/      # Validación y seguridad
│   │   └── utils/           # Utilidades
│   └── package.json
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilidades y API client
│   │   └── types/           # Tipos TypeScript
│   └── package.json
├── electron/                # Empaquetado desktop (futuro)
├── database/                # Base de datos SQLite
├── uploads/                 # Archivos subidos
└── logs/                    # Logs del sistema
```

## 🔧 Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeORM** - ORM para base de datos
- **SQLite** - Base de datos embebida
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **TypeScript** - Tipado estático

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Framework de CSS
- **Framer Motion** - Animaciones
- **React Query** - Estado del servidor
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

## 📊 Base de Datos

### Tablas Principales
1. **usuarios** - Gestión de usuarios y roles
2. **sedes** - Ubicaciones principales
3. **ubicaciones** - Áreas específicas dentro de sedes
4. **tipos_extintores** - Clasificación de extintores
5. **extintores** - Inventario principal
6. **mantenimientos** - Historial de mantenimientos
7. **logs** - Auditoría del sistema

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Validación de entrada de datos
- ✅ Rate limiting
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado
- ✅ Logging de acciones

## 🚀 Funcionalidades Principales

### Completadas
- [x] Sistema de login con roles
- [x] Dashboard con estadísticas
- [x] Gestión básica de usuarios
- [x] CRUD de sedes y ubicaciones
- [x] API REST completa
- [x] Interfaz responsive

### En Desarrollo
- [ ] Gestión completa de extintores
- [ ] Sistema de mantenimientos
- [ ] Generación de reportes
- [ ] Códigos QR
- [ ] Exportación Excel/PDF
- [ ] Sistema de alertas
- [ ] Backup automático

## 📱 Características de la UI

- **Diseño Moderno**: Interfaz limpia y profesional basada en la identidad visual de YCC Extintores
- **Responsive**: Adaptable a móviles, tablets y desktop
- **Animaciones**: Transiciones suaves con Framer Motion
- **Accesibilidad**: Componentes accesibles
- **Tema Personalizado**: Implementación de la paleta de colores oficial y logo de YCC Extintores

### 🎨 Guía de Estilo

El proyecto cuenta con una guía de estilo completa que define:
- Paleta de colores oficial
- Uso del logo corporativo
- Tipografía
- Componentes UI estandarizados

Consulta el archivo [GUIA_ESTILO.md](./GUIA_ESTILO.md) para más detalles sobre la implementación visual.

Los recursos gráficos oficiales (logo y paleta de colores) se encuentran en:
`c:\Users\raulc\Documents\Proyecto YCC Extintores\Diseño\Paleta de colores\`

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/change-password` - Cambiar contraseña

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/recent-activity` - Actividad reciente
- `GET /api/dashboard/alerts` - Alertas del sistema

### Extintores
- `GET /api/extintores` - Listar extintores
- `POST /api/extintores` - Crear extintor
- `PUT /api/extintores/:id` - Actualizar extintor
- `DELETE /api/extintores/:id` - Eliminar extintor

### Usuarios (Solo Admin)
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Ubicaciones
- `GET /api/sedes` - Listar sedes
- `GET /api/ubicaciones` - Listar ubicaciones
- `POST /api/sedes` - Crear sede
- `POST /api/ubicaciones` - Crear ubicación

## 📝 Desarrollo

### Scripts Disponibles

**Backend:**
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilar TypeScript
npm run start    # Producción
npm run lint     # Linting
```

**Frontend:**
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview de producción
npm run lint     # Linting
```

### Variables de Entorno

**Backend (.env):**
```env
PORT=12345
JWT_SECRET=your-secret-key
DB_PATH=../fireguardian.db
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:12345
VITE_APP_NAME=FireGuardian
```

## 🐛 Debugging

### Logs del Sistema
- Backend: `./logs/app.log`
- Errores: `./logs/error.log`
- Acciones: Tabla `logs` en la base de datos

### Herramientas de Desarrollo
- React DevTools (Frontend)
- React Query DevTools (Estado del servidor)
- TypeScript compiler (Verificación de tipos)

## 📦 Deployment

### Desarrollo Local
1. Ejecutar `start.bat` o comandos manuales
2. Acceder a http://localhost:5173

### Producción (Futuro)
- Build del frontend: `npm run build`
- Empaquetado con Electron
- Instalador .exe para Windows

## 🤝 Contribución

1. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- **Desarrollador**: Equipo de TI, MIT
- **Cliente**: YCC
- **Documentación**: Ver carpeta `Documentacion/`

## 📄 Licencia

Este proyecto es propiedad de YCC. Todos los derechos reservados.

---

**Desarrollado con ❤️ para YCC**

*Sistema FireGuardian v1.0.0 - 2024*
