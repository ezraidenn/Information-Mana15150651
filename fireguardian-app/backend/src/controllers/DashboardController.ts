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
      console.log('Solicitud de estadísticas recibida');
      
      const extintorRepo = AppDataSource.getRepository(Extintor);
      const hoy = new Date();
      const fecha30Dias = new Date(hoy);
      fecha30Dias.setDate(fecha30Dias.getDate() + 30);

      // 1. Total de extintores
      const total_extintores = await extintorRepo.count();

      // 2. Extintores vencidos (fecha_vencimiento < hoy)
      const extintores_vencidos = await extintorRepo
        .createQueryBuilder('extintor')
        .where('extintor.fecha_vencimiento < :hoy', { hoy: hoy.toISOString().split('T')[0] })
        .getCount();

      // 3. Extintores por vencer (fecha_vencimiento entre hoy y +30 días)
      const extintores_por_vencer = await extintorRepo
        .createQueryBuilder('extintor')
        .where('extintor.fecha_vencimiento >= :hoy', { hoy: hoy.toISOString().split('T')[0] })
        .andWhere('extintor.fecha_vencimiento <= :fecha30', { fecha30: fecha30Dias.toISOString().split('T')[0] })
        .getCount();

      // 4. Extintores vigentes
      const extintores_vigentes = total_extintores - extintores_vencidos - extintores_por_vencer;

      // 5. Mantenimientos pendientes (extintores sin mantenimiento en +365 días)
      const hace1Anio = new Date(hoy);
      hace1Anio.setFullYear(hace1Anio.getFullYear() - 1);
      
      const mantenimientos_pendientes = await extintorRepo
        .createQueryBuilder('extintor')
        .where('extintor.fecha_mantenimiento IS NULL OR extintor.fecha_mantenimiento < :hace1Anio', 
          { hace1Anio: hace1Anio.toISOString().split('T')[0] })
        .getCount();

      // 6. Extintores por tipo
      const porTipo = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoin('extintor.tipo', 'tipo')
        .select('tipo.id', 'tipo')
        .addSelect('tipo.nombre', 'nombre')
        .addSelect('COUNT(extintor.id)', 'cantidad')
        .groupBy('tipo.id')
        .addGroupBy('tipo.nombre')
        .getRawMany();

      const extintores_por_tipo = porTipo.map(item => ({
        tipo: item.tipo,
        nombre: item.nombre,
        cantidad: parseInt(item.cantidad),
        color: '#6B7280' // Color por defecto
      }));

      // 7. Extintores por ubicación
      const porUbicacion = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoin('extintor.ubicacion', 'ubicacion')
        .leftJoin('ubicacion.sede', 'sede')
        .select('ubicacion.nombre_area', 'ubicacion')
        .addSelect('sede.nombre', 'sede')
        .addSelect('COUNT(extintor.id)', 'cantidad')
        .where('ubicacion.nombre_area IS NOT NULL')
        .groupBy('ubicacion.nombre_area')
        .addGroupBy('sede.nombre')
        .orderBy('COUNT(extintor.id)', 'DESC')
        .limit(10)
        .getRawMany();

      const extintores_por_ubicacion = porUbicacion.map(item => ({
        ubicacion: item.ubicacion || 'Sin ubicación',
        sede: item.sede || 'Sin sede',
        cantidad: parseInt(item.cantidad)
      }));

      // 8. Vencimientos próximos (próximos 30 días, ordenados por fecha)
      const vencimientosProximos = await extintorRepo
        .createQueryBuilder('extintor')
        .leftJoinAndSelect('extintor.tipo', 'tipo')
        .leftJoinAndSelect('extintor.ubicacion', 'ubicacion')
        .leftJoinAndSelect('ubicacion.sede', 'sede')
        .where('extintor.fecha_vencimiento >= :hoy', { hoy: hoy.toISOString().split('T')[0] })
        .andWhere('extintor.fecha_vencimiento <= :fecha30', { fecha30: fecha30Dias.toISOString().split('T')[0] })
        .orderBy('extintor.fecha_vencimiento', 'ASC')
        .limit(10)
        .getMany();

      const vencimientos_proximos = vencimientosProximos.map(ext => {
        const diasRestantes = ext.dias_para_vencimiento;
        // Convertir fecha a string - SQLite devuelve strings
        const fechaStr = String(ext.fecha_vencimiento).split('T')[0];
          
        return {
          id: ext.id,
          codigo_interno: ext.codigo_interno || 'N/A',
          tipo: ext.tipo?.nombre || 'N/A',
          ubicacion: ext.ubicacion 
            ? `${ext.ubicacion.nombre_area} - ${ext.ubicacion.sede?.nombre || 'N/A'}`
            : 'N/A',
          fecha_vencimiento: fechaStr,
          dias_restantes: diasRestantes
        };
      });

      const stats: DashboardStats = {
        total_extintores,
        extintores_vencidos,
        extintores_por_vencer,
        extintores_vigentes,
        mantenimientos_pendientes,
        extintores_por_tipo,
        extintores_por_ubicacion,
        vencimientos_proximos
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
