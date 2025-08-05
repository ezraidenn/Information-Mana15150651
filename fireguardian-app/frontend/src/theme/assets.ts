/**
 * Configuración centralizada de assets para FireGuardian
 * Este archivo facilita la actualización de recursos gráficos en un solo lugar
 */

// Importar el logo principal
import logoDefault from '../assets/images/logo.png';

// Configuración de assets
export const assets = {
  logo: {
    default: logoDefault,
    // Puedes agregar más variantes del logo aquí
    // white: logoWhite,
    // small: logoSmall,
  },
  // Otros assets que podrían ser necesarios
  icons: {
    // Iconos específicos de la aplicación
  },
  images: {
    // Imágenes de fondo u otras imágenes
  }
};

export default assets;
