import { Request, Response } from 'express';
import { AuthRequest } from '../types';
export declare class AuthController {
    /**
     * Iniciar sesión
     */
    static login(req: Request, res: Response): Promise<any>;
    /**
     * Cerrar sesión
     */
    static logout(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Obtener perfil del usuario actual
     */
    static getProfile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Cambiar contraseña
     */
    static changePassword(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Verificar token (para validación del frontend)
     */
    static verifyToken(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Registrar nuevo usuario (solo para admins)
     */
    static register(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map