declare module 'qrcode-reader' {
  export default class QrCode {
    callback: (err: Error | null, result: any) => void;
    decode: (bitmap: any) => void;
  }
}
