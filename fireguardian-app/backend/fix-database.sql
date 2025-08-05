-- Script SQL para corregir la base de datos FireGuardian
-- Versión: 1.0 - 04/08/2025

-- 1. Limpiar tipos de extintores existentes
DELETE FROM tipos_extintores;

-- 2. Insertar tipos de extintores con clases de fuego e iconos correctos
INSERT INTO tipos_extintores (id, nombre, descripcion, uso_recomendado, color_hex, clase_fuego, icono_path, agente_extintor, creado_en, actualizado_en)
VALUES 
('ABC', 'Polvo Químico Seco ABC', 'Extintor multipropósito para fuegos clase A, B y C', 'Áreas generales, oficinas, almacenes', '#FF5733', 'A,B,C', '/assets/icons/extintores/clases/class-A.png,/assets/icons/extintores/clases/class-B.png,/assets/icons/extintores/clases/class-C.png', 'Polvo Químico Seco', datetime('now'), datetime('now')),
('CO2', 'Dióxido de Carbono', 'Extintor para fuegos clase B y C, ideal para equipos eléctricos', 'Salas de servidores, laboratorios, áreas con equipos electrónicos', '#3366FF', 'B,C', '/assets/icons/extintores/clases/class-B.png,/assets/icons/extintores/clases/class-C.png', 'Dióxido de Carbono (CO₂)', datetime('now'), datetime('now')),
('H2O', 'Agua a Presión', 'Extintor para fuegos clase A', 'Áreas con materiales sólidos combustibles', '#33FF57', 'A', '/assets/icons/extintores/clases/class-A.png', 'Agua', datetime('now'), datetime('now')),
('K', 'Clase K', 'Extintor para fuegos de aceites y grasas de cocina', 'Cocinas comerciales, restaurantes', '#FFFF33', 'K', '/assets/icons/extintores/clases/class-K.png', 'Acetato de Potasio', datetime('now'), datetime('now')),
('AFFF', 'Espuma AFFF', 'Extintor de espuma formadora de película acuosa', 'Áreas con líquidos inflamables', '#33FFFF', 'A,B', '/assets/icons/extintores/clases/class-A.png,/assets/icons/extintores/clases/class-B.png', 'Espuma AFFF', datetime('now'), datetime('now')),
('D', 'Polvo para Metales', 'Extintor para fuegos de metales combustibles', 'Laboratorios, áreas de trabajo con metales', '#F59E0B', 'D', '/assets/icons/extintores/clases/class-D.png', 'Polvo Especial para Metales', datetime('now'), datetime('now'));

-- 3. Verificar y corregir usuarios base
-- Primero verificamos si existen los usuarios base
INSERT OR IGNORE INTO usuarios (nombre, email, password, rol, activo, creado_en, actualizado_en)
VALUES 
('Administrador', 'admin@fireguardian.com', '$2b$10$XFE0UENoBOUJhwOXwdQUO.bW.ENMQHxd9yb6tNHXLzQfUdA0JzGjS', 'admin', 1, datetime('now'), datetime('now')),
('Técnico', 'tecnico@fireguardian.com', '$2b$10$XFE0UENoBOUJhwOXwdQUO.bW.ENMQHxd9yb6tNHXLzQfUdA0JzGjS', 'tecnico', 1, datetime('now'), datetime('now')),
('Consulta', 'consulta@fireguardian.com', '$2b$10$XFE0UENoBOUJhwOXwdQUO.bW.ENMQHxd9yb6tNHXLzQfUdA0JzGjS', 'consulta', 1, datetime('now'), datetime('now'));

-- 4. Corregir estados de extintores según fechas de vencimiento
UPDATE extintores
SET estado = CASE
  WHEN date(fecha_vencimiento) < date('now') THEN 'VENCIDO'
  WHEN date(fecha_vencimiento) > date('now', '+30 days') THEN 'ACTIVO'
  ELSE 'MANTENIMIENTO'
END
WHERE estado IS NULL OR estado = '';

-- 5. Asegurar que todos los extintores tengan un estado válido
UPDATE extintores
SET estado = 'ACTIVO'
WHERE estado IS NULL OR estado = '';

-- 6. Asegurar que todos los extintores tengan una capacidad
UPDATE extintores
SET capacidad = '6 kg'
WHERE capacidad IS NULL OR capacidad = '';
