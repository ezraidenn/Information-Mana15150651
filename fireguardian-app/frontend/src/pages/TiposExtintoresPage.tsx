import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiClient } from '../utils/api';
import { TipoExtintor } from '../types';
import { ExtintorVirtualLabel } from '../components/extintores/ExtintorVirtualLabel';

const TiposExtintoresPage: React.FC = () => {
  // Estado para el formulario y filtros
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTipo, setCurrentTipo] = useState<TipoExtintor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para formulario
  const [formData, setFormData] = useState<Partial<TipoExtintor>>({
    id: '',
    nombre: '',
    descripcion: '',
    uso_recomendado: '',
    color_hex: '#FF0000',
    color_secundario_hex: '#FFFFFF',
    agente_extintor: 'PQS',
    clase_fuego: ['A', 'B', 'C'],
    capacidad: '4.5kg',
    forma_etiqueta: 'rectangular',
    normativa: 'NOM-154-SCFI-2005'
  });

  const queryClient = useQueryClient();
  
  // Obtener todos los tipos de extintores
  const { data: tiposExtintores = [], isLoading, error } = useQuery({
    queryKey: ['tipos-extintores'],
    queryFn: () => apiClient.getTiposExtintores(),
    staleTime: 5000,
    refetchOnWindowFocus: false
  });

  // Filtrar tipos de extintores según término de búsqueda
  const filteredTipos = tiposExtintores.filter(tipo => 
    tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    tipo.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutación para crear tipo de extintor
  const createMutation = useMutation({
    mutationFn: (tipo: Partial<TipoExtintor>) => apiClient.createTipoExtintor(tipo),
    onSuccess: () => {
      toast.success('Tipo de extintor creado correctamente');
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['tipos-extintores'] });
    },
    onError: (error: any) => {
      console.error('Error al crear tipo de extintor:', error);
      toast.error('Error al crear el tipo de extintor');
    }
  });

  // Mutación para actualizar tipo de extintor
  const updateMutation = useMutation({
    mutationFn: ({ id, tipo }: { id: string, tipo: Partial<TipoExtintor> }) => 
      apiClient.updateTipoExtintor(id, tipo),
    onSuccess: () => {
      toast.success('Tipo de extintor actualizado correctamente');
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['tipos-extintores'] });
    },
    onError: (error: any) => {
      console.error('Error al actualizar tipo de extintor:', error);
      toast.error('Error al actualizar el tipo de extintor');
    }
  });

  // Mutación para eliminar tipo de extintor
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTipoExtintor(id),
    onSuccess: () => {
      toast.success('Tipo de extintor eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['tipos-extintores'] });
    },
    onError: (error: any) => {
      console.error('Error al eliminar tipo de extintor:', error);
      toast.error('Error al eliminar el tipo de extintor');
    }
  });

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      id: '',
      nombre: '',
      descripcion: '',
      uso_recomendado: '',
      color_hex: '#FF0000',
      color_secundario_hex: '#FFFFFF',
      agente_extintor: 'Polvo Químico Seco',
      clase_fuego: ['A', 'B', 'C'],
      capacidad: '4.5kg',
      forma_etiqueta: 'rectangular',
      normativa: 'NOM-154-SCFI-2005'
    });
    setCurrentTipo(null);
    setIsEditing(false);
  };

  // Función para manejar la edición de un tipo de extintor
  const handleEdit = (tipo: TipoExtintor) => {
    setCurrentTipo(tipo);
    console.log('Editando tipo:', tipo);
    
    setFormData({
      id: tipo.id,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
      uso_recomendado: tipo.uso_recomendado || '',
      color_hex: tipo.color_hex || '#FF0000',
      color_secundario_hex: tipo.color_secundario_hex || '#FFFFFF',
      // Ya no usamos agente_extintor
      clase_fuego: tipo.clase_fuego || ['A', 'B', 'C'],
      capacidad: tipo.capacidad || '4.5kg',
      forma_etiqueta: tipo.forma_etiqueta || 'rectangular',
      normativa: tipo.normativa || 'NOM-154-SCFI-2005'
    });
    
    setIsEditing(true);
    setShowForm(true);
  };

  // Función para manejar la eliminación de un tipo de extintor
  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tipo de extintor?')) {
      deleteMutation.mutate(id);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ya no necesitamos el campo agente_extintor
    const dataToSubmit = {
      ...formData,
      // Eliminamos la referencia a agente_extintor
    };
    
    console.log('Enviando datos:', dataToSubmit);
    
    if (isEditing && currentTipo) {
      updateMutation.mutate({ id: currentTipo.id, tipo: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tipos de Extintores</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={18} className="mr-1" /> Nuevo Tipo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          Error al cargar los tipos de extintores. Por favor, intenta de nuevo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTipos.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No se encontraron tipos de extintores.
            </div>
          ) : (
            filteredTipos.map((tipo) => (
              <Card key={tipo.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex justify-between items-center p-3 bg-gray-50">
                  <div className="flex items-center">
                    <div 
                      className="w-5 h-5 rounded-full mr-2" 
                      style={{ backgroundColor: tipo.color_hex || '#FF0000' }}
                    ></div>
                    <h3 className="font-medium">{tipo.nombre}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(tipo)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <Edit size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Etiqueta Virtual - Centrada y ocupando todo el espacio */}
                  <div className="flex justify-center py-4 px-2">
                    <ExtintorVirtualLabel 
                      tipo={tipo} 
                      size="md"
                      showDetails={true} 
                      showLogo={true}
                      codigoQR={tipo.id}
                      fechaRecarga={new Date().toISOString()}
                      fechaVencimiento={new Date(Date.now() + 31536000000).toISOString()} // 1 año en el futuro
                    />
                  </div>
                  
                  {/* Información adicional que no está en el componente ExtintorVirtualLabel */}
                  <div className="p-3 border-t grid grid-cols-2 gap-2">
                    {tipo.capacidad && (
                      <div className="text-xs">
                        <span className="font-semibold text-gray-500">Capacidad:</span> {tipo.capacidad}
                      </div>
                    )}
                    {tipo.normativa && (
                      <div className="text-xs">
                        <span className="font-semibold text-gray-500">Norma:</span> {tipo.normativa}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal para crear/editar tipo de extintor */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Editar Tipo de Extintor' : 'Nuevo Tipo de Extintor'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-3 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="ID"
                  value={formData.id || ''}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  required
                  placeholder="ABC"
                  disabled={isEditing}
                />
                <Input
                  label="Nombre"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                  placeholder="Extintor ABC"
                />
              </div>
              
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={2}
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción del tipo de extintor..."
                />
              </div>
              
              {/* Datos para la etiqueta virtual */}
              <div className="pt-2 pb-1 border-t border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Datos para Etiqueta Virtual</h3>
                
                <div className="grid grid-cols-1 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacidad
                    </label>
                    <input
                      type="text"
                      value={formData.capacidad || ''}
                      onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="4.5kg, 6kg, 9kg"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clases de Fuego
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D', 'K'].map(clase => (
                      <label key={clase} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.clase_fuego?.includes(clase) || false}
                          onChange={(e) => {
                            const currentClases = formData.clase_fuego || [];
                            const newClases = e.target.checked 
                              ? [...currentClases, clase]
                              : currentClases.filter(c => c !== clase);
                            setFormData({...formData, clase_fuego: newClases});
                          }}
                          className="form-checkbox h-4 w-4 text-red-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-1 mr-2 text-sm">Clase {clase}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Principal
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={formData.color_hex || '#FF0000'}
                        onChange={(e) => setFormData({...formData, color_hex: e.target.value})}
                        className="w-8 h-8 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        value={formData.color_hex || '#FF0000'}
                        onChange={(e) => setFormData({...formData, color_hex: e.target.value})}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="#FF0000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Secundario
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={formData.color_secundario_hex || '#FFFFFF'}
                        onChange={(e) => setFormData({...formData, color_secundario_hex: e.target.value})}
                        className="w-8 h-8 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        value={formData.color_secundario_hex || '#FFFFFF'}
                        onChange={(e) => setFormData({...formData, color_secundario_hex: e.target.value})}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Normativa
                  </label>
                  <input
                    type="text"
                    value={formData.normativa || ''}
                    onChange={(e) => setFormData({...formData, normativa: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="NOM-154-SCFI-2005"
                  />
                </div>
              </div>
              
              <Input
                label="Uso Recomendado"
                value={formData.uso_recomendado || ''}
                onChange={(e) => setFormData({...formData, uso_recomendado: e.target.value})}
                placeholder="Fuegos clase A, B, C"
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
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiposExtintoresPage;
