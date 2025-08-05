import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  ApiResponse, 
  User, 
  Extintor, 
  DashboardStats, 
  RecentActivity, 
  Alerts,
  ExtintorFilters,
  LoginCredentials,
  AuthResponse,
  ChangePasswordData,
  ExtintorFormData,
  MantenimientoFormData,
  UserFormData,
  Sede,
  Ubicacion,
  TipoExtintor,
  Mantenimiento
} from '../types';
import { storageUtils } from './index';
import toast from 'react-hot-toast';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Cargar token del localStorage
    this.token = storageUtils.get<string>('auth_token');
    if (this.token) {
      this.setAuthToken(this.token);
    }

    // Interceptor para requests
    this.client.interceptors.request.use(
      (config) => {
        // Agregar timestamp para evitar cache
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now()
          };
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para responses
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Si la respuesta no es exitosa según nuestra API
        if (!response.data.success) {
          throw new Error(response.data.error || 'Error desconocido');
        }
        return response;
      },
      (error: AxiosError<ApiResponse>) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Manejar errores de la API
   */
  private handleApiError(error: AxiosError<ApiResponse>): void {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      this.clearAuth();
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      window.location.href = '/login';
      return;
    }

    if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
      return;
    }

    if (error.response && error.response.status >= 500) {
      toast.error('Error del servidor. Por favor, intenta más tarde.');
      return;
    }

    // Error de red
    if (!error.response) {
      toast.error('Error de conexión. Verifica tu conexión a internet.');
      return;
    }

    // Mostrar mensaje de error específico de la API
    const message = error.response?.data?.error || 'Error desconocido';
    toast.error(message);
  }

  /**
   * Establecer token de autenticación
   */
  setAuthToken(token: string): void {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storageUtils.set('auth_token', token);
  }

  /**
   * Limpiar autenticación
   */
  clearAuth(): void {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    storageUtils.remove('auth_token');
    storageUtils.remove('user_data');
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const authData = response.data.data!;
    
    this.setAuthToken(authData.token);
    storageUtils.set('user_data', authData.user);
    
    return authData;
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Obtener perfil del usuario
   */
  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await this.client.post('/auth/change-password', data);
  }

  /**
   * Verificar token
   */
  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    const response = await this.client.get<ApiResponse<{ valid: boolean; user: User }>>('/auth/verify');
    return response.data.data!;
  }

  /**
   * Registrar nuevo usuario (solo admins)
   */
  async registerUser(userData: UserFormData): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>('/auth/register', userData);
    return response.data.data!;
  }

  // ==================== DASHBOARD ====================

  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data.data!;
  }

  /**
   * Obtener actividad reciente
   */
  async getRecentActivity(): Promise<RecentActivity> {
    const response = await this.client.get<ApiResponse<RecentActivity>>('/dashboard/recent-activity');
    return response.data.data!;
  }

  /**
   * Obtener métricas de rendimiento
   */
  async getPerformanceMetrics(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/dashboard/performance');
    return response.data.data!;
  }

  /**
   * Obtener alertas
   */
  async getAlerts(): Promise<Alerts> {
    const response = await this.client.get<ApiResponse<Alerts>>('/dashboard/alerts');
    return response.data.data!;
  }

  // ==================== EXTINTORES ====================

  /**
   * Obtener todos los extintores con filtros opcionales y paginación
   */
  async getExtintores(filters?: ExtintorFilters): Promise<{ data: Extintor[], total: number, page: number, limit: number, totalPages: number }> {
    try {
      console.log('API Client: Fetching extintores with filters:', filters);
      // Asegurarse de que los filtros sean correctos para el backend
      const cleanFilters: Record<string, any> = {};
      if (filters?.search) cleanFilters.search = filters.search;
      if (filters?.tipo_id) cleanFilters.tipo_id = filters.tipo_id;
      if (filters?.ubicacion_id) cleanFilters.ubicacion_id = filters.ubicacion_id;
      if (filters?.sede_id) cleanFilters.sede_id = filters.sede_id;
      if (filters?.estado) cleanFilters.estado = filters.estado; // Añadir filtro de estado
      if (filters?.estado_vencimiento) cleanFilters.estado_vencimiento = filters.estado_vencimiento;
      if (filters?.requiere_mantenimiento !== undefined) cleanFilters.requiere_mantenimiento = filters.requiere_mantenimiento;
      if (filters?.page) cleanFilters.page = filters.page;
      if (filters?.limit) cleanFilters.limit = filters.limit;
      if (filters?.sort_by) cleanFilters.sort_by = filters.sort_by;
      if (filters?.sort_order) cleanFilters.sort_order = filters.sort_order;
      
      // Hacer la petición con los filtros limpios
      const response = await this.client.get<ApiResponse<any>>('/extintores', { params: cleanFilters });
      
      // Verificar si la respuesta es exitosa y tiene datos
      if (!response.data || !response.data.success) {
        console.warn('API Client: Error en respuesta:', response.data?.error || 'Respuesta inválida');
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      }
      
      // Verificar si hay datos en la respuesta
      if (!response.data.data) {
        console.warn('API Client: No extintores data in response');
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      }
      
      console.log(`API Client: Fetched ${response.data.data.extintores?.length || 0} extintores`);
      
      // Extraer la estructura completa de la respuesta
      const result = {
        data: response.data.data.extintores || [],
        total: response.data.data.pagination?.total_items || 0,
        page: response.data.data.pagination?.current_page || 1,
        limit: response.data.data.pagination?.items_per_page || 20,
        totalPages: response.data.data.pagination?.total_pages || 0
      };
      
      return result;
    } catch (error) {
      console.error('API Client: Error fetching extintores:', error);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  }

  /**
   * Obtener extintor por ID
   */
  async getExtintor(id: number): Promise<Extintor | null> {
    try {
      const response = await this.client.get<ApiResponse<Extintor>>(`/extintores/${id}`);
      return response.data.success ? response.data.data || null : null;
    } catch (error) {
      console.error('API Client: Error fetching extintor by ID:', error);
      return null;
    }
  }

  /**
   * Crear un nuevo extintor
   */
  async createExtintor(data: ExtintorFormData): Promise<Extintor | null> {
    try {
      // Asegurarse de que codigo_interno esté presente
      const processedData = {
        ...data,
        codigo_interno: data.codigo // Siempre usar el campo codigo como codigo_interno
      };
      
      // Log para depuración
      console.log('API createExtintor - Datos procesados:', { 
        original: data,
        processed: processedData,
        codigo: data.codigo,
        codigo_interno: processedData.codigo_interno
      });
      
      // Si hay imagen, usar FormData
      if (data.imagen) {
        const formData = new FormData();
        Object.entries(processedData).forEach(([key, value]) => {
          if (key === 'imagen' && value instanceof File) {
            formData.append('imagen', value);
          } else if (value !== undefined && value !== null) {
            // Asegurarse de que el campo codigo se envíe como codigo_interno
            const apiKey = key === 'codigo' ? 'codigo_interno' : key;
            formData.append(apiKey, value.toString());
          }
        });
        
        // Log del FormData (solo para depuración)
        console.log('API createExtintor - FormData keys:', [...formData.keys()]);
        
        const response = await this.client.post<ApiResponse<Extintor>>('/extintores', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data.success ? response.data.data || null : null;
      } else {
        // Sin imagen, enviar JSON normal
        const response = await this.client.post<ApiResponse<Extintor>>('/extintores', processedData);
        return response.data.success ? response.data.data || null : null;
      }
    } catch (error) {
      console.error('API Client: Error creating extintor:', error);
      throw error;
    }
  }

  /**
   * Actualizar un extintor existente
   */
  async updateExtintor(id: number, data: ExtintorFormData): Promise<Extintor | null> {
    try {
      // Asegurarse de que codigo_interno esté presente
      const processedData = {
        ...data,
        codigo_interno: data.codigo // Siempre usar el campo codigo como codigo_interno
      };
      
      // Log para depuración
      console.log(`API updateExtintor(${id}) - Datos procesados:`, { 
        original: data,
        processed: processedData,
        codigo: data.codigo,
        codigo_interno: processedData.codigo_interno
      });
      
      // Si hay imagen, usar FormData
      if (data.imagen) {
        const formData = new FormData();
        Object.entries(processedData).forEach(([key, value]) => {
          if (key === 'imagen' && value instanceof File) {
            formData.append('imagen', value);
          } else if (value !== undefined && value !== null) {
            // Asegurarse de que el campo codigo se envíe como codigo_interno
            const apiKey = key === 'codigo' ? 'codigo_interno' : key;
            formData.append(apiKey, value.toString());
          }
        });
        
        // Log del FormData (solo para depuración)
        console.log(`API updateExtintor(${id}) - FormData keys:`, [...formData.keys()]);
        
        const response = await this.client.put<ApiResponse<Extintor>>(`/extintores/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Log de la respuesta
        console.log(`API updateExtintor(${id}) - Respuesta:`, response.data);
        
        return response.data.success ? response.data.data || null : null;
      } else {
        // Sin imagen, enviar JSON normal
        const response = await this.client.put<ApiResponse<Extintor>>(`/extintores/${id}`, processedData);
        
        // Log de la respuesta
        console.log(`API updateExtintor(${id}) - Respuesta:`, response.data);
        
        return response.data.success ? response.data.data || null : null;
      }
    } catch (error) {
      console.error('API Client: Error updating extintor:', error);
      throw error;
    }
  }

  /**
   * Eliminar un extintor
   */
  async deleteExtintor(id: number): Promise<boolean> {
    try {
      const response = await this.client.delete<ApiResponse<null>>(`/extintores/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('API Client: Error deleting extintor:', error);
      throw error;
    }
  }

  /**
   * Obtener extintores por ubicación
   */
  async getExtintoresByLocation(ubicacionId: number): Promise<Extintor[]> {
    try {
      const response = await this.client.get<ApiResponse<Extintor[]>>(`/ubicaciones/${ubicacionId}/extintores`);
      return response.data.success ? response.data.data || [] : [];
    } catch (error) {
      console.error('API Client: Error fetching extintores by location:', error);
      return [];
    }
  }

  // ==================== MANTENIMIENTOS ====================

  /**
   * Crear mantenimiento
   */
  async createMantenimiento(data: MantenimientoFormData): Promise<Mantenimiento> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'evidencia' && value instanceof File) {
          formData.append('evidencia', value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await this.client.post<ApiResponse<Mantenimiento>>('/mantenimientos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!;
  }

  /**
   * Obtener mantenimientos de un extintor
   */
  async getMantenimientos(extintorId: number): Promise<Mantenimiento[]> {
    const response = await this.client.get<ApiResponse<Mantenimiento[]>>(`/mantenimientos/extintor/${extintorId}`);
    return response.data.data!;
  }

  // ==================== SEDES Y UBICACIONES ====================

  /**
   * Obtener todas las sedes
   */
  async getSedes(): Promise<Sede[]> {
    const response = await this.client.get<ApiResponse<Sede[]>>('/sedes');
    return response.data.data || [];
  }

  /**
   * Obtener todas las ubicaciones
   */
  async getUbicaciones(): Promise<Ubicacion[]> {
    try {
      const response = await this.client.get<ApiResponse<Ubicacion[]>>('/ubicaciones');
      return response.data.success ? response.data.data || [] : [];
    } catch (error) {
      console.error('API Client: Error fetching ubicaciones:', error);
      return [];
    }
  }

  /**
   * Obtener ubicaciones por sede
   */
  async getUbicacionesBySede(sedeId: number): Promise<Ubicacion[]> {
    const response = await this.client.get<ApiResponse<Ubicacion[]>>(`/ubicaciones/sede/${sedeId}`);
    return response.data.data || [];
  }

  /**
   * Crear nueva sede
   */
  async createSede(data: Partial<Sede>): Promise<Sede> {
    const response = await this.client.post<ApiResponse<Sede>>('/sedes', data);
    return response.data.data!;
  }

  /**
   * Crear nueva ubicación
   */
  async createUbicacion(data: Partial<Ubicacion>): Promise<Ubicacion> {
    // Asegurarse de que los campos tengan los nombres correctos para el backend
    const payload = {
      nombre_area: data.nombre_area,
      descripcion: data.descripcion,
      sede_id: data.sede_id
    };
    
    const response = await this.client.post<ApiResponse<Ubicacion>>('/ubicaciones', payload);
    return response.data.data!;
  }

  // ==================== TIPOS DE EXTINTORES ====================

  /**
   * Obtener todos los tipos de extintores
   */
  async getTiposExtintores(): Promise<TipoExtintor[]> {
    try {
      const response = await this.client.get<ApiResponse<TipoExtintor[]>>('/tipos-extintores');
      return response.data.success ? response.data.data || [] : [];
    } catch (error) {
      console.error('API Client: Error fetching tipos de extintores:', error);
      return [];
    }
  }

  /**
   * Obtener tipo de extintor por ID
   */
  async getTipoExtintor(id: string): Promise<TipoExtintor | null> {
    try {
      const response = await this.client.get<ApiResponse<TipoExtintor>>(`/tipos-extintores/${id}`);
      return response.data.success ? response.data.data || null : null;
    } catch (error) {
      console.error('API Client: Error fetching tipo de extintor:', error);
      return null;
    }
  }

  /**
   * Crear nuevo tipo de extintor
   */
  async createTipoExtintor(data: Partial<TipoExtintor>): Promise<TipoExtintor> {
    const response = await this.client.post<ApiResponse<TipoExtintor>>('/tipos-extintores', data);
    return response.data.data!;
  }

  /**
   * Actualizar tipo de extintor
   */
  async updateTipoExtintor(id: string, data: Partial<TipoExtintor>): Promise<TipoExtintor> {
    const response = await this.client.put<ApiResponse<TipoExtintor>>(`/tipos-extintores/${id}`, data);
    return response.data.data!;
  }

  /**
   * Eliminar tipo de extintor
   */
  async deleteTipoExtintor(id: string): Promise<void> {
    await this.client.delete<ApiResponse<void>>(`/tipos-extintores/${id}`);
  }

  // ==================== USUARIOS ====================

  /**
   * Obtener todos los usuarios con filtros opcionales
   */
  async getUsuarios(filters?: { search?: string, rol?: string, activo?: string }): Promise<{ data: User[], total: number, page: number, limit: number, totalPages: number }> {
    try {
      console.log('API Client: Fetching usuarios with filters:', filters);
      // Asegurarse de que los filtros sean correctos para el backend
      const cleanFilters: Record<string, string> = {};
      if (filters?.search) cleanFilters.search = filters.search;
      if (filters?.rol && filters.rol !== 'todos') cleanFilters.rol = filters.rol;
      if (filters?.activo && filters.activo !== 'todos') cleanFilters.activo = filters.activo;
      
      // Hacer la petición con los filtros limpios
      const response = await this.client.get<ApiResponse<any>>('/usuarios', { params: cleanFilters });
      
      // Verificar si la respuesta es exitosa y tiene datos
      if (!response.data || !response.data.success) {
        console.warn('API Client: Error en respuesta:', response.data?.error || 'Respuesta inválida');
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      }
      
      // Verificar si hay datos en la respuesta
      if (!response.data.data) {
        console.warn('API Client: No users data in response');
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      }
      
      console.log(`API Client: Fetched ${response.data.data.data?.length || 0} users`);
      
      // Extraer la estructura completa de la respuesta
      const result = {
        data: response.data.data.data || [],
        total: response.data.data.total || 0,
        page: response.data.data.page || 1,
        limit: response.data.data.limit || 20,
        totalPages: response.data.data.totalPages || 0
      };
      
      return result;
    } catch (error) {
      console.error('API Client: Error fetching usuarios:', error);
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUsuario(id: number): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>(`/usuarios/${id}`);
    return response.data.data!;
  }

  /**
   * Crear nuevo usuario
   */
  async createUsuario(data: {
    nombre: string;
    email: string;
    password: string;
    rol: 'admin' | 'tecnico' | 'consulta';
  }): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>('/usuarios', data);
    return response.data.data!;
  }

  /**
   * Actualizar usuario
   */
  async updateUsuario(id: number, data: Partial<UserFormData>): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(`/usuarios/${id}`, data);
    return response.data.data!;
  }

  /**
   * Cambiar contraseña de usuario (admin)
   */
  async changeUserPassword(id: number, newPassword: string): Promise<void> {
    await this.client.put<ApiResponse<void>>(`/usuarios/${id}/password`, { newPassword });
  }

  /**
   * Activar/Desactivar usuario
   */
  async toggleUserActive(id: number): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(`/usuarios/${id}/toggle-active`);
    return response.data.data!;
  }

  /**
   * Eliminar usuario
   */
  async deleteUsuario(id: number): Promise<void> {
    await this.client.delete(`/usuarios/${id}`);
  }

  // ==================== REPORTES Y EXPORTACIÓN ====================

  /**
   * Exportar extintores
   */
  async exportExtintores(format: 'excel' | 'pdf', filters?: ExtintorFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await this.client.get(`/reportes/extintores?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  /**
   * Generar código QR para extintor
   */
  async generateQR(extintorId: number): Promise<Blob> {
    const response = await this.client.get(`/extintores/${extintorId}/qr`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  // ==================== BACKUP ====================

  /**
   * Crear backup
   */
  async createBackup(options?: { encrypt?: boolean; password?: string }): Promise<Blob> {
    const response = await this.client.post('/backup/create', options, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  // ==================== SALUD DEL SISTEMA ====================

  /**
   * Verificar salud del servidor
   */
  async checkHealth(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/health');
    return response.data.data!;
  }

  /**
   * Obtener información de la API
   */
  async getApiInfo(): Promise<any> {
    const response = await this.client.get<ApiResponse<any>>('/info');
    return response.data.data!;
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Exportar también la clase para casos especiales
export { ApiClient };

// Hooks de conveniencia para React Query
export const apiQueries = {
  // Keys para React Query
  keys: {
    dashboard: ['dashboard'] as const,
    dashboardStats: () => [...apiQueries.keys.dashboard, 'stats'] as const,
    dashboardActivity: () => [...apiQueries.keys.dashboard, 'activity'] as const,
    dashboardAlerts: () => [...apiQueries.keys.dashboard, 'alerts'] as const,
    
    extintores: ['extintores'] as const,
    extintor: (id: number) => [...apiQueries.keys.extintores, id] as const,
    extintoresList: (filters?: ExtintorFilters) => [...apiQueries.keys.extintores, 'list', filters] as const,
    extintoresByLocation: (ubicacionId: number) => [...apiQueries.keys.extintores, 'location', ubicacionId] as const,
    
    sedes: ['sedes'] as const,
    ubicaciones: ['ubicaciones'] as const,
    ubicacionesBySede: (sedeId: number) => [...apiQueries.keys.ubicaciones, 'sede', sedeId] as const,
    
    tiposExtintores: ['tipos-extintores'] as const,
    usuarios: ['usuarios'] as const,
    usuariosList: (filters?: { search?: string, rol?: string, activo?: string }) => [...apiQueries.keys.usuarios, 'list', filters] as const,
    usuario: (id: number) => [...apiQueries.keys.usuarios, id] as const,
    
    mantenimientos: ['mantenimientos'] as const,
    mantenimientosByExtintor: (extintorId: number) => [...apiQueries.keys.mantenimientos, 'extintor', extintorId] as const,
  },

  // Funciones de query
  functions: {
    getDashboardStats: () => apiClient.getDashboardStats(),
    getRecentActivity: () => apiClient.getRecentActivity(),
    getAlerts: () => apiClient.getAlerts(),
    
    getExtintores: (filters?: ExtintorFilters) => apiClient.getExtintores(filters),
    getExtintor: (id: number) => apiClient.getExtintor(id),
    getExtintoresByLocation: (ubicacionId: number) => apiClient.getExtintoresByLocation(ubicacionId),
    
    getSedes: () => apiClient.getSedes(),
    getUbicaciones: () => apiClient.getUbicaciones(),
    getUbicacionesBySede: (sedeId: number) => apiClient.getUbicacionesBySede(sedeId),
    
    getTiposExtintores: () => apiClient.getTiposExtintores(),
    getUsuarios: (filters?: { search?: string, rol?: string, activo?: string }) => apiClient.getUsuarios(filters),
    getUsuario: (id: number) => apiClient.getUsuario(id),
    
    getMantenimientos: (extintorId: number) => apiClient.getMantenimientos(extintorId),
  }
};
