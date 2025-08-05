-- Script para actualizar los tipos de extintores según la tabla de compatibilidad
-- Para ejecutar: sqlite3 fireguardian.db < actualizar-extintores.sql

-- Eliminar todos los tipos de extintores existentes
DELETE FROM tipos_extintores;

-- Insertar los nuevos tipos de extintores con sus clases de fuego aplicables
INSERT INTO tipos_extintores (id, nombre, descripcion, uso_recomendado, color_hex, clase_fuego, icono_path, creado_en, actualizado_en)
VALUES
  ('agua', 'Agua', 'Extintor de agua', 'Ideal para fuegos de clase A (materiales sólidos)', '#0066CC', 'A', '/assets/icons/extintores/agua.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('agua_presion', 'Agua a presión', 'Extintor de agua a presión', 'Ideal para fuegos de clase A (materiales sólidos)', '#0099FF', 'A', '/assets/icons/extintores/agua-presion.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('espuma', 'Espuma química', 'Extintor de espuma química', 'Ideal para fuegos de clase A y B (sólidos y líquidos inflamables)', '#66CCFF', 'A,B', '/assets/icons/extintores/espuma.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('polvo_seco', 'Polvo seco', 'Extintor de polvo químico seco', 'Multipropósito para fuegos de clase A, B, C y D', '#FFCC00', 'A,B,C,D', '/assets/icons/extintores/polvo-seco.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('co2', 'CO2', 'Extintor de dióxido de carbono', 'Ideal para fuegos de clase B y C (líquidos inflamables y eléctricos)', '#333333', 'B,C', '/assets/icons/extintores/co2.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('haloclean', 'Haloclean', 'Extintor de reemplazo de halón', 'Multipropósito para fuegos de clase A, B y C', '#009966', 'A,B,C', '/assets/icons/extintores/halon.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acetato_potasio', 'Acetato de potasio', 'Extintor de acetato de potasio', 'Específico para fuegos de clase K (aceites y grasas de cocina)', '#FF6600', 'K', '/assets/icons/extintores/clase-k.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('polvo_d', 'Polvo D', 'Extintor de polvo para metales', 'Específico para fuegos de clase D (metales combustibles)', '#FFFF00', 'D', '/assets/icons/extintores/polvo-d.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Mostrar los tipos de extintores actualizados
SELECT id, nombre, clase_fuego FROM tipos_extintores;
