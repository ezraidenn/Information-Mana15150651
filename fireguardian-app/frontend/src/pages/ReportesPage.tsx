import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

const ReportesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="h-8 w-8 mr-3 text-primary-600" />
          Reportes
        </h1>
        <p className="text-gray-600 mt-1">Análisis y exportación de datos</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader title="Generación de Reportes" />
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Página en Desarrollo</h3>
              <p className="text-gray-600">La generación de reportes estará disponible pronto.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReportesPage;
