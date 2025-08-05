import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Edit, Search, X, Building, MapPin, Plus } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiClient, apiQueries } from '../utils/api';
import { Sede, Ubicacion } from '../types';

const UbicacionesPage: React.FC = () => {
  // Estado para el formulario y filtros
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'sede' | 'ubicacion'>('sede');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSede, setCurrentSede] = useState<Sede | null>(null);
  const [currentUbicacion, setCurrentUbicacion] = useState<Ubicacion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para formulario de sede
  const [sedeFormData, setSedeFormData] = useState<Partial<Sede>>({
    nombre: '',
    direccion: ''
  });

  // Estado para formulario de ubicación
  const [ubicacionFormData, setUbicacionFormData] = useState<Partial<Ubicacion>>({
    nombre_area: '',
    descripcion: '',
    sede_id: 0
  });

  const queryClient = useQueryClient();
  
  // Obtener todas las sedes
  const { 
    data: sedes = [], 
    isLoading: sedesLoading, 
    error: sedesError 
  } = useQuery({
    queryKey: apiQueries.keys.sedes,
    queryFn: apiQueries.functions.getSedes,
    staleTime: 0, // Sin caché para asegurar datos frescos
    refetchOnWindowFocus: true
  });

  // Obtener todas las ubicaciones
  const { 
    data: ubicaciones = [], 
    isLoading: ubicacionesLoading, 
    error: ubicacionesError,
    refetch: refetchUbicaciones
  } = useQuery({
    queryKey: apiQueries.keys.ubicaciones,
    queryFn: apiQueries.functions.getUbicaciones,
    staleTime: 0, // Sin caché para asegurar datos frescos
    refetchOnWindowFocus: true
  });

  // Filtrar sedes según término de búsqueda
  const filteredSedes = (sedes as Sede[]).filter((sede: Sede) => 
    sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sede.direccion && sede.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Asegurarse de que todas las ubicaciones tengan la propiedad sede_id
  const ubicacionesConSede = ubicaciones.map(ubicacion => {
    // Si la ubicación ya tiene sede_id, la dejamos como está
    if (ubicacion.sede_id) {
      return ubicacion;
    }
    // Si no tiene sede_id pero tiene sede con id, usamos ese id
    if (ubicacion.sede && ubicacion.sede.id) {
      return { ...ubicacion, sede_id: ubicacion.sede.id };
    }
    // Si no tiene ninguno de los dos, la dejamos como está (aunque no se mostrará correctamente)
    return ubicacion;
  });

  // Nota: No necesitamos filtrar ubicaciones globalmente ya que las filtramos por sede

  // Mutación para crear sede
  const createSedeMutation = useMutation({
    mutationFn: (sede: Partial<Sede>) => {
      // Asegurarse de que nombre es una cadena no vacía
      if (!sede.nombre) {
        throw new Error('El nombre de la sede es requerido');
      }
      return apiClient.createSede({
        nombre: sede.nombre,
        direccion: sede.direccion
      });
    },
    onSuccess: () => {
      toast.success('Sede creada correctamente');
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.sedes });
    },
    onError: (error: any) => {
      console.error('Error al crear sede:', error);
      toast.error('Error al crear la sede');
    }
  });

  // Mutación para crear ubicación
  const createUbicacionMutation = useMutation({
    mutationFn: (ubicacion: Partial<Ubicacion>) => {
      // Asegurarse de que los campos requeridos existen
      if (!ubicacion.nombre_area) {
        throw new Error('El nombre del área es requerido');
      }
      if (!ubicacion.sede_id) {
        throw new Error('La sede es requerida');
      }
      console.log('Enviando datos al backend:', ubicacion);
      return apiClient.createUbicacion({
        nombre_area: ubicacion.nombre_area,
        descripcion: ubicacion.descripcion,
        sede_id: ubicacion.sede_id
      });
    },
    onSuccess: (data) => {
      console.log('Ubicación creada exitosamente:', data);
      toast.success('Ubicación creada correctamente');
      setShowForm(false);
      resetForm();
      
      // Invalidar ambas consultas para asegurar que los datos se actualicen
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.ubicaciones });
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.sedes });
      
      // Forzar una recarga inmediata
      refetchUbicaciones();
    },
    onError: (error: any) => {
      console.error('Error al crear ubicación:', error);
      toast.error(`Error al crear la ubicación: ${error.message || 'Error desconocido'}`);
    }
  });

  // Función para resetear el formulario
  const resetForm = () => {
    setSedeFormData({
      nombre: '',
      direccion: ''
    });
    setUbicacionFormData({
      nombre_area: '',
      descripcion: '',
      sede_id: 0
    });
    setCurrentSede(null);
    setCurrentUbicacion(null);
    setIsEditing(false);
  };

  // Función para manejar la edición de una sede
  const handleEditSede = (sede: Sede) => {
    setFormType('sede');
    setCurrentSede(sede);
    setSedeFormData({
      nombre: sede.nombre,
      direccion: sede.direccion
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Función para manejar la edición de una ubicación
  const handleEditUbicacion = (ubicacion: Ubicacion) => {
    setFormType('ubicacion');
    setCurrentUbicacion(ubicacion);
    setUbicacionFormData({
      nombre_area: ubicacion.nombre_area,
      descripcion: ubicacion.descripcion,
      sede_id: ubicacion.sede_id
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Función para manejar el envío del formulario de sede
  const handleSubmitSede = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sedeFormData.nombre) {
      toast.error('El nombre de la sede es obligatorio');
      return;
    }
    
    if (isEditing && currentSede) {
      // Lógica para actualizar sede (pendiente de implementar en API)
      toast.error('Función de actualización de sede no implementada');
    } else {
      createSedeMutation.mutate({
        nombre: sedeFormData.nombre,
        direccion: sedeFormData.direccion
      });
    }
  };

  // Función para manejar el envío del formulario de ubicación
  const handleSubmitUbicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ubicacionFormData.nombre_area) {
      toast.error('El nombre del área es obligatorio');
      return;
    }
    
    if (!ubicacionFormData.sede_id) {
      toast.error('Debe seleccionar una sede');
      return;
    }
    
    if (isEditing && currentUbicacion) {
      // Lógica para actualizar ubicación (pendiente de implementar en API)
      toast.error('Función de actualización de ubicación no implementada');
    } else {
      try {
        console.log('Enviando datos del formulario:', ubicacionFormData);
        await createUbicacionMutation.mutateAsync({
          nombre_area: ubicacionFormData.nombre_area,
          descripcion: ubicacionFormData.descripcion,
          sede_id: ubicacionFormData.sede_id
        });
        
        // Forzar una recarga inmediata de las ubicaciones y sedes
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: apiQueries.keys.ubicaciones }),
          queryClient.invalidateQueries({ queryKey: apiQueries.keys.sedes })
        ]);
        
        // Esperar un momento y luego refrescar los datos
        setTimeout(() => {
          refetchUbicaciones();
        }, 1000);
      } catch (error: any) {
        console.error('Error al crear ubicación:', error);
        toast.error(`Error: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  // Función para abrir formulario de sede
  const openSedeForm = () => {
    setFormType('sede');
    resetForm();
    setShowForm(true);
  };

  // Función para abrir formulario de ubicación
  const openUbicacionForm = () => {
    setFormType('ubicacion');
    resetForm();
    setShowForm(true);
  };

  const isLoading = sedesLoading || ubicacionesLoading;
  const error = sedesError || ubicacionesError;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error al cargar los datos</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administración de Ubicaciones</h1>
        <div className="flex gap-2">
          <Button onClick={openSedeForm} className="flex items-center">
            <Building size={16} className="mr-1" />
            <span>Nueva Sede</span>
          </Button>
          <Button onClick={openUbicacionForm} className="flex items-center">
            <MapPin size={16} className="mr-1" />
            <span>Nueva Ubicación</span>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Visualización jerárquica de sedes y ubicaciones */}
      <div className="space-y-6">
        {filteredSedes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Building size={40} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No se encontraron sedes</p>
            <Button 
              onClick={openSedeForm} 
              variant="outline" 
              className="mt-4 flex items-center mx-auto"
            >
              <Plus size={16} className="mr-1" /> Crear nueva sede
            </Button>
          </div>
        ) : (
          filteredSedes.map((sede) => {
            // Filtrar ubicaciones que pertenecen a esta sede
            const sedeUbicaciones = ubicacionesConSede.filter(
              (ubicacion) => ubicacion.sede_id === sede.id
            );

            return (
              <Card key={sede.id} className="overflow-hidden">
                {/* Cabecera de la sede */}
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center">
                        <Building size={18} className="mr-2 text-gray-600" />
                        {sede.nombre}
                      </h2>
                      {sede.direccion && (
                        <p className="text-sm text-gray-500 mt-1">{sede.direccion}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditSede(sede)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* Áreas/Ubicaciones de esta sede */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                    <MapPin className="mr-1" size={16} /> 
                    Áreas/Ubicaciones ({sedeUbicaciones.length})
                  </h3>
                  
                  {sedeUbicaciones.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-md">
                      No hay áreas registradas en esta sede
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sedeUbicaciones.map(ubicacion => (
                        <div 
                          key={ubicacion.id} 
                          className="bg-white border border-gray-100 rounded-md p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{ubicacion.nombre_area}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditUbicacion(ubicacion)}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-red-600"
                            >
                              <Edit size={14} />
                            </Button>
                          </div>
                          {ubicacion.descripcion && (
                            <p className="text-sm text-gray-600">{ubicacion.descripcion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Botón para añadir nueva ubicación en esta sede */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setUbicacionFormData({...ubicacionFormData, sede_id: sede.id});
                      setFormType('ubicacion');
                      setShowForm(true);
                    }}
                    className="text-sm"
                  >
                    <Plus size={14} className="mr-1" /> Añadir área en {sede.nombre}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {formType === 'sede' 
                  ? (isEditing ? 'Editar Sede' : 'Nueva Sede') 
                  : (isEditing ? 'Editar Ubicación' : 'Nueva Ubicación')
                }
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {formType === 'sede' ? (
              <form onSubmit={handleSubmitSede}>
                <Input
                  label="Nombre de la Sede"
                  value={sedeFormData.nombre || ''}
                  onChange={(e) => setSedeFormData({...sedeFormData, nombre: e.target.value})}
                  placeholder="Nombre de la sede"
                  required
                />
                <Input
                  label="Dirección"
                  value={sedeFormData.direccion || ''}
                  onChange={(e) => setSedeFormData({...sedeFormData, direccion: e.target.value})}
                  placeholder="Dirección completa"
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={createSedeMutation.isPending}
                  >
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitUbicacion}>
                <Input
                  label="Nombre del Área"
                  value={ubicacionFormData.nombre_area || ''}
                  onChange={(e) => setUbicacionFormData({...ubicacionFormData, nombre_area: e.target.value})}
                  placeholder="Nombre del área o ubicación"
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sede
                  </label>
                  <select
                    value={ubicacionFormData.sede_id || ''}
                    onChange={(e) => setUbicacionFormData({
                      ...ubicacionFormData, 
                      sede_id: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Seleccione una sede</option>
                    {sedes.map(sede => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Descripción"
                  value={ubicacionFormData.descripcion || ''}
                  onChange={(e) => setUbicacionFormData({...ubicacionFormData, descripcion: e.target.value})}
                  placeholder="Descripción del área"
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={createUbicacionMutation.isPending}
                  >
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UbicacionesPage;
