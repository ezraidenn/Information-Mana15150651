import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Extintor } from './Extintor';

@Entity('tipos_extintores')
export class TipoExtintor {
  @PrimaryColumn({ type: 'text' })
  id!: string; // ABC, CO2, H2O, etc.

  @Column({ type: 'text', nullable: false })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'text', nullable: true })
  uso_recomendado?: string;

  @Column({ type: 'text', nullable: true })
  color_hex?: string; // Para visualización en tarjetas

  @Column({ type: 'simple-array', nullable: true })
  clase_fuego?: string[]; // Clases de fuego aplicables (A, B, C, D, K)

  @Column({ type: 'simple-array', nullable: true })
  icono_path?: string[]; // Rutas a los íconos de clases de fuego

  @OneToMany(() => Extintor, extintor => extintor.tipo)
  extintores!: Extintor[];

  @CreateDateColumn()
  creado_en!: Date;

  @UpdateDateColumn()
  actualizado_en!: Date;
}
