import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Extintor } from './Extintor';
import { Mantenimiento } from './Mantenimiento';
import { Log } from './Log';

export type UsuarioRol = 'admin' | 'tecnico' | 'consulta';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  nombre!: string;

  @Column({ type: 'text', unique: true, nullable: false })
  email!: string;

  @Column({ type: 'text', nullable: false })
  password!: string;

  @Column({ 
    type: 'text', 
    nullable: false,
    enum: ['admin', 'tecnico', 'consulta']
  })
  rol!: UsuarioRol;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'datetime', nullable: true })
  ultimo_acceso?: Date;

  @OneToMany(() => Extintor, extintor => extintor.responsable)
  extintores_responsable!: Extintor[];

  @OneToMany(() => Mantenimiento, mantenimiento => mantenimiento.tecnico)
  mantenimientos!: Mantenimiento[];

  @OneToMany(() => Log, log => log.usuario)
  logs!: Log[];

  @CreateDateColumn()
  creado_en!: Date;

  @UpdateDateColumn()
  actualizado_en!: Date;

  // Método para ocultar password en JSON
  toJSON() {
    const { password, ...result } = this;
    return result;
  }
}
