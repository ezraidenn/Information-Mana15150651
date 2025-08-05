import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class ExtintorController {
    /**
     * Obtener todos los extintores con filtros y paginación
     */
    static getAll(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Obtener un extintor por ID
     */
    static getById(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Crear un nuevo extintor
     */
    static create(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Actualizar un extintor
     */
    static update(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Eliminar un extintor
     */
    static delete(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Obtener extintores por ubicación
     */
    static getByLocation(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ExtintorController.d.ts.map