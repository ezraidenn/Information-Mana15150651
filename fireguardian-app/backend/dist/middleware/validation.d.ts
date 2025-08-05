import { Request, Response, NextFunction } from 'express';
export declare const validateRequired: (fields: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateEmail: (field?: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateDate: (field: string, required?: boolean) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validatePositiveInteger: (field: string, required?: boolean) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateStringLength: (field: string, minLength?: number, maxLength?: number) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateEnum: (field: string, allowedValues: string[], required?: boolean) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateImageFile: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateExtintor: ((req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>)[];
export declare const validateUsuario: ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined)[];
export declare const validateMantenimiento: ((req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>)[];
//# sourceMappingURL=validation.d.ts.map