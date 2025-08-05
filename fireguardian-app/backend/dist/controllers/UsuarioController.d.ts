import { Request, Response } from 'express';
export declare class UsuarioController {
    private usuarioRepository;
    /**
     * Obtener todos los usuarios
     */
    getAll(req: Request, res: Response): Promise<void>;
    /**
     * Obtener usuario por ID
     */
    getById(req: Request, res: Response): Promise<void>;
    /**
     * Crear nuevo usuario
     */
    create(req: Request, res: Response): Promise<void>;
    /**
     * Actualizar usuario
     */
    update(req: Request, res: Response): Promise<void>;
    /**
     * Cambiar contraseña de usuario
     */
    changePassword(req: Request, res: Response): Promise<void>;
    /**
     * Activar/Desactivar usuario
     */
    toggleActive(req: Request, res: Response): Promise<void>;
    /**
     * Eliminar usuario (soft delete)
     */
    delete(req: Request, res: Response): Promise<void>;
    /**
     * Obtener estadísticas de usuarios
     */
    getStats(req: Request, res: Response): Promise<void>;
    /**
     * Obtener actividad reciente de usuarios
     */
    getRecentActivity(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=UsuarioController.d.ts.map