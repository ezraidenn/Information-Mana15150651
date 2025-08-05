import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput, useFormValidation } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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
    reset,
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
      toast.success('¡Bienvenido a FireGuardian!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error en login:', error);
      // El error ya se maneja en el hook useAuth y el interceptor de la API
    } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header con logo */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            
            <motion.h1
              className="text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              FireGuardian
            </motion.h1>
            
            <motion.p
              className="text-primary-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Sistema de Inventario de Extintores
            </motion.p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Campo Email */}
              <div>
                <Input
                  type="email"
                  label="Correo Electrónico"
                  placeholder="usuario@ejemplo.com"
                  value={values.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  leftIcon={<User className="h-5 w-5" />}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Campo Contraseña */}
              <div>
                <PasswordInput
                  label="Contraseña"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleFieldBlur('password')}
                  error={touched.password ? errors.password : undefined}
                  leftIcon={<Lock className="h-5 w-5" />}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                loadingText="Iniciando sesión..."
                disabled={isLoading}
                className="mt-8"
              >
                Iniciar Sesión
              </Button>
            </motion.form>

            {/* Información adicional */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                      Usuarios de Prueba
                    </h3>
                    <div className="text-xs text-blue-700 space-y-1">
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
          className="text-center mt-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>© 2024 YCC Extintores. Todos los derechos reservados.</p>
          <p className="mt-1">Versión 1.0.0</p>
        </motion.div>
      </motion.div>

      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
