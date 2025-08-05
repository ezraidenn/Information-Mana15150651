import { Usuario } from './Usuario';
export type AccionTipo = 'crear' | 'editar' | 'eliminar' | 'login' | 'logout' | 'backup' | 'exportar';
export type EntidadTipo = 'extintores' | 'tipos_extintores' | 'usuarios' | 'ubicaciones' | 'sedes' | 'mantenimientos' | 'sistema';
export declare class Log {
    id: number;
    usuario_id?: number;
    accion: AccionTipo;
    entidad: EntidadTipo;
    entidad_id?: number;
    descripcion?: string;
    ip_address?: string;
    user_agent?: string;
    usuario?: Usuario;
    timestamp: Date;
    get color_accion(): string;
    get icono_accion(): string;
}
//# sourceMappingURL=Log.d.ts.map