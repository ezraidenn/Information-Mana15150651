// Declaraciones de tipos para módulos sin tipos

declare module 'qrcode-reader' {
  export default class QrCode {
    callback: (err: Error | null, result: any) => void;
    decode: (bitmap: any) => void;
  }
}

declare module 'jimp' {
  namespace Jimp {
    function read(path: string): Promise<any>;
  }
  export = Jimp;
}

// Ampliar las definiciones de Express para multer
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
  
  interface Request {
    file?: Multer.File;
    files?: {
      [fieldname: string]: Multer.File[];
    } | Multer.File[];
  }
}
