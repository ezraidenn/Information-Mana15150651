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
import { QueryClient } from '@tanstack/react-query';

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
    
    // Invalidar cache de usuarios
    const queryClient = getGlobalQueryClient();
    if (queryClient) {
      // Importar dinámicamente queryUtils para evitar dependencia circular
      const { queryUtils } = await import('./queryUtils');
      queryUtils.invalidateUsuarios(queryClient);
    }
    
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
  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await this.client.get<ApiResponse<RecentActivity[]>>('/dashboard/activity');
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
   * Obtener listado de extintores
   */
  async getExtintores(filters?: ExtintorFilters): Promise<Extintor[]> {
    let url = '/extintores';
    
    // Agregar filtros a la URL si existen
    if (filters) {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.client.get<ApiResponse<Extintor[]>>(url);
    return response.data.data!;
  }

  /**
   * Obtener un extintor por ID
   */
  async getExtintor(id: number): Promise<Extintor | null> {
    try {
      const response = await this.client.get<ApiResponse<Extintor>>(`/extintores/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error al obtener extintor ${id}:`, error);
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
        
        // Agregar todos los campos al FormData
        Object.entries(processedData).forEach(([key, value]) => {
          if (key !== 'imagen') {
            formData.append(key, String(value));
          }
        });
        
        // Agregar imagen
        formData.append('imagen', data.imagen);
        
        const response = await this.client.post<ApiResponse<Extintor>>(
          '/extintores',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        // Notificar al QueryClient global para invalidar consultas relacionadas
        const queryClient = getGlobalQueryClient();
        if (queryClient) {
          // Importar dinámicamente queryUtils para evitar dependencia circular
          const { queryUtils } = await import('./queryUtils');
          queryUtils.invalidateExtintores(queryClient);
        }
        
        return response.data.data || null;
      } else {
        // Sin imagen, enviar JSON normal
        const response = await this.client.post<ApiResponse<Extintor>>(
          '/extintores',
          processedData
        );
        
        // Notificar al QueryClient global para invalidar consultas relacionadas
        const queryClient = getGlobalQueryClient();
        if (queryClient) {
          // Importar dinámicamente queryUtils para evitar dependencia circular
          const { queryUtils } = await import('./queryUtils');
          queryUtils.invalidateExtintores(queryClient);
        }
        
        return response.data.data || null;
      }
    } catch (error) {
      console.error('Error al crear extintor:', error);
      return null;
    }
  }

  /**
   * Actualizar un extintor existente
   */
  async updateExtintor(id: number, data: ExtintorFormData): Promise<Extintor | null> {
    try {
      // Si hay imagen, subir primero
      if (data.imagen instanceof File) {
        const formData = new FormData();
        formData.append('imagen', data.imagen);
        
        // Subir imagen
        await this.client.post<ApiResponse<{path: string}>>(
          `/extintores/${id}/imagen`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        // Eliminar imagen del objeto de datos
        delete data.imagen;
      }
      
      // Actualizar datos del extintor
      const response = await this.client.put<ApiResponse<Extintor>>(
        `/extintores/${id}`,
        data
      );
      
      // Notificar al QueryClient global para invalidar consultas relacionadas
      const queryClient = getGlobalQueryClient();
      if (queryClient) {
        // Importar dinámicamente queryUtils para evitar dependencia circular
        const { queryUtils } = await import('./queryUtils');
        queryUtils.invalidateExtintores(queryClient);
      }
      
      return response.data.data || null;
    } catch (error) {
      console.error('Error al actualizar extintor:', error);
      return null;
    }
  }

  /**
   * Eliminar un extintor
   */
  async deleteExtintor(id: number): Promise<boolean> {
    try {
      await this.client.delete(`/extintores/${id}`);
      
      // Invalidar cache de extintores
      const queryClient = getGlobalQueryClient();
      if (queryClient) {
        // Importar dinámicamente queryUtils para evitar dependencia circular
        const { queryUtils } = await import('./queryUtils');
        queryUtils.invalidateExtintor(queryClient, id);
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar extintor:', error);
      return false;
    }
  }

  /**
   * Crear nuevo usuario
   */
  async createUsuario(data: UserFormData): Promise<User> {
    const response = await this.client.post<ApiResponse<User>>('/usuarios', data);
    
    // Invalidar cache de usuarios
    const queryClient = getGlobalQueryClient();
    if (queryClient) {
      // Importar dinámicamente queryUtils para evitar dependencia circular
      const { queryUtils } = await import('./queryUtils');
      queryUtils.invalidateUsuarios(queryClient);
    }
    
    return response.data.data!;
  }

  /**
   * Actualizar usuario
   */
  async updateUsuario(id: number, data: UserFormData): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(`/usuarios/${id}`, data);
    
    // Invalidar cache de usuarios
    const queryClient = getGlobalQueryClient();
    if (queryClient) {
      // Importar dinámicamente queryUtils para evitar dependencia circular
      const { queryUtils } = await import('./queryUtils');
      queryUtils.invalidateUsuarios(queryClient);
    }
    
    return response.data.data!;
  }

  /**
   * Cambiar contraseña de usuario
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
    
    // Invalidar cache de usuarios
    const queryClient = getGlobalQueryClient();
    if (queryClient) {
      // Importar dinámicamente queryUtils para evitar dependencia circular
      const { queryUtils } = await import('./queryUtils');
      queryUtils.invalidateUsuarios(queryClient, id);
    }
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
  
  // Métodos para sedes y ubicaciones
  async getSedes(): Promise<Sede[]> {
    const response = await this.client.get<ApiResponse<Sede[]>>('/sedes');
    return response.data.data!;
  }
  
  async getUbicaciones(): Promise<Ubicacion[]> {
    const response = await this.client.get<ApiResponse<Ubicacion[]>>('/ubicaciones');
    return response.data.data!;
  }
  
  async getUbicacionesBySede(sedeId: number): Promise<Ubicacion[]> {
    const response = await this.client.get<ApiResponse<Ubicacion[]>>(`/ubicaciones/sede/${sedeId}`);
    return response.data.data!;
  }
  
  async getExtintoresByLocation(ubicacionId: number): Promise<Extintor[]> {
    const response = await this.client.get<ApiResponse<Extintor[]>>(`/extintores/ubicacion/${ubicacionId}`);
    return response.data.data!;
  }
  
  async getTiposExtintores(): Promise<TipoExtintor[]> {
    const response = await this.client.get<ApiResponse<TipoExtintor[]>>('/tipos-extintores');
    return response.data.data!;
  }
  
  async getUsuarios(filters?: { search?: string, rol?: string, activo?: string }): Promise<User[]> {
    let url = '/usuarios';
    
    // Agregar filtros a la URL si existen
    if (filters) {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await this.client.get<ApiResponse<User[]>>(url);
    return response.data.data!;
  }
  
  async getUsuario(id: number): Promise<User | null> {
    try {
      const response = await this.client.get<ApiResponse<User>>(`/usuarios/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      return null;
    }
  }
  
  async getMantenimientos(extintorId: number): Promise<Mantenimiento[]> {
    const response = await this.client.get<ApiResponse<Mantenimiento[]>>(`/mantenimientos/extintor/${extintorId}`);
    return response.data.data!;
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Instancia global de QueryClient para usar en mutaciones
let globalQueryClient: QueryClient | null = null;

// Función para establecer el QueryClient global
export const setGlobalQueryClient = (queryClient: QueryClient) => {
  globalQueryClient = queryClient;
};

// Función para obtener el QueryClient global
export const getGlobalQueryClient = (): QueryClient | null => {
  return globalQueryClient;
};

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
