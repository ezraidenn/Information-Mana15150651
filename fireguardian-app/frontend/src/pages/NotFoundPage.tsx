import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animación del número 404 */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <div className="relative">
            <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Shield className="h-16 w-16 text-primary-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Mensaje principal */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-4">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <p className="text-sm text-gray-500">
            Verifica la URL o regresa al dashboard principal.
          </p>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={handleGoHome}
            leftIcon={<Home className="h-4 w-4" />}
            size="lg"
          >
            Ir al Dashboard
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            size="lg"
          >
            Volver Atrás
          </Button>
        </motion.div>

        {/* Sugerencias */}
        <motion.div
          className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
            <Search className="h-5 w-5 mr-2" />
            ¿Qué estabas buscando?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <button
              onClick={() => navigate('/extintores')}
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-gray-900">Extintores</div>
              <div className="text-gray-600">Gestión de inventario</div>
            </button>
            
            <button
              onClick={() => navigate('/mantenimientos')}
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-gray-900">Mantenimientos</div>
              <div className="text-gray-600">Historial y programación</div>
            </button>
            
            <button
              onClick={() => navigate('/reportes')}
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-gray-900">Reportes</div>
              <div className="text-gray-600">Análisis y exportación</div>
            </button>
            
            <button
              onClick={() => navigate('/usuarios')}
              className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-gray-900">Usuarios</div>
              <div className="text-gray-600">Gestión de accesos</div>
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p>Si el problema persiste, contacta al administrador del sistema.</p>
        </motion.div>
      </div>

      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-100 rounded-full opacity-50"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary-100 rounded-full opacity-50"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
