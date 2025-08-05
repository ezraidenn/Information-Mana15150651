import { ApiResponse } from '../types';
export declare const createApiResponse: <T>(success: boolean, data?: T, message?: string, error?: string) => ApiResponse<T>;
export declare const successResponse: <T>(data: T, message?: string) => ApiResponse<T>;
export declare const errorResponse: (error: string, data?: any) => ApiResponse<any>;
export declare const generateUniqueFileName: (originalName: string) => string;
export declare const ensureDirectoryExists: (dirPath: string) => Promise<void>;
export declare const safeDeleteFile: (filePath: string) => Promise<boolean>;
export declare const formatDate: (date: Date | string, format?: "short" | "long" | "iso") => string;
export declare const daysBetweenDates: (date1: Date | string, date2: Date | string) => number;
export declare const sanitizeText: (text: string, maxLength?: number) => string;
export declare const generateCode: (prefix?: string, length?: number) => string;
export declare const encryptText: (text: string, password: string) => string;
export declare const decryptText: (encryptedText: string, password: string) => string;
export declare const isValidImageFormat: (filename: string) => boolean;
export declare const formatFileSize: (bytes: number) => string;
export declare const generateFileHash: (filePath: string) => Promise<string>;
export declare const cleanupOldLogs: (daysToKeep?: number) => Promise<number>;
export declare const getSystemInfo: () => {
    platform: any;
    arch: any;
    nodeVersion: string;
    totalMemory: string;
    freeMemory: string;
    uptime: number;
    loadAverage: any;
};
export declare const validateDatabaseConnection: () => Promise<boolean>;
export declare const logUserAction: (req: any, accion: string, entidad: string, detalles?: string) => Promise<void>;
//# sourceMappingURL=helpers.d.ts.map