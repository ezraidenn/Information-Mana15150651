import { TipoExtintor } from './TipoExtintor';
import { Ubicacion } from './Ubicacion';
import { Usuario } from './Usuario';
import { Mantenimiento } from './Mantenimiento';
export declare class Extintor {
    id: number;
    codigo_interno?: string;
    tipo_id: string;
    descripcion?: string;
    ubicacion_id: number;
    responsable_id?: number;
    fecha_vencimiento: Date;
    fecha_mantenimiento?: Date;
    imagen_path?: string;
    estado?: string;
    tipo: TipoExtintor;
    ubicacion: Ubicacion;
    responsable?: Usuario;
    mantenimientos: Mantenimiento[];
    creado_en: Date;
    actualizado_en: Date;
    get dias_para_vencimiento(): number;
    get estado_vencimiento(): 'vencido' | 'por_vencer' | 'vigente';
    get requiere_mantenimiento(): boolean;
}
//# sourceMappingURL=Extintor.d.ts.map