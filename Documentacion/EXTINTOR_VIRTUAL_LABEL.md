# Documentación del Componente ExtintorVirtualLabel

<div style="text-align: right">
Versión 1.1<br>
Fecha: 4 de agosto de 2025<br>
YCC Extintores
</div>

---

## Índice

1. [Descripción General](#descripción-general)
2. [Estructura de Datos](#estructura-de-datos)
3. [Sistema de Tooltips](#sistema-de-tooltips)
4. [Clases de Fuego](#clases-de-fuego)
5. [Estilos Responsivos](#estilos-responsivos)
6. [Mejoras Recientes](#mejoras-recientes)
7. [Uso del Componente](#uso-del-componente)
8. [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)
9. [Próximas Mejoras](#próximas-mejoras-sugeridas)

---

## Descripción General

`ExtintorVirtualLabel` es un componente React que muestra una etiqueta virtual realista para un tipo de extintor basada en las normativas mexicanas (NOM-154-SCFI-2005 y NOM-002-STPS-2010). El componente visualiza información clave sobre el extintor, incluyendo:

- Tipo de extintor
- Clases de fuego aplicables (A, B, C, D, K)
- Fechas de recarga y vencimiento
- Información detallada sobre cada clase de fuego mediante tooltips interactivos

Este componente forma parte del sistema de visualización de extintores en la aplicación FireGuardian, permitiendo a los usuarios identificar rápidamente las características de cada extintor sin necesidad de consultar documentación adicional.

## Estructura de Datos

### Props

```typescript
export interface ExtintorVirtualLabelProps {
  tipo: TipoExtintor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fechaRecarga?: string; // Fecha de última recarga
  fechaVencimiento?: string; // Fecha de vencimiento
  // Props obsoletas mantenidas por compatibilidad
  showDetails?: boolean; // @deprecated
  showLogo?: boolean; // @deprecated
  codigoQR?: string; // @deprecated
}
```

### Estado Interno

```typescript
// Estado para controlar qué tooltip se muestra
const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
const [tooltipPosition, setTooltipPosition] = useState<{ 
  top: number; 
  left: number; 
  position?: 'above' | 'right' | 'below' 
}>({ top: 0, left: 0 });
const [tooltipMode, setTooltipMode] = useState<'hover' | 'click'>('hover');
```

## Sistema de Tooltips

El componente implementa un sistema de tooltips avanzado con las siguientes características:

### Modos de Tooltip

- **Modo Hover**: El tooltip se muestra al pasar el cursor sobre un icono y se oculta cuando el cursor sale del área del icono o del tooltip después de un breve retraso (500ms).
- **Modo Click**: El tooltip se muestra al hacer clic en un icono y permanece visible hasta que el usuario hace clic en el botón de cierre, en el tooltip mismo, o en cualquier área fuera del tooltip.

### Posicionamiento Inteligente

El tooltip se posiciona automáticamente según el espacio disponible en la ventana:
- **Arriba**: Si hay suficiente espacio arriba del icono
- **Abajo**: Si hay suficiente espacio debajo del icono (posición predeterminada)
- **Derecha**: Si hay más espacio horizontal que vertical

### Renderizado con Portal

El tooltip se renderiza mediante un portal de React directamente en el `document.body` para evitar problemas de recorte (clipping) causados por contenedores con `overflow: hidden`.

### Gestión de Eventos

- **onMouseEnter (icono)**: Muestra el tooltip en modo hover si no hay otro tooltip en modo click
- **onMouseLeave (icono)**: Inicia un temporizador para ocultar el tooltip después de 500ms si está en modo hover
- **onClick (icono)**: Alterna entre mostrar/ocultar el tooltip en modo click
- **onMouseEnter (tooltip)**: Cancela cualquier temporizador para evitar que el tooltip desaparezca
- **onMouseLeave (tooltip)**: Inicia un temporizador para ocultar el tooltip después de 500ms si está en modo hover
- **onClick (botón de cierre)**: Cierra el tooltip independientemente del modo

### Tolerancia y UX

- Se implementa un retraso de 500ms antes de ocultar el tooltip para permitir que el usuario mueva el cursor desde el icono hasta el tooltip sin que este desaparezca.
- El tooltip tiene un botón de cierre explícito para mejorar la usabilidad.
- Se aplican efectos visuales (bordes y sombras diferentes) para distinguir entre los modos hover y click.

## Clases de Fuego

El componente muestra iconos para las clases de fuego aplicables según el tipo de extintor:

- **Clase A**: Fuegos de materiales combustibles sólidos (madera, papel, tela)
- **Clase B**: Fuegos de líquidos y gases inflamables
- **Clase C**: Fuegos de equipos eléctricos energizados
- **Clase D**: Fuegos de metales combustibles
- **Clase K**: Fuegos de aceites y grasas de cocina

La determinación de las clases de fuego se realiza según el agente extintor del tipo de extintor.

## Estilos Responsivos

El componente se adapta a diferentes tamaños mediante las props `size` y `className`:

- **Tamaños predefinidos**: 'sm', 'md', 'lg', 'xl'
- **Clases personalizadas**: Se pueden pasar mediante la prop `className`

## Mejoras Recientes

### Corrección del Comportamiento de Tooltips

Se ha mejorado significativamente la estabilidad y consistencia del sistema de tooltips:

1. **Sistema de Modos**: Reemplazo del estado booleano `tooltipLocked` por un estado `tooltipMode` con valores 'hover' | 'click'.
2. **Gestión de Eventos**: Mejora en los manejadores de eventos para evitar que los tooltips desaparezcan prematuramente.
3. **Consistencia Visual**: Los tooltips ahora tienen un comportamiento coherente al pasar entre diferentes iconos.
4. **Tiempo de Espera**: Se aumentó el tiempo de espera para ocultar los tooltips de 300ms a 500ms para mejorar la experiencia de usuario.
5. **Cancelación de Timeouts**: Implementación de lógica para cancelar timeouts existentes al entrar en nuevos elementos.

### Correcciones de TypeScript

- Tipado correcto para eventos de mouse: `React.MouseEvent<HTMLDivElement>`
- Eliminación de parámetros no utilizados en los manejadores de eventos
- Corrección de la estructura JSX para evitar errores de sintaxis

## Uso del Componente

```tsx
import ExtintorVirtualLabel from '../components/extintores/ExtintorVirtualLabel';

// Ejemplo de uso
const MiComponente = () => {
  const tipoExtintor = {
    id: 1,
    nombre: 'Extintor de Polvo Químico Seco',
    agente_extintor: 'polvo químico seco',
    color_hex: '#FF0000',
    // otros campos...
  };
  
  return (
    <ExtintorVirtualLabel 
      tipo={tipoExtintor}
      size="md"
      fechaRecarga="2025-01-15"
      fechaVencimiento="2026-01-15"
      className="my-4"
    />
  );
};
```

## Consideraciones de Rendimiento

- El componente utiliza `useCallback` para memoizar funciones y evitar renderizados innecesarios.
- Los timeouts se limpian adecuadamente para evitar fugas de memoria.
- El uso de portales para los tooltips mejora el rendimiento visual al evitar problemas de z-index y recorte.

## Próximas Mejoras Sugeridas

1. Implementar animaciones suaves para la aparición y desaparición de tooltips
2. Añadir soporte para temas oscuros/claros
3. Mejorar la accesibilidad (ARIA roles, navegación por teclado)
4. Optimizar el rendimiento para múltiples instancias del componente
5. Añadir pruebas unitarias y de integración
6. Integración con el sistema global de tooltips implementado en la aplicación

---

<div style="text-align: center; margin-top: 50px; color: #666;">
<p>© 2025 YCC Extintores - FireGuardian</p>
<p>Documento confidencial para uso interno</p>
</div>
