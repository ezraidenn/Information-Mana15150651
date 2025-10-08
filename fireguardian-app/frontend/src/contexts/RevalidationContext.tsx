import React, { createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Definir el tipo para el contexto
type RevalidationContextType = {
  invalidateQueries: (queryKeys: string[]) => void;
  triggerRefetch: (resource: 'extintores' | 'mantenimientos' | 'usuarios' | 'all') => void;
};

// Crear el contexto
const RevalidationContext = createContext<RevalidationContextType | undefined>(undefined);

// Mapeo de recursos a queryKeys que deben ser invalidados
const resourceToQueryKeys: Record<string, string[]> = {
  extintores: ['extintores', 'dashboardStats', 'dashboardActivity', 'dashboardAlerts'],
  mantenimientos: ['mantenimientos', 'dashboardStats', 'dashboardActivity', 'dashboardAlerts'],
  usuarios: ['usuarios', 'dashboardActivity'],
  all: ['dashboardStats', 'dashboardActivity', 'dashboardAlerts', 'extintores', 'mantenimientos', 'usuarios']
};

// Proveedor del contexto
export const RevalidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Función para invalidar múltiples queries
  const invalidateQueries = (queryKeys: string[]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  // Función para desencadenar la revalidación basada en el recurso modificado
  const triggerRefetch = (resource: 'extintores' | 'mantenimientos' | 'usuarios' | 'all') => {
    const keysToInvalidate = resourceToQueryKeys[resource] || [];
    invalidateQueries(keysToInvalidate);
  };

  const value = {
    invalidateQueries,
    triggerRefetch
  };

  return (
    <RevalidationContext.Provider value={value}>
      {children}
    </RevalidationContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useRevalidation = () => {
  const context = useContext(RevalidationContext);
  if (context === undefined) {
    throw new Error('useRevalidation debe ser usado dentro de un RevalidationProvider');
  }
  return context;
};
