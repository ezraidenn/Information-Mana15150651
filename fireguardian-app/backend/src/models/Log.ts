import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from './Usuario';

export type AccionTipo = 'crear' | 'editar' | 'eliminar' | 'login' | 'logout' | 'backup' | 'exportar';
export type EntidadTipo = 'extintores' | 'tipos_extintores' | 'usuarios' | 'ubicaciones' | 'sedes' | 'mantenimientos' | 'sistema';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: true })
  usuario_id?: number;

  @Column({ 
    type: 'text', 
    nullable: false,
    enum: ['crear', 'editar', 'eliminar', 'login', 'logout', 'backup', 'exportar']
  })
  accion!: AccionTipo;

  @Column({ 
    type: 'text', 
    nullable: false,
    enum: ['extintores', 'tipos_extintores', 'usuarios', 'ubicaciones', 'sedes', 'mantenimientos', 'sistema']
  })
  entidad!: EntidadTipo;

  @Column({ type: 'integer', nullable: true })
  entidad_id?: number;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'text', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  // Relaciones
  @ManyToOne(() => Usuario, usuario => usuario.logs)
  @JoinColumn({ name: 'usuario_id' })
  usuario?: Usuario;

  @CreateDateColumn()
  timestamp!: Date;

  // Método de utilidad para obtener el color de la acción
  get color_accion(): string {
    const colores: Record<AccionTipo, string> = {
      'crear': '#10B981',    // Verde
      'editar': '#3B82F6',   // Azul
      'eliminar': '#EF4444', // Rojo
      'login': '#8B5CF6',    // Púrpura
      'logout': '#6B7280',   // Gris
      'backup': '#F59E0B',   // Amarillo
      'exportar': '#06B6D4'  // Cian
    };
    return colores[this.accion] || '#6B7280';
  }

  get icono_accion(): string {
    const iconos: Record<AccionTipo, string> = {
      'crear': '➕',
      'editar': '✏️',
      'eliminar': '🗑️',
      'login': '🔐',
      'logout': '🚪',
      'backup': '💾',
      'exportar': '📤'
    };
    return iconos[this.accion] || '📝';
  }
}
