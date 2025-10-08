import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Coffee } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput, useFormValidation } from '@/components/ui/Input';
import { LoginCredentials } from '@/types';
import toast from 'react-hot-toast';

// Validaciones del formulario
const validationRules = {
  email: (value: string) => {
    if (!value) return 'El email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
    return undefined;
  },
  password: (value: string) => {
    if (!value) return 'La contraseña es requerida';
    if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return undefined;
  },
};

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Manejo del formulario
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateAll,
  } = useFormValidation<LoginCredentials>(
    { email: '', password: '' },
    validationRules
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      await login(values);
      setLoginSuccess(true);
      
      // Mostrar animación de éxito antes de redirigir
      setTimeout(() => {
        toast.success('¡Bienvenido a FireGuardian!');
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Error en login:', error);
      // El error ya se maneja en el hook useAuth y el interceptor de la API
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof LoginCredentials, value: string) => {
    setFieldValue(field, value);
  };

  const handleFieldBlur = (field: keyof LoginCredentials) => {
    setFieldTouched(field);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con patrón sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23694a38\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200 rounded-bl-full opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-300 rounded-tr-full opacity-20 -z-10"></div>

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card principal */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-amber-200">
          {/* Encabezado */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-700 p-6 text-center relative overflow-hidden">
            <motion.div
              className="relative z-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-center mb-3">
                <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm border border-white/30">
                  <Coffee className="h-10 w-10 text-amber-100" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-amber-50 mb-1">YCC Extintores</h1>
              <p className="text-amber-100/90 text-sm">Sistema de Gestión FireGuardian</p>
            </motion.div>
            
            {/* Decoración de fondo */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-amber-600/20 rounded-full" />
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-amber-600/20 rounded-full" />
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="p-6 bg-white">
            {loginSuccess ? (
              <motion.div
                className="py-8 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <motion.div
                      initial={{ rotate: 0, scale: 0 }}
                      animate={{ rotate: [0, 20, -20, 0], scale: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Coffee className="h-12 w-12 text-green-600" />
                    </motion.div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">¡Inicio de sesión exitoso!</h2>
                <p className="text-gray-600">Redirigiendo al panel de control...</p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Bienvenido</h2>
                  <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
                </motion.div>

                {/* Campo Email */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Input
                    type="email"
                    label="Correo Electrónico"
                    placeholder="usuario@ejemplo.com"
                    value={values.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    error={touched.email ? errors.email : undefined}
                    leftIcon={<User className="h-5 w-5 text-amber-700" />}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </motion.div>

                {/* Campo Contraseña */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <PasswordInput
                    label="Contraseña"
                    placeholder="••••••••"
                    value={values.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    onBlur={() => handleFieldBlur('password')}
                    error={touched.password ? errors.password : undefined}
                    leftIcon={<Lock className="h-5 w-5 text-amber-700" />}
                    required
                    autoComplete="current-password"
                  />
                </motion.div>

                {/* Botón de envío */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={isLoading}
                    loadingText="Iniciando sesión..."
                    disabled={isLoading}
                    className="mt-6 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white border-0 shadow-lg shadow-amber-600/30"
                  >
                    Iniciar Sesión
                  </Button>
                </motion.div>
              </motion.form>
            )}

            {/* Información adicional */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-amber-800 mb-1">
                      Usuarios de Prueba
                    </h3>
                    <div className="text-xs text-amber-700 space-y-1">
                      <p><strong>Admin:</strong> admin@fireguardian.com / admin123</p>
                      <p><strong>Técnico:</strong> tecnico@fireguardian.com / tecnico123</p>
                      <p><strong>Consulta:</strong> consulta@fireguardian.com / consulta123</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 text-sm text-amber-800/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p>© 2025 FireGuardian. Todos los derechos reservados.</p>
          <p className="mt-1">Versión 1.0.0</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
