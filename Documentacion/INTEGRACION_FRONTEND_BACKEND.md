# 🔄 Integración Frontend-Backend - FireGuardian

*Actualizado: 4 de Agosto, 2025*

## 📌 Resumen de Mejoras en la Integración

Este documento detalla las mejoras implementadas en la integración entre el frontend y el backend de FireGuardian, con enfoque en la consistencia de datos, manejo de errores y optimización de la comunicación.

## 🔑 Sistema de Autenticación

### Problemas Resueltos
Se identificaron y corrigieron inconsistencias en el sistema de autenticación:

1. **Inconsistencia en campos de autenticación**:
   - Frontend usaba `email` en el formulario pero el tipo `LoginCredentials` definía `username`
   - Backend esperaba `email` en el controlador pero el middleware de validación verificaba `username`
   - La función de inicialización de datos creaba usuarios con `username` en lugar de `email`

### Soluciones Implementadas
```typescript
// Frontend: Tipo LoginCredentials corregido
interface LoginCredentials {
  email: string;       // Antes era username
  password: string;
}

// Backend: Middleware de validación actualizado
const validateLogin = [
  check('email').isEmail().withMessage('Debe proporcionar un email válido'),
  check('password').notEmpty().withMessage('La contraseña es requerida'),
  handleValidationErrors
];

// Backend: Inicialización de datos corregida
const defaultUser = new Usuario();
defaultUser.email = 'admin@fireguardian.com';  // Antes era username
defaultUser.password = await bcrypt.hash('admin123', 10);
defaultUser.nombre = 'Administrador';
defaultUser.rol = 'admin';
```

### Mejoras Adicionales
- Se implementaron variables de entorno (.env) en backend y frontend
- Se eliminaron valores hardcodeados de puertos y URLs
- Se añadieron logs detallados al proceso de login para facilitar la depuración

## 📋 Módulo de Usuarios

### Problemas Resueltos
Se identificaron y corrigieron problemas en la página de usuarios:

1. **Error al cargar usuarios** debido a inconsistencias en la estructura de datos esperada:
   - URL de API incorrecta en el archivo `.env` del frontend
   - Puerto incorrecto en el archivo `.env` del backend
   - Duplicación de `/api` en la URL del cliente API
   - Manejo incorrecto de la estructura de respuesta de la API

### Soluciones Implementadas
```typescript
// Frontend: Cliente API corregido
async getUsuarios(filters: UserFilters = {}): Promise<PaginatedResponse<Usuario>> {
  const queryParams = new URLSearchParams();
  
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());
  
  const response = await this.axiosInstance.get(`/usuarios?${queryParams}`);
  return response.data; // Devuelve la estructura completa esperada
}

// Backend: Estructura de respuesta estandarizada
@Get()
async findAll(@Query() query: any): Promise<any> {
  const { page = 1, limit = 10, search = '' } = query;
  
  const [usuarios, total] = await this.usuarioService.findAll({
    page: +page,
    limit: +limit,
    search
  });
  
  return {
    data: usuarios,
    total,
    page: +page,
    limit: +limit,
    totalPages: Math.ceil(total / +limit)
  };
}
```

### Estructura de Respuesta Estandarizada
La API devuelve un objeto con la estructura:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## 🧯 Módulo de Extintores

### Problemas Resueltos
Se identificaron y corrigieron problemas en el manejo de datos de extintores:

1. **Inconsistencia en el campo código/código_interno**:
   - Frontend usaba `codigo` pero el backend esperaba `codigo_interno`
   - No había claridad sobre la relación entre estos campos
   - Posibles pérdidas de datos al actualizar extintores

### Soluciones Implementadas

#### Frontend: Cliente API
```typescript
// Método createExtintor mejorado
async createExtintor(extintor: ExtintorFormData): Promise<any> {
  const formData = new FormData();
  
  // Mapeo explícito de codigo a codigo_interno
  if (extintor.codigo) {
    formData.append('codigo_interno', extintor.codigo);
    console.log('Mapeando codigo a codigo_interno:', extintor.codigo);
  }
  
  // Resto de campos...
  
  // Log para depuración
  console.log('FormData keys:', [...formData.keys()]);
  
  const response = await this.axiosInstance.post('/extintores', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Log de respuesta
  console.log('Respuesta createExtintor:', response.data);
  
  return response.data;
}

// Método updateExtintor mejorado
async updateExtintor(id: number, extintor: ExtintorFormData): Promise<any> {
  const formData = new FormData();
  
  // Mapeo explícito de codigo a codigo_interno
  if (extintor.codigo) {
    formData.append('codigo_interno', extintor.codigo);
    console.log('Mapeando codigo a codigo_interno:', extintor.codigo);
  }
  
  // Resto de campos...
  
  // Log para depuración
  console.log('FormData keys para update:', [...formData.keys()]);
  
  const response = await this.axiosInstance.put(`/extintores/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Log de respuesta
  console.log('Respuesta updateExtintor:', response.data);
  
  return response.data;
}
```

#### Frontend: Formulario de Extintores
```tsx
// Inicialización del formulario
const resetForm = () => {
  setFormData({
    codigo: '', // Este campo se usará como codigo_interno en el backend
    tipo_id: '',
    ubicacion_id: 0,
    capacidad: '',
    fecha_vencimiento: new Date().toISOString().split('T')[0],
    fecha_recarga: '',
    observaciones: '',
    estado: 'ACTIVO' // Estado por defecto
  });
  // Resto del código...
};

// Edición de extintor existente
const handleEdit = (extintor: Extintor) => {
  // Log para depuración
  console.log('Editando extintor:', {
    extintor,
    codigo: extintor.codigo,
    codigo_interno: extintor.codigo_interno
  });
  
  setFormData({
    codigo: extintor.codigo || extintor.codigo_interno || '', // Usar codigo si existe, sino usar codigo_interno
    // Resto de campos...
  });
  // Resto del código...
};

// UI del formulario
<label className="block text-sm font-medium text-gray-700 mb-1">
  Código
  <span className="text-xs text-gray-500 ml-1">(se guardará como código interno)</span>
</label>
<Input
  value={formData.codigo || ''}
  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
  placeholder="EXT-001"
  required
  className="focus:border-red-500 focus:ring-red-500"
/>
```

### Beneficios de las Mejoras
- **Consistencia de datos**: Garantiza que los campos se manejen correctamente entre frontend y backend
- **Claridad para el usuario**: Indica explícitamente cómo se utilizarán los campos
- **Trazabilidad**: Logs detallados para seguir el flujo de datos
- **Robustez**: Manejo adecuado de valores nulos o indefinidos

## 🌐 Configuración de Entorno

### Variables de Entorno Frontend
```
VITE_API_URL=http://localhost:3002/api
```

### Variables de Entorno Backend
```
PORT=3002
JWT_SECRET=fireguardian_secret_key
DB_TYPE=sqlite
DB_NAME=fireguardian.db
```

### Configuración de Axios
```typescript
// Configuración base de Axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## 🔍 Manejo de Errores

### Mejoras Implementadas
1. **Logs detallados** en puntos críticos de la aplicación
2. **Mensajes de error específicos** para diferentes situaciones
3. **Interceptores de Axios** para manejo centralizado de errores
4. **Toast notifications** para informar al usuario sobre errores

### Ejemplo de Implementación
```typescript
// Interceptor para manejo de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en petición API:', error);
    
    // Errores específicos según código HTTP
    if (error.response) {
      switch (error.response.status) {
        case 401:
          toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
          // Redireccionar a login si es necesario
          break;
        case 403:
          toast.error('No tiene permisos para realizar esta acción.');
          break;
        case 404:
          toast.error('El recurso solicitado no existe.');
          break;
        case 500:
          toast.error('Error en el servidor. Contacte al administrador.');
          break;
        default:
          toast.error('Error en la operación. Intente nuevamente.');
      }
    } else {
      toast.error('Error de conexión. Verifique su conexión a internet.');
    }
    
    return Promise.reject(error);
  }
);
```

## 🔜 Próximas Mejoras Recomendadas

1. **Caché optimista**: Implementar React Query para mejorar la experiencia de usuario y reducir peticiones
2. **Validación de formularios**: Utilizar Zod o Yup para validación de datos en el frontend
3. **Tipado estricto**: Mejorar la consistencia de tipos entre frontend y backend
4. **Pruebas de integración**: Implementar pruebas que verifiquen la correcta comunicación entre frontend y backend
5. **Monitoreo de errores**: Implementar un sistema de registro y notificación de errores
6. **Optimización de consultas**: Mejorar el rendimiento de las consultas a la base de datos
7. **Compresión de datos**: Implementar compresión para reducir el tamaño de las respuestas API
