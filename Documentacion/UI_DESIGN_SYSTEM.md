# FireGuardian - Sistema de Diseño UI
**Documento de Especificaciones Técnicas**

<div style="text-align: right">
Versión 1.1<br>
Fecha: 4 de agosto de 2025<br>
YCC Extintores
</div>

---

## Índice

1. [Introducción](#1-introducción)
2. [Paleta de Colores](#2-paleta-de-colores)
3. [Tipografía](#3-tipografía)
4. [Componentes UI](#4-componentes-ui)
   - [4.1 Sidebar](#41-sidebar)
   - [4.2 Navbar](#42-navbar)
   - [4.3 Tarjetas](#43-tarjetas)
   - [4.4 Botones](#44-botones)
   - [4.5 Iconos](#45-iconos)
   - [4.6 Tooltips](#46-tooltips)
5. [Layout y Espaciado](#5-layout-y-espaciado)
6. [Responsividad](#6-responsividad)
7. [Animaciones y Transiciones](#7-animaciones-y-transiciones)
8. [Accesibilidad](#8-accesibilidad)
9. [Estado de Implementación](#9-estado-de-implementación)

---

## 1. Introducción

Este documento define las especificaciones técnicas y estándares de diseño para la interfaz de usuario de FireGuardian, el sistema de gestión de extintores desarrollado para YCC Extintores. El objetivo es mantener una coherencia visual y funcional en toda la aplicación, facilitando el desarrollo y mantenimiento del producto.

---

## 2. Paleta de Colores

### 2.1 Colores Primarios

| Nombre | Valor Hex | Uso |
|--------|-----------|-----|
| Primary Main | `#DC2626` | Elementos principales, botones de acción primaria |
| Primary Light | `#EF4444` | Hover states, backgrounds secundarios |
| Primary Dark | `#B91C1C` | Bordes, texto sobre fondos claros |

### 2.2 Colores Secundarios

| Nombre | Valor Hex | Uso |
|--------|-----------|-----|
| Secondary Main | `#1E3A8A` | Headers, barras de navegación |
| Secondary Light | `#3B82F6` | Hover states, backgrounds terciarios |
| Secondary Dark | `#1E40AF` | Bordes, separadores |

### 2.3 Colores de Fondo

| Nombre | Valor Hex | Uso |
|--------|-----------|-----|
| Background Main | `#F9FAFB` | Fondo principal de la aplicación |
| Background Paper | `#FFFFFF` | Fondo de tarjetas y paneles |
| Background Light | `#F3F4F6` | Áreas de contenido destacadas |

### 2.4 Colores de Texto

| Nombre | Valor Hex | Uso |
|--------|-----------|-----|
| Text Primary | `#1F2937` | Texto principal |
| Text Secondary | `#4B5563` | Texto secundario, subtítulos |
| Text Disabled | `#9CA3AF` | Texto deshabilitado |

### 2.5 Colores de Estado

| Nombre | Valor Hex | Uso |
|--------|-----------|-----|
| Success | `#10B981` | Confirmaciones, estados positivos |
| Warning | `#F59E0B` | Advertencias, alertas |
| Error | `#EF4444` | Errores, estados críticos |
| Info | `#3B82F6` | Información, estados neutrales |

---

## 3. Tipografía

### 3.1 Fuentes

- **Principal**: Inter (Sans-serif)
- **Secundaria**: System UI fallback

### 3.2 Tamaños de Fuente

| Nombre | Tamaño | Peso | Uso |
|--------|--------|------|-----|
| Heading 1 | 2rem (32px) | 700 | Títulos principales |
| Heading 2 | 1.5rem (24px) | 700 | Subtítulos |
| Heading 3 | 1.25rem (20px) | 600 | Títulos de sección |
| Body 1 | 1rem (16px) | 400 | Texto principal |
| Body 2 | 0.875rem (14px) | 400 | Texto secundario |
| Caption | 0.75rem (12px) | 400 | Etiquetas, pies de foto |
| Button | 0.875rem (14px) | 500 | Texto en botones |

---

## 4. Componentes UI

### 4.1 Sidebar

#### Dimensiones
- **Ancho expandido**: 16rem (256px)
- **Ancho colapsado**: 4rem (64px)
- **Altura**: 100vh

#### Estilos
- **Color de fondo**: Secondary Main (`#1E3A8A`)
- **Color de texto**: White (`#FFFFFF`)
- **Sombra**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Borde derecho**: `1px solid rgba(0, 0, 0, 0.1)`

#### Estados
- **Default**: Colapsado en pantallas grandes, oculto en móviles
- **Hover**: Expandido automáticamente en pantallas grandes
- **Móvil**: Drawer deslizable con overlay

#### Comportamiento
- Se expande al pasar el cursor por encima en pantallas grandes
- En móviles, se muestra como un drawer que se abre al pulsar el botón de menú
- Transición suave de 300ms para cambios de estado

### 4.2 Navbar

#### Dimensiones
- **Altura**: 3.5rem (56px)
- **Padding horizontal**: 1rem (16px) en móvil, 2rem (32px) en desktop
- **Posición**: Fija en la parte superior

#### Estilos
- **Color de fondo**: Secondary Main (`#1E3A8A`)
- **Color de texto**: White (`#FFFFFF`)
- **Sombra**: `0 2px 4px rgba(0, 0, 0, 0.1)`
- **Borde inferior**: `1px solid rgba(0, 0, 0, 0.1)`
- **Ancho**: Responsive, se ajusta al estado del sidebar

#### Elementos
- **Logo**: Altura 40px, alineado a la izquierda
- **Buscador**: Campo de búsqueda central (oculto en móvil)
- **Menú usuario**: Dropdown a la derecha
- **Notificaciones**: Icono con badge a la derecha

### 4.3 Tarjetas

#### Dimensiones
- **Padding interno**: 1rem (16px) en móvil, 1.5rem (24px) en desktop
- **Border radius**: 0.75rem (12px)

#### Estilos
- **Color de fondo**: Background Paper (`#FFFFFF`)
- **Borde**: `1px solid rgba(0, 0, 0, 0.1)`
- **Sombra**: `0 2px 8px rgba(0, 0, 0, 0.05)`

#### Variantes
- **Estándar**: Para contenido general
- **Destacada**: Con borde de color primario
- **Estadística**: Para mostrar KPIs y métricas

### 4.4 Botones

#### Dimensiones
- **Altura**: 2.5rem (40px)
- **Padding horizontal**: 1rem (16px)
- **Border radius**: 0.375rem (6px)

#### Variantes

| Variante | Fondo | Texto | Borde | Hover |
|----------|-------|-------|-------|-------|
| Primary | Primary Main | White | None | Primary Dark |
| Secondary | Transparent | Primary Main | Primary Main | Background tinted |
| Text | Transparent | Text Primary | None | Background tinted |
| Icon | Transparent | Current color | None | Background tinted |

#### Estados
- **Default**: Estado normal
- **Hover**: Cambio de color/opacidad
- **Active**: Ligera reducción de escala (0.98)
- **Disabled**: Opacidad reducida (0.6)

### 4.5 Iconos

#### Tamaños
- **Pequeño**: 1rem (16px)
- **Medio**: 1.25rem (20px)
- **Grande**: 1.5rem (24px)

#### Biblioteca
- Lucide Icons (React)

#### Uso de iconos por sección
| Sección | Icono | Tamaño |
|---------|-------|--------|
| Dashboard | Home | Medio |
| Extintores | Shield | Medio |
| Mantenimientos | Wrench | Medio |
| Usuarios | Users | Medio |
| Reportes | FileText | Medio |
| Configuración | Settings | Medio |
| Notificaciones | Bell | Medio |
| Búsqueda | Search | Medio |
| Menú | Menu | Medio |
| Cerrar sesión | LogOut | Medio |

### 4.6 Tooltips

#### Dimensiones
- **Padding**: 0.5rem (8px)
- **Border radius**: 0.25rem (4px)
- **Flecha**: 6px

#### Estilos
- **Color de fondo**: Background Paper (`#FFFFFF`)
- **Borde**: `1px solid rgba(0, 0, 0, 0.1)`
- **Sombra**: `0 2px 8px rgba(0, 0, 0, 0.1)`
- **Color de texto**: Text Primary (`#1F2937`)

#### Comportamiento
- Aparece al hacer hover sobre el elemento
- Desaparece al quitar el hover
- Solo un tooltip visible a la vez (sistema global)
- Transición suave de 150ms

---

## 5. Layout y Espaciado

### 5.1 Grid System

- **Columnas**: 12 columnas
- **Gutters**: 0.5rem (8px) en móvil, 1rem (16px) en desktop
- **Contenedor**: 98-99% del ancho disponible

### 5.2 Espaciado

Sistema de espaciado basado en múltiplos de 4px, reducido para maximizar el área de contenido:

| Nombre | Valor | Uso |
|--------|-------|-----|
| xs | 0.25rem (4px) | Espaciado mínimo, separación de iconos |
| sm | 0.5rem (8px) | Espaciado pequeño, padding interno de elementos compactos |
| md | 0.75rem (12px) | Espaciado estándar, margen entre elementos relacionados |
| lg | 1rem (16px) | Espaciado grande, separación entre secciones |
| xl | 1.5rem (24px) | Espaciado extra grande, márgenes de página |
| 2xl | 2rem (32px) | Espaciado máximo, separación entre bloques principales |

### 5.3 Breakpoints

| Nombre | Ancho mínimo | Descripción |
|--------|--------------|-------------|
| xs | 0px | Móviles pequeños |
| sm | 640px | Móviles grandes |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Pantallas grandes |

---

## 6. Responsividad

### 6.1 Estrategia Mobile-First

La aplicación está diseñada siguiendo una estrategia mobile-first, adaptándose progresivamente a pantallas más grandes.

### 6.2 Comportamiento por Breakpoint

| Componente | Móvil (< 768px) | Tablet (768-1023px) | Desktop (≥ 1024px) |
|------------|-----------------|---------------------|-------------------|
| Sidebar | Drawer con overlay | Drawer con overlay | Colapsado, expandible al hover |
| Navbar | Simplificado, sin buscador | Completo | Completo, fijo |
| Grid | 1 columna | 2 columnas | 3-4 columnas |
| Tarjetas | 100% ancho | 50% ancho | 33% ancho |
| Tablas | Scroll horizontal | Responsive | Completa |
| Formularios | 1 columna | 1-2 columnas | 2 columnas |

---

## 7. Animaciones y Transiciones

### 7.1 Duraciones

- **Rápida**: 150ms (hover, focus)
- **Media**: 300ms (expansiones, colapsados)
- **Lenta**: 500ms (entradas, salidas)

### 7.2 Curvas de Aceleración

- **Estándar**: `ease-in-out`
- **Entrada**: `ease-out`
- **Salida**: `ease-in`
- **Enfática**: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`

### 7.3 Animaciones Comunes

| Elemento | Animación | Duración | Curva |
|----------|-----------|----------|-------|
| Sidebar | Expansión/colapso | 300ms | ease-in-out |
| Página | Fade in | 300ms | ease-out |
| Modal | Scale + fade | 300ms | ease-out |
| Botones | Scale | 150ms | ease-out |
| Tooltips | Fade | 150ms | ease-out |

---

## 8. Accesibilidad

### 8.1 Contraste

Todos los textos cumplen con WCAG 2.1 AA:
- Texto normal: contraste mínimo 4.5:1
- Texto grande: contraste mínimo 3:1

### 8.2 Navegación por Teclado

- Todos los elementos interactivos son accesibles mediante teclado
- Focus visible para todos los elementos interactivos
- Orden de tabulación lógico

### 8.3 Semántica

- Uso adecuado de elementos HTML semánticos
- ARIA labels donde sea necesario
- Textos alternativos para imágenes

---

## 9. Estado de Implementación

### 9.1 Componentes Implementados

| Componente | Estado | Observaciones |
|------------|--------|--------------|
| AppLayout | Completado | Incluye sidebar y navbar fijo |
| ThemeContext | Completado | Sistema global de temas |
| Dashboard | Completado | Estadísticas y métricas |
| Extintores | Completado | CRUD completo, vista de tarjetas |
| Mantenimientos | En desarrollo | Estructura básica implementada |
| Usuarios | Completado | CRUD completo |
| Reportes | Pendiente | - |
| Configuración | Pendiente | - |
| TooltipContext | Completado | Sistema global de tooltips |
| Formularios | Completado | Diseño en dos columnas |

### 9.2 Mejoras Implementadas

- Navbar fijo con ancho adaptativo
- Tooltips globales con sistema de contexto
- Iconos PNG para clases de fuego
- Formularios en dos columnas para mejor aprovechamiento del espacio
- Overlay modal mejorado para evitar interacción con elementos de fondo

### 9.3 Próximas Actualizaciones

- Implementación de temas oscuro/claro
- Mejoras de accesibilidad
- Sistema de notificaciones
- Generación de códigos QR
- Exportación a Excel/PDF

---

<div style="text-align: center; margin-top: 50px; color: #666;">
<p>© 2025 YCC Extintores - FireGuardian</p>
<p>Documento confidencial para uso interno</p>
</div>
