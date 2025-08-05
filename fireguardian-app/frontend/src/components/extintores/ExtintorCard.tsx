import React from 'react';
import { Calendar, Clock, Edit, FileText, MapPin, Trash2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Extintor } from '../../types';
import { ClaseFuegoIcon } from './ClaseFuegoIcon';
import { Tooltip } from '../ui/Tooltip';

interface ExtintorCardProps {
  extintor: Extintor;
  onEdit: (extintor: Extintor) => void;
  onDelete: (id: number) => void;
}

export const ExtintorCard: React.FC<ExtintorCardProps> = ({ extintor, onEdit, onDelete }) => {
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

  // Obtener el icono del estado
  const EstadoIcon = getEstadoIcon(extintor.estado);

  // Obtener las clases de fuego del tipo de extintor
  const clasesFuego = extintor.tipo?.clase_fuego || [];

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
  
  // Obtener color para días de vencimiento
  const getColorDiasVencimiento = () => {
    if (diasVencimiento < 0) return 'text-red-600';
    if (diasVencimiento < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Obtener texto para días de vencimiento
  const getTextoDiasVencimiento = () => {
    if (diasVencimiento < 0) return `Vencido hace ${Math.abs(diasVencimiento)} días`;
    if (diasVencimiento === 0) return 'Vence hoy';
    if (diasVencimiento === 1) return 'Vence mañana';
    return `Vence en ${diasVencimiento} días`;
  };

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

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Encabezado con color según tipo de extintor */}
      <div 
        className="h-2" 
        style={{ backgroundColor: extintor.tipo?.color_hex || '#EF4444' }}
      ></div>
      
      <div className="p-6">
        {/* Encabezado con código y estado */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {extintor.codigo}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {extintor.tipo?.nombre || 'No especificado'} - {extintor.capacidad || ''}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoColor(extintor.estado)}`}>
            <EstadoIcon className="w-3 h-3" />
            {extintor.estado}
          </span>
        </div>

        {/* Clases de fuego */}
        {clasesFuego.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Clases de fuego:</p>
            <div className="flex gap-2">
              {clasesFuego.map((clase) => (
                <ClaseFuegoIcon key={clase} clase={clase} size="sm" />
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
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>
              <span className="text-gray-600">Vence: </span>
              <span className={getColorDiasVencimiento()}>
                {formatDate(extintor.fecha_vencimiento)}
              </span>
            </span>
          </div>
          
          {/* Días para vencimiento */}
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className={getColorDiasVencimiento()}>
              {getTextoDiasVencimiento()}
            </span>
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

        {/* Acciones */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/qr/${extintor.id}`, '_blank')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Ver QR
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(extintor)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(extintor.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Exportación nombrada ya definida arriba
