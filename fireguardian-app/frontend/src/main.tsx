import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Configuración de desarrollo
if (process.env.NODE_ENV === 'development') {
  // Habilitar React DevTools
  if (typeof window !== 'undefined') {
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
      hook.onCommitFiberRoot = (id: any, root: any) => {
        // Log para debugging en desarrollo
        console.log('React render:', id, root);
      };
    }
  }
}

// Configuración de producción
if (process.env.NODE_ENV === 'production') {
  // Deshabilitar console.log en producción
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

// Crear root de React 18
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot Module Replacement (HMR) para desarrollo
if (process.env.NODE_ENV === 'development' && import.meta.hot) {
  import.meta.hot.accept('./App', () => {
    // Re-renderizar cuando App.tsx cambie
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
}

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Manejo de errores globales no capturados
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
  
  // En producción, podrías enviar el error a un servicio de logging
  if (process.env.NODE_ENV === 'production') {
    // Ejemplo: sendErrorToLoggingService(event.error);
  }
});

// Manejo de promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesa rechazada no capturada:', event.reason);
  
  // Prevenir que se muestre el error en la consola del navegador
  event.preventDefault();
  
  // En producción, podrías enviar el error a un servicio de logging
  if (process.env.NODE_ENV === 'production') {
    // Ejemplo: sendErrorToLoggingService(event.reason);
  }
});

// Configuración de variables de entorno para debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 FireGuardian App iniciada en modo desarrollo');
  console.log('📊 Variables de entorno:', {
    NODE_ENV: process.env.NODE_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    BASE_URL: import.meta.env.BASE_URL,
  });
}

// Información de la aplicación
console.log('🔥 FireGuardian - Sistema de Inventario de Extintores');
console.log('📅 Versión:', '1.0.0');
console.log('🏢 Desarrollado para YCC Extintores');

// Exportar para testing
export { root };
