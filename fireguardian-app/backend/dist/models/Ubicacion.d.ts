import { Sede } from './Sede';
import { Extintor } from './Extintor';
export declare class Ubicacion {
    id: number;
    nombre_area: string;
    descripcion?: string;
    sede_id: number;
    sede: Sede;
    extintores: Extintor[];
    creado_en: Date;
    actualizado_en: Date;
}
//# sourceMappingURL=Ubicacion.d.ts.map