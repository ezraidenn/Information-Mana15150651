import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Componente de cabecera para páginas
 * Muestra un título, descripción opcional, icono opcional y acciones opcionales
 */
const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  actions 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-border-light">
      <div className="flex items-center">
        {icon && (
          <div className="mr-3 p-2 rounded-full bg-secondary-light text-primary-dark">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {description && (
            <p className="mt-1 text-text-secondary">{description}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="mt-4 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
