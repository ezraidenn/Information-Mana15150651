import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TipoExtintor } from './TipoExtintor';
import { Ubicacion } from './Ubicacion';
import { Usuario } from './Usuario';
import { Mantenimiento } from './Mantenimiento';

@Entity('extintores')
export class Extintor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true, nullable: true })
  codigo_interno?: string; // Código físico/etiqueta opcional

  @Column({ type: 'text', nullable: false })
  tipo_id!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'integer', nullable: false })
  ubicacion_id!: number;

  @Column({ type: 'integer', nullable: true })
  responsable_id?: number;

  @Column({ type: 'date', nullable: false })
  fecha_vencimiento!: Date;

  @Column({ type: 'date', nullable: true })
  fecha_mantenimiento?: Date; // Última revisión

  @Column({ type: 'text', nullable: true })
  imagen_path?: string;
  
  @Column({ type: 'text', nullable: true, default: 'ACTIVO' })
  estado?: string; // ACTIVO, MANTENIMIENTO, VENCIDO, BAJA

  // Relaciones
  @ManyToOne(() => TipoExtintor, tipo => tipo.extintores, { eager: true })
  @JoinColumn({ name: 'tipo_id' })
  tipo!: TipoExtintor;

  @ManyToOne(() => Ubicacion, ubicacion => ubicacion.extintores, { eager: true })
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion!: Ubicacion;

  @ManyToOne(() => Usuario, usuario => usuario.extintores_responsable, { eager: true })
  @JoinColumn({ name: 'responsable_id' })
  responsable?: Usuario;

  @OneToMany(() => Mantenimiento, mantenimiento => mantenimiento.extintor)
  mantenimientos!: Mantenimiento[];

  @CreateDateColumn()
  creado_en!: Date;

  @UpdateDateColumn()
  actualizado_en!: Date;

  // Métodos de utilidad
  get dias_para_vencimiento(): number {
    const hoy = new Date();
    const vencimiento = new Date(this.fecha_vencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  get estado_vencimiento(): 'vencido' | 'por_vencer' | 'vigente' {
    const dias = this.dias_para_vencimiento;
    if (dias < 0) return 'vencido';
    if (dias <= 30) return 'por_vencer';
    return 'vigente';
  }

  get requiere_mantenimiento(): boolean {
    if (!this.fecha_mantenimiento) return true;
    const hoy = new Date();
    const ultimoMantenimiento = new Date(this.fecha_mantenimiento);
    const diferencia = hoy.getTime() - ultimoMantenimiento.getTime();
    const diasSinMantenimiento = Math.ceil(diferencia / (1000 * 3600 * 24));
    return diasSinMantenimiento > 365; // Más de un año sin mantenimiento
  }
}
