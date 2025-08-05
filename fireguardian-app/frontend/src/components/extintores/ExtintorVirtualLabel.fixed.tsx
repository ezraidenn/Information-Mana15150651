import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TipoExtintor } from '../../types';

// Importamos los iconos de clases de fuego
import classAIcon from '../../assets/icons/extintores/clases/class-A.png';
import classBIcon from '../../assets/icons/extintores/clases/class-B.png';
import classCIcon from '../../assets/icons/extintores/clases/class-C.png';
import classDIcon from '../../assets/icons/extintores/clases/class-D.png';
import classKIcon from '../../assets/icons/extintores/clases/class-K.png';

// Importamos los iconos de ejemplos
import classAExample from '../../assets/icons/extintores/clases/class-a-example.png';
import classBExample from '../../assets/icons/extintores/clases/class-b-example.png';
import classCExample from '../../assets/icons/extintores/clases/class-c-example.png';
import classDExample from '../../assets/icons/extintores/clases/class-d-example.png';
import classKExample from '../../assets/icons/extintores/clases/class-k-example.png';

export interface ExtintorVirtualLabelProps {
  tipo: TipoExtintor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** @deprecated No se usa actualmente, mantenido por compatibilidad */
  showDetails?: boolean;
  /** @deprecated No se usa actualmente, mantenido por compatibilidad */
  showLogo?: boolean;
  className?: string;
  /** @deprecated No se usa actualmente, mantenido por compatibilidad */
  codigoQR?: string;
  fechaRecarga?: string; // Fecha de última recarga
  fechaVencimiento?: string; // Fecha de vencimiento
}

/**
 * Componente que muestra una etiqueta virtual realista para un tipo de extintor
 * basada en las normativas mexicanas (NOM-154-SCFI-2005 y NOM-002-STPS-2010)
 */
export const ExtintorVirtualLabel: React.FC<ExtintorVirtualLabelProps> = (props) => {
  const {
    tipo,
    size = 'md',
    className = '',
    fechaRecarga,
    fechaVencimiento,
  } = props;
  
  // Estado para controlar qué tooltip se muestra
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; position?: 'above' | 'right' | 'below' }>({ top: 0, left: 0 });
  const [tooltipMode, setTooltipMode] = useState<'hover' | 'click'>('hover'); // Modo del tooltip: hover (temporal) o click (persistente)
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tooltipTimeoutRef = useRef<number | null>(null);
  
  // Función para cerrar el tooltip
  const closeTooltip = useCallback(() => {
    setActiveTooltip(null);
    setTooltipMode('hover');
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);
  
  // Función para manejar el clic en un icono de clase de fuego
  const handleFireClassClick = useCallback((fireClass: string) => {
    // Si ya hay un tooltip activo y es el mismo que se está clickeando
    if (activeTooltip === fireClass) {
      // Si ya está en modo click, lo cerramos
      if (tooltipMode === 'click') {
        closeTooltip();
      } else {
        // Si está en modo hover, lo cambiamos a click
        setTooltipMode('click');
      }
    } else {
      // Si es un tooltip diferente o no hay ninguno activo
      // Mostramos el tooltip y lo ponemos en modo click
      setActiveTooltip(fireClass);
      setTooltipMode('click');
      // Actualizamos la posición del tooltip
      updateTooltipPosition(fireClass);
    }
  }, [activeTooltip, tooltipMode, closeTooltip]);

  // Color principal para la etiqueta
  const primaryColor = tipo.color_hex || '#FF0000';
  
  // Función para actualizar la posición del tooltip
  const updateTooltipPosition = useCallback((fireClass?: string) => {
    const tooltipId = fireClass || activeTooltip;
    if (tooltipId && iconRefs.current[tooltipId]) {
      const iconElement = iconRefs.current[tooltipId];
      if (iconElement) {
        const rect = iconElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Determinar la posición óptima para el tooltip
        // Por defecto, intentamos colocarlo arriba del icono
        let position: 'above' | 'right' | 'below' = 'above';
        
        // Si no hay suficiente espacio arriba, intentamos a la derecha
        if (rect.top < 150) {
          position = 'right';
          
          // Si tampoco hay espacio a la derecha, lo ponemos abajo
          if (rect.right + 300 > viewportWidth) {
            position = 'below';
          }
        }
        
        // Calcular las coordenadas según la posición
        let top: number;
        let left: number;
        
        if (position === 'above') {
          top = rect.top - 10; // Un poco de espacio entre el icono y el tooltip
          left = rect.left + rect.width / 2;
        } else if (position === 'below') {
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
        } else { // right
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
        }
        
        // Actualizar la posición del tooltip
        setTooltipPosition({ top, left, position });
      }
    }
  }, [activeTooltip]);
  
  // Actualizar la posición cuando se hace scroll
  const handleScroll = useCallback(() => {
    if (activeTooltip) {
      updateTooltipPosition();
    }
  }, [activeTooltip, updateTooltipPosition]);
  
  // Actualizar la posición cuando cambia el tamaño de la ventana
  const handleResize = useCallback(() => {
    if (activeTooltip) {
      updateTooltipPosition();
    }
  }, [activeTooltip, updateTooltipPosition]);
  
  // Manejador para cerrar el tooltip al hacer clic fuera
  const handleClickOutside = (event: MouseEvent) => {
    // Si no hay tooltip activo o no está en modo clic, no hacemos nada
    if (!activeTooltip || tooltipMode !== 'click') return;
    
    // Verificamos si el clic fue dentro del tooltip o de un icono
    const tooltipElement = document.querySelector('.tooltip-portal');
    const clickedElement = event.target as Node;
    
    // Si el tooltip existe y el clic no fue dentro del tooltip ni en un icono de clase de fuego
    if (tooltipElement && !tooltipElement.contains(clickedElement)) {
      // Verificamos que no se haya hecho clic en un icono de clase de fuego
      let clickedOnIcon = false;
      Object.values(iconRefs.current).forEach(iconRef => {
        if (iconRef && iconRef.contains(clickedElement)) {
          clickedOnIcon = true;
        }
      });
      
      // Si no se hizo clic en un icono ni en el tooltip, cerramos el tooltip
      if (!clickedOnIcon) {
        closeTooltip();
      }
    }
  };
  
  // Agregar y eliminar event listeners
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeTooltip, updateTooltipPosition, tooltipMode, closeTooltip]);

  // Mapeo de clases de fuego a sus iconos y ejemplos
  const fireClassIcons = {
    'A': { icon: classAIcon, example: classAExample },
    'B': { icon: classBIcon, example: classBExample },
    'C': { icon: classCIcon, example: classCExample },
    'D': { icon: classDIcon, example: classDExample },
    'K': { icon: classKIcon, example: classKExample },
  };
  
  // Descripciones de las clases de fuego
  const fireClassDescriptions = {
    'A': 'Fuegos con combustibles sólidos como madera, papel, tela, plástico, etc. que producen brasas.',
    'B': 'Fuegos con combustibles líquidos como gasolina, aceites, pinturas, etc. o sólidos licuables.',
    'C': 'Fuegos que involucran equipos eléctricos energizados.',
    'D': 'Fuegos con metales combustibles como magnesio, titanio, sodio, etc.',
    'K': 'Fuegos en cocinas que involucran aceites y grasas vegetales o animales.',
  };
  
  // Determinar las clases de fuego aplicables para este tipo de extintor
  const getFireClasses = (): string[] => {
    const classes: string[] = [];
    
    // Verificar cada clase según el tipo de extintor
    if (tipo.clase_a) classes.push('A');
    if (tipo.clase_b) classes.push('B');
    if (tipo.clase_c) classes.push('C');
    if (tipo.clase_d) classes.push('D');
    if (tipo.clase_k) classes.push('K');
    
    return classes;
  };
  
  // Obtener las clases de fuego aplicables
  const fireClasses = getFireClasses();
  
  // Formatear fecha para mostrar en la etiqueta
  const formatearFecha = (fechaStr?: string): string => {
    if (!fechaStr) return 'N/A';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Tamaños de los iconos según el tamaño de la etiqueta
  const iconSizes = {
    'sm': 'w-6 h-6',
    'md': 'w-8 h-8',
    'lg': 'w-10 h-10',
    'xl': 'w-12 h-12',
  };
  
  // Tamaños de las imágenes dentro de los iconos
  const iconImgSizes = {
    'sm': 'w-4 h-4',
    'md': 'w-6 h-6',
    'lg': 'w-8 h-8',
    'xl': 'w-10 h-10',
  };
  
  // Tamaños de la etiqueta
  const labelSizes = {
    'sm': 'w-48',
    'md': 'w-56',
    'lg': 'w-64',
    'xl': 'w-72',
  };

  // Renderizar el tooltip con portal
  // Función para renderizar el tooltip usando un portal
  const renderTooltip = () => {
    if (!activeTooltip) return null;
    
    // Crear un portal que se renderice en el body
    return createPortal(
      <div 
        className={`fixed z-[9999] bg-white rounded-md shadow-xl p-3 border transition-all duration-200 tooltip-portal ${tooltipMode === 'click' ? 'border-blue-500' : 'border-gray-200'}`}
        style={{
          position: 'fixed',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: tooltipPosition.position === 'above' 
            ? 'translateX(-50%) translateY(-100%)' // Arriba del icono
            : tooltipPosition.position === 'below'
              ? 'translateX(-50%)' // Debajo del icono
              : 'translateY(-50%)', // A la derecha del icono
          boxShadow: tooltipMode === 'click' 
            ? '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          width: '280px',
          maxWidth: 'calc(100vw - 40px)', // Evita que se salga de la pantalla
          pointerEvents: 'auto', // Asegura que el tooltip sea interactivo
          opacity: 1,
          visibility: 'visible'
        }}
        onMouseEnter={() => {
          // Si estamos en modo hover, cancelamos cualquier timeout
          if (tooltipMode === 'hover' && tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
          }
        }}
        onMouseLeave={() => {
          // Solo ocultamos si estamos en modo hover
          if (tooltipMode === 'hover') {
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
            }
            tooltipTimeoutRef.current = window.setTimeout(() => setActiveTooltip(null), 300);
          }
        }}
      >
        {/* Botón de cierre en la esquina superior derecha */}
        <button 
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          onClick={closeTooltip}
        >
          ✕
        </button>
        <div className="flex items-start">
          <img 
            src={fireClassIcons[activeTooltip as keyof typeof fireClassIcons]?.example} 
            alt={`Ejemplo de fuego clase ${activeTooltip}`}
            className="w-14 h-14 object-contain mr-3"
          />
          <div>
            <h4 className="font-bold text-sm mb-1">Clase {activeTooltip}</h4>
            <p className="text-xs leading-relaxed text-gray-700">
              {fireClassDescriptions[activeTooltip as keyof typeof fireClassDescriptions]}
            </p>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className={`flex flex-col ${labelSizes[size]} ${className}`}>
      {/* Cabecera */}
      <div 
        className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-3 rounded-t-lg font-bold text-center flex items-center justify-center"
        style={{ backgroundColor: primaryColor }}
      >
        <span>{tipo.nombre}</span>
      </div>
      
      {/* Contenido principal */}
      <div className="flex flex-col border border-gray-200 rounded-b-lg">
        {/* Contenido principal en fila */}
        <div className="flex">
          {/* Información detallada - IZQUIERDA */}
          <div className="w-1/2 p-3">
            {/* Datos del extintor */}
            <div className="text-sm">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-gray-600">ID:</div>
                <div>{tipo.id || 'N/A'}</div>
                
                
                {tipo.uso_recomendado && (
                  <>
                    <div className="text-gray-600">Uso:</div>
                    <div>{tipo.uso_recomendado}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Clases de fuego - Iconos - DERECHA */}
          <div className="w-1/2 p-3 flex items-center justify-center">
            {/* El tooltip ahora se renderiza con un portal */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {/* Solo mostrar los iconos de las clases de fuego aplicables */}
              {fireClasses.map((fireClass) => (
                <div 
                  key={fireClass}
                  ref={(el) => (iconRefs.current[fireClass] = el)}
                  className="relative"
                  onClick={() => handleFireClassClick(fireClass)}
                  onMouseEnter={() => {
                    // Solo mostramos el tooltip si no está en modo click
                    if (tooltipMode !== 'click' || activeTooltip !== fireClass) {
                      setActiveTooltip(fireClass);
                      updateTooltipPosition(fireClass);
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent) => {
                    // Solo ocultamos si está en modo hover
                    if (tooltipMode === 'hover') {
                      // Verificamos si el cursor se mueve hacia el tooltip
                      const tooltipElement = document.querySelector('.tooltip-portal');
                      if (tooltipElement) {
                        const tooltipRect = tooltipElement.getBoundingClientRect();
                        const mouseX = e.clientX;
                        const mouseY = e.clientY;
                        
                        // Margen de tolerancia alrededor del tooltip
                        const tolerance = 30;
                        
                        // Si el cursor está cerca del tooltip, no lo ocultamos
                        if (
                          mouseX >= tooltipRect.left - tolerance &&
                          mouseX <= tooltipRect.right + tolerance &&
                          mouseY >= tooltipRect.top - tolerance &&
                          mouseY <= tooltipRect.bottom + tolerance
                        ) {
                          return;
                        }
                      }
                      
                      // Ocultamos con un pequeño retraso
                      if (tooltipTimeoutRef.current) {
                        clearTimeout(tooltipTimeoutRef.current);
                      }
                      tooltipTimeoutRef.current = window.setTimeout(() => {
                        if (activeTooltip === fireClass && tooltipMode === 'hover') {
                          setActiveTooltip(null);
                        }
                      }, 300);
                    }
                  }}
                >
                  <div className={`${iconSizes[size]} flex items-center justify-center border ${activeTooltip === fireClass ? 'border-blue-500' : 'border-gray-300'} rounded bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`} title="Haz clic para ver información">
                    <img 
                      src={fireClassIcons[fireClass as keyof typeof fireClassIcons]?.icon} 
                      alt={`Clase ${fireClass}`}
                      className={`${iconImgSizes[size]} object-contain`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Fechas de recarga y vencimiento */}
        {(fechaRecarga || fechaVencimiento) && (
          <div className="flex px-3 pb-3 text-xs gap-2">
            {fechaRecarga && (
              <div className="flex-1 bg-blue-600 text-white p-1 rounded text-center">
                <span className="font-semibold">Recarga:</span> {formatearFecha(fechaRecarga)}
              </div>
            )}
            {fechaVencimiento && (
              <div className="flex-1 bg-red-600 text-white p-1 rounded text-center">
                <span className="font-semibold">Vence:</span> {formatearFecha(fechaVencimiento)}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Renderizar el tooltip con portal */}
      {renderTooltip()}
    </div>
  );
};

export default ExtintorVirtualLabel;
