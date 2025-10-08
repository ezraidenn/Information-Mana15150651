import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { apiClient } from '../../utils/api';
import { toast } from 'react-hot-toast';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const webcamRef = useRef<Webcam>(null);

  // Configuración de la cámara
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode,
  };

  // Función para activar la cámara
  const startCamera = () => {
    setIsCameraActive(true);
  };

  // Función para cambiar entre cámara frontal y trasera
  const toggleCamera = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  };

  // Función para capturar la imagen
  const captureImage = useCallback(() => {
    if (!webcamRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        toast.error('No se pudo capturar la imagen');
      }
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      toast.error('Error al acceder a la cámara');
    } finally {
      setIsCapturing(false);
    }
  }, [webcamRef]);

  // Función para reintentar la captura
  const retryCapture = () => {
    setCapturedImage(null);
  };

  // Función para procesar la imagen capturada y buscar QR
  const processImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Procesando imagen capturada');
      
      // Convertir la imagen base64 a un archivo
      const base64Data = capturedImage.split(',')[1];
      console.log('Imagen base64 obtenida, longitud:', base64Data.length);
      
      let response;
      try {
        // Verificar que la imagen base64 sea válida
        if (!base64Data || base64Data.length === 0) {
          throw new Error('Imagen base64 inválida o vacía');
        }
        
        const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
        console.log('Blob creado, tamaño:', blob.size);
        
        // Verificar que el blob tenga un tamaño razonable
        if (blob.size < 100) { // Menos de 100 bytes probablemente no es una imagen válida
          throw new Error('La imagen es demasiado pequeña para ser válida');
        }
        
        const file = new File([blob], 'qr-scan.jpg', { type: 'image/jpeg' });
        console.log('Archivo creado:', file.name, file.type, file.size);
        
        // Crear un FormData para enviar la imagen
        const formData = new FormData();
        formData.append('qrImage', file);
        console.log('FormData creado con la imagen');
        
        // Enviar la imagen al servidor para procesamiento
        console.log('Enviando imagen al servidor...');
        try {
          response = await apiClient.scanQR(formData);
          console.log('Respuesta del servidor:', response);
        } catch (apiError: any) {
          console.error('Error en la API:', apiError);
          
          // Extraer mensaje de error detallado si está disponible
          let errorMessage = 'Error al procesar la imagen en el servidor';
          if (apiError.response && apiError.response.data) {
            errorMessage = apiError.response.data.error || errorMessage;
            console.log('Mensaje de error del servidor:', errorMessage);
          }
          
          throw new Error(errorMessage);
        }
      } catch (conversionError: any) {
        console.error('Error al convertir imagen:', conversionError);
        throw new Error(conversionError.message || 'Error al preparar la imagen para envío');
      }
      
      if (response && response.success) {
        // Notificar éxito
        toast.success(response.message || 'QR escaneado correctamente');
        
        // Llamar al callback con los datos del QR
        onScanSuccess(response.data);
        
        // Cerrar el escáner
        onClose();
      } else {
        toast.error(response.error || 'No se pudo procesar el código QR');
        retryCapture();
      }
    } catch (error) {
      console.error('Error al procesar QR:', error);
      toast.error('Error al procesar la imagen');
      retryCapture();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[95vh] flex flex-col">
        <div className="p-4 bg-red-600 text-white flex justify-between items-center">
          <h3 className="text-lg font-medium">Escanear Código QR</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {!isCameraActive ? (
            <div className="text-center py-4 sm:py-8">
              <Camera size={48} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
              <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
                Para escanear un código QR, necesitamos acceder a tu cámara.
              </p>
              <Button onClick={startCamera}>
                Activar Cámara
              </Button>
            </div>
          ) : capturedImage ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="relative border rounded-lg overflow-hidden">
                <img 
                  src={capturedImage} 
                  alt="Captura" 
                  className="w-full h-auto max-h-[50vh] object-contain mx-auto"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  onClick={retryCapture}
                  disabled={isProcessing}
                  className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                >
                  <RotateCcw size={16} className="mr-1 sm:mr-2" />
                  Reintentar
                </Button>
                <Button 
                  onClick={processImage}
                  disabled={isProcessing}
                  className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                >
                  <Check size={16} className="mr-1 sm:mr-2" />
                  Procesar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="relative border rounded-lg overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-auto max-h-[50vh] object-contain"
                  style={{ height: 'auto', maxHeight: '50vh' }}
                />
                {isCapturing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  onClick={toggleCamera}
                  disabled={isCapturing}
                  className="text-xs sm:text-sm py-1 sm:py-2"
                >
                  Cambiar Cámara
                </Button>
                <Button 
                  onClick={captureImage}
                  disabled={isCapturing}
                  className="text-xs sm:text-sm py-1 sm:py-2"
                >
                  Capturar
                </Button>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                Asegúrate de que el código QR esté bien enfocado y con buena iluminación.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
