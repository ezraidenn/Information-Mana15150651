import { AppDataSource } from '../database/config';
import { TipoExtintor } from '../models/TipoExtintor';

/**
 * Script para actualizar los tipos de extintores según la información de la imagen
 * Basado en la tabla de compatibilidad de agentes extintores con clases de fuego
 */
async function actualizarTiposExtintores() {
  try {
    console.log('Iniciando actualización de tipos de extintores...');
    
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');
    
    const tipoExtintorRepo = AppDataSource.getRepository(TipoExtintor);
    
    // 1. Eliminar todos los tipos de extintores existentes
    console.log('Eliminando tipos de extintores existentes...');
    const tiposExistentes = await tipoExtintorRepo.find();
    
    if (tiposExistentes.length > 0) {
      await tipoExtintorRepo.remove(tiposExistentes);
      console.log(`Se eliminaron ${tiposExistentes.length} tipos de extintores existentes`);
    } else {
      console.log('No hay tipos de extintores existentes para eliminar');
    }
    
    // 2. Crear los nuevos tipos de extintores según la información de la imagen
    console.log('Creando nuevos tipos de extintores...');
    
    const nuevosTipos = [
      {
        id: 'agua',
        nombre: 'Agua',
        descripcion: 'Extintor de agua',
        uso_recomendado: 'Ideal para fuegos de clase A (materiales sólidos)',
        color_hex: '#0066CC', // Azul
        clase_fuego: ['A'],
        icono_path: '/assets/icons/extintores/agua.png'
      },
      {
        id: 'agua_presion',
        nombre: 'Agua a presión',
        descripcion: 'Extintor de agua a presión',
        uso_recomendado: 'Ideal para fuegos de clase A (materiales sólidos)',
        color_hex: '#0099FF', // Azul claro
        clase_fuego: ['A'],
        icono_path: '/assets/icons/extintores/agua-presion.png'
      },
      {
        id: 'espuma',
        nombre: 'Espuma química',
        descripcion: 'Extintor de espuma química',
        uso_recomendado: 'Ideal para fuegos de clase A y B (sólidos y líquidos inflamables)',
        color_hex: '#66CCFF', // Azul muy claro
        clase_fuego: ['A', 'B'],
        icono_path: '/assets/icons/extintores/espuma.png'
      },
      {
        id: 'polvo_seco',
        nombre: 'Polvo seco',
        descripcion: 'Extintor de polvo químico seco',
        uso_recomendado: 'Multipropósito para fuegos de clase A, B y C',
        color_hex: '#FFCC00', // Amarillo
        clase_fuego: ['A', 'B', 'C'],
        icono_path: '/assets/icons/extintores/polvo-seco.png'
      },
      {
        id: 'co2',
        nombre: 'CO2',
        descripcion: 'Extintor de dióxido de carbono',
        uso_recomendado: 'Ideal para fuegos de clase B y C (líquidos inflamables y eléctricos)',
        color_hex: '#333333', // Negro
        clase_fuego: ['B', 'C'],
        icono_path: '/assets/icons/extintores/co2.png'
      },
      {
        id: 'haloclean',
        nombre: 'Haloclean',
        descripcion: 'Extintor de reemplazo de halón',
        uso_recomendado: 'Multipropósito para fuegos de clase A, B y C',
        color_hex: '#009966', // Verde
        clase_fuego: ['A', 'B', 'C'],
        icono_path: '/assets/icons/extintores/halon.png'
      },
      {
        id: 'acetato_potasio',
        nombre: 'Acetato de potasio',
        descripcion: 'Extintor de acetato de potasio',
        uso_recomendado: 'Específico para fuegos de clase K (aceites y grasas de cocina)',
        color_hex: '#FF6600', // Naranja
        clase_fuego: ['K'],
        icono_path: '/assets/icons/extintores/clase-k.png'
      },
      {
        id: 'polvo_d',
        nombre: 'Polvo D',
        descripcion: 'Extintor de polvo para metales',
        uso_recomendado: 'Específico para fuegos de clase D (metales combustibles)',
        color_hex: '#FFFF00', // Amarillo brillante
        clase_fuego: ['D'],
        icono_path: '/assets/icons/extintores/polvo-d.png'
      }
    ];
    
    for (const tipo of nuevosTipos) {
      await tipoExtintorRepo.save(tipoExtintorRepo.create(tipo));
      console.log(`Tipo de extintor creado: ${tipo.nombre} (${tipo.id}) - Clases de fuego: ${tipo.clase_fuego.join(', ')}`);
    }
    
    console.log(`Se crearon ${nuevosTipos.length} nuevos tipos de extintores`);
    console.log('Actualización completada con éxito');
    
  } catch (error) {
    console.error('Error al actualizar tipos de extintores:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexión a la base de datos cerrada');
    }
  }
}

// Ejecutar la función
actualizarTiposExtintores();
