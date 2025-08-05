# FireGuardian Frontend

Frontend de la aplicación FireGuardian desarrollado con React, TypeScript y Tailwind CSS.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI con Hooks y Context API
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Build tool y dev server ultrarrápido
- **Tailwind CSS** - Framework de CSS utilitario
- **Framer Motion** - Biblioteca de animaciones
- **React Query** - Manejo de estado del servidor
- **React Router** - Enrutamiento del lado del cliente
- **React Hook Form** - Manejo de formularios
- **Lucide React** - Iconos SVG
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (Button, Input, etc.)
│   └── layout/         # Componentes de layout
├── pages/              # Páginas de la aplicación
├── hooks/              # Custom hooks
├── utils/              # Utilidades y helpers
├── providers/          # Proveedores de contexto
├── types/              # Definiciones de TypeScript
└── styles/             # Estilos globales
```

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` con la configuración apropiada.

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:5173
   ```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta ESLint
- `npm run type-check` - Verifica tipos de TypeScript

## 🎨 Componentes UI

### Componentes Base
- **Button** - Botón con múltiples variantes y estados
- **Input** - Campo de entrada con validación
- **Card** - Contenedor de contenido
- **LoadingSpinner** - Indicadores de carga
- **ErrorBoundary** - Manejo de errores

### Layout
- **AppLayout** - Layout principal con sidebar y header
- **ProtectedRoute** - Protección de rutas por roles

## 🔐 Autenticación

El sistema utiliza JWT para autenticación:

```typescript
// Hook de autenticación
const { user, login, logout, isAuthenticated } = useAuth();

// Protección de rutas
<ProtectedRoute requiredRoles={['admin', 'tecnico']}>
  <ComponenteProtegido />
</ProtectedRoute>
```

## 📊 Manejo de Estado

### React Query para Estado del Servidor
```typescript
// Query de datos
const { data, isLoading, error } = useQuery({
  queryKey: ['extintores'],
  queryFn: () => apiClient.getExtintores(),
});

// Mutación
const mutation = useMutation({
  mutationFn: apiClient.createExtintor,
  onSuccess: () => {
    queryClient.invalidateQueries(['extintores']);
  },
});
```

### Context API para Estado Global
```typescript
// Contexto de autenticación
const AuthContext = createContext<AuthContextType>();

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

## 🎭 Animaciones

Utilizamos Framer Motion para animaciones suaves:

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Contenido animado
</motion.div>
```

## 🎨 Estilos y Temas

### Tailwind CSS
- Configuración personalizada en `tailwind.config.js`
- Paleta de colores específica para FireGuardian
- Componentes utilitarios personalizados

### Variables CSS Personalizadas
```css
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
}
```

## 🔧 Configuración

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=FireGuardian
VITE_DEBUG=false
```

### Configuración de Vite
- Proxy para desarrollo
- Alias de paths
- Optimizaciones de build

## 📱 Responsividad

La aplicación está optimizada para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📦 Build y Deployment

### Build de Producción
```bash
npm run build
```

### Análisis del Bundle
```bash
npm run analyze
```

### Preview de Producción
```bash
npm run preview
```

## 🔍 Debugging

### React DevTools
- Instalación automática en desarrollo
- Profiling de componentes
- Inspección de estado

### React Query DevTools
- Panel de debugging para queries
- Visualización de cache
- Métricas de rendimiento

## 📚 Convenciones de Código

### Naming
- Componentes: PascalCase (`UserCard`)
- Hooks: camelCase con prefijo `use` (`useAuth`)
- Archivos: PascalCase para componentes, camelCase para utils

### Estructura de Componentes
```typescript
interface ComponentProps {
  // Props tipadas
}

export const Component: React.FC<ComponentProps> = ({
  prop1,
  prop2,
}) => {
  // Hooks
  // Estados
  // Efectos
  // Handlers
  
  return (
    // JSX
  );
};
```

### Imports
```typescript
// Librerías externas
import React from 'react';
import { motion } from 'framer-motion';

// Imports internos
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ApiResponse } from '@/types';
```

## 🚀 Performance

### Optimizaciones Implementadas
- Lazy loading de rutas
- Code splitting automático
- Memoización de componentes costosos
- Virtualización de listas largas
- Optimización de imágenes

### Métricas Objetivo
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

## 🔒 Seguridad

### Medidas Implementadas
- Validación de inputs
- Sanitización de datos
- Protección XSS
- Headers de seguridad
- Validación de tokens JWT

## 📈 Monitoreo

### Métricas Tracked
- Performance de la aplicación
- Errores de JavaScript
- Uso de funcionalidades
- Tiempo de carga de páginas

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch
3. Commit de cambios
4. Push a la branch
5. Crear Pull Request

## 📄 Licencia

Este proyecto es propiedad de YCC Extintores. Todos los derechos reservados.

---

**Desarrollado con ❤️ para YCC Extintores**
