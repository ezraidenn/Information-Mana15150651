import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, Edit, Trash2, 
  Shield, UserCheck, UserX, Key, AlertCircle, CheckCircle, X
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import toast from 'react-hot-toast';

// Usamos la interfaz User del archivo de tipos
import { User, UserFormData } from '../types';

// Extendemos User para incluir actualizado_en que se usa en la página
interface Usuario extends User {
  actualizado_en: string;
}

// Componente principal de la página de usuarios
const UsuariosPage: React.FC = () => {
  // Estado para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState<string | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);
  
  // Estado para modales
  const [showForm, setShowForm] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Estado para usuario seleccionado y formularios
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    email: '',
    password: '',
    rol: 'consulta'
  });
  const [newPassword, setNewPassword] = useState('');
  
  // Acceso al cliente de consulta para invalidar consultas
  const queryClient = useQueryClient();
  
  // Consulta para obtener usuarios con filtros
  const { data: usuarios, isLoading, isError } = useQuery({
    queryKey: ['usuarios', searchTerm, rolFilter, activeFilter],
    queryFn: () => apiClient.getUsuarios({
      search: searchTerm || undefined,
      rol: rolFilter,
      activo: activeFilter
    }),
    select: (data: User[]) => {
      // Convertir User a Usuario añadiendo actualizado_en
      return data.map(user => ({
        ...user,
        actualizado_en: user.ultimo_acceso || '-'
      }));
    }
  });
  
  // Mutación para crear usuario
  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => apiClient.createUsuario({
      nombre: data.nombre,
      email: data.email,
      password: data.password!,
      rol: data.rol
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario creado correctamente');
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error al crear usuario: ${error.message || 'Desconocido'}`);
    }
  });
  
  // Mutación para actualizar usuario
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) => 
      apiClient.updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario actualizado correctamente');
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Error al actualizar usuario: ${error.message || 'Desconocido'}`);
    }
  });
  
  // Mutación para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => 
      apiClient.changeUserPassword(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Contraseña cambiada correctamente');
      setShowPasswordDialog(false);
      setNewPassword('');
    },
    onError: (error: any) => {
      toast.error(`Error al cambiar contraseña: ${error.message || 'Desconocido'}`);
    }
  });
  
  // Mutación para activar/desactivar usuario
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => apiClient.toggleUserActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Estado de usuario actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(`Error al cambiar estado: ${error.message || 'Desconocido'}`);
    }
  });
  
  // Mutación para eliminar usuario
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado correctamente');
      setShowDeleteDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar usuario: ${error.message || 'Desconocido'}`);
    }
  });
  
  // Manejador para abrir formulario de creación
  const handleCreate = () => {
    setSelectedUser(null);
    resetForm();
    setShowForm(true);
  };
  
  // Manejador para abrir formulario de edición
  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol as 'admin' | 'tecnico' | 'consulta'
    });
    setShowForm(true);
  };
  
  // Manejador para abrir diálogo de cambio de contraseña
  const handlePasswordChange = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setNewPassword('');
    setShowPasswordDialog(true);
  };
  
  // Manejador para abrir diálogo de confirmación de eliminación
  const handleDelete = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowDeleteDialog(true);
  };
  
  // Manejador para activar/desactivar usuario
  const handleToggleActive = (usuario: Usuario) => {
    toggleActiveMutation.mutate(usuario.id);
  };
  
  // Manejador para enviar formulario de usuario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUser) {
      // Actualizar usuario existente
      const updateData: Partial<UserFormData> = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol
      };
      
      updateMutation.mutate({ 
        id: selectedUser.id, 
        data: updateData 
      });
    } else {
      // Crear nuevo usuario
      createMutation.mutate(formData);
    }
  };
  
  // Manejador para enviar cambio de contraseña
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUser && newPassword) {
      changePasswordMutation.mutate({
        id: selectedUser.id,
        password: newPassword
      });
    }
  };
  
  // Manejador para confirmar eliminación
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };
  
  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'consulta'
    });
  };
  
  // Variantes de animación para modales
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };
  
  // Función para obtener el color del rol
  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'tecnico':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Función para obtener el icono del rol
  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'tecnico':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <UserX className="w-4 h-4" />;
    }
  };
  
  // Variantes de animación para la lista
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };
  
  // Variantes de animación para cada elemento de la lista
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 w-full">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="mr-2" /> 
            Gestión de Usuarios
          </h1>
          <Button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
          </Button>
        </div>
        
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold flex items-center">
              <Filter className="w-4 h-4 mr-2" /> Filtros
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Nombre o email"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={rolFilter || ''}
                  onChange={(e) => setRolFilter(e.target.value || undefined)}
                >
                  <option value="">Todos</option>
                  <option value="admin">Administrador</option>
                  <option value="tecnico">Técnico</option>
                  <option value="consulta">Consulta</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={activeFilter || ''}
                  onChange={(e) => setActiveFilter(e.target.value || undefined)}
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setRolFilter(undefined);
                  setActiveFilter(undefined);
                }}
                className="text-sm"
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Lista de usuarios */}
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold">Usuarios</h2>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500">
                Error al cargar usuarios. Intente nuevamente.
              </div>
            ) : usuarios && usuarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Nombre</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Rol</th>
                      <th className="text-left py-3 px-4">Estado</th>
                      <th className="text-left py-3 px-4">Último Acceso</th>
                      <th className="text-right py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={listVariants}>
                    {usuarios.map((usuario) => (
                      <motion.tr 
                        key={usuario.id} 
                        className="border-b hover:bg-gray-50"
                        variants={itemVariants}
                      >
                        <td className="py-3 px-4">{usuario.nombre}</td>
                        <td className="py-3 px-4">{usuario.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getRolColor(usuario.rol)}`}>
                            {getRolIcon(usuario.rol)}
                            <span className="ml-1">
                              {usuario.rol === 'admin' ? 'Administrador' : 
                               usuario.rol === 'tecnico' ? 'Técnico' : 'Consulta'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span 
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              usuario.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {usuario.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{usuario.actualizado_en}</td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button
                            onClick={() => handleEdit(usuario)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handlePasswordChange(usuario)}
                            variant="ghost"
                            size="sm"
                            className="text-amber-600"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleToggleActive(usuario)}
                            variant="ghost"
                            size="sm"
                            className={usuario.activo ? 'text-gray-600' : 'text-green-600'}
                          >
                            {usuario.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            onClick={() => handleDelete(usuario)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No se encontraron usuarios con los filtros seleccionados.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Modal de creación/edición de usuario */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-lg w-full max-w-md"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <Input
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                  
                  {!selectedUser && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Contraseña</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Contraseña"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Rol</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.rol}
                      onChange={(e) => setFormData({
                        ...formData, 
                        rol: e.target.value as 'admin' | 'tecnico' | 'consulta'
                      })}
                      required
                    >
                      <option value="admin">Administrador</option>
                      <option value="tecnico">Técnico</option>
                      <option value="consulta">Consulta</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {selectedUser ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de cambio de contraseña */}
      <AnimatePresence>
        {showPasswordDialog && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-lg w-full max-w-md"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Cambiar Contraseña</h3>
                <Button
                  onClick={() => setShowPasswordDialog(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Cambiando contraseña para: <strong>{selectedUser.nombre}</strong>
                  </p>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowPasswordDialog(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    Cambiar Contraseña
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {showDeleteDialog && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-lg w-full max-w-md"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-red-600">Eliminar Usuario</h3>
                <Button
                  onClick={() => setShowDeleteDialog(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-md mb-4">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p className="text-sm">Esta acción no se puede deshacer.</p>
                </div>
                
                <p className="mb-4">
                  ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.nombre}</strong>?
                </p>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    onClick={() => setShowDeleteDialog(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    Eliminar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsuariosPage;
