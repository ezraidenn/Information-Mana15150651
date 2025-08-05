import React, { useState, useRef } from 'react';
import { Calendar, Clock, Edit, FileText, MapPin, Trash2, AlertTriangle, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Extintor } from '../../types';
import { Tooltip } from '../ui/Tooltip';
import { createPortal } from 'react-dom';

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

interface ExtintorCardProps {
  extintor: Extintor;
  onEdit: (extintor: Extintor) => void;
  onDelete: (id: number) => void;
}

export const ExtintorCard: React.FC<ExtintorCardProps> = ({ extintor, onEdit, onDelete }) => {
  // Estado para controlar qué tooltip se muestra
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Función para obtener el color según el estado
  const getEstadoColor = (estado: string | undefined) => {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800';
      case 'MANTENIMIENTO':
        return 'bg-yellow-100 text-yellow-800';
      case 'VENCIDO':
        return 'bg-red-100 text-red-800';
      case 'BAJA':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Función para obtener el icono según el estado
  const getEstadoIcon = (estado: string | undefined) => {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return CheckCircle;
      case 'MANTENIMIENTO':
        return Clock;
      case 'VENCIDO':
        return AlertTriangle;
      case 'BAJA':
        return AlertCircle;
      default:
        return CheckCircle;
    }
  };

  // Obtener las clases de fuego del tipo de extintor
  // Aseguramos que siempre sea un array
  let clasesFuego: string[] = [];
  
  // Aseguramos que el tipo de extintor y sus clases de fuego existan
  if (extintor.tipo) {
    const claseFuegoData = extintor.tipo.clase_fuego as string[] | string | undefined;
    if (Array.isArray(claseFuegoData)) {
      clasesFuego = claseFuegoData;
    } else if (typeof claseFuegoData === 'string') {
      clasesFuego = claseFuegoData.split(',');
    }
  }
  
  // Aseguramos que siempre haya al menos una clase de fuego para mostrar
  if (clasesFuego.length === 0 && extintor.tipo?.nombre) {
    // Si no hay clases de fuego pero sí hay un tipo, mostramos al menos la clase A (común)
    clasesFuego = ['A'];
  }
  
  // Información de las clases de fuego con sus iconos y descripciones
  // Descripciones detalladas de las clases de fuego según la norma mexicana NOM-002-STPS-2010
  const fireClassDescriptions = {
    A: 'Es aquel que se presenta en material combustible sólido, generalmente de naturaleza orgánica, y que su combustión se realiza normalmente con formación de brasas tales como madera, papel, cartón, tela, plástico.',
    B: 'Es aquel que se presenta en líquidos combustibles e inflamables y gases inflamables, tales como pintura, gasolina, petróleo, etc.',
    C: 'Es aquel que involucra aparatos, equipos e instalaciones eléctricas energizadas.',
    D: 'Es aquel en el que intervienen metales combustibles, tales como el magnesio, titanio, circonio, sodio, litio y potasio.',
    K: 'Es aquel que se presenta básicamente en instalaciones de cocina, que involucra sustancias combustibles, tales como aceites y grasas vegetales o animales.'
  };

  const claseFuegoInfo: Record<string, { color: string; descripcion: string; icon: string; example: string }> = {
    A: { color: '#3B82F6', descripcion: fireClassDescriptions.A, icon: classAIcon, example: classAExample },
    B: { color: '#EF4444', descripcion: fireClassDescriptions.B, icon: classBIcon, example: classBExample },
    C: { color: '#10B981', descripcion: fireClassDescriptions.C, icon: classCIcon, example: classCExample },
    D: { color: '#F59E0B', descripcion: fireClassDescriptions.D, icon: classDIcon, example: classDExample },
    K: { color: '#8B5CF6', descripcion: fireClassDescriptions.K, icon: classKIcon, example: classKExample },
  };
  
  // Función para mostrar el tooltip detallado
  const handleFireClassClick = (fireClass: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeTooltip === fireClass) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(fireClass);
      // Calculamos la mejor posición para el tooltip
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Por defecto, posicionamos debajo
      let top = rect.bottom + window.scrollY + 10;
      let left = rect.left + rect.width / 2 + window.scrollX;
      
      // Aseguramos que el tooltip no se salga de la pantalla
      // Si no hay espacio abajo, lo ponemos arriba
      if (rect.bottom + 200 > viewportHeight) {
        top = rect.top + window.scrollY - 10;
      }
      
      setTooltipPosition({
        top: top,
        left: left
      });
    }
  };
  
  // Cerrar el tooltip al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeTooltip) {
        const tooltipElement = document.querySelector('.detailed-tooltip');
        const targetIcon = iconRefs.current[activeTooltip];

        // Si el clic no es ni en el tooltip ni en el icono que lo activó, cerramos el tooltip
        if (tooltipElement && !tooltipElement.contains(e.target as Node) && 
            targetIcon && !targetIcon.contains(e.target as Node)) {
          setActiveTooltip(null);
        }
      }
    };
    
    // Cerrar tooltip con la tecla Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTooltip) {
        setActiveTooltip(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTooltip]);
  
  // Renderizar el tooltip detallado con portal
  const renderDetailedTooltip = () => {
    if (!activeTooltip) return null;
    
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
          onClick={() => setActiveTooltip(null)}
        >
          <X className="w-3 h-3" />
        </button>
        <div className="flex items-start">
          <img 
            src={claseFuegoInfo[activeTooltip]?.example} 
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

  // Formatear la fecha de vencimiento
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calcular días para vencimiento
  const getDiasVencimiento = () => {
    const hoy = new Date();
    const vencimiento = new Date(extintor.fecha_vencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    const dias = Math.ceil(diferencia / (1000 * 3600 * 24));
    return dias;
  };

  const diasVencimiento = getDiasVencimiento();
  
  // Obtener la ubicación completa
  const getUbicacionCompleta = () => {
    const ubicacionNombre = extintor.ubicacion ? 
      (typeof extintor.ubicacion === 'string' ? 
        extintor.ubicacion : 
        extintor.ubicacion.nombre_area || 'No especificada') : 
      'No especificada';
    
    const sedeNombre = extintor.ubicacion && extintor.ubicacion.sede ? 
      extintor.ubicacion.sede.nombre : 
      (extintor.sede ? 
        (typeof extintor.sede === 'string' ? 
          extintor.sede : 
          (extintor.sede as any).nombre || '') : 
        '');
    
    return sedeNombre ? `${ubicacionNombre} - ${sedeNombre}` : ubicacionNombre;
  };

  // La variable diasVencimiento se usa para mostrar el estado de vencimiento

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Encabezado con color según tipo de extintor */}
      <div 
        className="h-2" 
        style={{ backgroundColor: extintor.tipo?.color_hex || '#EF4444' }}
      ></div>
      
      <div className="p-4">
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{extintor.tipo?.nombre}</h3>
            <div className="bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">
              <p className="text-sm font-mono font-medium text-gray-800">{extintor.codigo}</p>
            </div>
            {extintor.codigo_interno && (
              <p className="text-xs text-gray-500 mt-1">Código interno: {extintor.codigo_interno}</p>
            )}
          </div>
          
          {/* Estado del extintor */}
          <div className="flex items-center">
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${getEstadoColor(extintor.estado)}`}>
              <div className="flex items-center gap-1">
                {React.createElement(getEstadoIcon(extintor.estado), { className: 'w-3 h-3' })}
                <span>{extintor.estado || 'ACTIVO'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Capacidad */}
        {extintor.capacidad && (
          <div className="mb-4">
            <p className="text-sm font-medium">
              Capacidad: <span className="text-blue-600">{extintor.capacidad}</span>
            </p>
          </div>
        )}
        
        {/* Clases de fuego */}
        {clasesFuego.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Clases de fuego:</p>
            <div className="flex flex-wrap gap-2">
              {clasesFuego.map((clase: string) => (
                <div 
                  key={clase}
                  ref={(el) => (iconRefs.current[clase] = el)}
                  className="relative"
                  onClick={(e) => handleFireClassClick(clase, e)}
                >
                  <div 
                    className={`w-8 h-8 flex items-center justify-center border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${activeTooltip === clase ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300'}`}
                    style={{ borderColor: activeTooltip === clase ? 'transparent' : claseFuegoInfo[clase]?.color }}
                    title="Haz clic para ver información"
                  >
                    <img 
                      src={claseFuegoInfo[clase]?.icon} 
                      alt={`Clase ${clase}`} 
                      className="w-7 h-7 object-contain" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agente extintor */}
        {extintor.tipo?.agente_extintor && (
          <div className="mb-4">
            <Tooltip content="Agente extintor utilizado" position="top">
              <p className="text-sm text-gray-700 font-medium">
                {extintor.tipo.agente_extintor}
              </p>
            </Tooltip>
          </div>
        )}

        {/* Información adicional */}
        <div className="space-y-2 mb-4">
          {/* Ubicación */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{getUbicacionCompleta()}</span>
          </div>
          
          {/* Fecha de vencimiento */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Fecha de vencimiento:</p>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">{formatDate(extintor.fecha_vencimiento)}</span>
            </div>
            <div className="mt-2">
              {diasVencimiento > 30 ? (
                <div className="bg-green-600 text-white text-xs p-1.5 rounded-md text-center shadow-sm">
                  <span className="font-semibold">Vence en:</span> {diasVencimiento} días
                </div>
              ) : diasVencimiento > 0 ? (
                <div className="bg-yellow-500 text-white text-xs p-1.5 rounded-md text-center shadow-sm">
                  <span className="font-semibold">¡Próximo a vencer!</span> {diasVencimiento} días
                </div>
              ) : (
                <div className="bg-red-600 text-white text-xs p-1.5 rounded-md text-center shadow-sm">
                  <span className="font-semibold">Vencido hace:</span> {Math.abs(diasVencimiento)} días
                </div>
              )}
            </div>
          </div>
          
          {/* Último mantenimiento */}
          {extintor.ultimo_mantenimiento && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                Último mant.: {formatDate(extintor.ultimo_mantenimiento)}
              </span>
            </div>
          )}
        </div>

        {/* Observaciones */}
        {extintor.observaciones && (
          <div className="mb-4 p-2 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 line-clamp-2">
              {extintor.observaciones}
            </p>
          </div>
        )}
      </div>
      
      {/* Acciones - Movidas al final de la tarjeta */}
      <div className="border-t mt-4 pt-3 flex justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/qr/${extintor.id}`, '_blank')}
          className="flex-1 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
        >
          <div className="flex flex-col items-center">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-xs mt-1 font-medium text-blue-600">Ver QR</span>
          </div>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(extintor)}
          className="flex-1 rounded-md border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all"
        >
          <div className="flex flex-col items-center">
            <Edit className="h-5 w-5 text-green-600" />
            <span className="text-xs mt-1 font-medium text-green-600">Editar</span>
          </div>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(extintor.id)}
          className="flex-1 rounded-md border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-all"
        >
          <div className="flex flex-col items-center">
            <Trash2 className="h-5 w-5 text-red-600" />
            <span className="text-xs mt-1 font-medium text-red-600">Eliminar</span>
          </div>
        </Button>
      </div>
      {/* Renderizar el tooltip detallado */}
      {renderDetailedTooltip()}
    </div>
  );
};

// Exportación nombrada ya definida arriba
