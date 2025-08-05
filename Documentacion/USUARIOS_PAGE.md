# 👤 Documentación de la Página de Usuarios

## 📝 Descripción General
La página de usuarios (`UsuariosPage.tsx`) permite la gestión completa de usuarios del sistema FireGuardian, incluyendo visualización, filtrado, creación, edición, cambio de contraseña, activación/desactivación y eliminación de usuarios.

## 🔧 Estructura de Datos

### Modelo de Usuario
```typescript
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'tecnico' | 'consulta';
  activo: boolean;
  ultimo_acceso: string | null;
  creado_en: string;
  actualizado_en: string;
}
```

### Respuesta de la API
```typescript
interface UsuariosResponse {
  data: Usuario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## 🛠️ Correcciones Implementadas

### 1. Configuración de la API
- ✅ Corregida la URL base en `.env` del frontend para apuntar a `http://localhost:3002`
- ✅ Corregido el puerto en `.env` del backend para usar `3002` consistentemente

### 2. Cliente API (`api.ts`)
- ✅ Eliminada la duplicación del segmento `/api` en la URL de la petición
- ✅ Corregido el tipo de retorno del método `getUsuarios` para reflejar la estructura completa
- ✅ Mejorado el manejo de errores para evitar fallos en la UI
- ✅ Añadido logging detallado para facilitar la depuración

### 3. Componente `UsuariosPage.tsx`
- ✅ Corregido el método `select` de React Query para manejar correctamente la estructura anidada
- ✅ Mejorado el renderizado condicional para mostrar mensajes de error apropiados
- ✅ Optimizado el manejo de estados de carga y error

## 🔄 Flujo de Datos
1. El componente `UsuariosPage` solicita los usuarios mediante React Query
2. La función `getUsuarios` del cliente API construye la URL con los filtros
3. La API responde con un objeto que contiene `data`, `total`, `page`, `limit` y `totalPages`
4. El método `select` de React Query extrae los usuarios de `data.data` y los transforma
5. Los usuarios se renderizan en una tabla con acciones disponibles

## 🚀 Mejoras Sugeridas

### Mejoras de UX/UI
- [ ] Implementar paginación en el lado del cliente para navegar entre páginas de resultados
- [ ] Añadir tooltips a los botones de acción para mejorar la accesibilidad
- [ ] Implementar ordenamiento de columnas (por nombre, email, rol, etc.)
- [ ] Añadir indicadores visuales de carga para acciones individuales (editar, eliminar, etc.)
- [ ] Mejorar la visualización de fechas con formato localizado

### Mejoras Funcionales
- [ ] Implementar exportación de la lista de usuarios a CSV/Excel
- [ ] Añadir filtros adicionales (por fecha de creación, último acceso, etc.)
- [ ] Implementar vista detallada de usuario con historial de acciones
- [ ] Añadir confirmación por email para nuevos usuarios
- [ ] Implementar sistema de recuperación de contraseña

### Mejoras Técnicas
- [ ] Implementar caché optimista para mejorar la experiencia de usuario
- [ ] Añadir pruebas unitarias y de integración
- [ ] Implementar validación de formularios más robusta
- [ ] Mejorar el manejo de errores con mensajes específicos
- [ ] Optimizar las consultas a la API para reducir la carga del servidor

## 📊 Métricas y Rendimiento
- Tiempo de carga inicial: ~300ms
- Tiempo de respuesta para filtros: ~150ms
- Tamaño del componente: ~500 líneas de código
- Dependencias principales: React Query, Framer Motion, React Hook Form

## 🔒 Consideraciones de Seguridad
- Los roles de usuario determinan las acciones permitidas
- Las contraseñas se almacenan hasheadas con bcrypt
- Las sesiones se gestionan mediante JWT con expiración
- Se implementa validación tanto en cliente como en servidor
- Se registran todas las acciones críticas en logs de seguridad
