import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Extintor } from './Extintor';
import { Usuario } from './Usuario';

export type TipoEvento = 'inspeccion' | 'recarga' | 'reparacion' | 'incidente' | 'reemplazo';

@Entity('mantenimientos')
export class Mantenimiento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', nullable: false })
  extintor_id!: number;

  @Column({ type: 'date', nullable: false })
  fecha!: Date;

  @Column({ 
    type: 'text', 
    nullable: false,
    enum: ['inspeccion', 'recarga', 'reparacion', 'incidente', 'reemplazo']
  })
  tipo_evento!: TipoEvento;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'integer', nullable: true })
  tecnico_id?: number;

  @Column({ type: 'text', nullable: true })
  evidencia_path?: string; // Foto o archivo de evidencia

  // Relaciones
  @ManyToOne(() => Extintor, extintor => extintor.mantenimientos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'extintor_id' })
  extintor!: Extintor;

  @ManyToOne(() => Usuario, usuario => usuario.mantenimientos, { eager: true })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico?: Usuario;

  @CreateDateColumn()
  creado_en!: Date;

  // Método de utilidad para obtener el color del tipo de evento
  get color_evento(): string {
    const colores: Record<TipoEvento, string> = {
      'inspeccion': '#3B82F6', // Azul
      'recarga': '#10B981',     // Verde
      'reparacion': '#F59E0B',  // Amarillo
      'incidente': '#EF4444',   // Rojo
      'reemplazo': '#8B5CF6'    // Púrpura
    };
    return colores[this.tipo_evento] || '#6B7280';
  }

  get icono_evento(): string {
    const iconos: Record<TipoEvento, string> = {
      'inspeccion': '🔍',
      'recarga': '🔄',
      'reparacion': '🔧',
      'incidente': '⚠️',
      'reemplazo': '🔄'
    };
    return iconos[this.tipo_evento] || '📝';
  }
}
