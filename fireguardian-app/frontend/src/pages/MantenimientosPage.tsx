import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Plus, Search, Filter, Calendar, User, FileText, 
  CheckCircle, AlertTriangle, Clock, Edit, Trash2, Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRevalidation } from '../contexts/RevalidationContext';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';
import { Mantenimiento, MantenimientoFormData } from '../types';

// Usando los tipos importados desde '../types'

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMantenimiento, setEditingMantenimiento] = useState<Mantenimiento | null>(null);
  const [formData, setFormData] = useState<LocalMantenimientoFormData>({
    extintor_id: 0,
    tipo_evento: 'inspeccion',
    fecha: '',
    descripcion: ''
  });

  const queryClient = useQueryClient();
  const { invalidateQueries } = useRevalidation();
  // Queries
  const { data: mantenimientos = [], isLoading, error } = useQuery({
    queryKey: ['mantenimientos', searchTerm, filterTipo, filterEstado],
    queryFn: () => apiClient.getMantenimientos({
      search: searchTerm,
      tipo: filterTipo,
      estado: filterEstado
    }),
    refetchInterval: 30000
  });

  const { data: extintoresResponse } = useQuery({
    queryKey: ['extintores-select'],
    queryFn: () => apiClient.getExtintores({})
  });

  // Extraer el array de extintores de la respuesta paginada
  const extintores = extintoresResponse?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: MantenimientoFormData) => apiClient.createMantenimiento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
      // Actualizar el dashboard cuando se crea un nuevo mantenimiento
      invalidateQueries(['dashboardStats', 'dashboardActivity', 'dashboardAlerts']);
      toast.success('Mantenimiento registrado exitosamente');
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al registrar mantenimiento');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MantenimientoFormData }) => 
      apiClient.updateMantenimiento(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
      // Actualizar el dashboard cuando se actualiza un mantenimiento
      invalidateQueries(['dashboardStats', 'dashboardActivity', 'dashboardAlerts']);
      toast.success('Mantenimiento actualizado exitosamente');
      setShowForm(false);
      setEditingMantenimiento(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al actualizar mantenimiento');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteMantenimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
      // Actualizar el dashboard cuando se elimina un mantenimiento
      invalidateQueries(['dashboardStats', 'dashboardActivity', 'dashboardAlerts']);
      toast.success('Mantenimiento eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al eliminar mantenimiento');
    }
  });

  const resetForm = () => {
    setFormData({
      extintor_id: 0,
      tipo_evento: 'inspeccion',
      fecha: '',
      descripcion: ''
    });
  };

  const handleEdit = (mantenimiento: Mantenimiento) => {
    setEditingMantenimiento(mantenimiento);
    setFormData({
      extintor_id: mantenimiento.extintor_id,
      tipo_evento: mantenimiento.tipo.toLowerCase() as any, // Convertir a minúsculas
      fecha: mantenimiento.fecha_mantenimiento,
      descripcion: mantenimiento.observaciones,
      tecnico_id: mantenimiento.tecnico_id
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este mantenimiento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMantenimiento) {
      updateMutation.mutate({ id: editingMantenimiento.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getTipoColor = (tipo: string) => {
    const tipoUpper = tipo.toUpperCase();
    switch (tipoUpper) {
      case 'INSPECCION': return 'text-blue-600 bg-blue-100';
      case 'RECARGA': return 'text-green-600 bg-green-100';
      case 'REPARACION': return 'text-orange-600 bg-orange-100';
      case 'INCIDENTE': return 'text-red-600 bg-red-100';
      case 'REEMPLAZO': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoColor = (estado: string) => {
    const estadoUpper = estado?.toUpperCase() || 'COMPLETADO';
    switch (estadoUpper) {
      case 'COMPLETADO': return 'text-green-600 bg-green-100';
      case 'EN_PROCESO': return 'text-yellow-600 bg-yellow-100';
      case 'PENDIENTE': return 'text-red-600 bg-red-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    const estadoUpper = estado?.toUpperCase() || 'COMPLETADO';
    switch (estadoUpper) {
      case 'COMPLETADO': return CheckCircle;
      case 'EN_PROCESO': return Clock;
      case 'PENDIENTE': return AlertTriangle;
      default: return CheckCircle;
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
          Error al cargar mantenimientos
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Wrench className="h-8 w-8 mr-3 text-blue-600" />
            Mantenimientos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona el historial de mantenimientos ({mantenimientos.length} registros)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>
            Exportar
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingMantenimiento(null);
              resetForm();
              setShowForm(true);
            }}
          >
            Nuevo Mantenimiento
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por extintor o técnico..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="PREVENTIVO">Preventivo</option>
              <option value="CORRECTIVO">Correctivo</option>
              <option value="RECARGA">Recarga</option>
              <option value="PRUEBA_HIDROSTATICA">Prueba Hidrostática</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="COMPLETADO">Completado</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Mantenimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {mantenimientos.map((mantenimiento: Mantenimiento) => {
            const EstadoIcon = getEstadoIcon(mantenimiento.estado);
            return (
              <motion.div
                key={mantenimiento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {mantenimiento.extintor_codigo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {mantenimiento.extintor_ubicacion}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(mantenimiento.tipo)}`}>
                        {mantenimiento.tipo.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoColor(mantenimiento.estado)}`}>
                        <EstadoIcon className="w-3 h-3" />
                        {mantenimiento.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{mantenimiento.fecha_mantenimiento ? new Date(mantenimiento.fecha_mantenimiento).toLocaleDateString() : 'Sin fecha'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Próximo: {mantenimiento.fecha_proxima ? new Date(mantenimiento.fecha_proxima).toLocaleDateString() : 'Sin fecha'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      Técnico: {mantenimiento.tecnico}
                    </div>
                    {mantenimiento.costo && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 text-center">$</span>
                        Costo: ${mantenimiento.costo.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {mantenimiento.observaciones && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {mantenimiento.observaciones}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Por: {mantenimiento.creado_por || 'Sistema'} • {mantenimiento.created_at ? new Date(mantenimiento.created_at).toLocaleDateString() : 'Fecha desconocida'}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => window.open(`/evidencia/${mantenimiento.id}`, '_blank')}
                      >
                        Ver Evidencia
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit className="h-4 w-4" />}
                        onClick={() => handleEdit(mantenimiento)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDelete(mantenimiento.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Estado vacío */}
      {mantenimientos.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron mantenimientos
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterTipo || filterEstado 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza registrando el primer mantenimiento'
                }
              </p>
              <Button 
                onClick={() => {
                  setEditingMantenimiento(null);
                  resetForm();
                  setShowForm(true);
                }}
              >
                Registrar Mantenimiento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingMantenimiento ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Extintor
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.extintor_id}
                      onChange={(e) => setFormData({...formData, extintor_id: parseInt(e.target.value)})}
                      required
                    >
                      <option value={0}>Seleccionar extintor</option>
                      {extintores.map((extintor: any) => (
                        <option key={extintor.id} value={extintor.id}>
                          {extintor.codigo} - {extintor.ubicacion}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Mantenimiento
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="PREVENTIVO">Preventivo</option>
                      <option value="CORRECTIVO">Correctivo</option>
                      <option value="RECARGA">Recarga</option>
                      <option value="PRUEBA_HIDROSTATICA">Prueba Hidrostática</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Fecha de Mantenimiento"
                    type="date"
                    value={formData.fecha_mantenimiento}
                    onChange={(e) => setFormData({...formData, fecha_mantenimiento: e.target.value})}
                    required
                  />
                  
                  <Input
                    label="Fecha Próximo Mantenimiento"
                    type="date"
                    value={formData.fecha_proxima}
                    onChange={(e) => setFormData({...formData, fecha_proxima: e.target.value})}
                    required
                  />
                  
                  <Input
                    label="Costo (opcional)"
                    type="number"
                    step="0.01"
                    value={formData.costo || ''}
                    onChange={(e) => setFormData({...formData, costo: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      placeholder="Detalles del mantenimiento realizado..."
                      required
                    />
                  </div>
                  
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
                      loading={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingMantenimiento ? 'Actualizar' : 'Registrar'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MantenimientosPage;
