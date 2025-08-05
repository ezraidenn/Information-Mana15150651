# 📋 Documentación del Formulario de Extintores

## 🔄 Selección en Cascada de Sede y Ubicación

### Descripción
El formulario de creación y edición de extintores implementa un sistema de selección en cascada para la sede y ubicación, mejorando la experiencia de usuario y previniendo errores de asignación incorrecta.

### Funcionamiento
1. **Selección de Sede**:
   - El usuario debe seleccionar primero una sede de la lista desplegable
   - Este campo es obligatorio y siempre está habilitado
   - Al cambiar de sede, se resetea la ubicación seleccionada

2. **Selección de Ubicación**:
   - El campo de ubicación permanece deshabilitado (en gris) hasta que se seleccione una sede
   - Una vez seleccionada la sede, se muestran únicamente las ubicaciones pertenecientes a esa sede
   - El usuario debe seleccionar una ubicación específica dentro de la sede elegida

3. **Edición de Extintor**:
   - Al editar un extintor existente, el sistema automáticamente:
     - Identifica la sede correspondiente a la ubicación del extintor
     - Preselecciona la sede correcta
     - Filtra y muestra solo las ubicaciones de esa sede
     - Preselecciona la ubicación actual del extintor

### Implementación Técnica

#### Estados
```typescript
// Estado para la sede seleccionada
const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);

// Filtrar ubicaciones por sede seleccionada
const filteredUbicaciones = selectedSedeId
  ? ubicaciones.filter((ubicacion: any) => {
      const sedeId = ubicacion.sede_id || (ubicacion.sede && ubicacion.sede.id);
      return sedeId === selectedSedeId;
    })
  : [];
```

#### Formulario
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Sede
  </label>
  <select
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
    value={selectedSedeId || ''}
    onChange={(e) => {
      const newSedeId = e.target.value ? parseInt(e.target.value) : null;
      setSelectedSedeId(newSedeId);
      // Resetear la ubicación cuando cambia la sede
      setFormData({...formData, ubicacion_id: 0});
    }}
    required
  >
    <option value="">Seleccionar sede</option>
    {sedes.map((sede: any) => (
      <option key={sede.id} value={sede.id}>
        {sede.nombre}
      </option>
    ))}
  </select>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Ubicación
  </label>
  <select
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
    value={formData.ubicacion_id}
    onChange={(e) => setFormData({...formData, ubicacion_id: parseInt(e.target.value)})}
    disabled={!selectedSedeId}
    required
  >
    <option value={0}>Seleccionar ubicación</option>
    {filteredUbicaciones.map((ubicacion: any) => (
      <option key={ubicacion.id} value={ubicacion.id}>
        {ubicacion.nombre_area || ubicacion.nombre}
      </option>
    ))}
  </select>
</div>
```

#### Manejo de Edición
```typescript
// Función para manejar la edición de un extintor
const handleEdit = (extintor: Extintor) => {
  setCurrentExtintor(extintor);
  
  // Obtener la sede_id de la ubicación
  const ubicacion = ubicaciones.find(u => u.id === extintor.ubicacion_id);
  const sedeId = ubicacion?.sede_id || (ubicacion?.sede && ubicacion.sede.id) || null;
  
  // Establecer la sede seleccionada
  setSelectedSedeId(sedeId);
  
  setFormData({
    codigo: extintor.codigo,
    tipo_id: extintor.tipo_id,
    ubicacion_id: extintor.ubicacion_id,
    capacidad: extintor.capacidad || '',
    fecha_vencimiento: extintor.fecha_vencimiento,
    fecha_recarga: extintor.fecha_recarga || '',
    observaciones: extintor.observaciones || ''
  });
  setIsEditing(true);
  setShowForm(true);
};
```

### Ventajas
- ✅ Mejora la experiencia de usuario con una interfaz intuitiva
- ✅ Previene errores de asignación de ubicaciones a sedes incorrectas
- ✅ Simplifica el proceso de selección al mostrar solo opciones relevantes
- ✅ Facilita la edición de extintores existentes con preselección automática
- ✅ Implementa las mejores prácticas de UX para formularios jerárquicos

### Consideraciones Futuras
- Implementar búsqueda en los selectores para sedes/ubicaciones con muchos registros
- Añadir la posibilidad de crear nuevas ubicaciones directamente desde el formulario
- Mejorar la visualización con íconos o colores para identificar mejor las sedes

---

*Documentación actualizada el 4 de agosto de 2025*
