import { DroneModel, DroneStatus } from '@skyops/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('drones')
export class DroneEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  serialNumber!: string;

  @Column()
  model!: DroneModel;

  @Index()
  @Column()
  status!: DroneStatus;

  @Column('double precision', { default: 0 })
  totalFlightHours!: number;

  @Column('timestamptz', { nullable: true })
  lastMaintenanceAt!: Date | null;

  @Index()
  @Column('timestamptz', { nullable: true })
  nextMaintenanceDueAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  registeredAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
