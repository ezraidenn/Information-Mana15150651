import { Response, NextFunction } from 'express';
import { AccionTipo, EntidadTipo } from '../models/Log';
import { AuthRequest } from '../types';
export declare const logAction: (accion: AccionTipo, entidad: EntidadTipo, descripcion?: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const autoLog: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const createLog: (usuario_id: number | undefined, accion: AccionTipo, entidad: EntidadTipo, entidad_id?: number, descripcion?: string, ip_address?: string, user_agent?: string) => Promise<void>;
//# sourceMappingURL=logging.d.ts.map