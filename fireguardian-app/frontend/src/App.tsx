import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { QueryProvider } from '@/providers/QueryProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ThemeProvider } from '@/theme/ThemeContext';
import ThemeApplier from '@/theme/ThemeApplier';
import { TooltipProvider } from './contexts/TooltipContext';

// Importar estilos globales
import '@/theme/global.css';

// Lazy loading de componentes para optimizar el bundle
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ExtintoresPage = lazy(() => import('@/pages/ExtintoresPage'));
const ExtintorDetailPage = lazy(() => import('@/pages/ExtintorDetailPage'));
const TiposExtintoresPage = lazy(() => import('@/pages/TiposExtintoresPage'));
const UbicacionesPage = lazy(() => import('@/pages/UbicacionesPage'));
const MantenimientosPage = lazy(() => import('@/pages/MantenimientosPage'));
const UsuariosPage = lazy(() => import('@/pages/UsuariosPage'));
const ThemeSettingsPage = lazy(() => import('@/pages/admin/ThemeSettingsPage'));
const ReportesPage = lazy(() => import('@/pages/ReportesPage'));
const ConfiguracionPage = lazy(() => import('@/pages/ConfiguracionPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Layout principal de la aplicación
const AppLayout = lazy(() => import('@/components/layout/AppLayout'));

// Componente de loading para Suspense
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <LoadingSpinner size="lg" />
  </div>
);

// Componente para manejar la redirección inicial
const InitialRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

// Rutas protegidas que requieren autenticación
const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/extintores" element={<ExtintoresPage />} />
        <Route path="/extintores/:id" element={<ExtintorDetailPage />} />
        <Route path="/tipos-extintores" element={<TiposExtintoresPage />} />
        <Route path="/ubicaciones" element={<UbicacionesPage />} />
        <Route path="/mantenimientos" element={<MantenimientosPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
        <Route path="/configuracion/tema" element={<ThemeSettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
};

// Nota: Las rutas públicas se manejan directamente en AppRoutes

// Componente principal de rutas
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Ruta raíz - redirección inicial */}
        <Route path="/" element={<InitialRedirect />} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        
        {/* Rutas protegidas */}
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Suspense>
  );
};

// Componente principal de la aplicación
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              <Router>
              {/* Aplicador de tema que configura las variables CSS */}
              <ThemeApplier />
              
              <div className="min-h-screen bg-bg-default">
                <AppRoutes />
                
                {/* Toaster para notificaciones */}
                <Toaster
                  position="top-right"
                  reverseOrder={false}
                  gutter={8}
                  containerClassName=""
                  containerStyle={{}}
                  toastOptions={{
                    // Configuración por defecto
                    duration: 4000,
                    style: {
                      background: 'var(--color-bg-paper)',
                      color: 'var(--color-text-primary)',
                      boxShadow: 'var(--shadow-md)',
                      borderRadius: 'var(--border-radius-lg)',
                      border: '1px solid var(--color-border-light)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      padding: '12px 16px',
                    },
                    
                    // Estilos para diferentes tipos
                    success: {
                      iconTheme: {
                        primary: 'var(--color-status-success)',
                        secondary: '#fff',
                      },
                      style: {
                        borderLeft: '4px solid var(--color-status-success)',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: 'var(--color-status-error)',
                        secondary: '#fff',
                      },
                      style: {
                        borderLeft: '4px solid var(--color-status-error)',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: 'var(--color-status-info)',
                        secondary: '#fff',
                      },
                      style: {
                        borderLeft: '4px solid var(--color-status-info)',
                      },
                    },
                  }}
                />
              </div>
            </Router>
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
