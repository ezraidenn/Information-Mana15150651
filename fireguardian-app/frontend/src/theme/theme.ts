/**
 * Configuración global de tema para FireGuardian
 * Este archivo centraliza todos los valores de diseño para facilitar cambios futuros
 */

export const theme = {
  // Colores principales según la paleta oficial
  colors: {
    primary: {
      main: '#B7BD31',      // Uni. of California Gold
      light: '#E0D1B7',     // Flax
      dark: '#8D531B',      // Russet
      contrast: '#FFFFFF',  // Color de texto sobre primary
    },
    secondary: {
      main: '#B1A66E',      // Misty Moss
      light: '#CEC6A5',     // Tono claro
      dark: '#413515',      // Pullman Green
      contrast: '#FFFFFF',  // Color de texto sobre secondary
    },
    text: {
      primary: '#2C251D',   // Texto principal (tono oscuro de la paleta)
      secondary: '#635A35', // Texto secundario (tono medio de la paleta)
      disabled: '#A29D8A',  // Texto deshabilitado (tono claro de la paleta)
    },
    background: {
      default: '#FFFFFF',   // Fondo principal (blanco)
      paper: '#EBE7CD',     // Fondo de tarjetas/papel (tono muy claro de la paleta)
      light: '#F5F2E3',     // Fondo claro secundario
    },
    status: {
      success: '#10B981',   // Verde para éxito
      warning: '#F59E0B',   // Amarillo para advertencias
      error: '#EF4444',     // Rojo para errores
      info: '#3B82F6',      // Azul para información
    },
    border: {
      light: '#E5E7EB',     // Bordes claros
      default: '#D1D5DB',   // Bordes estándar
    }
  },
  
  // Tipografía
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  // Espaciado
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '2.5rem',  // 40px
    '3xl': '3rem',    // 48px
  },
  
  // Bordes
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',   // Círculo
  },
  
  // Sombras
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Transiciones
  transitions: {
    default: '0.2s ease-in-out',
    fast: '0.1s ease-in-out',
    slow: '0.3s ease-in-out',
  },
  
  // Configuración de logo
  logo: {
    default: '/assets/logo.png',
    alt: 'FireGuardian Logo',
    width: 180,
    height: 40,
  },
  
  // Breakpoints para responsive
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Tipo para TypeScript
export type Theme = typeof theme;

// Exportar tema por defecto
export default theme;
