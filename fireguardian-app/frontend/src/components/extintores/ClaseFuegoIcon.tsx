import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTooltip } from '../../contexts/TooltipContext';

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

interface ClaseFuegoIconProps {
  clase: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

// Descripciones detalladas de las clases de fuego según la norma mexicana NOM-002-STPS-2010
const fireClassDescriptions = {
  A: 'Es aquel que se presenta en material combustible sólido, generalmente de naturaleza orgánica, y que su combustión se realiza normalmente con formación de brasas tales como madera, papel, cartón, tela, plástico.',
  B: 'Es aquel que se presenta en líquidos combustibles e inflamables y gases inflamables, tales como pintura, gasolina, petróleo, etc.',
  C: 'Es aquel que involucra aparatos, equipos e instalaciones eléctricas energizadas.',
  D: 'Es aquel en el que intervienen metales combustibles, tales como el magnesio, titanio, circonio, sodio, litio y potasio.',
  K: 'Es aquel que se presenta básicamente en instalaciones de cocina, que involucra sustancias combustibles, tales como aceites y grasas vegetales o animales.'
};

const claseFuegoInfo: Record<string, { color: string; descripcion: string; icon: string; example: string }> = {
  A: {
    color: '#3B82F6', // Azul
    descripcion: 'Fuegos de materiales sólidos (madera, papel, tela, etc.)',
    icon: classAIcon,
    example: classAExample
  },
  B: {
    color: '#EF4444', // Rojo
    descripcion: 'Fuegos de líquidos inflamables (gasolina, aceite, pintura, etc.)',
    icon: classBIcon,
    example: classBExample
  },
  C: {
    color: '#10B981', // Verde
    descripcion: 'Fuegos eléctricos (equipos energizados)',
    icon: classCIcon,
    example: classCExample
  },
  D: {
    color: '#F59E0B', // Amarillo
    descripcion: 'Fuegos de metales combustibles (magnesio, titanio, etc.)',
    icon: classDIcon,
    example: classDExample
  },
  K: {
    color: '#8B5CF6', // Púrpura
    descripcion: 'Fuegos de aceites y grasas de cocina',
    icon: classKIcon,
    example: classKExample
  }
};

export const ClaseFuegoIcon: React.FC<ClaseFuegoIconProps> = ({ 
  clase, 
  size = 'md',
  showTooltip = true 
}) => {
  // Generar un ID único para este tooltip basado en la clase
  const tooltipId = `tooltip-clase-${clase}`;
  
  // Usar el contexto de tooltips para controlar cuál está activo
  const { activeTooltipId, setActiveTooltipId } = useTooltip();
  
  // Determinar si este tooltip está activo
  const isActive = activeTooltipId === tooltipId;
  
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  const { color, icon, example } = claseFuegoInfo[clase] || { 
    color: '#6B7280', 
    icon: '',
    example: ''
  };
  
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (!showTooltip) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 10,
      left: rect.left + rect.width / 2 + window.scrollX
    });
    
    // Si ya está activo, desactivarlo. Si no, activarlo (cerrando cualquier otro)
    if (isActive) {
      setActiveTooltipId(null);
    } else {
      setActiveTooltipId(tooltipId);
    }
    
    e.stopPropagation();
  };
  
  // Cerrar el tooltip al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isActive) {
        const tooltipElement = document.querySelector('.detailed-tooltip');
        if (tooltipElement && !tooltipElement.contains(e.target as Node)) {
          setActiveTooltipId(null);
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isActive, setActiveTooltipId]);
  
  const iconElement = (
    <div 
      className={`${sizeClasses[size]} flex items-center justify-center rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={handleClick}
      title="Haz clic para ver más información"
    >
      {icon ? (
        <img 
          src={icon} 
          alt={`Clase ${clase}`} 
          className="w-full h-full object-contain"
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {clase}
        </div>
      )}
    </div>
  );
  
  // Renderizar el tooltip detallado con portal
  const renderDetailedTooltip = () => {
    if (!isActive) return null;
    
    return createPortal(
      <div 
        className="fixed z-[9999] bg-white rounded-md shadow-xl p-3 border border-blue-500 detailed-tooltip"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translateX(-50%)',
          width: '280px',
          maxWidth: 'calc(100vw - 40px)',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)'
        }}
      >
        {/* Botón de cierre */}
        <button 
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setActiveTooltipId(null)}
        >
          ✕
        </button>
        <div className="flex items-start">
          <img 
            src={example} 
            alt={`Ejemplo de fuego clase ${clase}`}
            className="w-14 h-14 object-contain mr-3"
          />
          <div>
            <h4 className="font-bold text-sm mb-1">Clase {clase}</h4>
            <p className="text-xs leading-relaxed text-gray-700">
              {fireClassDescriptions[clase as keyof typeof fireClassDescriptions]}
            </p>
          </div>
        </div>
      </div>,
      document.body
    );
  };
  
  return (
    <>
      {iconElement}
      {renderDetailedTooltip()}
    </>
  );
};

export default ClaseFuegoIcon;
