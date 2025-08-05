import { Request, Response } from 'express';
import { AuthRequest } from '../types';
export declare class TipoExtintorController {
    /**
     * Obtener todos los tipos de extintores
     */
    getAll(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Obtener un tipo de extintor por ID
     */
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Crear un nuevo tipo de extintor
     */
    create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Actualizar un tipo de extintor existente
     */
    update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Eliminar un tipo de extintor
     */
    delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=TipoExtintorController.d.ts.map