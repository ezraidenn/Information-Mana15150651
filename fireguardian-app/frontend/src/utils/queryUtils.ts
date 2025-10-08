import { QueryClient } from '@tanstack/react-query';
import { apiQueries } from './api';

/**
 * Utilidades para gestionar las consultas de React Query
 * y mantener los datos sincronizados en tiempo real
 */
export const queryUtils = {
  /**
   * Invalida todas las consultas relacionadas con el dashboard
   * @param queryClient Cliente de React Query
   */
  invalidateDashboard: (queryClient: QueryClient) => {
    // Invalidar todas las consultas del dashboard
    queryClient.invalidateQueries({ queryKey: apiQueries.keys.dashboard });
  },

  /**
   * Invalida consultas específicas del dashboard
   * @param queryClient Cliente de React Query
   * @param keys Claves específicas a invalidar
   */
  invalidateDashboardSpecific: (
    queryClient: QueryClient, 
    keys: ('stats' | 'activity' | 'alerts')[]
  ) => {
    keys.forEach(key => {
      switch (key) {
        case 'stats':
          queryClient.invalidateQueries({ queryKey: apiQueries.keys.dashboardStats() });
          break;
        case 'activity':
          queryClient.invalidateQueries({ queryKey: apiQueries.keys.dashboardActivity() });
          break;
        case 'alerts':
          queryClient.invalidateQueries({ queryKey: apiQueries.keys.dashboardAlerts() });
          break;
      }
    });
  },

  /**
   * Invalida todas las consultas relacionadas con extintores
   * @param queryClient Cliente de React Query
   */
  invalidateExtintores: (queryClient: QueryClient) => {
    // Invalidar todas las consultas de extintores
    queryClient.invalidateQueries({ queryKey: apiQueries.keys.extintores });
    
    // También invalidar el dashboard ya que depende de los datos de extintores
    queryUtils.invalidateDashboard(queryClient);
  },

  /**
   * Invalida consultas específicas de extintores
   * @param queryClient Cliente de React Query
   * @param id ID del extintor (opcional)
   */
  invalidateExtintor: (queryClient: QueryClient, id?: number) => {
    if (id) {
      // Invalidar solo el extintor específico
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.extintor(id) });
    } else {
      // Invalidar todos los extintores
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.extintores });
    }
    
    // También invalidar el dashboard
    queryUtils.invalidateDashboard(queryClient);
  },

  /**
   * Invalida todas las consultas relacionadas con mantenimientos
   * @param queryClient Cliente de React Query
   * @param extintorId ID del extintor (opcional)
   */
  invalidateMantenimientos: (queryClient: QueryClient, extintorId?: number) => {
    if (extintorId) {
      // Invalidar mantenimientos de un extintor específico
      queryClient.invalidateQueries({ 
        queryKey: apiQueries.keys.mantenimientosByExtintor(extintorId) 
      });
      
      // También invalidar el extintor específico
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.extintor(extintorId) });
    } else {
      // Invalidar todos los mantenimientos
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.mantenimientos });
    }
    
    // También invalidar actividad reciente del dashboard
    queryUtils.invalidateDashboardSpecific(queryClient, ['activity', 'alerts']);
  },

  /**
   * Invalida todas las consultas relacionadas con usuarios
   * @param queryClient Cliente de React Query
   * @param id ID del usuario (opcional)
   */
  invalidateUsuarios: (queryClient: QueryClient, id?: number) => {
    if (id) {
      // Invalidar solo el usuario específico
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.usuario(id) });
    } else {
      // Invalidar todos los usuarios
      queryClient.invalidateQueries({ queryKey: apiQueries.keys.usuarios });
      // Invalidar la lista de usuarios con cualquier filtro
      queryClient.invalidateQueries({ 
        queryKey: ['usuarios', 'list'],
        exact: false
      });
    }
    
    // También invalidar el dashboard ya que puede mostrar información de usuarios
    queryUtils.invalidateDashboardSpecific(queryClient, ['activity']);
  }
};
