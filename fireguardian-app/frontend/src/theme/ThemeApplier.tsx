import React, { useEffect } from 'react';
import { useTheme } from './ThemeContext';

/**
 * Componente que aplica dinámicamente el tema a las variables CSS
 * Esto permite que los cambios de tema se reflejen en toda la aplicación
 */
const ThemeApplier: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Aplicar colores principales a variables CSS
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-primary-${key}`, value);
    });

    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-secondary-${key}`, value);
    });

    // Aplicar colores de texto
    Object.entries(theme.colors.text).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-text-${key}`, value);
    });

    // Aplicar colores de fondo
    Object.entries(theme.colors.background).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-bg-${key}`, value);
    });

    // Aplicar colores de estado
    Object.entries(theme.colors.status).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-status-${key}`, value);
    });

    // Aplicar colores de borde
    Object.entries(theme.colors.border).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-border-${key}`, value);
    });

    // Aplicar tipografía
    document.documentElement.style.setProperty('--font-family', theme.typography.fontFamily);

    // Aplicar otras propiedades del tema según sea necesario
  }, [theme]);

  return null; // Este componente no renderiza nada visible
};

export default ThemeApplier;
