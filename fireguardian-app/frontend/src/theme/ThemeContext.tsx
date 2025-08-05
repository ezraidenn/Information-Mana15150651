import React, { createContext, useContext, useState, ReactNode } from 'react';
import defaultTheme, { Theme } from './theme';

// Interfaz para el contexto del tema
interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
}

// Crear el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Props para el proveedor del tema
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Partial<Theme>;
}

// Proveedor del tema
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme 
}) => {
  // Combinar el tema por defecto con el tema inicial proporcionado
  const [theme, setTheme] = useState<Theme>({
    ...defaultTheme,
    ...initialTheme,
  });

  // Función para actualizar el tema
  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
