import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { AppDataSource } from '../database/config';
import { Extintor } from '../models/Extintor';
import { createApiResponse, ensureDirectoryExists } from '../utils/helpers';
import * as path from 'path';
import * as fs from 'fs/promises';
import multer from 'multer';
// Importaciones
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Importar Jimp y QrCode
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    try {
      // Usar una ruta absoluta para el directorio de uploads
      const uploadDir = path.resolve(__dirname, '../../../uploads/qr_scans');
      console.log('Directorio de uploads:', uploadDir);
      
      // Asegurarse de que el directorio existe
      ensureDirectoryExists(uploadDir);
      console.log('Directorio de uploads verificado/creado');
      
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error al configurar directorio de destino:', error);
      cb(error as Error, '');
    }
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    try {
      const uniqueFilename = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      console.log('Nombre de archivo generado:', uniqueFilename);
      cb(null, uniqueFilename);
    } catch (error) {
      console.error('Error al generar nombre de archivo:', error);
      cb(error as Error, '');
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
      console.log('Procesando archivo:', file.originalname, 'tipo:', file.mimetype);
      
      // Aceptar solo imágenes
      if (file.mimetype.startsWith('image/')) {
        console.log('Archivo aceptado:', file.originalname);
        cb(null, true);
      } else {
        console.log('Archivo rechazado (no es imagen):', file.originalname);
        cb(new Error('Solo se permiten archivos de imagen'));
      }
    } catch (error) {
      console.error('Error en fileFilter de multer:', error);
      cb(error as Error);
    }
  }
}).single('qrImage');

export class QRController {
  /**
   * Escanear una imagen QR y buscar el extintor correspondiente
   */
  static async scanQR(req: AuthRequest, res: Response): Promise<void> {
    // Usar multer para procesar la imagen
    upload(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json(createApiResponse(
          false,
          undefined,
          undefined,
          err.message
        ));
      }

      try {
        if (!req.file) {
          return res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'No se ha proporcionado ninguna imagen'
          ));
        }

        const filePath = req.file.path;
        console.log('Procesando imagen QR desde:', filePath);
        
        let qrCodeValue;
        try {
          // Verificar que el archivo existe
          console.log('Verificando existencia del archivo:', filePath);
          try {
            await fs.access(filePath);
            console.log('Archivo existe y es accesible');
            
            // Obtener información del archivo
            const fileStats = await fs.stat(filePath);
            console.log('Tamaño del archivo:', fileStats.size, 'bytes');
            
            if (fileStats.size === 0) {
              console.error('El archivo está vacío');
              return res.status(400).json(createApiResponse(
                false,
                undefined,
                undefined,
                'El archivo de imagen está vacío'
              ));
            }
          } catch (fsError) {
            console.error('Error al acceder al archivo:', fsError);
            return res.status(500).json(createApiResponse(
              false,
              undefined,
              undefined,
              'Error al acceder al archivo: ' + (fsError.message || 'Error desconocido')
            ));
          }
          
          // Leer la imagen con Jimp
          console.log('Intentando leer imagen con Jimp...');
          let image;
          try {
            // Leer el archivo como buffer
            const buffer = await fs.readFile(filePath);
            console.log('Archivo leído como buffer, tamaño:', buffer.length);
            
            // Usar Jimp.read con el buffer
            image = await new Promise((resolve, reject) => {
              // Intentar con el constructor
              try {
                const jimpInstance = new Jimp(buffer, (err, img) => {
                  if (err) {
                    console.error('Error con constructor de Jimp:', err);
                    reject(err);
                    return;
                  }
                  console.log('Imagen creada correctamente con constructor de Jimp');
                  resolve(img);
                });
              } catch (constructorError) {
                console.error('Error al usar constructor de Jimp:', constructorError);
                
                // Intentar con método read como alternativa
                try {
                  Jimp.read(buffer, (err, img) => {
                    if (err) {
                      console.error('Error con Jimp.read:', err);
                      reject(err);
                      return;
                    }
                    console.log('Imagen leída correctamente con Jimp.read');
                    resolve(img);
                  });
                } catch (readError) {
                  console.error('Error al usar Jimp.read:', readError);
                  reject(readError);
                }
              }
            });
            
            if (!image || !image.bitmap) {
              throw new Error('La imagen no se procesó correctamente o no tiene bitmap');
            }
            
            console.log('Dimensiones:', image.bitmap.width, 'x', image.bitmap.height);
            console.log('Formato de imagen:', image.getMIME());
          } catch (jimpError) {
            console.error('Error específico de Jimp:', jimpError);
            // Eliminar el archivo temporal
            await fs.unlink(filePath).catch(e => console.error('Error al eliminar archivo:', e));
            
            return res.status(500).json(createApiResponse(
              false,
              undefined,
              undefined,
              'Error al procesar la imagen con Jimp: ' + (jimpError.message || 'Error desconocido')
            ));
          }
          
          // Decodificar el QR
          console.log('Iniciando decodificación QR...');
          try {
            qrCodeValue = await QRController.decodeQR(image);
            console.log('Resultado de decodificación QR:', qrCodeValue);
          } catch (qrError) {
            console.error('Error en decodificación QR:', qrError);
            // Eliminar el archivo temporal
            await fs.unlink(filePath).catch(e => console.error('Error al eliminar archivo:', e));
            
            return res.status(500).json(createApiResponse(
              false,
              undefined,
              undefined,
              'Error al decodificar QR: ' + (qrError.message || 'Error desconocido')
            ));
          }
        } catch (innerError) {
          console.error('Error general al procesar la imagen:', innerError);
          // Eliminar el archivo temporal
          await fs.unlink(filePath).catch(e => console.error('Error al eliminar archivo:', e));
          
          return res.status(500).json(createApiResponse(
            false,
            undefined,
            undefined,
            'Error al procesar la imagen: ' + (innerError.message || 'Error desconocido')
          ));
        }
        
        if (!qrCodeValue) {
          // Eliminar el archivo temporal
          await fs.unlink(filePath).catch(e => console.error('Error al eliminar archivo:', e));
          
          return res.status(400).json(createApiResponse(
            false,
            undefined,
            undefined,
            'No se pudo detectar un código QR en la imagen'
          ));
        }

        try {
          // Buscar el extintor por el código QR
          const extintorRepo = AppDataSource.getRepository(Extintor);
          const extintor = await extintorRepo
            .createQueryBuilder('extintor')
            .leftJoinAndSelect('extintor.tipo', 'tipo')
            .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
            .leftJoinAndSelect('ubicacion.sede', 'sede')
            .leftJoinAndSelect('extintor.responsable', 'responsable')
            .where('extintor.codigo_qr = :qrCode', { qrCode: qrCodeValue })
            .getOne();
          
          console.log('Extintor encontrado:', extintor ? 'Sí' : 'No');

          // Eliminar el archivo temporal
          await fs.unlink(filePath).catch(e => console.error('Error al eliminar archivo:', e));

          if (extintor) {
            // Si el extintor existe, devolver sus datos
            return res.json(createApiResponse(
              true,
              {
                found: true,
                extintor,
                qrCode: qrCodeValue
              },
              'Extintor encontrado'
            ));
          } else {
            // Si el extintor no existe, devolver solo el código QR
            return res.json(createApiResponse(
              true,
              {
                found: false,
                qrCode: qrCodeValue
              },
              'Código QR escaneado correctamente, pero no corresponde a ningún extintor registrado'
            ));
          }
        } catch (dbError) {
          console.error('Error al buscar extintor en la base de datos:', dbError);
          // Eliminar el archivo temporal si aún existe
          await fs.unlink(filePath).catch(e => console.error('Error al eliminar archivo:', e));
          
          return res.status(500).json(createApiResponse(
            false,
            undefined,
            undefined,
            'Error al buscar extintor en la base de datos: ' + (dbError.message || 'Error desconocido')
          ));
        }
      } catch (error) {
        console.error('Error al escanear código QR:', error);
        return res.status(500).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Error al procesar la imagen QR'
        ));
      }
    });
  }

  /**
   * Decodificar un código QR de una imagen
   */
  private static async decodeQR(image: any): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        console.log('Iniciando decodificación QR');
        
        if (!image || !image.bitmap) {
          console.error('Imagen inválida o sin propiedad bitmap');
          console.log('Propiedades de la imagen:', Object.keys(image || {}));
          resolve(null);
          return;
        }
        
        const qrCodeReader = new QrCode();
        
        qrCodeReader.callback = (err: Error | null, result: any) => {
          if (err) {
            console.error('Error en callback de QR reader:', err);
            resolve(null);
            return;
          }
          
          if (!result || !result.result) {
            console.log('No se detectó código QR en la imagen');
            resolve(null);
            return;
          }
          
          console.log('Código QR detectado:', result.result);
          resolve(result.result);
        };
        
        console.log('Dimensiones de la imagen:', image.bitmap.width, 'x', image.bitmap.height);
        qrCodeReader.decode(image.bitmap);
      } catch (error) {
        console.error('Error en decodificación QR:', error);
        resolve(null);
      }
    });
  }

  /**
   * Generar un código QR para un extintor
   */
  static async generateQR(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      
      const extintorRepo = AppDataSource.getRepository(Extintor);
      const extintor = await extintorRepo.findOne({ where: { id: parseInt(id) } });
      
      if (!extintor) {
        res.status(404).json(createApiResponse(
          false,
          undefined,
          undefined,
          'Extintor no encontrado'
        ));
        return;
      }
      
      // Si el extintor no tiene un código QR, generamos uno
      if (!extintor.codigo_qr) {
        // Generar un código único basado en el ID y un timestamp
        extintor.codigo_qr = `FG-EXT-${extintor.id}-${Date.now()}`;
        await extintorRepo.save(extintor);
      }
      
      // Generar el código QR como una imagen PNG
      const qrBuffer = await QRCode.toBuffer(extintor.codigo_qr, {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 1,
        scale: 8
      });
      
      // Configurar la respuesta para devolver la imagen
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="extintor-${extintor.id}-qr.png"`);
      res.send(qrBuffer);
      return;
      
    } catch (error) {
      console.error('Error al generar código QR:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error al generar el código QR'
      ));
    }
  }
}
