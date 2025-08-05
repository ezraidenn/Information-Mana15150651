import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginCredentials, AppContextType } from '@/types';
import { apiClient } from '@/utils/api';
import { storageUtils } from '@/utils';
import toast from 'react-hot-toast';

// Crear el contexto
const AuthContext = createContext<AppContextType | undefined>(undefined);

// Props del proveedor
interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Verificar estado de autenticación
   */
  const checkAuthStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Verificar si hay token en localStorage
      const token = storageUtils.get<string>('auth_token');
      const userData = storageUtils.get<User>('user_data');
      
      if (!token || !userData) {
        setIsLoading(false);
        return;
      }

      // Verificar token con el servidor
      const { valid, user: serverUser } = await apiClient.verifyToken();
      
      if (valid && serverUser) {
        setUser(serverUser);
        setIsAuthenticated(true);
        
        // Actualizar datos del usuario en localStorage si han cambiado
        if (JSON.stringify(userData) !== JSON.stringify(serverUser)) {
          storageUtils.set('user_data', serverUser);
        }
      } else {
        // Token inválido, limpiar datos
        await logout();
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Iniciar sesión
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      
      const authData = await apiClient.login(credentials);
      
      setUser(authData.user);
      setIsAuthenticated(true);
      
      toast.success(`¡Bienvenido, ${authData.user.nombre}!`);
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // El error ya se maneja en el interceptor de la API
      // Solo necesitamos lanzar el error para que el componente lo maneje
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async (): Promise<void> => {
    try {
      // Intentar cerrar sesión en el servidor
      await apiClient.logout();
    } catch (error) {
      // Ignorar errores del servidor al cerrar sesión
      console.warn('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      setIsAuthenticated(false);
      apiClient.clearAuth();
      
      toast.success('Sesión cerrada exitosamente');
    }
  };

  /**
   * Actualizar datos del usuario
   */
  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    storageUtils.set('user_data', updatedUser);
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: 'admin' | 'tecnico' | 'consulta'): boolean => {
    return user?.rol === role;
  };

  /**
   * Verificar si el usuario tiene uno de varios roles
   */
  const hasAnyRole = (roles: Array<'admin' | 'tecnico' | 'consulta'>): boolean => {
    return user ? roles.includes(user.rol) : false;
  };

  /**
   * Verificar si el usuario puede editar (admin o técnico)
   */
  const canEdit = (): boolean => {
    return hasAnyRole(['admin', 'tecnico']);
  };

  /**
   * Verificar si el usuario es administrador
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  // Valor del contexto
  const contextValue: AppContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    // Funciones adicionales de utilidad
    hasRole,
    hasAnyRole,
    canEdit,
    isAdmin,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = (): AppContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// Hook para verificar autenticación con redirección
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);
  
  return { isAuthenticated, isLoading };
};

// Hook para verificar roles con redirección
export const useRequireRole = (
  requiredRoles: Array<'admin' | 'tecnico' | 'consulta'>,
  redirectTo: string = '/dashboard'
) => {
  const { user, hasAnyRole, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    if (!isLoading && user) {
      const access = hasAnyRole(requiredRoles);
      setHasAccess(access);
      
      if (!access) {
        toast.error('No tienes permisos para acceder a esta página');
        window.location.href = redirectTo;
      }
    }
  }, [user, isLoading, hasAnyRole, requiredRoles, redirectTo]);
  
  return { hasAccess, isLoading };
};

// Componente de protección de rutas
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Array<'admin' | 'tecnico' | 'consulta'>;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallback = <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
  </div>
}) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <>{fallback}</>;
  }
  
  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    window.location.href = '/login';
    return <>{fallback}</>;
  }
  
  // Verificar roles si se especifican
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    toast.error('No tienes permisos para acceder a esta página');
    window.location.href = '/dashboard';
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Componente para mostrar contenido solo si el usuario tiene ciertos roles
interface RoleGuardProps {
  children: ReactNode;
  roles: Array<'admin' | 'tecnico' | 'consulta'>;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  fallback = null
}) => {
  const { hasAnyRole } = useAuth();
  
  if (!hasAnyRole(roles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Extender el tipo AppContextType para incluir las funciones adicionales
declare module '@/types' {
  interface AppContextType {
    hasRole: (role: 'admin' | 'tecnico' | 'consulta') => boolean;
    hasAnyRole: (roles: Array<'admin' | 'tecnico' | 'consulta'>) => boolean;
    canEdit: () => boolean;
    isAdmin: () => boolean;
    checkAuthStatus: () => Promise<void>;
  }
}
