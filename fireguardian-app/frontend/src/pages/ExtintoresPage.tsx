import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FileText, Filter, Plus, Search, X } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiClient } from '../utils/api';
import { Extintor, ExtintorFilters, ExtintorFormData } from '../types';
import { ExtintorCard } from '../components/extintores/ExtintorCard';

const ExtintoresPage: React.FC = () => {
  // Estado para el formulario y filtros
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExtintor, setCurrentExtintor] = useState<Extintor | null>(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estado para filtros API
  const [filters, setFilters] = useState<ExtintorFilters>({
    search: '',
    tipo_id: undefined,
    ubicacion_id: undefined,
    estado: undefined,
    page: 1,
    limit: 50,
    sort: 'codigo',
    order: 'asc'
  });
  
  // Estado para formulario
  const [formData, setFormData] = useState<ExtintorFormData>({
    codigo: '',
    tipo_id: '',
    ubicacion_id: 0,
    capacidad: '',
    fecha_vencimiento: new Date().toISOString().split('T')[0],
    fecha_recarga: '',
    observaciones: '',
    estado: 'ACTIVO' // Estado por defecto
  });
  
  // Estado para la sede seleccionada
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  
  // Función para actualizar los filtros
  const updateFilters = (newFilters: Partial<ExtintorFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1
    }));
  };

  // Actualizar filtros cuando cambian los criterios de búsqueda
  useEffect(() => {
    updateFilters({
      search: searchTerm,
      tipo_id: filterTipo || undefined,
      estado: filterEstado || undefined,
      page: currentPage
    });
  }, [searchTerm, filterTipo, filterEstado, currentPage]);
  
  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Queries
  const { data: extintoresData, isLoading, error } = useQuery({ 
    queryKey: ['extintores', filters],
    queryFn: () => apiClient.getExtintores(filters),
    staleTime: 5000,
    refetchOnWindowFocus: false
  });
  
  const extintores = extintoresData?.data || [];

  const { data: tiposExtintores = [] } = useQuery({
    queryKey: ['tipos-extintores'],
    queryFn: () => apiClient.getTiposExtintores()
  });

  const { data: sedes = [] } = useQuery({
    queryKey: ['sedes'],
    queryFn: () => apiClient.getSedes()
  });

  const { data: ubicaciones = [] } = useQuery({
    queryKey: ['ubicaciones'],
    queryFn: () => apiClient.getUbicaciones()
  });
  
  // Filtrar ubicaciones por sede seleccionada
  const filteredUbicaciones = selectedSedeId
    ? ubicaciones.filter((ubicacion: any) => {
        const sedeId = ubicacion.sede_id || (ubicacion.sede && ubicacion.sede.id);
        return sedeId === selectedSedeId;
      })
    : [];

  // Mutación para crear extintor
  const createMutation = useMutation({
    mutationFn: (extintor: ExtintorFormData) => apiClient.createExtintor(extintor),
    onSuccess: () => {
      toast.success('Extintor creado correctamente');
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['extintores'] });
    },
    onError: (error: any) => {
      console.error('Error al crear extintor:', error);
      toast.error('Error al crear el extintor');
    }
  });

  // Mutación para actualizar extintor
  const updateMutation = useMutation({
    mutationFn: ({ id, extintor }: { id: number, extintor: ExtintorFormData }) => 
      apiClient.updateExtintor(id, extintor),
    onSuccess: () => {
      toast.success('Extintor actualizado correctamente');
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['extintores'] });
    },
    onError: (error: any) => {
      console.error('Error al actualizar extintor:', error);
      toast.error('Error al actualizar el extintor');
    }
  });

  // Mutación para eliminar extintor
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteExtintor(id),
    onSuccess: () => {
      toast.success('Extintor eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['extintores'] });
    },
    onError: (error: any) => {
      console.error('Error al eliminar extintor:', error);
      toast.error('Error al eliminar el extintor');
    }
  });

  const resetForm = () => {
    setFormData({
      codigo: '', // Este campo se usará como codigo_interno en el backend
      tipo_id: '',
      ubicacion_id: 0,
      capacidad: '',
      fecha_vencimiento: new Date().toISOString().split('T')[0],
      fecha_recarga: '',
      observaciones: '',
      estado: 'ACTIVO' // Estado por defecto
    });
    setSelectedSedeId(null);
    setIsEditing(false);
    setCurrentExtintor(null);
    setShowForm(false);
  };

  // Función para manejar la edición de un extintor
  const handleEdit = (extintor: Extintor) => {
    setCurrentExtintor(extintor);
    
    // Obtener la sede_id de la ubicación
    const ubicacion = ubicaciones.find(u => u.id === extintor.ubicacion_id);
    const sedeId = ubicacion?.sede_id || (ubicacion?.sede && ubicacion.sede.id) || null;
    
    // Establecer la sede seleccionada
    setSelectedSedeId(sedeId);
    
    // Usar el estado explícito del extintor si existe, o determinarlo por las propiedades calculadas
    let estadoExtintor: 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA' = 'ACTIVO';
    
    if (extintor.estado) {
      // Si el extintor tiene un estado explícito, usarlo
      estadoExtintor = extintor.estado as 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA';
    } else {
      // Fallback a la lógica anterior para compatibilidad
      if (extintor.estado_vencimiento === 'vencido') {
        estadoExtintor = 'VENCIDO';
      } else if (extintor.requiere_mantenimiento) {
        estadoExtintor = 'MANTENIMIENTO';
      } else if (extintor.estado_vencimiento === 'vigente' && !extintor.requiere_mantenimiento) {
        estadoExtintor = 'ACTIVO';
      }
    }
    
    // Log para depuración
    console.log('Editando extintor:', {
      extintor,
      codigo: extintor.codigo,
      codigo_interno: extintor.codigo_interno
    });
    
    setFormData({
      codigo: extintor.codigo || extintor.codigo_interno || '', // Usar codigo si existe, sino usar codigo_interno
      tipo_id: extintor.tipo_id,
      ubicacion_id: extintor.ubicacion_id,
      capacidad: extintor.capacidad || '',
      fecha_vencimiento: extintor.fecha_vencimiento,
      fecha_recarga: extintor.fecha_recarga || '',
      observaciones: extintor.observaciones || '',
      estado: estadoExtintor
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Función para manejar la eliminación de un extintor
  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este extintor?')) {
      deleteMutation.mutate(id);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar los datos para enviar al backend
    const extintorData = {
      ...formData,
      codigo_interno: formData.codigo // Mapear 'codigo' a 'codigo_interno' para el backend
    };
    
    // Log para depuración
    console.log('Enviando datos de extintor:', { 
      formData, 
      extintorData,
      codigo: formData.codigo,
      codigo_interno: extintorData.codigo_interno 
    });
    
    if (isEditing && currentExtintor) {
      updateMutation.mutate({
        id: currentExtintor.id,
        extintor: extintorData
      });
    } else {
      createMutation.mutate(extintorData);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Error al cargar extintores
        </h3>
        <p className="text-gray-500 mb-6">
          No se pudieron cargar los datos. Verifica tu conexión.
        </p>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Extintores</h1>
          <p className="text-gray-600 mt-1">
            Gestiona el inventario de extintores ({extintores.length} total)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button 
            onClick={() => {
              setIsEditing(false);
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Extintor
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                placeholder="Buscar por código o ubicación..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {tiposExtintores.map((tipo: any) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="MANTENIMIENTO">En Mantenimiento</option>
              <option value="VENCIDO">Vencido</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Información de total y paginación */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Mostrando {extintores.length} de {extintoresData?.total || 0} extintores
        </div>
      </div>

      {/* Lista de Extintores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extintores.map((extintor: Extintor) => (
          <ExtintorCard 
            key={extintor.id}
            extintor={extintor}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {/* Controles de paginación */}
      {extintoresData?.totalPages && extintoresData.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
              «
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
              ‹
            </button>
            
            {/* Números de página */}
            {Array.from({ length: Math.min(5, extintoresData.totalPages) }, (_, i) => {
              // Mostrar páginas alrededor de la actual
              let pageNum;
              if (extintoresData.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= extintoresData.totalPages - 2) {
                pageNum = extintoresData.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === extintoresData.totalPages}
              className={`px-3 py-1 rounded ${currentPage === extintoresData.totalPages ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
              ›
            </button>
            <button
              onClick={() => handlePageChange(extintoresData.totalPages)}
              disabled={currentPage === extintoresData.totalPages}
              className={`px-3 py-1 rounded ${currentPage === extintoresData.totalPages ? 'bg-gray-200 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {extintores.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🧯</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron extintores
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterTipo || filterEstado 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer extintor al inventario'
                }
              </p>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                  setShowForm(true);
                }}
              >
                Agregar Extintor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {showForm && (
        <>
          {/* Overlay que cubre toda la pantalla - corregido para cubrir completamente */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-70 m-0 p-0 w-screen h-screen overflow-hidden" 
            onClick={() => setShowForm(false)}
            style={{ margin: 0, padding: 0 }}
          ></div>
          
          {/* Modal - posicionado encima del overlay */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 m-0 overflow-hidden">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-4 relative mx-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? 'Editar Extintor' : 'Nuevo Extintor'}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowForm(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-4 gap-y-2">
              {/* Primera columna */}
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                    <span className="text-xs text-gray-500 ml-1">(se guardará como código interno)</span>
                  </label>
                  <Input
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    placeholder="EXT-001"
                    required
                    className="focus:border-red-500 focus:ring-red-500"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Extintor
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.tipo_id}
                    onChange={(e) => setFormData({...formData, tipo_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposExtintores.map((tipo: any) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre} - {tipo.agente_extintor}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sede
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={selectedSedeId || ''}
                    onChange={(e) => {
                      const sedeId = e.target.value ? parseInt(e.target.value) : null;
                      setSelectedSedeId(sedeId);
                      // Resetear la ubicación cuando cambia la sede
                      setFormData({...formData, ubicacion_id: 0});
                    }}
                    required
                  >
                    <option value="">Seleccionar sede</option>
                    {sedes.map((sede: any) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.ubicacion_id}
                    onChange={(e) => setFormData({...formData, ubicacion_id: parseInt(e.target.value)})}
                    disabled={!selectedSedeId}
                    required
                  >
                    <option value={0}>Seleccionar ubicación</option>
                    {filteredUbicaciones.map((ubicacion: any) => (
                      <option key={ubicacion.id} value={ubicacion.id}>
                        {ubicacion.nombre_area || ubicacion.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Segunda columna */}
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <Input
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado del Extintor
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.estado || 'ACTIVO'}
                    onChange={(e) => setFormData({...formData, estado: e.target.value as 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA'})}
                    required
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="MANTENIMIENTO">En Mantenimiento</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>
                    
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
              
              {/* Botones de acción - ocupan todo el ancho */}
              <div className="col-span-2 flex justify-end gap-3 pt-3 border-t border-gray-200 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExtintoresPage;
