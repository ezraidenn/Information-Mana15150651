import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Sede } from './Sede';
import { Extintor } from './Extintor';

@Entity('ubicaciones')
export class Ubicacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  nombre_area!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'integer', nullable: false })
  sede_id!: number;

  @ManyToOne(() => Sede, sede => sede.ubicaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sede_id' })
  sede!: Sede;

  @OneToMany(() => Extintor, extintor => extintor.ubicacion)
  extintores!: Extintor[];

  @CreateDateColumn()
  creado_en!: Date;

  @UpdateDateColumn()
  actualizado_en!: Date;
}
