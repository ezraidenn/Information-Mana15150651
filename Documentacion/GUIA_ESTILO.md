# Guía de Estilo FireGuardian

*Actualizado: 4 de Agosto, 2025*

## Identidad Visual

La identidad visual de FireGuardian se basa en los elementos de diseño proporcionados por YCC Extintores, incluyendo su logo oficial y una paleta de colores específica que refleja la naturaleza del negocio de seguridad contra incendios.

## Sistema de Temas

FireGuardian implementa un sistema centralizado de temas que permite mantener una apariencia visual consistente en toda la aplicación y facilita los cambios futuros en la identidad visual.

### Estructura del Sistema de Temas

- **theme.ts**: Archivo central de configuración que define todos los aspectos visuales de la aplicación
- **ThemeContext.tsx**: Contexto React para acceder y modificar el tema desde cualquier componente
- **ThemeApplier.tsx**: Componente que aplica las variables CSS definidas en el tema
- **global.css**: Define las variables CSS y estilos globales
- **assets.ts**: Configuración centralizada de recursos gráficos

### Administración del Tema

La aplicación incluye una página de administración del tema accesible en `/configuracion/tema` que permite:

- Cambiar los colores primarios y secundarios
- Actualizar el logo
- Visualizar los cambios en tiempo real

## Logo

El logo oficial se encuentra en la siguiente ubicación:
`c:\Users\raulc\Documents\Proyecto YCC Extintores\Diseño\Paleta de colores\Logos\Countryclub-500x500px logo - icono blanco.png`

Este logo debe ser utilizado en todas las interfaces de usuario principales, incluyendo:
- Pantalla de inicio de sesión
- Barra de navegación
- Reportes generados
- Documentación oficial

## Paleta de Colores

La paleta de colores oficial de FireGuardian se basa en las imágenes proporcionadas en:
`c:\Users\raulc\Documents\Proyecto YCC Extintores\Diseño\Paleta de colores\`

### Colores Principales

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo Principal | #DC2626 | Color primario, botones de acción principal, alertas |
| Azul Oscuro | #1E3A8A | Encabezados, barras de navegación |
| Gris Oscuro | #1F2937 | Texto principal |
| Blanco | #FFFFFF | Fondos, texto sobre colores oscuros |

### Colores Secundarios

| Color | Hex | Uso |
|-------|-----|-----|
| Amarillo | #F59E0B | Advertencias, notificaciones |
| Verde | #10B981 | Éxito, confirmaciones |
| Gris Claro | #F3F4F6 | Fondos secundarios, bordes |

## Tipografía

- **Títulos principales**: Inter Bold
- **Subtítulos**: Inter SemiBold
- **Texto normal**: Inter Regular
- **Tamaños**:
  - Títulos: 24px - 32px
  - Subtítulos: 18px - 22px
  - Texto normal: 14px - 16px
  - Texto pequeño: 12px

## Guía para Desarrolladores

### Uso del Sistema de Temas

#### Acceso al Tema

```tsx
import { useTheme } from '@/theme/ThemeContext';

const MyComponent: React.FC = () => {
  const { theme } = useTheme();
  
  // Ahora puedes acceder a theme.colors, theme.typography, etc.
  return <div>...</div>;
};
```

#### Uso de Variables CSS

En lugar de usar colores hardcodeados, utiliza las variables CSS definidas en el tema:

```css
/* Incorrecto */
.my-element {
  color: #DC2626;
  background-color: #F3F4F6;
}

/* Correcto */
.my-element {
  color: var(--color-primary-main);
  background-color: var(--color-bg-light);
}
```

#### Uso del Componente Logo

```tsx
import Logo from '@/components/common/Logo';

// Logo por defecto
<Logo />

// Logo blanco (para fondos oscuros)
<Logo variant="white" />

// Logo pequeño (icono)
<Logo variant="small" />

// Con clases personalizadas
<Logo className="my-custom-class" />
```

#### Actualización del Tema

```tsx
import { useTheme } from '@/theme/ThemeContext';

const ThemeUpdater: React.FC = () => {
  const { updateTheme } = useTheme();
  
  const handleUpdateTheme = () => {
    updateTheme({
      colors: {
        primary: {
          main: '#FF0000', // Nuevo color primario
        },
      },
    });
  };
  
  return <button onClick={handleUpdateTheme}>Actualizar Tema</button>;
};
```

## Componentes UI

### Botones

- **Botón primario**: Fondo rojo (#DC2626), texto blanco, bordes redondeados (8px)
- **Botón secundario**: Borde gris, texto gris oscuro, fondo transparente
- **Botón de éxito**: Fondo verde (#10B981), texto blanco
- **Botón de peligro**: Fondo rojo oscuro (#B91C1C), texto blanco

### Tarjetas

- Fondo blanco
- Sombra suave
- Bordes redondeados (12px)
- Padding interno de 16px - 24px

### Formularios

- Campos con bordes ligeros
- Etiquetas en la parte superior
- Mensajes de error en rojo debajo del campo
- Indicadores de campo requerido con asterisco rojo
- Formularios en dos columnas para mejor aprovechamiento del espacio

### Tooltips

- Fondo blanco con borde ligero
- Sombra suave
- Texto oscuro
- Flecha indicadora de origen
- Transición suave al mostrar/ocultar

## Iconografía

Se utiliza la biblioteca Lucide React para iconos consistentes en toda la aplicación.

Para las clases de fuego se utilizan iconos PNG personalizados ubicados en:
`/frontend/src/assets/icons/fire-classes/`

## Implementación en el Código

La implementación de estos estilos se realiza principalmente a través de:

1. **Tailwind CSS**: Configuración personalizada en `tailwind.config.js`
2. **Variables CSS**: Definidas en archivos globales de estilos
3. **Componentes reutilizables**: Que implementan estos estilos de manera consistente

## Preferencias de Diseño

Siguiendo las preferencias del usuario:

1. **Sidebar**: Minimalista que se expande al pasar el cursor
2. **Espacios**: Reducidos para maximizar el área de contenido
3. **Simetría**: Visual entre el lado izquierdo y derecho
4. **Scrollbars**: Evitar scrollbars horizontales
5. **Contenido principal**: Que ocupe casi todo el ancho disponible (98-99%)
6. **Paddings y márgenes**: Pequeños para aprovechar el espacio
7. **Transiciones**: Suaves entre estados del sidebar

## Recomendaciones para Desarrolladores

- Utilizar siempre los componentes predefinidos para mantener consistencia
- No modificar la paleta de colores sin aprobación
- Asegurar que todas las interfaces nuevas sigan esta guía de estilo
- Mantener la accesibilidad (contraste, tamaños de texto) en todas las interfaces
- Seguir las preferencias de diseño establecidas

---

*Esta guía de estilo debe ser seguida por todos los desarrolladores que trabajen en el proyecto FireGuardian para mantener una experiencia de usuario coherente y profesional.*
