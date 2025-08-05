import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import Logo from '../common/Logo';
import { theme as defaultTheme } from '../../theme/theme';

/**
 * Componente para administrar el tema de la aplicación
 * Permite cambiar colores y visualizar cómo se verían los cambios
 */
const ThemeManager: React.FC = () => {
  const { theme, updateTheme } = useTheme();
  
  // Estado para los colores seleccionados - usando los colores oficiales de YCC Extintores
  const [primaryColor, setPrimaryColor] = useState('#B7BD31'); // Uni. of California Gold
  const [secondaryColor, setSecondaryColor] = useState('#B1A66E'); // Misty Moss
  const [accentColor, setAccentColor] = useState('#413515'); // Pullman Green
  
  // Estado para los colores de fondo y tarjetas
  const [bgPaperColor, setBgPaperColor] = useState('#F5F3E8'); // Fondo claro crema
  const [bgLightColor, setBgLightColor] = useState('#F9F7F0'); // Fondo más claro
  const [cardColor, setCardColor] = useState('#FFFFFF'); // Color de tarjetas
  const [shadowColor, setShadowColor] = useState('rgba(65, 53, 21, 0.1)'); // Sombra basada en Pullman Green
  
  // Inicializar los colores del tema al cargar el componente
  useEffect(() => {
    // Obtener los valores actuales de las variables CSS
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    const primaryMain = style.getPropertyValue('--color-primary-main').trim() || '#B7BD31';
    const secondaryMain = style.getPropertyValue('--color-secondary-main').trim() || '#B1A66E';
    const textPrimary = style.getPropertyValue('--color-text-primary').trim() || '#413515';
    const bgPaper = style.getPropertyValue('--color-bg-paper').trim() || '#F5F3E8';
    const bgLight = style.getPropertyValue('--color-bg-light').trim() || '#F9F7F0';
    const card = style.getPropertyValue('--color-card').trim() || '#FFFFFF';
    const shadow = style.getPropertyValue('--color-shadow').trim() || 'rgba(65, 53, 21, 0.1)';
    
    setPrimaryColor(primaryMain.startsWith('#') ? primaryMain : `#${primaryMain}`);
    setSecondaryColor(secondaryMain.startsWith('#') ? secondaryMain : `#${secondaryMain}`);
    setAccentColor(textPrimary.startsWith('#') ? textPrimary : `#${textPrimary}`);
    setBgPaperColor(bgPaper.startsWith('#') ? bgPaper : `#${bgPaper}`);
    setBgLightColor(bgLight.startsWith('#') ? bgLight : `#${bgLight}`);
    setCardColor(card.startsWith('#') ? card : `#${card}`);
    setShadowColor(shadow);
  }, []);
  
  // Función para ajustar un color (hacerlo más claro o más oscuro)
  const adjustColor = (color: string, amount: number): string => {
    // Convertir el color hex a RGB
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Convertir a valores RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Ajustar cada componente
    const adjustR = Math.max(0, Math.min(255, r + amount));
    const adjustG = Math.max(0, Math.min(255, g + amount));
    const adjustB = Math.max(0, Math.min(255, b + amount));
    
    // Convertir de nuevo a hex
    return `#${Math.round(adjustR).toString(16).padStart(2, '0')}${Math.round(adjustG).toString(16).padStart(2, '0')}${Math.round(adjustB).toString(16).padStart(2, '0')}`;
  };
  
  // Función para cargar un nuevo logo
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          // Aquí se podría guardar el logo en localStorage o enviarlo al backend
          console.log('Nuevo logo cargado:', result.substring(0, 50) + '...');
          // También se podría actualizar el estado para mostrar el nuevo logo
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Función para aplicar los cambios de tema
  const applyThemeChanges = () => {
    // Usar el tema predeterminado como base para asegurar consistencia
    const newTheme = {
      colors: {
        ...defaultTheme.colors,
        primary: {
          ...defaultTheme.colors.primary,
          main: primaryColor,
          light: adjustColor(primaryColor, 20), // Más claro
          dark: adjustColor(primaryColor, -20), // Más oscuro
        },
        secondary: {
          ...defaultTheme.colors.secondary,
          main: secondaryColor,
          light: adjustColor(secondaryColor, 20),
          dark: adjustColor(secondaryColor, -20),
        },
        text: {
          ...defaultTheme.colors.text,
          primary: accentColor,
          secondary: adjustColor(accentColor, 20),
        },
        background: {
          ...defaultTheme.colors.background,
          paper: bgPaperColor,
          light: bgLightColor,
        },
        card: cardColor,
        shadow: shadowColor
      },
    };
    
    updateTheme(newTheme);
    
    // Actualizar variables CSS directamente
    const root = document.documentElement;
    
    // Colores primarios
    root.style.setProperty('--color-primary-main', primaryColor);
    root.style.setProperty('--color-primary-light', adjustColor(primaryColor, 20));
    root.style.setProperty('--color-primary-dark', adjustColor(primaryColor, -20));
    
    // Colores secundarios
    root.style.setProperty('--color-secondary-main', secondaryColor);
    root.style.setProperty('--color-secondary-light', adjustColor(secondaryColor, 20));
    root.style.setProperty('--color-secondary-dark', adjustColor(secondaryColor, -20));
    
    // Colores de texto
    root.style.setProperty('--color-text-primary', accentColor);
    root.style.setProperty('--color-text-secondary', adjustColor(accentColor, 20));
    
    // Colores de fondo y tarjetas
    root.style.setProperty('--color-bg-paper', bgPaperColor);
    root.style.setProperty('--color-bg-light', bgLightColor);
    root.style.setProperty('--color-card', cardColor);
    root.style.setProperty('--color-shadow', shadowColor);
  };
  
  return (
    <div className="p-6 bg-bg-paper rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-text-primary">Administrador de Tema</h2>
      
      {/* Selección de colores */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 border border-secondary-light rounded-lg bg-bg-paper shadow-md">
          <h3 className="text-lg font-semibold mb-3">Color Primario</h3>
          <p className="text-sm text-text-secondary mb-3">
            Usado para botones principales, acentos y elementos destacados.
          </p>
          
          <div className="flex items-center space-x-3">
            <input 
              type="color" 
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input 
              type="text" 
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 p-2 border border-secondary-light rounded"
            />
          </div>
        </div>
        
        <div className="p-4 border border-secondary-light rounded-lg bg-bg-paper shadow-md">
          <h3 className="text-lg font-semibold mb-3">Color Secundario</h3>
          <p className="text-sm text-text-secondary mb-3">
            Usado para fondos, barras de navegación y elementos complementarios.
          </p>
          
          <div className="flex items-center space-x-3">
            <input 
              type="color" 
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input 
              type="text" 
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="flex-1 p-2 border border-secondary-light rounded"
            />
          </div>
        </div>
        
        <div className="p-4 border border-secondary-light rounded-lg bg-bg-paper shadow-md">
          <h3 className="text-lg font-semibold mb-3">Color de Texto</h3>
          <p className="text-sm text-text-secondary mb-3">
            Usado para texto principal y elementos de contraste.
          </p>
          
          <div className="flex items-center space-x-3">
            <input 
              type="color" 
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input 
              type="text" 
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="flex-1 p-2 border border-secondary-light rounded"
            />
          </div>
        </div>
      </div>
      
      {/* Colores de fondo y tarjetas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-secondary-light rounded-lg bg-bg-paper shadow-md">
          <h3 className="text-lg font-semibold mb-3">Color de Fondo Principal</h3>
          <p className="text-sm text-text-secondary mb-3">
            Usado para el fondo principal de la aplicación.
          </p>
          
          <div className="flex items-center space-x-3">
            <input 
              type="color" 
              value={bgPaperColor}
              onChange={(e) => setBgPaperColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input 
              type="text" 
              value={bgPaperColor}
              onChange={(e) => setBgPaperColor(e.target.value)}
              className="flex-1 p-2 border border-secondary-light rounded"
            />
          </div>
        </div>
        
        <div className="p-4 border border-secondary-light rounded-lg bg-bg-paper shadow-md">
          <h3 className="text-lg font-semibold mb-3">Color de Fondo Secundario</h3>
          <p className="text-sm text-text-secondary mb-3">
            Usado para fondos de elementos y contenedores.
          </p>
          
          <div className="flex items-center space-x-3">
            <input 
              type="color" 
              value={bgLightColor}
              onChange={(e) => setBgLightColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input 
              type="text" 
              value={bgLightColor}
              onChange={(e) => setBgLightColor(e.target.value)}
              className="flex-1 p-2 border border-secondary-light rounded"
            />
          </div>
        </div>
      </div>
      
      {/* Colores de tarjetas y sombras */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-secondary-light rounded-lg bg-bg-paper shadow-md">
          <h3 className="text-lg font-semibold mb-3">Color de Tarjetas</h3>
          <p className="text-sm text-text-secondary mb-3">
            Usado para el fondo de tarjetas y componentes.
          </p>
          
          <div className="flex items-center space-x-3">
            <input 
              type="color" 
              value={cardColor}
              onChange={(e) => setCardColor(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input 
              type="text" 
              value={cardColor}
              onChange={(e) => setCardColor(e.target.value)}
              className="flex-1 p-2 border border-secondary-light rounded"
            />
          </div>
        </div>
        
        <div className="p-4 border border-secondary-light rounded-lg bg-bg-paper shadow-md">
          <h3 className="text-lg font-semibold mb-3">Color de Sombras</h3>
          <p className="text-sm text-text-secondary mb-3">
            Usado para sombras y efectos de profundidad.
          </p>
          
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded cursor-pointer border border-secondary-light"
              style={{ backgroundColor: shadowColor }}
            ></div>
            <input 
              type="text" 
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="flex-1 p-2 border border-secondary-light rounded"
              placeholder="rgba(65, 53, 21, 0.1)"
            />
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Formato: rgba(R, G, B, Alpha) - Ejemplo: rgba(65, 53, 21, 0.1)
          </p>
        </div>
      </div>
      
      {/* Logo */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Logo</h3>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 border border-secondary-light rounded-lg bg-bg-light flex items-center justify-center">
            <Logo className="max-w-[180px] max-h-[80px]" />
          </div>
          
          <label className="cursor-pointer bg-primary-main text-primary-contrast px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            Cambiar Logo
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
          
          <p className="text-sm text-text-secondary">
            Formato recomendado: PNG o SVG con fondo transparente
          </p>
        </div>
      </div>
      
      {/* Vista previa */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Vista Previa - Paleta YCC Extintores</h3>
        
        <div className="p-4 border border-secondary-dark rounded-lg bg-bg-light">
          <div className="flex flex-col space-y-6">
            {/* Paleta de colores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-16 rounded-lg" 
                  style={{backgroundColor: primaryColor}}
                ></div>
                <span className="mt-1 text-xs font-medium">Uni. of California Gold</span>
                <span className="text-xs text-text-secondary">{primaryColor}</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-16 rounded-lg" 
                  style={{backgroundColor: secondaryColor}}
                ></div>
                <span className="mt-1 text-xs font-medium">Misty Moss</span>
                <span className="text-xs text-text-secondary">{secondaryColor}</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-16 rounded-lg" 
                  style={{backgroundColor: accentColor}}
                ></div>
                <span className="mt-1 text-xs font-medium">Pullman Green</span>
                <span className="text-xs text-text-secondary">{accentColor}</span>
              </div>
            </div>
            
            {/* Colores de fondo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-12 rounded-lg border border-secondary-light" 
                  style={{backgroundColor: bgPaperColor}}
                ></div>
                <span className="mt-1 text-xs font-medium">Fondo Principal</span>
                <span className="text-xs text-text-secondary">{bgPaperColor}</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-12 rounded-lg border border-secondary-light" 
                  style={{backgroundColor: bgLightColor}}
                ></div>
                <span className="mt-1 text-xs font-medium">Fondo Secundario</span>
                <span className="text-xs text-text-secondary">{bgLightColor}</span>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-12 rounded-lg border border-secondary-light" 
                  style={{backgroundColor: cardColor}}
                ></div>
                <span className="mt-1 text-xs font-medium">Tarjetas</span>
                <span className="text-xs text-text-secondary">{cardColor}</span>
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex flex-wrap gap-3">
              <button className="bg-primary-main text-primary-contrast px-4 py-2 rounded-lg">
                Botón Primario
              </button>
              <button className="bg-secondary-main text-secondary-contrast px-4 py-2 rounded-lg">
                Botón Secundario
              </button>
              <button className="border border-primary-main text-primary-main px-4 py-2 rounded-lg">
                Botón Outline
              </button>
              <button className="bg-secondary-dark text-white px-4 py-2 rounded-lg">
                Botón Oscuro
              </button>
            </div>
            
            {/* Sidebar de ejemplo */}
            <div className="flex">
              <div className="w-44 bg-secondary-main rounded-l-lg p-2 border-r border-secondary-dark">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center">
                    <img
                      src="/Countryclub-500x500px logo - icono blanco.png"
                      alt="FireGuardian"
                      className="h-14 w-14"
                    />
                  </div>
                  <div className="flex items-center h-14">
                    <span className="ml-1 text-white font-bold" style={{ textShadow: '1px 1px 2px #413515' }}>FireGuardian</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="px-2 py-2 bg-primary-light text-primary-dark rounded-lg border-r-3 border-primary-dark">
                    Extintores
                  </div>
                  <div className="px-2 py-2 text-text-primary hover:bg-secondary-light hover:text-secondary-dark rounded-lg">
                    Mantenimientos
                  </div>
                  <div className="px-2 py-2 text-text-primary hover:bg-secondary-light hover:text-secondary-dark rounded-lg">
                    Ubicaciones
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-bg-paper p-3 rounded-r-lg">
                <h4 className="font-bold text-text-primary">Contenido Principal</h4>
                <p className="mt-2 text-text-secondary">
                  Esta es una vista previa de cómo se vería la interfaz con los colores seleccionados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón para aplicar cambios */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={applyThemeChanges}
          className="bg-primary-main text-primary-contrast px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Aplicar Cambios
        </button>
      </div>
    </div>
  );
};

export default ThemeManager;
