import { Request } from 'express';
import { Usuario } from '../models/Usuario';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
}
export interface AuthRequest extends Request {
    user?: Usuario;
}
export interface CreateExtintorDTO {
    codigo_interno?: string;
    tipo_id: string;
    descripcion?: string;
    ubicacion_id: number;
    responsable_id?: number;
    fecha_vencimiento: string;
    fecha_mantenimiento?: string;
    estado?: 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA';
}
export interface UpdateExtintorDTO extends Partial<CreateExtintorDTO> {
    id: number;
    imagen_path?: string;
}
export interface CreateMantenimientoDTO {
    extintor_id: number;
    fecha: string;
    tipo_evento: 'inspeccion' | 'recarga' | 'reparacion' | 'incidente' | 'reemplazo';
    descripcion?: string;
    tecnico_id?: number;
}
export interface CreateUsuarioDTO {
    nombre: string;
    email: string;
    password: string;
    rol: 'admin' | 'tecnico' | 'consulta';
}
export interface UpdateUsuarioDTO extends Partial<Omit<CreateUsuarioDTO, 'password'>> {
    id: number;
    password?: string;
    activo?: boolean;
}
export interface CreateUbicacionDTO {
    nombre_area: string;
    descripcion?: string;
    sede_id: number;
}
export interface CreateSedeDTO {
    nombre: string;
    direccion?: string;
}
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
export interface ExtintorFilters {
    tipo_id?: string;
    ubicacion_id?: number;
    sede_id?: number;
    estado?: 'ACTIVO' | 'MANTENIMIENTO' | 'VENCIDO' | 'BAJA';
    estado_vencimiento?: 'vencido' | 'por_vencer' | 'vigente';
    requiere_mantenimiento?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: 'fecha_vencimiento' | 'fecha_mantenimiento' | 'creado_en';
    sort_order?: 'ASC' | 'DESC';
}
export interface ExportOptions {
    format: 'excel' | 'pdf';
    filters?: ExtintorFilters;
    include_images?: boolean;
    include_maintenance_history?: boolean;
}
export interface BackupOptions {
    include_images?: boolean;
    encrypt?: boolean;
    password?: string;
}
export interface AppConfig {
    app_name: string;
    version: string;
    database_path: string;
    images_path: string;
    backups_path: string;
    qr_codes_path: string;
    logs_path: string;
    auto_backup_enabled: boolean;
    auto_backup_interval_days: number;
    encryption_enabled: boolean;
    max_image_size_mb: number;
    allowed_image_types: string[];
}
export interface NotificationSettings {
    email_enabled: boolean;
    email_recipients: string[];
    days_before_expiration: number;
    maintenance_reminder_days: number;
}
export interface QRCodeData {
    extintor_id: number;
    codigo_interno?: string;
    tipo: string;
    ubicacion: string;
    fecha_vencimiento: string;
    url_detalle: string;
}
//# sourceMappingURL=index.d.ts.map