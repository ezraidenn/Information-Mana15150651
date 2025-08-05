import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import assets from '../../theme/assets';

interface LogoProps {
  variant?: 'default' | 'white' | 'small';
  className?: string;
  onClick?: () => void;
  customLogoUrl?: string; // Nueva propiedad para permitir una URL personalizada
}

/**
 * Componente Logo que utiliza la configuración del tema global
 * Permite cambiar fácilmente el logo en toda la aplicación
 * 
 * Uso:
 * - Para usar el logo por defecto: <Logo />
 * - Para usar un logo personalizado: <Logo customLogoUrl="/ruta/al/logo.png" />
 * - Para usar el logo oficial YCC: <Logo customLogoUrl="C:/Users/raulc/Documents/Proyecto YCC Extintores/Diseño/Paleta de colores/Logos/Countryclub-500x500px logo - icono blanco.png" />
 */
const Logo: React.FC<LogoProps> = ({ 
  variant = 'default', 
  className = '', 
  onClick,
  customLogoUrl
}) => {
  const { theme } = useTheme();
  
  // Determinar qué logo mostrar según la variante o URL personalizada
  const getLogo = () => {
    // Si hay una URL personalizada, usarla con prioridad
    if (customLogoUrl) {
      return customLogoUrl;
    }
    
    switch (variant) {
      case 'white':
        // Logo con versión blanca para fondos oscuros
        // Si existe una versión blanca en assets, usarla, de lo contrario usar el default
        return assets.logo.default;
      case 'small':
        // Versión pequeña del logo (icono)
        // Si existe una versión pequeña en assets, usarla, de lo contrario usar el default
        return assets.logo.default;
      case 'default':
      default:
        // Logo principal definido en assets
        return assets.logo.default;
    }
  };
  
  // Determinar dimensiones según la variante
  const getDimensions = () => {
    if (variant === 'small') {
      return {
        width: theme.logo.width / 2,
        height: theme.logo.height / 2
      };
    }
    
    return {
      width: theme.logo.width,
      height: theme.logo.height
    };
  };
  
  const dimensions = getDimensions();
  const logoSrc = getLogo();
  
  return (
    <img
      src={logoSrc}
      alt={theme.logo.alt}
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};

export default Logo;
