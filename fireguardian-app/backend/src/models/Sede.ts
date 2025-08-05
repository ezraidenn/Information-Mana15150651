import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ubicacion } from './Ubicacion';

@Entity('sedes')
export class Sede {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @OneToMany(() => Ubicacion, ubicacion => ubicacion.sede)
  ubicaciones!: Ubicacion[];

  @CreateDateColumn()
  creado_en!: Date;

  @UpdateDateColumn()
  actualizado_en!: Date;
}
