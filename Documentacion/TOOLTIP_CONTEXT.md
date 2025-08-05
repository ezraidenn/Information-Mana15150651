# 🛈 Sistema de Tooltips - FireGuardian

*Actualizado: 4 de Agosto, 2025*

## 📌 Resumen del Sistema de Tooltips

Este documento detalla la implementación del sistema de tooltips en FireGuardian, con enfoque en el contexto global que permite controlar qué tooltip está activo en un momento dado.

## 🌐 Contexto Global de Tooltips

### Descripción
Se ha implementado un contexto global (`TooltipContext`) para gestionar el estado de los tooltips en toda la aplicación. Este enfoque permite que solo un tooltip esté expandido a la vez, mejorando la experiencia de usuario y evitando la sobrecarga visual.

### Implementación Técnica

#### TooltipContext.tsx
```tsx
import React, { createContext, useState, useContext } from 'react';

// Definir el tipo para el contexto
interface TooltipContextType {
  activeTooltipId: string | null;
  setActiveTooltipId: (id: string | null) => void;
}

// Crear el contexto con valores por defecto
const TooltipContext = createContext<TooltipContextType>({
  activeTooltipId: null,
  setActiveTooltipId: () => {},
});

// Hook personalizado para usar el contexto
export const useTooltip = () => useContext(TooltipContext);

// Proveedor del contexto
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  return (
    <TooltipContext.Provider value={{ activeTooltipId, setActiveTooltipId }}>
      {children}
    </TooltipContext.Provider>
  );
};
```

#### Integración en App.tsx
```tsx
import { TooltipProvider } from '@/contexts/TooltipContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster position="top-right" />
          <RouterProvider router={router} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## 🔥 Componente ClaseFuegoIcon

### Descripción
El componente `ClaseFuegoIcon` ha sido modificado para utilizar el contexto de tooltips, permitiendo que solo un tooltip de clase de fuego esté expandido a la vez.

### Implementación Técnica

```tsx
import { useTooltip } from '@/contexts/TooltipContext';
import { useEffect, useRef } from 'react';

// Dentro del componente ClaseFuegoIcon
const { activeTooltipId, setActiveTooltipId } = useTooltip();
const tooltipId = `tooltip-${clase}-${id || Math.random().toString(36).substr(2, 9)}`;
const isExpanded = activeTooltipId === tooltipId;
const tooltipRef = useRef<HTMLDivElement>(null);

// Función para alternar el tooltip
const toggleTooltip = () => {
  if (isExpanded) {
    setActiveTooltipId(null);
  } else {
    setActiveTooltipId(tooltipId);
  }
};

// Cerrar el tooltip al hacer clic fuera
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      tooltipRef.current && 
      !tooltipRef.current.contains(event.target as Node) &&
      isExpanded
    ) {
      setActiveTooltipId(null);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isExpanded, setActiveTooltipId]);

// Renderizado del tooltip
<div 
  ref={tooltipRef}
  className={`relative inline-block ${className || ''}`}
>
  {/* Icono */}
  <div 
    onClick={toggleTooltip}
    className="cursor-pointer transition-transform hover:scale-110"
  >
    <img 
      src={claseFuegoInfo[clase].icono} 
      alt={`Clase ${clase}`}
      className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
    />
  </div>
  
  {/* Tooltip */}
  {isExpanded && (
    <div className="absolute z-10 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 mt-2 -left-28">
      {/* Contenido del tooltip */}
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-primary-dark">
          Clase {clase}
        </h3>
        <button 
          onClick={() => setActiveTooltipId(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Resto del contenido... */}
    </div>
  )}
</div>
```

## 🧩 Flujo de Datos

### Diagrama de Flujo
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  TooltipContext │◄────┤ ClaseFuegoIcon  │◄────┤ ExtintoresPage  │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│                 │
│     App.tsx     │
│                 │
└─────────────────┘
```

### Flujo de Interacción
1. El usuario hace clic en un icono de clase de fuego
2. El componente `ClaseFuegoIcon` llama a `setActiveTooltipId` con su ID único
3. El contexto actualiza el `activeTooltipId`
4. Todos los componentes `ClaseFuegoIcon` se re-renderizan
5. Solo el componente con ID coincidente muestra su tooltip expandido
6. Si el usuario hace clic en otro icono, el primer tooltip se cierra automáticamente

## 🎯 Beneficios

1. **Experiencia de usuario mejorada**:
   - Interfaz más limpia con solo un tooltip visible a la vez
   - Menor sobrecarga cognitiva para el usuario
   - Comportamiento predecible y consistente

2. **Mantenibilidad del código**:
   - Lógica de gestión de tooltips centralizada
   - Fácil de extender a otros componentes
   - Separación clara de responsabilidades

3. **Rendimiento**:
   - Menos elementos en el DOM simultáneamente
   - Menor sobrecarga de renderizado
   - Gestión eficiente de eventos

4. **Accesibilidad**:
   - Mejor navegación para usuarios de lectores de pantalla
   - Menor confusión para usuarios con discapacidades cognitivas
   - Experiencia más predecible para todos los usuarios

## 🔄 Extensibilidad

El sistema de tooltips puede extenderse fácilmente a otros componentes de la aplicación siguiendo estos pasos:

1. **Importar el hook**:
   ```tsx
   import { useTooltip } from '@/contexts/TooltipContext';
   ```

2. **Usar el contexto en el componente**:
   ```tsx
   const { activeTooltipId, setActiveTooltipId } = useTooltip();
   ```

3. **Generar un ID único para el tooltip**:
   ```tsx
   const tooltipId = `tooltip-${componentType}-${uniqueId}`;
   ```

4. **Controlar la visibilidad basada en el ID activo**:
   ```tsx
   const isExpanded = activeTooltipId === tooltipId;
   ```

5. **Implementar la lógica de toggle**:
   ```tsx
   const toggleTooltip = () => {
     if (isExpanded) {
       setActiveTooltipId(null);
     } else {
       setActiveTooltipId(tooltipId);
     }
   };
   ```

## 🔜 Próximas Mejoras Recomendadas

1. **Animaciones de transición**: Añadir animaciones suaves para la aparición y desaparición de tooltips
2. **Posicionamiento inteligente**: Detectar los bordes de la pantalla y ajustar la posición del tooltip
3. **Soporte para teclado**: Mejorar la accesibilidad permitiendo navegar entre tooltips con el teclado
4. **Tooltips anidados**: Permitir tooltips dentro de otros tooltips para información jerárquica
5. **Personalización de estilos**: Permitir diferentes estilos de tooltips según el contexto
6. **Tiempo de espera**: Opción para cerrar automáticamente los tooltips después de un tiempo determinado
