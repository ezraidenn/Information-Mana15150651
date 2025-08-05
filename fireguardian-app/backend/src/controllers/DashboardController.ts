import { Response } from 'express';
import { AppDataSource } from '../database/config';
import { Extintor } from '../models/Extintor';
import { TipoExtintor } from '../models/TipoExtintor';
import { Ubicacion } from '../models/Ubicacion';
import { Sede } from '../models/Sede';
import { Mantenimiento } from '../models/Mantenimiento';
import { Usuario } from '../models/Usuario';
import { createApiResponse } from '../utils/helpers';
import { AuthRequest, DashboardStats } from '../types';

export class DashboardController {

  /**
   * Obtener estadísticas principales del dashboard
   */
  static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const extintorRepo = AppDataSource.getRepository(Extintor);
      const tipoRepo = AppDataSource.getRepository(TipoExtintor);
      const ubicacionRepo = AppDataSource.getRepository(Ubicacion);
      const sedeRepo = AppDataSource.getRepository(Sede);
      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);

      // Obtener todos los extintores con sus relaciones
      const extintores = await extintorRepo.find({
        relations: ['tipo', 'ubicacion', 'ubicacion.sede']
      });

      // Calcular estadísticas básicas
      const totalExtintores = extintores.length;
      let extintoresVencidos = 0;
      let extintoresPorVencer = 0;
      let extintoresVigentes = 0;
      let mantenimientosPendientes = 0;

      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(hoy.getDate() + 30); // 30 días para considerar "por vencer"

      extintores.forEach(extintor => {
        const fechaVencimiento = new Date(extintor.fecha_vencimiento);
        
        if (fechaVencimiento < hoy) {
          extintoresVencidos++;
        } else if (fechaVencimiento <= fechaLimite) {
          extintoresPorVencer++;
        } else {
          extintoresVigentes++;
        }

        if (extintor.requiere_mantenimiento) {
          mantenimientosPendientes++;
        }
      });

      // Estadísticas por tipo de extintor
      const extintoresPorTipo = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .select([
          'tipo.id as tipo',
          'tipo.nombre as nombre',
          'tipo.color_hex as color',
          'COUNT(extintor.id) as cantidad'
        ])
        .groupBy('tipo.id, tipo.nombre, tipo.color_hex')
        .getRawMany();

      // Estadísticas por ubicación
      const extintoresPorUbicacion = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .select([
          'ubicacion.nombre_area as ubicacion',
          'sede.nombre as sede',
          'COUNT(extintor.id) as cantidad'
        ])
        .groupBy('ubicacion.id, ubicacion.nombre_area, sede.nombre')
        .getRawMany();

      // Vencimientos próximos (próximos 60 días)
      const fechaLimiteExtendida = new Date();
      fechaLimiteExtendida.setDate(hoy.getDate() + 60);

      const vencimientosProximos = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .where('extintor.fecha_vencimiento BETWEEN :hoy AND :limite', {
          hoy: hoy.toISOString().split('T')[0],
          limite: fechaLimiteExtendida.toISOString().split('T')[0]
        })
        .orderBy('extintor.fecha_vencimiento', 'ASC')
        .getMany();

      const vencimientosFormateados = vencimientosProximos.map(extintor => ({
        id: extintor.id,
        codigo_interno: extintor.codigo_interno,
        tipo: extintor.tipo.nombre,
        ubicacion: `${extintor.ubicacion.nombre_area} - ${extintor.ubicacion.sede.nombre}`,
        fecha_vencimiento: extintor.fecha_vencimiento.toISOString().split('T')[0],
        dias_restantes: extintor.dias_para_vencimiento
      }));

      const stats: DashboardStats = {
        total_extintores: totalExtintores,
        extintores_vencidos: extintoresVencidos,
        extintores_por_vencer: extintoresPorVencer,
        extintores_vigentes: extintoresVigentes,
        mantenimientos_pendientes: mantenimientosPendientes,
        extintores_por_tipo: extintoresPorTipo.map(item => ({
          tipo: item.tipo,
          nombre: item.nombre,
          cantidad: parseInt(item.cantidad),
          color: item.color || '#6B7280'
        })),
        extintores_por_ubicacion: extintoresPorUbicacion.map(item => ({
          ubicacion: item.ubicacion,
          sede: item.sede,
          cantidad: parseInt(item.cantidad)
        })),
        vencimientos_proximos: vencimientosFormateados
      };

      res.json(createApiResponse(
        true,
        stats,
        'Estadísticas obtenidas exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Obtener resumen de actividad reciente
   */
  static async getRecentActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);
      const extintorRepo = AppDataSource.getRepository(Extintor);

      // Últimos mantenimientos (últimos 30 días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);

      const mantenimientosRecientes = await mantenimientoRepo
        .createQueryBuilder('mantenimiento')
        .leftJoinAndSelect('mantenimiento.extintor', 'extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .leftJoinAndSelect('mantenimiento.tecnico', 'tecnico')
        .where('mantenimiento.fecha >= :fechaLimite', { fechaLimite })
        .orderBy('mantenimiento.fecha', 'DESC')
        .limit(10)
        .getMany();

      // Extintores agregados recientemente (últimos 30 días)
      const extintoresRecientes = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .where('extintor.creado_en >= :fechaLimite', { fechaLimite })
        .orderBy('extintor.creado_en', 'DESC')
        .limit(5)
        .getMany();

      const actividadReciente = {
        mantenimientos_recientes: mantenimientosRecientes.map(m => ({
          id: m.id,
          fecha: m.fecha,
          tipo_evento: m.tipo_evento,
          descripcion: m.descripcion,
          extintor: {
            id: m.extintor.id,
            codigo_interno: m.extintor.codigo_interno,
            tipo: m.extintor.tipo.nombre,
            ubicacion: m.extintor.ubicacion.nombre_area
          },
          tecnico: m.tecnico ? m.tecnico.nombre : 'No asignado',
          icono: m.icono_evento,
          color: m.color_evento
        })),
        extintores_recientes: extintoresRecientes.map(e => ({
          id: e.id,
          codigo_interno: e.codigo_interno,
          tipo: e.tipo.nombre,
          ubicacion: `${e.ubicacion.nombre_area} - ${e.ubicacion.sede.nombre}`,
          fecha_creacion: e.creado_en,
          estado_vencimiento: e.estado_vencimiento
        }))
      };

      res.json(createApiResponse(
        true,
        actividadReciente,
        'Actividad reciente obtenida exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Obtener métricas de rendimiento
   */
  static async getPerformanceMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const extintorRepo = AppDataSource.getRepository(Extintor);
      const mantenimientoRepo = AppDataSource.getRepository(Mantenimiento);

      // Métricas de los últimos 12 meses
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 12);

      // Mantenimientos por mes
      const mantenimientosPorMes = await mantenimientoRepo
        .createQueryBuilder('mantenimiento')
        .select([
          "strftime('%Y-%m', mantenimiento.fecha) as mes",
          'COUNT(*) as cantidad',
          'mantenimiento.tipo_evento as tipo'
        ])
        .where('mantenimiento.fecha >= :fechaInicio', { fechaInicio })
        .groupBy("strftime('%Y-%m', mantenimiento.fecha), mantenimiento.tipo_evento")
        .orderBy('mes', 'ASC')
        .getRawMany();

      // Tendencia de vencimientos
      const proximosVencimientos = await extintorRepo
        .createQueryBuilder('extintor')
        .select([
          "strftime('%Y-%m', extintor.fecha_vencimiento) as mes",
          'COUNT(*) as cantidad'
        ])
        .where('extintor.fecha_vencimiento >= :hoy', { hoy: new Date() })
        .groupBy("strftime('%Y-%m', extintor.fecha_vencimiento)")
        .orderBy('mes', 'ASC')
        .limit(12)
        .getRawMany();

      // Eficiencia de mantenimiento (porcentaje de extintores al día)
      const totalExtintores = await extintorRepo.count();
      const extintoresAlDia = await extintorRepo
        .createQueryBuilder('extintor')
        .where('extintor.fecha_mantenimiento >= :fechaLimite', {
          fechaLimite: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 1 año atrás
        })
        .getCount();

      const eficienciaMantenimiento = totalExtintores > 0 
        ? Math.round((extintoresAlDia / totalExtintores) * 100)
        : 0;

      const metricas = {
        mantenimientos_por_mes: mantenimientosPorMes.map(item => ({
          mes: item.mes,
          cantidad: parseInt(item.cantidad),
          tipo: item.tipo
        })),
        proximos_vencimientos: proximosVencimientos.map(item => ({
          mes: item.mes,
          cantidad: parseInt(item.cantidad)
        })),
        eficiencia_mantenimiento: eficienciaMantenimiento,
        total_extintores: totalExtintores,
        extintores_al_dia: extintoresAlDia
      };

      res.json(createApiResponse(
        true,
        metricas,
        'Métricas de rendimiento obtenidas exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener métricas:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }

  /**
   * Obtener alertas y notificaciones
   */
  static async getAlerts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const extintorRepo = AppDataSource.getRepository(Extintor);

      const hoy = new Date();
      const en30Dias = new Date();
      en30Dias.setDate(hoy.getDate() + 30);

      // Extintores vencidos
      const extintoresVencidos = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .where('extintor.fecha_vencimiento < :hoy', { hoy })
        .getMany();

      // Extintores por vencer
      const extintoresPorVencer = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .where('extintor.fecha_vencimiento BETWEEN :hoy AND :limite', {
          hoy,
          limite: en30Dias
        })
        .getMany();

      // Extintores que requieren mantenimiento
      const fechaLimiteMantenimiento = new Date();
      fechaLimiteMantenimiento.setFullYear(fechaLimiteMantenimiento.getFullYear() - 1);

      const extintoresMantenimiento = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .where('extintor.fecha_mantenimiento IS NULL OR extintor.fecha_mantenimiento < :fechaLimite', {
          fechaLimite: fechaLimiteMantenimiento
        })
        .getMany();

      const alertas = {
        extintores_vencidos: {
          count: extintoresVencidos.length,
          items: extintoresVencidos.map(e => ({
            id: e.id,
            codigo_interno: e.codigo_interno,
            tipo: e.tipo.nombre,
            ubicacion: e.ubicacion.nombre_area,
            fecha_vencimiento: e.fecha_vencimiento,
            dias_vencido: Math.abs(e.dias_para_vencimiento)
          })),
          severity: 'high'
        },
        extintores_por_vencer: {
          count: extintoresPorVencer.length,
          items: extintoresPorVencer.map(e => ({
            id: e.id,
            codigo_interno: e.codigo_interno,
            tipo: e.tipo.nombre,
            ubicacion: e.ubicacion.nombre_area,
            fecha_vencimiento: e.fecha_vencimiento,
            dias_restantes: e.dias_para_vencimiento
          })),
          severity: 'medium'
        },
        mantenimientos_pendientes: {
          count: extintoresMantenimiento.length,
          items: extintoresMantenimiento.map(e => ({
            id: e.id,
            codigo_interno: e.codigo_interno,
            tipo: e.tipo.nombre,
            ubicacion: e.ubicacion.nombre_area,
            fecha_ultimo_mantenimiento: e.fecha_mantenimiento,
            dias_sin_mantenimiento: e.fecha_mantenimiento 
              ? Math.floor((hoy.getTime() - new Date(e.fecha_mantenimiento).getTime()) / (1000 * 60 * 60 * 24))
              : null
          })),
          severity: 'low'
        }
      };

      res.json(createApiResponse(
        true,
        alertas,
        'Alertas obtenidas exitosamente'
      ));

    } catch (error) {
      console.error('Error al obtener alertas:', error);
      res.status(500).json(createApiResponse(
        false,
        undefined,
        undefined,
        'Error interno del servidor'
      ));
    }
  }
}
