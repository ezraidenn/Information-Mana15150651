import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Calendar,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiQueries } from '@/utils/api';
import { Card, CardHeader, CardContent, StatCard, CardGrid } from '@/components/ui/Card';
import { LoadingSpinner, Skeleton } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorBoundary';
import { formatDate, formatRelativeTime } from '@/utils';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Queries para datos del dashboard
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: apiQueries.keys.dashboardStats(),
    queryFn: apiQueries.functions.getDashboardStats,
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  const {
    data: recentActivity,
    isLoading: activityLoading,
    error: activityError,
  } = useQuery({
    queryKey: apiQueries.keys.dashboardActivity(),
    queryFn: apiQueries.functions.getRecentActivity,
    refetchInterval: 60000, // Refetch cada minuto
  });

  const {
    data: alerts,
    isLoading: alertsLoading,
    error: alertsError,
  } = useQuery({
    queryKey: apiQueries.keys.dashboardAlerts(),
    queryFn: apiQueries.functions.getAlerts,
    refetchInterval: 30000, // Refetch cada 30 segundos
  });

  const isLoading = statsLoading || activityLoading || alertsLoading;
  const hasError = statsError || activityError || alertsError;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido, {user?.nombre}!
            </h1>
            <p className="text-gray-600 mt-1">
              Aquí tienes un resumen del estado actual del sistema
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Última actualización: {formatRelativeTime(new Date())}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchStats();
                window.location.reload();
              }}
              className="mt-2"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error general */}
      {hasError && (
        <ErrorMessage
          title="Error al cargar el dashboard"
          message="No se pudieron cargar algunos datos. Intenta actualizar la página."
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Estadísticas principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Estadísticas Generales
        </h2>
        
        {statsLoading ? (
          <CardGrid columns={4} gap="md">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" variant="rectangular" />
                <Skeleton lines={2} />
                <Skeleton className="h-4 w-20 mt-2" />
              </Card>
            ))}
          </CardGrid>
        ) : stats ? (
          <CardGrid columns={4} gap="md">
            <StatCard
              title="Total Extintores"
              value={stats.totalExtintores}
              icon={<Shield />}
              color="blue"
              trend={stats.extintoresTrend ? {
                value: stats.extintoresTrend,
                isPositive: stats.extintoresTrend > 0,
                label: "vs mes anterior"
              } : undefined}
            />
            
            <StatCard
              title="Operativos"
              value={stats.extintoresOperativos}
              subtitle={`${((stats.extintoresOperativos / stats.totalExtintores) * 100).toFixed(1)}% del total`}
              icon={<CheckCircle />}
              color="green"
            />
            
            <StatCard
              title="Requieren Atención"
              value={stats.extintoresAlerta}
              subtitle="Próximos a vencer"
              icon={<AlertTriangle />}
              color="yellow"
            />
            
            <StatCard
              title="Fuera de Servicio"
              value={stats.extintoresCriticos}
              subtitle="Requieren mantenimiento"
              icon={<Clock />}
              color="red"
            />
          </CardGrid>
        ) : null}
      </motion.div>

      {/* Alertas y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alertas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader
              title="Alertas Importantes"
              subtitle="Extintores que requieren atención inmediata"
              divider
            />
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-800">
                          {alert.mensaje}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {alert.ubicacion} • {formatRelativeTime(new Date(alert.fecha))}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {alerts.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="link" size="sm">
                        Ver todas las alertas ({alerts.length - 5} más)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">No hay alertas pendientes</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Todos los extintores están en buen estado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader
              title="Actividad Reciente"
              subtitle="Últimas acciones realizadas en el sistema"
              divider
            />
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 8).map((activity, index) => {
                    const getActivityIcon = (tipo: string) => {
                      switch (tipo) {
                        case 'mantenimiento':
                          return <Activity className="h-4 w-4 text-blue-600" />;
                        case 'inspeccion':
                          return <CheckCircle className="h-4 w-4 text-green-600" />;
                        case 'alerta':
                          return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
                        default:
                          return <Shield className="h-4 w-4 text-gray-600" />;
                      }
                    };

                    return (
                      <motion.div
                        key={activity.id}
                        className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {activity.descripcion}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                            <span>{activity.usuario}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(new Date(activity.fecha))}</span>
                            {activity.ubicacion && (
                              <>
                                <span>•</span>
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {activity.ubicacion}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay actividad reciente</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Las acciones aparecerán aquí cuando se realicen
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Acciones Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader
            title="Acciones Rápidas"
            subtitle="Accede rápidamente a las funciones más utilizadas"
            divider
          />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/extintores/nuevo'}
              >
                <Shield className="h-6 w-6" />
                <span className="text-sm">Nuevo Extintor</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/mantenimientos/nuevo'}
              >
                <Activity className="h-6 w-6" />
                <span className="text-sm">Mantenimiento</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/reportes'}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Generar Reporte</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col space-y-2"
                onClick={() => window.location.href = '/extintores?filtro=proximos_vencer'}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Próximos a Vencer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
