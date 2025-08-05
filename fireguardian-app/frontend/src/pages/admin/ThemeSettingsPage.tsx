import React from 'react';
import ThemeManager from '../../components/admin/ThemeManager';
import PageHeader from '../../components/ui/PageHeader';
import { Palette } from 'lucide-react';

/**
 * Página de configuración del tema de la aplicación
 * Permite a los administradores personalizar colores, logo y otros aspectos visuales
 */
const ThemeSettingsPage: React.FC = () => {
  // Establecer el título de la página usando document.title
  React.useEffect(() => {
    document.title = "Configuración del Tema | FireGuardian";
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Configuración del Tema"
        description="Personaliza los colores y el logo de la aplicación FireGuardian con la paleta oficial YCC Extintores"
        icon={<Palette size={24} />}
      />
      
      <div className="mt-6">
        <ThemeManager />
      </div>
    </div>
  );
};

export default ThemeSettingsPage;
