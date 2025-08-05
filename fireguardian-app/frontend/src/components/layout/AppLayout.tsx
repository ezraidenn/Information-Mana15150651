import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Shield,
  Wrench,
  Users,
  FileText,
  Settings,
  Menu,
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { IconButton } from '@/components/ui/Button';
import { cn } from '@/utils';

// Definir elementos de navegación
// Definir tipos para los roles
type UserRole = 'admin' | 'tecnico' | 'consulta';

// Definir tipo para los elementos de navegación
type NavigationItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
  roles?: UserRole[];
};

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Vista general del sistema',
  },
  {
    name: 'Extintores',
    href: '/extintores',
    icon: Shield,
    description: 'Gestión de extintores',
  },
  {
    name: 'Mantenimientos',
    href: '/mantenimientos',
    icon: Wrench,
    description: 'Historial de mantenimientos',
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    description: 'Gestión de usuarios',
    roles: ['admin'],
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: FileText,
    description: 'Reportes y exportación',
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Configuración del sistema',
    roles: ['admin'],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const { user, logout, hasAnyRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Filtrar elementos de navegación según roles
  const filteredNavigation = navigationItems.filter(item => 
    !item.roles || hasAnyRole(item.roles as ("admin" | "tecnico" | "consulta")[])
  );
  
  // Establecer el estado de montado después de la carga
  useEffect(() => {
    // Pequeño retraso para asegurar una transición suave
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);
  
  const expandSidebar = () => {
    setSidebarExpanded(true);
  };

  const collapseSidebar = () => {
    setSidebarExpanded(false);
  };
  
  // Gestionar la transición del sidebar
  useEffect(() => {
    // Aplicar transición suave cuando cambia el estado del sidebar
    const content = document.getElementById('main-content');
    if (content) {
      content.style.transition = 'all 0.3s ease-in-out';
    }
  }, [sidebarExpanded]);
  
  // Manejar el cambio de tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3E8] overflow-x-hidden" style={{ maxWidth: '100vw' }}>
      {/* Sidebar para móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            />
            
            {/* Sidebar */}
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-[70vw] max-w-[250px] min-w-[200px] shadow-xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ overflowY: 'hidden', overflowX: 'hidden' }}
            >
              <Sidebar 
                navigation={filteredNavigation} 
                currentPath={location.pathname}
                onItemClick={closeSidebar}
                isExpanded={true}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar para desktop - minimizado por defecto */}
      <div 
        className={`hidden lg:block lg:fixed lg:inset-y-0 lg:z-20 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'lg:w-64' : 'lg:w-16'}`}
        onMouseEnter={expandSidebar}
        onMouseLeave={collapseSidebar}
        style={{ 
          overflowY: 'hidden', 
          opacity: isMounted ? 1 : 0, 
          transition: 'all 0.3s ease-in-out',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Sidebar 
          navigation={filteredNavigation} 
          currentPath={location.pathname}
          isExpanded={sidebarExpanded}
        />
      </div>

      {/* Contenido principal */}
      <div 
        className={`transition-all duration-300 ease-in-out ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'}`} 
        style={{ width: 'calc(100% - 32px)', maxWidth: 'calc(100% - 32px)', overflowX: 'hidden', paddingRight: '8px', marginRight: '8px' }}
      >
        {/* Header */}
        <header className="fixed top-0 z-30 bg-secondary-main shadow-lg border-b border-secondary-dark transition-all duration-300" style={{ 
            left: windowWidth >= 1024 ? (sidebarExpanded ? '16rem' : '4rem') : '0', 
            width: windowWidth >= 1024 ? `calc(100% - ${sidebarExpanded ? '16rem' : '4rem'})` : '100%',
            marginLeft: '0'
          }}>
          <div className="px-0 sm:px-2 lg:px-4" style={{ boxSizing: 'border-box' }}>
            <div className="flex justify-between items-center h-14 mx-auto" style={{ maxWidth: '100%' }}>
              {/* Botón de menú móvil */}
              <div className="flex items-center lg:hidden pl-1">
                <IconButton
                  icon={<Menu className="text-white" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir menú"
                  className="text-white hover:bg-secondary-dark"
                />
              </div>

              {/* Logo y título para móvil */}
              <div className="flex items-center lg:hidden">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  <img
                    src="/Countryclub-500x500px logo - icono blanco.png"
                    alt="FireGuardian"
                    className="h-9 w-9"
                  />
                </div>
                <div className="flex items-center h-14">
                  <span className="ml-2 text-lg font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    FireGuardian
                  </span>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="hidden md:flex flex-1 max-w-md mx-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar extintores, ubicaciones..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>

              {/* Acciones del header */}
              <div className="flex items-center space-x-2 pr-1">
                {/* Notificaciones */}
                <IconButton
                  icon={<Bell className="text-white" />}
                  variant="ghost"
                  size="sm"
                  aria-label="Notificaciones"
                  className="text-white hover:bg-secondary-dark"
                />

                {/* Menú de usuario */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-1 py-2 px-1 rounded-lg hover:bg-secondary-dark transition-colors"
                  >
                    <div className="h-8 w-8 bg-primary-main rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.nombre?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-white">
                        {user?.nombre}
                      </p>
                      <p className="text-xs text-white text-opacity-80 capitalize">
                        {user?.rol}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </button>

                  {/* Dropdown del usuario */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        {/* Overlay para cerrar */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={closeUserMenu}
                        />
                        
                        <motion.div
                          className="absolute right-0 mt-2 w-48 bg-bg-paper rounded-lg shadow-lg border border-secondary-dark z-20"
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                navigate('/perfil');
                                closeUserMenu();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-secondary-light"
                            >
                              <User className="h-4 w-4 mr-3 text-primary-main" />
                              Mi Perfil
                            </button>
                            <button
                              onClick={() => {
                                navigate('/configuracion');
                                closeUserMenu();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-secondary-light"
                            >
                              <Settings className="h-4 w-4 mr-3 text-primary-main" />
                              Configuración
                            </button>
                            <hr className="my-1 border-secondary-light" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-primary-dark hover:bg-primary-light hover:bg-opacity-20"
                            >
                              <LogOut className="h-4 w-4 mr-3 text-primary-dark" />
                              Cerrar Sesión
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 bg-[#F5F3E8] transition-all duration-300" style={{ 
            width: '98%', 
            maxWidth: '98%', 
            overflowX: 'hidden', 
            margin: '0 auto', 
            paddingTop: '56px' // Altura del header
          }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            id="main-content"
            className="px-1 sm:px-2 md:px-3 lg:px-4 py-4 sm:py-6 md:py-8 transition-all duration-300"
            style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}
          >
            <div className="bg-[#F9F7F0] rounded-xl shadow-md p-3 sm:p-4 md:p-4 border border-secondary-light mx-auto" style={{ width: '99%', maxWidth: '99%', overflowX: 'hidden', boxSizing: 'border-box', margin: '0 auto' }}>
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

// Componente Sidebar
interface SidebarProps {
  navigation: typeof navigationItems;
  currentPath: string;
  onItemClick?: () => void;
  isExpanded?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ navigation, currentPath, onItemClick, isExpanded = true }) => {
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
    onItemClick?.();
  };

  return (
    <div className="flex flex-col h-full bg-secondary-main overflow-hidden relative shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-14 border-b border-secondary-dark transition-all duration-300">
        <div className="flex-shrink-0 flex items-center justify-center" style={{ marginLeft: '4px' }}>
          <img
            src="/Countryclub-500x500px logo - icono blanco.png"
            alt="FireGuardian"
            className={`transition-all duration-300 ${isExpanded ? 'h-10 w-10' : 'h-8 w-8'}`}
          />
        </div>
        <div 
          className="flex items-center overflow-hidden transition-all duration-300"
          style={{
            maxWidth: isExpanded ? '200px' : '0',
            opacity: isExpanded ? 1 : 0,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <span 
            className="ml-2 text-base font-bold text-white whitespace-nowrap" 
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
          >
            FireGuardian
          </span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-hidden bg-[#F9F7F0] transition-all duration-300">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          
          return (
            <motion.button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                'w-full flex items-center justify-center px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-light text-primary-dark shadow-md'
                  : 'text-text-primary hover:bg-secondary-light hover:text-secondary-dark'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={item.name}
              style={{ height: isExpanded ? 'auto' : '40px' }}
            >
              <Icon className={cn(
                isExpanded ? 'h-5 w-5 mr-3' : 'h-5 w-5',
                isActive ? 'text-primary-dark' : 'text-secondary-dark'
              )} />
              {isExpanded && (
                <div className="text-left overflow-hidden whitespace-nowrap flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {item.description}
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="bg-secondary-main py-2 transition-all duration-300">
        {isExpanded ? (
          <div className="px-3 py-2 text-xs text-white text-center">
            <p className="font-medium">FireGuardian v1.0.0</p>
            <p className="mt-1 opacity-80">© 2024 YCC Extintores</p>
          </div>
        ) : (
          <div className="py-2 flex justify-center">
            <motion.div 
              className="w-6 h-6 flex items-center justify-center text-white opacity-80"
              whileHover={{ scale: 1.2 }}
              transition={{ duration: 0.2 }}
            >
              <Shield size={14} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
