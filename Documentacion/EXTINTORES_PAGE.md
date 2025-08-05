# 🧯 Documentación de ExtintoresPage

## 📝 Descripción General
La página de Extintores (`ExtintoresPage.tsx`) permite la gestión completa del inventario de extintores, incluyendo operaciones CRUD (Crear, Leer, Actualizar, Eliminar), filtrado, y visualización de datos.

## 🔄 Estructura de Datos

### Modelo Extintor
```typescript
interface Extintor {
  id: number;
  codigo: string;
  tipo_id: number | string;
  tipo?: {
    id: number;
    nombre: string;
    capacidad?: string;
  };
  ubicacion_id: number;
  ubicacion?: string | {
    id: number;
    nombre: string;
    sede_id?: number;
    sede?: {
      id: number;
      nombre: string;
    };
  };
  sede?: string | {
    id: number;
    nombre: string;
  };
  capacidad?: string;
  fecha_vencimiento: string;
  fecha_recarga?: string;
  estado?: string;
  observaciones?: string;
  creado_en?: string;
  actualizado_en?: string;
}
```

### Formulario de Extintor
```typescript
interface ExtintorFormData {
  codigo: string;
  tipo_id: string;
  ubicacion_id: number;
  capacidad: string;
  fecha_vencimiento: string;
  fecha_recarga: string;
  observaciones: string;
}
```

### Filtros de Extintor
```typescript
interface ExtintorFilters {
  search: string;
  tipo_id?: string | number;
  ubicacion_id?: number;
  estado?: string;
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}
```

### Respuesta Paginada
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## 🌐 Rutas de API Utilizadas

| Método | Ruta | Descripción | Parámetros |
|--------|------|-------------|------------|
| GET | `/api/extintores` | Obtener lista de extintores | `search`, `tipo_id`, `ubicacion_id`, `estado`, `page`, `limit`, `sort`, `order` |
| GET | `/api/tipos-extintores` | Obtener lista de tipos de extintores | - |
| GET | `/api/ubicaciones` | Obtener lista de ubicaciones | - |
| POST | `/api/extintores` | Crear nuevo extintor | Datos del formulario |
| PUT | `/api/extintores/:id` | Actualizar extintor existente | `id` + Datos del formulario |
| DELETE | `/api/extintores/:id` | Eliminar extintor | `id` |

## 🧩 Componentes Utilizados
- `Button`: Para acciones principales
- `Input`: Para campos de formulario
- `Card`, `CardHeader`, `CardContent`: Para contenedores de información
- `LoadingSpinner`: Para indicadores de carga
- Iconos de `lucide-react`: Para mejorar la UX

## 🔄 Flujo de Datos
1. El componente `ExtintoresPage` solicita los extintores mediante React Query
2. La función `getExtintores` del cliente API construye la URL con los filtros
3. La API responde con un objeto que contiene `data`, `total`, `page`, `limit` y `totalPages`
4. Los extintores se renderizan en tarjetas con acciones disponibles
5. Para crear o editar, se abre un modal con formulario que envía los datos a la API

## ⚠️ Problemas Identificados
1. ✅ **~~Falta de datos de tipos de extintores~~**: ~~La ruta `/api/tipos-extintores` responde con 404~~ - **RESUELTO**: Se ha implementado el controlador y rutas API completas para tipos de extintores
2. **Falta de datos de ubicaciones**: No hay implementación para gestionar ubicaciones (las rutas API existen pero falta la interfaz de usuario)
3. **Inconsistencia en tipos**: Algunos campos como `tipo_id` tienen inconsistencias entre string y number

## 🚀 Próximos Pasos

### Implementaciones Pendientes
1. **Crear página de gestión de tipos de extintores**:
   - Implementar `TiposExtintoresPage.tsx` para CRUD de tipos
   - ✅ Implementar API `/api/tipos-extintores` en el backend - **COMPLETADO**

2. **Crear página de gestión de ubicaciones**:
   - Implementar `UbicacionesPage.tsx` para CRUD de ubicaciones y sedes
   - Asegurar que la API `/api/ubicaciones` esté implementada en el backend

3. **Corregir inconsistencias de tipos**:
   - Estandarizar el tipo de `tipo_id` (preferiblemente como string)
   - Mejorar el tipado de objetos anidados como `ubicacion` y `sede`

### Mejoras Sugeridas

#### Mejoras de UX/UI
- [ ] Implementar paginación en el lado del cliente para navegar entre páginas de resultados
- [ ] Añadir tooltips a los botones de acción para mejorar la accesibilidad
- [ ] Implementar ordenamiento por columnas (por código, tipo, ubicación, etc.)
- [ ] Mejorar la visualización de fechas con formato localizado
- [ ] Añadir indicadores visuales para estados de extintores (vencido, por vencer, activo)

#### Mejoras Funcionales
- [ ] Implementar exportación de la lista de extintores a CSV/Excel
- [ ] Añadir filtros adicionales (por fecha de vencimiento, recarga, etc.)
- [ ] Implementar generación de códigos QR para extintores
- [ ] Añadir historial de mantenimientos por extintor
- [ ] Implementar sistema de alertas para extintores por vencer

#### Mejoras Técnicas
- [ ] Implementar caché optimista para mejorar la experiencia de usuario
- [ ] Añadir pruebas unitarias y de integración
- [ ] Implementar validación de formularios más robusta
- [ ] Mejorar el manejo de errores con mensajes específicos
- [ ] Optimizar consultas para reducir carga en el servidor
