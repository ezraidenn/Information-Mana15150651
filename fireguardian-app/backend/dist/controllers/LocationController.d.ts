import { Request, Response } from 'express';
export declare class LocationController {
    private sedeRepository;
    private ubicacionRepository;
    /**
     * Obtener todas las sedes
     */
    getAllSedes(req: Request, res: Response): Promise<void>;
    /**
     * Obtener sede por ID
     */
    getSedeById(req: Request, res: Response): Promise<void>;
    /**
     * Crear nueva sede
     */
    createSede(req: Request, res: Response): Promise<void>;
    /**
     * Actualizar sede
     */
    updateSede(req: Request, res: Response): Promise<void>;
    /**
     * Eliminar sede
     */
    deleteSede(req: Request, res: Response): Promise<void>;
    /**
     * Obtener todas las ubicaciones
     */
    getAllUbicaciones(req: Request, res: Response): Promise<void>;
    /**
     * Obtener ubicaciones por sede
     */
    getUbicacionesBySede(req: Request, res: Response): Promise<void>;
    /**
     * Obtener ubicación por ID
     */
    getUbicacionById(req: Request, res: Response): Promise<void>;
    /**
     * Crear nueva ubicación
     */
    createUbicacion(req: Request, res: Response): Promise<void>;
    /**
     * Actualizar ubicación
     */
    updateUbicacion(req: Request, res: Response): Promise<void>;
    /**
     * Eliminar ubicación
     */
    deleteUbicacion(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=LocationController.d.ts.map