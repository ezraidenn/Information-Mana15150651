import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, ChevronRight } from 'lucide-react';

/**
 * Componente de enlace a la configuración del tema
 * Para ser usado en la página de configuración general
 */
const ThemeSettingsLink: React.FC = () => {
  return (
    <Link 
      to="/configuracion/tema"
      className="flex items-center p-4 bg-bg-paper rounded-lg border border-secondary-light hover:border-primary-main transition-colors"
    >
      <div className="p-3 rounded-full bg-secondary-light text-primary-dark mr-4">
        <Palette size={24} />
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-lg text-text-primary">Configuración del Tema</h3>
        <p className="text-text-secondary mt-1">
          Personaliza los colores, logo y apariencia visual con la paleta oficial YCC Extintores
        </p>
      </div>
      
      <ChevronRight className="text-secondary-dark" size={20} />
    </Link>
  );
};

export default ThemeSettingsLink;
