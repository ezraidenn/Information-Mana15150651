import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRevalidation } from '../contexts/RevalidationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  AlertCircle, 
  CheckCircle, 
  Flame, 
  Activity,
  Calendar,
  TrendingUp,
  Shield,
  MapPin,
  Plus,
  Clock,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

// Componentes UI
import { Card, CardContent, CardHeader, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/LoadingSpinner';

// Estilos personalizados para el dashboard
import '../styles/dashboard.css';

// Datos y tipos
import { apiQueries } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { RecentActivity } from '../types';

// Definición de tipos
interface DashboardStats {
  total_extintores: number;
  extintores_vigentes: number;
  extintores_vencidos: number;
  extintores_por_vencer: number;
  mantenimientos_pendientes: number;
  porcentaje_crecimiento?: number;
  porcentaje_por_vencer?: number;
  porcentaje_mantenimientos?: number;
}

// Tipo para los items de actividad reciente
type ActivityItem = {
  id: number;
  tipo: string;
  fecha: Date;
  descripcion: string;
  usuario: string;
  extintor?: {
    id: number;
    codigo_interno?: string;
    tipo?: any;
    ubicacion?: any;
  };
}

// Función auxiliar para formatear fechas relativas
const formatRelativeTime = (date: Date): string => {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: es
  });
};

// Componente para mensajes de error
const ErrorMessage: React.FC<{
  title: string;
  message: string;
  onRetry?: () => void;
}> = ({ title, message, onRetry }) => {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="py-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-red-800">{title}</h4>
            <p className="text-sm text-red-600 mt-1">{message}</p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 bg-white text-red-600 border-red-300 hover:bg-red-50"
                onClick={onRetry}
              >
                Reintentar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Animaciones para los elementos del dashboard
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activityFilter, setActivityFilter] = React.useState('todos');
  const [showWelcome, setShowWelcome] = React.useState(true);
  const { invalidateQueries } = useRevalidation();
  
  // Efecto para ocultar el mensaje de bienvenida después de 5 segundos
  React.useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  // Efecto para configurar un intervalo de revalidación de datos
  React.useEffect(() => {
    // Revalidar datos cada 30 segundos para mantener el dashboard actualizado
    const interval = setInterval(() => {
      invalidateQueries(['dashboardStats', 'dashboardActivity', 'dashboardAlerts']);
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, [invalidateQueries]);

  // Función para filtrar y ordenar actividades
  const getFilteredActivities = (): ActivityItem[] => {
    if (!recentActivity) return [];
    
    let activities: ActivityItem[] = [
      ...recentActivity.mantenimientos_recientes.map((item: { id: number; fecha: string; extintor: { id: number; codigo_interno?: string }; tecnico: string }) => ({
        ...item,
        tipo: 'mantenimiento',
        fecha: new Date(item.fecha),
        descripcion: `Mantenimiento en extintor ${item.extintor.codigo_interno || item.extintor.id}`,
        usuario: item.tecnico
      })),
      ...recentActivity.extintores_recientes.map((item: { id: number; fecha_creacion: string; codigo_interno?: string; tipo: any; ubicacion: any }) => ({
        id: item.id,
        fecha: new Date(item.fecha_creacion),
        tipo: 'extintor',
        descripcion: `Nuevo extintor registrado: ${item.codigo_interno || item.id}`,
        extintor: {
          id: item.id,
          codigo_interno: item.codigo_interno,
          tipo: item.tipo,
          ubicacion: item.ubicacion
        },
        usuario: 'Sistema'
      }))
    ];
    
    // Aplicar filtro si no es 'todos'
    if (activityFilter !== 'todos') {
      activities = activities.filter(activity => activity.tipo === activityFilter);
    }
    
    // Ordenar por fecha más reciente y limitar a 10
    return activities.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 10);
  };

  // Consultas React Query para obtener datos del dashboard
  const { data: stats, error: statsError, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: apiQueries.functions.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 1, // Limitar reintentos automáticos
    retryDelay: 1000 // Retrasar reintentos 1 segundo
  });

  const { data: recentActivity, error: activityError, isLoading: activityLoading, refetch: refetchActivity } = useQuery<RecentActivity>({
    queryKey: ['dashboardActivity'],
    queryFn: apiQueries.functions.getRecentActivity,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000
  });

  // Comentado: Alertas duplicadas con Acciones Rápidas
  /*
  const { data: alerts, error: alertsError, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery<Alerts>({
    queryKey: ['dashboardAlerts'],
    queryFn: apiQueries.functions.getAlerts,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000
  });
  */
  
  // Comentamos esta consulta ya que está causando problemas
  /*
  const { data: performanceData, error: performanceError, isLoading: performanceLoading } = useQuery({
    queryKey: ['dashboardPerformance'],
    queryFn: apiQueries.functions.getPerformanceMetrics,
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  });
  */

  // Variable para mostrar errores generales
  const hasError = statsError || activityError;

  // Función para obtener el icono según el tipo de actividad
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'extintor':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'mantenimiento':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'recarga':
        return <Plus className="h-5 w-5 text-green-500" />;
      case 'vencimiento':
        return <Clock className="h-5 w-5 text-red-500" />;
      case 'instalacion':
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de bienvenida */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            className="welcome-banner" 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="welcome-content" 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <h1 className="welcome-title">¡Bienvenido, {user?.nombre || 'Administrador'}!</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600">Resumen del estado actual del sistema</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500 dashboard-update-time">
            Última actualización: {stats ? 'hace 0 segundos' : 'cargando...'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="refresh-button"
            onClick={() => {
              refetchStats();
              refetchActivity();
            }}
          >
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Actualizar
            </motion.div>
          </Button>
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
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="stats-container"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h2 
            className="section-title"
            variants={fadeInUp}
          >
            Estadísticas Generales
          </motion.h2>
          {statsError && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchStats()}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Reintentar
            </Button>
          )}
        </div>
        
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" variant="rectangular" />
                <Skeleton lines={2} />
                <Skeleton className="h-4 w-20 mt-2" />
              </Card>
            ))}
          </div>
        ) : statsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <AlertCircle className="text-red-600 mr-2" />
              <h3 className="font-medium text-red-800">Error al cargar estadísticas</h3>
            </div>
            <p className="text-sm text-red-700 mb-2">No se pudieron cargar las estadísticas del dashboard. El servidor puede estar experimentando problemas.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchStats()}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Reintentar
            </Button>
          </div>
        ) : stats ? (
          <motion.div 
            className="stats-grid stats-grid-5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
              <StatCard
                title="Total Extintores"
                value={stats.total_extintores}
                icon={<Flame className="stat-icon text-orange-500" />}
                trend={{
                  value: stats.porcentaje_crecimiento || 0,
                  isPositive: (stats.porcentaje_crecimiento || 0) > 0,
                  label: "vs. mes anterior"
                }}
                className="stat-card-gradient-orange"
              />
            </motion.div>
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
              <StatCard
                title="Extintores Vigentes"
                value={stats.extintores_vigentes}
                icon={<CheckCircle className="stat-icon text-green-500" />}
                subtitle={`${Math.round((stats.extintores_vigentes / stats.total_extintores) * 100)}% del total`}
                color="green"
                className="stat-card-gradient-green"
              />
            </motion.div>
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
              <StatCard
                title="Extintores Vencidos"
                value={stats.extintores_vencidos}
                icon={<AlertCircle className="stat-icon text-red-500" />}
                trend={{
                  value: 100,
                  isPositive: false,
                  label: "requieren atención inmediata"
                }}
                color="red"
                className="stat-card-gradient-red"
              />
            </motion.div>
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
              <StatCard
                title="Próximos a Vencer"
                value={stats.extintores_por_vencer}
                icon={<Clock className="stat-icon text-yellow-500" />}
                trend={{
                  value: stats.porcentaje_por_vencer || 0,
                  isPositive: false,
                  label: "próximos 30 días"
                }}
                color="yellow"
                className="stat-card-gradient-yellow"
              />
            </motion.div>
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
              <StatCard
                title="Mantenimientos Pendientes"
                value={stats.mantenimientos_pendientes}
                icon={<Activity className="stat-icon text-blue-500" />}
                trend={{
                  value: stats.porcentaje_mantenimientos || 0,
                  isPositive: false,
                  label: "requieren atención"
                }}
                color="blue"
                className="stat-card-gradient-blue"
              />
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay estadísticas disponibles</p>
            <p className="text-sm text-gray-500 mt-1">
              Intente nuevamente más tarde
            </p>
          </div>
        )}
      </motion.div>

      {/* Actividad Reciente */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="activity-container"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h2 
            className="section-title"
            variants={fadeInUp}
          >
            Actividad Reciente
          </motion.h2>
          {activityError && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchActivity()}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Reintentar
            </Button>
          )}
        </div>
        
        {activityLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full mr-4" variant="circular" />
                <div className="flex-1">
                  <Skeleton lines={2} />
                </div>
              </div>
            ))}
          </div>
        ) : activityError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <AlertCircle className="text-red-600 mr-2" />
              <h3 className="font-medium text-red-800">Error al cargar actividad reciente</h3>
            </div>
            <p className="text-sm text-red-700 mb-2">No se pudo cargar la actividad reciente. Intente nuevamente más tarde.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchActivity()}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              Reintentar
            </Button>
          </div>
        ) : recentActivity && 
           (recentActivity.mantenimientos_recientes.length > 0 || 
            recentActivity.extintores_recientes.length > 0) ? (
          <motion.div 
            className="activity-content"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
      
            {/* Filtros rápidos */}
            <motion.div 
              className="filters-container"
              variants={fadeInUp}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={activityFilter === 'todos' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('todos')}
                  className={`filter-button ${activityFilter === 'todos' ? 'filter-active' : ''}`}
                >
                  Todos
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={activityFilter === 'extintor' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('extintor')}
                  className={`filter-button ${activityFilter === 'extintor' ? 'filter-active-orange' : ''}`}
                >
                  Extintores
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={activityFilter === 'mantenimiento' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('mantenimiento')}
                  className={`filter-button ${activityFilter === 'mantenimiento' ? 'filter-active-blue' : ''}`}
                >
                  Mantenimientos
                </Button>
              </motion.div>
            </motion.div>
      
            {/* Timeline de actividades */}
            <motion.div 
              className="activity-timeline"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {getFilteredActivities().map((activity, index) => (
                  <motion.div
                    key={`${activity.tipo}-${activity.id}`}
                    variants={fadeInUp}
                    custom={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="timeline-item"
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    {/* Punto en la línea de tiempo */}
                    <motion.div 
                      className={`timeline-dot ${activity.tipo}`}
                      whileHover={{ scale: 1.2 }}
                      animate={{ 
                        boxShadow: [
                          '0 0 0 rgba(0, 0, 0, 0.2)', 
                          '0 0 10px rgba(0, 0, 0, 0.4)', 
                          '0 0 0 rgba(0, 0, 0, 0.2)'
                        ] 
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getActivityIcon(activity.tipo)}
                    </motion.div>
                    
                    {/* Contenido de la actividad */}
                    <div className={`timeline-content ${activity.tipo}`}>
                      <div className="timeline-header">
                        <div>
                          <h4 className="timeline-title">{activity.descripcion}</h4>
                          <p className="timeline-user">Por {activity.usuario}</p>
                          {activity.extintor && 'ubicacion' in activity.extintor && activity.extintor.ubicacion && (
                            <span className="flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {activity.extintor.ubicacion}
                            </span>
                          )}
                        </div>
                        <span className="timeline-time">{formatRelativeTime(activity.fecha)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
      
      {/* Botón para ver más actividad (deshabilitado) */}
            <motion.div 
              className="view-more-container"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="view-more-button opacity-60 cursor-not-allowed"
                  disabled={true}
                  title="Función no disponible aún"
                >
                  <span>Ver más actividad</span> 
                  <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Próximamente</span>
                  <ChevronRight className="ml-1 h-4 w-4 text-gray-400" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay actividad reciente</p>
            <p className="text-sm text-gray-500 mt-1">Se mostrarán las últimas actividades aquí</p>
          </div>
        )}
      </motion.div>

      {/* Acciones Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="actions-container"
      >
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-lg font-medium">Acciones Rápidas</h3>
              <p className="text-sm text-gray-500">Accede rápidamente a las funciones más utilizadas</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <motion.div 
              className="quick-actions-grid"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="quick-action-button extintor"
                  onClick={() => window.location.href = '/extintores'}
                >
                  <motion.div 
                    className="quick-action-icon"
                    whileHover={{ rotate: 10 }}
                  >
                    <Shield className="h-6 w-6" />
                  </motion.div>
                  <h4 className="quick-action-title">Extintores</h4>
                  <p className="quick-action-description">Gestionar equipos</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
              >
                <div 
                  className="quick-action-button mantenimiento opacity-60 cursor-not-allowed"
                  title="Función no disponible aún"
                >
                  <div className="quick-action-icon">
                    <Activity className="h-6 w-6 text-gray-500" />
                  </div>
                  <h4 className="quick-action-title text-gray-500">Mantenimiento</h4>
                  <p className="quick-action-description text-gray-400">Próximamente</p>
                  <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded absolute top-2 right-2">Próximo</span>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="quick-action-button vencidos"
                  onClick={() => window.location.href = '/extintores?filtro=vencidos'}
                >
                  <motion.div 
                    className="quick-action-icon"
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertTriangle className="h-6 w-6" />
                  </motion.div>
                  <h4 className="quick-action-title">Ver Vencidos</h4>
                  <p className="quick-action-description">Atención inmediata</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="quick-action-button proximos"
                  onClick={() => window.location.href = '/extintores?filtro=proximos_vencer'}
                >
                  <motion.div 
                    className="quick-action-icon"
                    whileHover={{ scale: 1.2 }}
                  >
                    <Calendar className="h-6 w-6" />
                  </motion.div>
                  <h4 className="quick-action-title">Próximos a Vencer</h4>
                  <p className="quick-action-description">Planificación</p>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
