// Tipos de respuesta de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Tipo para respuestas paginadas
export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos de usuario
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'tecnico' | 'consulta';
  activo: boolean;
  creado_en: string;
  ultimo_acceso?: string;
}

// Tipos de sede y ubicación
export interface Sede {
  id: number;
  nombre: string;
  direccion?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface Ubicacion {
  id: number;
  nombre_area: string;
  descripcion?: string;
  sede_id: number;
  sede: Sede;
  creado_en: string;
  actualizado_en: string;
}

// Tipos de mantenimiento
export interface Mantenimiento {
  id: number;
  extintor_id: number;
  extintor_codigo?: string;
  extintor_ubicacion?: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO' | 'RECARGA' | 'PRUEBA_HIDROSTATICA';
  fecha_mantenimiento: string;
  fecha_proxima: string;
  tecnico_id?: number;
  tecnico?: string;
  observaciones: string;
  costo?: number;
  estado: 'COMPLETADO' | 'PENDIENTE' | 'EN_PROCESO';
  creado_por?: string;
  created_at?: string;
  updated_at?: string;
  evidencia?: string;
}

export interface MantenimientoFormData {
  extintor_id: number;
  tipo: string;
  fecha_mantenimiento: string;
  fecha_proxima: string;
  observaciones: string;
  costo?: number;
  evidencia?: File;
}

// Tipos de extintor
export interface TipoExtintor {
  id: string;
  nombre: string;
  descripcion?: string;
  uso_recomendado?: string;
  color_hex?: string;
  icono_path?: string;
  creado_en: string;
  actualizado_en: string;
  
  // Campos para etiquetas virtuales
  clase_fuego?: string[]; // A, B, C, D, K
  agente_extintor?: string; // PQS, CO2, Agua, Espuma, etc.
  simbolos_path?: string[]; // Rutas a imágenes de símbolos
  color_secundario_hex?: string; // Para extintores bicolor
  forma_etiqueta?: 'rectangular' | 'circular' | 'rombo' | 'hexagonal';
  capacidad?: string; // 4.5kg, 6kg, 9kg, etc.
  presion_trabajo?: string; // Presión de trabajo en PSI
  normativa?: string; // NOM-154-SCFI-2005, etc.
}

export interface Extintor {
  id: number;
  codigo: string;
  codigo_interno?: string;
  codigo_qr?: string;
  tipo_id: string;
  descripcion?: string;
  ubicacion_id: number;
  responsable_id?: number;
  fecha_vencimiento: string;
  fecha_mantenimiento?: string;
  fecha_recarga?: string;
  imagen_path?: string;
  creado_en: string;
  actualizado_en: string;
  capacidad?: string;
  observaciones?: string;
  estado?: 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA';
  sede?: string;
  ultimo_mantenimiento?: string;
  
  // Relaciones
  tipo: TipoExtintor;
  ubicacion: Ubicacion;
  responsable?: User;
  mantenimientos?: Mantenimiento[];
  
  // Campos calculados
  dias_para_vencimiento: number;
  estado_vencimiento: 'vencido' | 'por_vencer' | 'vigente';
  requiere_mantenimiento: boolean;
  ubicacion_completa?: string;
}

// Tipos para eventos de mantenimiento
export interface EventoMantenimiento {
  id: number;
  extintor_id: number;
  fecha: string;
  tipo_evento: 'inspeccion' | 'recarga' | 'reparacion' | 'incidente' | 'reemplazo';
  descripcion?: string;
  tecnico_id?: number;
  evidencia_path?: string;
  creado_en: string;
  
  // Relaciones
  extintor?: Extintor;
  tecnico?: User;
  
  // Campos calculados
  color_evento: string;
  icono_evento: string;
}

// Tipos para el dashboard
export interface DashboardStats {
  total_extintores: number;
  extintores_vencidos: number;
  extintores_por_vencer: number;
  extintores_vigentes: number;
  mantenimientos_pendientes: number;
  extintores_por_tipo: Array<{
    tipo: string;
    nombre: string;
    cantidad: number;
    color: string;
  }>;
  extintores_por_ubicacion: Array<{
    ubicacion: string;
    sede: string;
    cantidad: number;
  }>;
  vencimientos_proximos: Array<{
    id: number;
    codigo_interno?: string;
    tipo: string;
    ubicacion: string;
    fecha_vencimiento: string;
    dias_restantes: number;
  }>;
}

export interface ActivityItem {
  id: number;
  fecha: string;
  tipo_evento: string;
  descripcion?: string;
  extintor: {
    id: number;
    codigo_interno?: string;
    tipo: string;
    ubicacion: string;
  };
  tecnico: string;
  icono: string;
  color: string;
}

export interface RecentActivity {
  mantenimientos_recientes: ActivityItem[];
  extintores_recientes: Array<{
    id: number;
    codigo_interno?: string;
    tipo: string;
    ubicacion: string;
    fecha_creacion: string;
    estado_vencimiento: string;
  }>;
}

export interface AlertData {
  count: number;
  items: any[];
  severity: 'high' | 'medium' | 'low';
}

export interface Alerts {
  extintores_vencidos: AlertData;
  extintores_por_vencer: AlertData;
  mantenimientos_pendientes: AlertData;
}

// Tipos para formularios
export interface ExtintorFormData {
  codigo: string;
  codigo_interno?: string;
  tipo_id: string;
  descripcion?: string;
  ubicacion_id: number;
  responsable_id?: number;
  fecha_vencimiento: string;
  fecha_mantenimiento?: string;
  fecha_recarga?: string;
  capacidad?: string;
  observaciones?: string;
  imagen?: File;
  estado?: 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA';
}

export interface MantenimientoFormData {
  extintor_id: number;
  fecha: string;
  tipo_evento: 'inspeccion' | 'recarga' | 'reparacion' | 'incidente' | 'reemplazo';
  descripcion?: string;
  tecnico_id?: number;
  evidencia?: File;
}

export interface UserFormData {
  nombre: string;
  email: string;
  password?: string;
  rol: 'admin' | 'tecnico' | 'consulta';
  activo?: boolean;
}

// Tipos para filtros
export interface ExtintorFilters {
  search?: string;
  tipo_id?: string | number;
  ubicacion_id?: number;
  sede_id?: number;
  estado?: string;
  estado_vencimiento?: 'vencido' | 'por_vencer' | 'vigente';
  requiere_mantenimiento?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  sort_by?: 'fecha_vencimiento' | 'codigo_interno' | 'tipo' | 'ubicacion';
  sort_order?: 'ASC' | 'DESC';
}

// Tipos para paginación
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// Tipos para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_in: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tipos para modales
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Tipos para componentes de UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

// Tipos para gráficas
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

// Tipos para formularios
export interface ExtintorFormData {
  codigo: string;
  codigo_interno?: string;
  codigo_qr?: string;
  tipo_id: string;
  ubicacion_id: number;
  capacidad?: string;
  fecha_vencimiento: string;
  fecha_recarga?: string;
  observaciones?: string;
  estado?: 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA';
}

// Tipos para exportación
export interface ExportOptions {
  format: 'excel' | 'pdf';
  filters?: ExtintorFilters;
  include_images?: boolean;
  include_maintenance_history?: boolean;
}

// Tipos para QR
export interface QRCodeData {
  extintor_id: number;
  codigo_interno?: string;
  tipo: string;
  ubicacion: string;
  fecha_vencimiento: string;
  url_detalle: string;
}

// Tipos para configuración
export interface AppConfig {
  app_name: string;
  version: string;
  company_name: string;
  features: {
    multi_user: boolean;
    backup_auto: boolean;
    notifications: boolean;
    qr_codes: boolean;
    reports: boolean;
  };
}

// Tipos para el contexto de la aplicación
export interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Tipos para hooks personalizados
export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  staleTime?: number;
}

export interface UseApiResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Tipos para el estado de la aplicación
export interface AppState {
  theme: 'light' | 'dark';
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };
  notifications: Notification[];
  currentPage: string;
}

// Tipos para rutas
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: Array<'admin' | 'tecnico' | 'consulta'>;
  title: string;
  icon?: string;
}

// Tipos para validación de formularios
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  validation?: ValidationRule;
  disabled?: boolean;
  className?: string;
}
