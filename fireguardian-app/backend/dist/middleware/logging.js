"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLog = exports.autoLog = exports.logAction = void 0;
const config_1 = require("../database/config");
const Log_1 = require("../models/Log");
const logAction = (accion, entidad, descripcion) => {
    return async (req, res, next) => {
        try {
            // Ejecutar la acción original
            next();
            // Después de que la respuesta sea exitosa, registrar el log
            res.on('finish', async () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const logRepo = config_1.AppDataSource.getRepository(Log_1.Log);
                        const logEntry = new Log_1.Log();
                        logEntry.usuario_id = req.user?.id;
                        logEntry.accion = accion;
                        logEntry.entidad = entidad;
                        logEntry.entidad_id = req.params.id ? parseInt(req.params.id) : undefined;
                        logEntry.descripcion = descripcion || `${accion} ${entidad}`;
                        logEntry.ip_address = req.ip || req.connection.remoteAddress;
                        logEntry.user_agent = req.get('User-Agent');
                        await logRepo.save(logEntry);
                    }
                    catch (error) {
                        console.error('Error al registrar log:', error);
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    };
};
exports.logAction = logAction;
// Middleware para registrar automáticamente acciones CRUD
const autoLog = async (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        // Solo registrar si la respuesta es exitosa
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Determinar acción basada en el método HTTP
            let accion;
            switch (req.method) {
                case 'POST':
                    accion = 'crear';
                    break;
                case 'PUT':
                case 'PATCH':
                    accion = 'editar';
                    break;
                case 'DELETE':
                    accion = 'eliminar';
                    break;
                default:
                    return originalSend.call(this, data);
            }
            // Determinar entidad basada en la ruta
            let entidad = 'sistema';
            const path = req.path.toLowerCase();
            if (path.includes('/tipos-extintores'))
                entidad = 'tipos_extintores';
            else if (path.includes('/extintores'))
                entidad = 'extintores';
            else if (path.includes('/usuarios'))
                entidad = 'usuarios';
            else if (path.includes('/ubicaciones'))
                entidad = 'ubicaciones';
            else if (path.includes('/sedes'))
                entidad = 'sedes';
            else if (path.includes('/mantenimientos'))
                entidad = 'mantenimientos';
            // Registrar el log de forma asíncrona
            setImmediate(async () => {
                try {
                    const logRepo = config_1.AppDataSource.getRepository(Log_1.Log);
                    const logEntry = new Log_1.Log();
                    logEntry.usuario_id = req.user?.id;
                    logEntry.accion = accion;
                    logEntry.entidad = entidad;
                    logEntry.entidad_id = req.params.id ? parseInt(req.params.id) : undefined;
                    logEntry.descripcion = `${accion} ${entidad} vía API`;
                    logEntry.ip_address = req.ip || req.connection.remoteAddress;
                    logEntry.user_agent = req.get('User-Agent');
                    await logRepo.save(logEntry);
                }
                catch (error) {
                    console.error('Error al registrar log automático:', error);
                }
            });
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.autoLog = autoLog;
// Función utilitaria para registrar logs manualmente
const createLog = async (usuario_id, accion, entidad, entidad_id, descripcion, ip_address, user_agent) => {
    try {
        const logRepo = config_1.AppDataSource.getRepository(Log_1.Log);
        const logEntry = new Log_1.Log();
        logEntry.usuario_id = usuario_id;
        logEntry.accion = accion;
        logEntry.entidad = entidad;
        logEntry.entidad_id = entidad_id;
        logEntry.descripcion = descripcion;
        logEntry.ip_address = ip_address;
        logEntry.user_agent = user_agent;
        await logRepo.save(logEntry);
    }
    catch (error) {
        console.error('Error al crear log manual:', error);
    }
};
exports.createLog = createLog;
//# sourceMappingURL=logging.js.map