import { Extintor } from './Extintor';
import { Usuario } from './Usuario';
export type TipoEvento = 'inspeccion' | 'recarga' | 'reparacion' | 'incidente' | 'reemplazo';
export declare class Mantenimiento {
    id: number;
    extintor_id: number;
    fecha: Date;
    tipo_evento: TipoEvento;
    descripcion?: string;
    tecnico_id?: number;
    evidencia_path?: string;
    extintor: Extintor;
    tecnico?: Usuario;
    creado_en: Date;
    get color_evento(): string;
    get icono_evento(): string;
}
//# sourceMappingURL=Mantenimiento.d.ts.map