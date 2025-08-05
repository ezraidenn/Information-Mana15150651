import { Extintor } from './Extintor';
import { Mantenimiento } from './Mantenimiento';
import { Log } from './Log';
export type UsuarioRol = 'admin' | 'tecnico' | 'consulta';
export declare class Usuario {
    id: number;
    nombre: string;
    email: string;
    password: string;
    rol: UsuarioRol;
    activo: boolean;
    ultimo_acceso?: Date;
    extintores_responsable: Extintor[];
    mantenimientos: Mantenimiento[];
    logs: Log[];
    creado_en: Date;
    actualizado_en: Date;
    toJSON(): Omit<this, "password" | "toJSON">;
}
//# sourceMappingURL=Usuario.d.ts.map