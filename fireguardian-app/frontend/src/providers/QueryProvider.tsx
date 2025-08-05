import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import toast from 'react-hot-toast';

// Configuración del cliente de React Query
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tiempo de vida de los datos en cache (5 minutos)
        staleTime: 5 * 60 * 1000,
        // Tiempo de vida en cache antes de ser eliminados (10 minutos)
        cacheTime: 10 * 60 * 1000,
        // Reintentar 3 veces en caso de error
        retry: (failureCount, error: any) => {
          // No reintentar errores de autenticación o permisos
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            return false;
          }
          // Reintentar máximo 3 veces para otros errores
          return failureCount < 3;
        },
        // Intervalo entre reintentos (exponencial)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch automático cuando la ventana vuelve a tener foco
        refetchOnWindowFocus: true,
        // Refetch cuando se reconecta a internet
        refetchOnReconnect: true,
        // No refetch automático en mount si los datos son frescos
        refetchOnMount: true,
      },
      mutations: {
        // Reintentar mutaciones fallidas una vez
        retry: 1,
        // Tiempo de espera para mutaciones (30 segundos)
        // networkMode: 'online',
      },
    },
    // Cache global para queries
    queryCache: new QueryCache({
      onError: (error: any, query) => {
        // Solo mostrar toast si la query no está en background
        if (query.state.fetchStatus !== 'idle') {
          console.error('Query error:', error);
          
          // No mostrar errores de autenticación (ya se manejan en el interceptor)
          if (error?.response?.status !== 401 && error?.response?.status !== 403) {
            const message = error?.response?.data?.error || error?.message || 'Error al cargar datos';
            toast.error(message);
          }
        }
      },
      onSuccess: (data, query) => {
        // Log de éxito para debugging en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('Query success:', query.queryKey, data);
        }
      },
    }),
    // Cache global para mutaciones
    mutationCache: new MutationCache({
      onError: (error: any, variables, context, mutation) => {
        console.error('Mutation error:', error);
        
        // No mostrar errores de autenticación (ya se manejan en el interceptor)
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          const message = error?.response?.data?.error || error?.message || 'Error al realizar la operación';
          toast.error(message);
        }
      },
      onSuccess: (data, variables, context, mutation) => {
        // Log de éxito para debugging en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('Mutation success:', mutation.options.mutationKey, data);
        }
      },
    }),
  });
};

// Instancia del cliente
let queryClient: QueryClient;

// Función para obtener o crear el cliente
const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

// Props del proveedor
interface QueryProviderProps {
  children: ReactNode;
}

// Proveedor de React Query
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              marginLeft: '5px',
              transform: 'scale(0.8)',
              transformOrigin: 'bottom right',
            },
          }}
        />
      )}
    </QueryClientProvider>
  );
};

// Hook para acceder al cliente desde componentes
export const useQueryClient = () => {
  return getQueryClient();
};

// Utilidades para invalidar queries específicas
export const queryUtils = {
  // Invalidar todas las queries del dashboard
  invalidateDashboard: () => {
    const client = getQueryClient();
    client.invalidateQueries({ queryKey: ['dashboard'] });
  },

  // Invalidar queries de extintores
  invalidateExtintores: () => {
    const client = getQueryClient();
    client.invalidateQueries({ queryKey: ['extintores'] });
  },

  // Invalidar query específica de extintor
  invalidateExtintor: (id: number) => {
    const client = getQueryClient();
    client.invalidateQueries({ queryKey: ['extintores', id] });
  },

  // Invalidar queries de usuarios
  invalidateUsuarios: () => {
    const client = getQueryClient();
    client.invalidateQueries({ queryKey: ['usuarios'] });
  },

  // Invalidar queries de sedes y ubicaciones
  invalidateLocations: () => {
    const client = getQueryClient();
    client.invalidateQueries({ queryKey: ['sedes'] });
    client.invalidateQueries({ queryKey: ['ubicaciones'] });
  },

  // Invalidar queries de mantenimientos
  invalidateMantenimientos: (extintorId?: number) => {
    const client = getQueryClient();
    if (extintorId) {
      client.invalidateQueries({ queryKey: ['mantenimientos', 'extintor', extintorId] });
    } else {
      client.invalidateQueries({ queryKey: ['mantenimientos'] });
    }
  },

  // Limpiar todo el cache
  clearCache: () => {
    const client = getQueryClient();
    client.clear();
  },

  // Refetch todas las queries activas
  refetchAll: () => {
    const client = getQueryClient();
    client.refetchQueries();
  },

  // Prefetch de datos comunes
  prefetchCommonData: async () => {
    const client = getQueryClient();
    
    // Prefetch tipos de extintores (datos que rara vez cambian)
    client.prefetchQuery({
      queryKey: ['tipos-extintores'],
      queryFn: async () => {
        const { apiClient } = await import('@/utils/api');
        return apiClient.getTiposExtintores();
      },
      staleTime: 30 * 60 * 1000, // 30 minutos
    });

    // Prefetch sedes
    client.prefetchQuery({
      queryKey: ['sedes'],
      queryFn: async () => {
        const { apiClient } = await import('@/utils/api');
        return apiClient.getSedes();
      },
      staleTime: 10 * 60 * 1000, // 10 minutos
    });
  },

  // Optimistic updates para extintores
  optimisticUpdateExtintor: (id: number, updatedData: any) => {
    const client = getQueryClient();
    
    // Actualizar query individual
    client.setQueryData(['extintores', id], (oldData: any) => ({
      ...oldData,
      ...updatedData,
    }));

    // Actualizar lista de extintores
    client.setQueriesData(
      { queryKey: ['extintores', 'list'] },
      (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((extintor: any) =>
            extintor.id === id ? { ...extintor, ...updatedData } : extintor
          ),
        };
      }
    );
  },

  // Remover extintor del cache
  removeExtintorFromCache: (id: number) => {
    const client = getQueryClient();
    
    // Remover query individual
    client.removeQueries({ queryKey: ['extintores', id] });

    // Actualizar listas para remover el extintor
    client.setQueriesData(
      { queryKey: ['extintores', 'list'] },
      (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.filter((extintor: any) => extintor.id !== id),
          total: oldData.total - 1,
        };
      }
    );
  },

  // Agregar nuevo extintor al cache
  addExtintorToCache: (newExtintor: any) => {
    const client = getQueryClient();
    
    // Agregar a las listas existentes
    client.setQueriesData(
      { queryKey: ['extintores', 'list'] },
      (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: [newExtintor, ...oldData.data],
          total: oldData.total + 1,
        };
      }
    );
  },
};

// Exportar el cliente para casos especiales
export { getQueryClient };

// Tipos para TypeScript
export type QueryUtils = typeof queryUtils;
