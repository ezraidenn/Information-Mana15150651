# 🧯 FireGuardian - Inventario Inteligente de Extintores Industriales

<div style="text-align: right">
Versión 1.2<br>
Fecha: 4 de agosto de 2025<br>
YCC Extintores
</div>

## 📑 Índice de Documentación

### 📋 Documentación General

| Documento | Descripción | Última Actualización |
|-----------|-------------|----------------------|
| [README.md](./README.md) | Documentación principal del proyecto | 04/08/2025 |
| [ESTADO_ACTUAL.md](./ESTADO_ACTUAL.md) | Estado actual del proyecto, logros y próximos pasos | 04/08/2025 |
| [REQUISITOS.md](./REQUISITOS.md) | Requisitos técnicos, dependencias y configuración | 04/08/2025 |
| [MEJORAS_PENDIENTES.md](./MEJORAS_PENDIENTES.md) | Hoja de ruta de desarrollo con mejoras priorizadas | 04/08/2025 |

### 🎨 Diseño y UI

| Documento | Descripción | Última Actualización |
|-----------|-------------|----------------------|
| [GUIA_ESTILO.md](./GUIA_ESTILO.md) | Guía de estilo, paleta de colores y recursos gráficos | 04/08/2025 |
| [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md) | Sistema de diseño UI completo con especificaciones técnicas | 04/08/2025 |
| [UI_MEJORAS.md](./UI_MEJORAS.md) | Mejoras implementadas en la interfaz de usuario | 04/08/2025 |

### 💻 Componentes y Funcionalidades

| Documento | Descripción | Última Actualización |
|-----------|-------------|----------------------|
| [EXTINTOR_VIRTUAL_LABEL.md](./EXTINTOR_VIRTUAL_LABEL.md) | Documentación del componente de etiqueta virtual | 04/08/2025 |
| [MEJORAS_EXTINTOR_VIRTUAL_LABEL.md](./MEJORAS_EXTINTOR_VIRTUAL_LABEL.md) | Mejoras implementadas en el componente | 04/08/2025 |
| [FORMULARIO_EXTINTORES.md](./FORMULARIO_EXTINTORES.md) | Documentación del formulario con selección en cascada | 04/08/2025 |
| [TOOLTIP_CONTEXT.md](./TOOLTIP_CONTEXT.md) | Sistema global de tooltips | 04/08/2025 |

### 📱 Páginas y Módulos

| Documento | Descripción | Última Actualización |
|-----------|-------------|----------------------|
| [EXTINTORES_PAGE.md](./EXTINTORES_PAGE.md) | Documentación de la página de extintores | 04/08/2025 |
| [USUARIOS_PAGE.md](./USUARIOS_PAGE.md) | Documentación de la página de usuarios | 04/08/2025 |

### 🔌 Integración

| Documento | Descripción | Última Actualización |
|-----------|-------------|----------------------|
| [INTEGRACION_FRONTEND_BACKEND.md](./INTEGRACION_FRONTEND_BACKEND.md) | Documentación de la integración entre frontend y backend | 04/08/2025 |

---

## 🧭 FASE 0: Visión General del Proyecto

### 🎯 Nombre del proyecto:
**FireGuardian** — Inventario inteligente de extintores industriales

### 🧠 Objetivo principal:
Desarrollar una aplicación portable ejecutable con soporte multiplataforma vía navegador, que permita gestionar, registrar, visualizar, monitorear y mantener un inventario actualizado y detallado de extintores en una o varias ubicaciones industriales.

### 💼 Usuarios objetivos:
- Técnicos de mantenimiento industrial
- Personal de brigada de seguridad
- Supervisores de planta o responsables de seguridad
- Auditores y consultores externos

### 📦 Producto esperado:
- App .exe portable
- Interfaz web multiplataforma (vía IP local)
- Base de datos local (SQLite)
- Backup, exportación y trazabilidad incluidos
- Interfaz visual, profesional y accesible

---

## 🛠 FASE 1: Análisis y Recolección de Requisitos

### ✅ Funcionalidades clave (resumen ejecutivo)

| Módulo | Funcionalidad |
|--------|---------------|
| Dashboard | Visualización gráfica de estado, vencimientos, tipos y ubicación de extintores |
| Inventario completo | Listado filtrable, búsqueda avanzada, edición y eliminación |
| Registro de extintores | Alta de nuevos con foto, tipo, ubicación, vencimiento, etc. |
| Vista detallada | Tarjeta con diseño atractivo con toda la información del extintor |
| Próximos a vencer | Filtro automático por fechas críticas |
| Vista por ubicación | Vista organizada jerárquicamente por área/sede |
| Historial de mantenimiento | Registro tipo bitácora por extintor (revisiones, recargas, incidencias) |
| Impresión de etiquetas | Generación de etiquetas QR con datos básicos |
| Navegación móvil | Acceso responsivo desde navegador por IP |
| Backup / Exportación | Copia local cifrada y exportación a Excel / PDF |
| Multiusuario (opcional) | Modo técnico, consulta, auditor (con logs) |

---

## 📊 FASE 2: Diseño de Alto Nivel

### 🔹 2.1 Diagrama de Casos de Uso (UML)

```
               [Usuario]
                   |
        ┌──────────┴────────────┐
        │                      │
Registrar Extintor     Visualizar Dashboard
        │                      │
        ▼                      ▼
Editar / Ver                Ver por Ubicación
        │                      │
        ▼                      ▼
Eliminar                  Ver Vencimientos
        │                      │
        ▼                      ▼
Ver historial           Exportar / Imprimir
```

### 🔹 2.2 Diagrama de Navegación (UX)

```
[Dashboard]
     ├──> [Listado Extintores]
     │        ├──> [Detalles]
     │        │      ├──> [Editar]
     │        │      ├──> [Ver historial]
     │        │      └──> [Eliminar]
     │        └──> [Registrar nuevo]
     ├──> [Por ubicación]
     ├──> [Próximos a vencer]
     ├──> [Historial global]
     ├──> [Impresión / QR]
     └──> [Configuración / Backup]
```

### 🔹 2.3 Modelo de Base de Datos Final — FireGuardian v1.0

#### 📊 Diagrama Entidad-Relación (ERD)

```
[sedes] ──┐
- id (PK)  │
- nombre   │
- direccion│
           │
           ▼
[ubicaciones] ──┐
- id (PK)       │
- nombre_area   │
- descripcion   │
- sede_id (FK)  │
                │
                ▼
[extintores] ◄──┘
- id (PK)
- codigo_interno
- tipo_id (FK)
- descripcion
- ubicacion_id (FK)
- responsable_id (FK)
- fecha_vencimiento
- fecha_mantenimiento
- imagen_path
- creado_en
- actualizado_en
     │
     ├──► [tipos_extintores]
     │    - id (PK)
     │    - nombre
     │    - descripcion
     │    - uso_recomendado
     │    - color_hex
     │    - icono_path
     │
     ├──► [usuarios]
     │    - id (PK)
     │    - nombre
     │    - username
     │    - password_hash
     │    - rol
     │    - activo
     │    - creado_en
     │    - ultimo_login
     │
     └──► [mantenimientos]
          - id (PK)
          - extintor_id (FK)
          - fecha
          - tipo_evento
          - descripcion
          - tecnico_id (FK)
          - evidencia_path
          - creado_en
               │
               └──► [logs] (opcional)
                    - id (PK)
                    - usuario_id (FK)
                    - accion
                    - entidad
                    - entidad_id
                    - timestamp
```

#### 🗄️ Estructura Detallada de Tablas

##### 🔹 1. extintores
Almacena cada extintor físico con relación a su tipo, ubicación y estado general.

```sql
CREATE TABLE extintores (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_interno       TEXT UNIQUE,            -- Opcional: código físico/etiqueta
  tipo_id              TEXT,                   -- FK: tipos_extintores.id
  descripcion          TEXT,
  ubicacion_id         INTEGER,                -- FK: ubicaciones.id
  responsable_id       INTEGER,                -- FK: usuarios.id
  fecha_vencimiento    DATE NOT NULL,
  fecha_mantenimiento  DATE,                   -- Última revisión
  imagen_path          TEXT,
  creado_en            DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tipo_id) REFERENCES tipos_extintores(id),
  FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
  FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
);
```

##### 🔹 2. tipos_extintores
Define metadatos técnicos y visuales de los distintos tipos de extintores.

```sql
CREATE TABLE tipos_extintores (
  id                 TEXT PRIMARY KEY,           -- ej. ABC, CO2, PQS
  nombre             TEXT NOT NULL,              -- Nombre largo
  descripcion        TEXT,
  uso_recomendado    TEXT,                       -- Ej: eléctricos, sólidos...
  color_hex          TEXT,                       -- Para visualización (ej: #FF0000)
  icono_path         TEXT                        -- Ruta a ícono local
);
```

##### 🔹 3. ubicaciones
Define la jerarquía de lugar donde se encuentran los extintores.

```sql
CREATE TABLE ubicaciones (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_area      TEXT NOT NULL,                -- Ej: Almacén Norte
  descripcion      TEXT,
  sede_id          INTEGER,                      -- FK a sedes.id
  FOREIGN KEY (sede_id) REFERENCES sedes(id)
);
```

##### 🔹 4. sedes
Permite estructurar por planta, edificio o ubicación general (multi-sede).

```sql
CREATE TABLE sedes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre           TEXT NOT NULL,                -- Ej: Planta A
  direccion        TEXT
);
```

##### 🔹 5. usuarios
Permite control de roles, acciones y trazabilidad del sistema.

```sql
CREATE TABLE usuarios (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre           TEXT NOT NULL,
  username         TEXT UNIQUE NOT NULL,
  password_hash    TEXT NOT NULL,
  rol              TEXT CHECK(rol IN ('admin', 'tecnico', 'consulta')) NOT NULL,
  activo           BOOLEAN DEFAULT 1,
  creado_en        DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_login     DATETIME
);
```

##### 🔹 6. mantenimientos
Bitácora detallada por extintor, con historial completo.

```sql
CREATE TABLE mantenimientos (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  extintor_id      INTEGER NOT NULL,              -- FK a extintores.id
  fecha            DATE NOT NULL,
  tipo_evento      TEXT NOT NULL,                 -- Ej: inspección, recarga, incidente
  descripcion      TEXT,
  tecnico_id       INTEGER,                       -- FK a usuarios.id
  evidencia_path   TEXT,                          -- Foto o archivo
  creado_en        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (extintor_id) REFERENCES extintores(id),
  FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);
```

##### 🔹 7. logs (opcional futuro)
Registro automático de acciones internas.

```sql
CREATE TABLE logs (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id       INTEGER,
  accion           TEXT,                      -- Ej: editó extintor #5
  entidad          TEXT,                      -- Ej: extintores, usuarios, etc.
  entidad_id       INTEGER,
  timestamp        DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### 🔹 2.4 Arquitectura Técnica

```
             Electron (App .exe)
                  │
   ┌──────────────┼──────────────────┐
   ▼              ▼                  ▼
React UI     Servidor Express     SQLite (DB local)
                  │
          Accesible vía IP (web)
```

---

## 🎨 FASE 3: Diseño UI/UX

### Pantallas a diseñar:
- [ ] Login o entrada directa (modo técnico/consulta)
- [ ] Dashboard con gráficas e indicadores
- [ ] Listado general
- [ ] Vista detallada de extintor (tarjeta)
- [ ] Registro / edición de extintores
- [ ] Historial de mantenimientos
- [ ] Vista por ubicación
- [ ] Filtro de vencimientos
- [ ] Impresión y exportación
- [ ] Configuración / backup

Se diseñarán usando Tailwind CSS o Figma para prototipado, con componentes escalables.

---

## 🔁 FASE 4: Desarrollo

### Fases técnicas:

| Fase | Tarea |
|------|-------|
| 1 | Setup de proyecto: Electron + React + Express + SQLite |
| 2 | Diseño base de datos + persistencia con TypeORM |
| 3 | Rutas internas + servidor web local accesible vía IP |
| 4 | UI de Dashboard con gráficas e indicadores |
| 5 | CRUD de extintores con validación y carga de imágenes |
| 6 | Vista detallada con estilo pro + exportación |
| 7 | Módulo de mantenimiento e historial |
| 8 | Vista por ubicación + filtros inteligentes |
| 9 | Sistema de backup, exportación, etiquetas QR |
| 10 | Pulido UI/UX, pruebas offline y en red local |

---

## ✅ FASE 5: Pruebas, Seguridad y Entrega

- [ ] Validación funcional completa
- [ ] Simulación de pérdida de datos / corrupción
- [ ] Escaneo de red para comprobar acceso desde celular
- [ ] Minificación y empaquetado de .exe
- [ ] Entrega con backup y guía de uso

---

## 🚀 Estado del Proyecto

### Cambios Recientes
- ✅ Implementación del navbar fijo que permanece visible durante el scroll
- ✅ Corrección del manejo de códigos de extintores entre frontend y backend
- ✅ Implementación del sistema global de tooltips con TooltipContext
- ✅ Mejora del overlay de modales para cubrir completamente la pantalla
- ✅ Optimización del formulario de extintores con diseño en dos columnas
- ✅ Implementación de iconos PNG para clases de fuego
- ✅ Actualización completa de la documentación del proyecto

### Estado Actual
- **Backend**: Servidor Express funcionando en puerto 3002, API para tipos de extintores implementada
- **Frontend**: Compila sin errores, componentes principales implementados
- **Páginas Completadas**: 
  - ✅ Extintores (CRUD completo con formularios modales)
  - ✅ Usuarios (Visualización y gestión de usuarios)
  - ✅ Tipos de Extintores (CRUD completo con formularios modales)
  - ⚠️ Mantenimientos (Estructura implementada, pendiente de completar)

### Próximos Pasos
1. **Completar la página de Mantenimientos**
2. **Implementar sistema de alertas para extintores por vencer**
3. **Implementar la página de Ubicaciones**
4. **Mejorar el sistema de reportes y exportación**

### Documentación Actualizada
- [README.md](./README.md) - Documentación general del proyecto
- [USUARIOS_PAGE.md](./USUARIOS_PAGE.md) - Documentación detallada de la página de usuarios
- [EXTINTORES_PAGE.md](./EXTINTORES_PAGE.md) - Documentación detallada de la página de extintores
- [TIPOS_EXTINTORES_PAGE.md](./TIPOS_EXTINTORES_PAGE.md) - Documentación detallada de la página de tipos de extintores
- [UI_MEJORAS.md](./UI_MEJORAS.md) - Mejoras de interfaz de usuario implementadas
- [TOOLTIP_CONTEXT.md](./TOOLTIP_CONTEXT.md) - Sistema global de tooltips
- [INTEGRACION_FRONTEND_BACKEND.md](./INTEGRACION_FRONTEND_BACKEND.md) - Integración entre frontend y backend
- [MEJORAS_PENDIENTES.md](./MEJORAS_PENDIENTES.md) - Lista de mejoras pendientes por módulo
- [GUIA_ESTILO.md](./GUIA_ESTILO.md) - Guía de estilo y recursos gráficos

---

## 📝 Notas de Desarrollo

Este archivo será actualizado conforme avance el desarrollo del proyecto. Cada fase completada será marcada y documentada con detalles específicos de implementación.

---

*Proyecto iniciado: 25 de Julio, 2025*

---

# 🔥 FireGuardian — Planeación y Estructura del Proyecto

## 🌐 1. Información General
**Nombre del proyecto:** FireGuardian  
**Objetivo:** App portable para control, registro y monitoreo de extintores en instalaciones industriales, con interfaz visual profesional y soporte multiplataforma (via navegador local).

## ✅ 2. Características Clave
- Inventario completo de extintores
- Registro con foto, tipo, vencimiento, ubicación
- Dashboard visual con gráficas y alertas
- Vista detallada por extintor con iconografía
- Historial de mantenimientos
- Filtro por ubicación y vencimiento
- Acceso web desde dispositivos en la red local
- Impresión de etiquetas QR y exportación de datos

## 📌 3. Estructura del Proyecto (Carpetas)
```bash
fireguardian-app/
├── backend/                   # Servidor Express y lógica API
│   ├── controllers/
│   ├── models/                # TypeORM / Sequelize models
│   ├── routes/
│   └── database/
│       ├── init.sql          # Script SQL con estructura
│       └── seed.sql          # Datos de prueba
│
├── frontend/                 # App React con Tailwind
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   └── tailwind.config.js
│
├── electron/                 # Bootstrap de Electron y config
│   ├── main.js               # Ventana principal y server
│   └── preload.js
│
├── images/                   # Fotos de extintores
├── backups/                  # Resguardos de la DB
├── qr_codes/                 # Códigos QR generados
├── logs/                     # Archivos de log
│
├── fireguardian.db           # Base de datos SQLite
├── package.json              # Configuración del proyecto
├── README.md
└── .env                      # Variables de entorno
```

## 🔹 4. Fases del Proyecto
| Fase | Nombre                           | Objetivo                                                         |
|------|----------------------------------|------------------------------------------------------------------|
| 0    | Definición y requisitos         | Establecer metas, usuarios y reglas de negocio                   |
| 1    | Modelado y ERD                   | Crear tablas con relaciones y normalización profesional          |
| 2    | Arquitectura y stack             | Electron, React, Express, SQLite                                 |
| 3    | Setup base del proyecto          | Inicialización y estructura de carpetas                         |
| 4    | Registro/extintores              | Crear CRUD completo con validación y carga de imagen            |
| 5    | Dashboard y gráficas             | KPIs y alertas (vencidos, por vencer, etc.)                      |
| 6    | Vistas detalladas y QR           | Tarjeta visual por extintor con exportación e impresión         |
| 7    | Historial de mantenimiento       | Bitácora editable con evidencias y responsable                  |
| 8    | Navegación móvil via IP local    | Acceso desde celular al dashboard                                |
| 9    | Backup/exportación               | Generación de archivos y respaldo automático                    |
| 10   | Pruebas, UI y entrega final      | Pulido visual, validaciones y empaquetado .exe                   |

## 📚 5. Documentación Adicional
- [ ] Diagrama ERD profesional en imagen
- [ ] Diagrama de navegación (flujo de interfaz)
- [ ] Mockups de UI (Figma o React Preview)
- [ ] Scripts SQL de creación de base de datos
- [ ] Guía técnica para instalación y ejecución
- [ ] Lista de validaciones de campos y seguridad

## 🔐 6. Roles y Accesos (si se activa usuarios)
| Rol     | Permisos                                                                 |
|---------|--------------------------------------------------------------------------|
| Admin   | Control total, edición, eliminación, backups                            |
| Técnico | Alta y edición de extintores y mantenimientos                          |
| Consulta| Solo lectura del dashboard y detalles                                   |

## 📍 7. Responsividad Web
- Se diseñará para adaptarse desde escritorio hasta celulares (Tailwind + Flex/Grid)
- Se servirá vía IP local (`http://192.168.x.x:3000`) cuando el ejecutable esté activo
- Se mostrará QR al inicio para facilitar acceso desde otros dispositivos

## 🚀 8. Sugerencias Extra (Opcionales, Avanzadas)

| Extra técnico | Descripción | ¿Incluir? |
|--------------|-------------|------------|
| 🔐 Encriptación local | Encriptar con AES la base SQLite para mayor seguridad | ✅ Recomendado |
| 📤 Exportación Excel/PDF | Generar reportes filtrados desde el dashboard | ✅ Muy útil |
| 🔁 Backup automático | Copia de seguridad del .db local cada X días | ✅ Recomendado |
| 🌐 API externa opcional | Por si se conecta a un sistema central en el futuro | Opcional |
| 🕒 Recordatorios | Alertas visuales o sonoras antes de vencimiento | ✅ Importante |
| 📲 Notificaciones push en red local | Si accedes desde otro dispositivo en LAN | Opcional avanzado |
