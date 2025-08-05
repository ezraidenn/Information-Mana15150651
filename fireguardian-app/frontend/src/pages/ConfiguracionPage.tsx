import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Database, MapPin } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import ThemeSettingsLink from '../components/admin/ThemeSettingsLink';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ConfiguracionPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Settings className="h-8 w-8 mr-3 text-primary-600" />
          Configuración
        </h1>
        <p className="text-gray-600 mt-1">Configuración del sistema y preferencias</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader title="Configuración del Sistema" />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Enlace a configuración del tema */}
              <ThemeSettingsLink />
              
              {/* Enlace a Tipos de Extintores */}
              {hasAnyRole(['admin', 'tecnico']) && (
                <motion.div 
                  className="flex items-center p-4 bg-bg-paper rounded-lg border border-secondary-light cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => navigate('/tipos-extintores')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                    <Shield size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg text-text-primary">Tipos de Extintores</h3>
                    <p className="text-text-secondary mt-1">
                      Gestionar los tipos de extintores del sistema
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Enlace a Ubicaciones */}
              {hasAnyRole(['admin', 'tecnico']) && (
                <motion.div 
                  className="flex items-center p-4 bg-bg-paper rounded-lg border border-secondary-light cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => navigate('/ubicaciones')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <MapPin size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg text-text-primary">Ubicaciones</h3>
                    <p className="text-text-secondary mt-1">
                      Gestionar sedes y ubicaciones del sistema
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Otros enlaces de configuración (futuros) */}
              <div className="flex items-center p-4 bg-bg-paper rounded-lg border border-secondary-light">
                <div className="p-3 rounded-full bg-secondary-light text-secondary-dark mr-4">
                  <Database size={24} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-text-primary">Configuración General</h3>
                  <p className="text-text-secondary mt-1">
                    Próximamente: Ajustes generales del sistema
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ConfiguracionPage;
