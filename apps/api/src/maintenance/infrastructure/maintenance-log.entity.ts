import { MaintenanceType } from '@skyops/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('maintenance_logs')
export class MaintenanceLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  droneId!: string;

  @Column()
  type!: MaintenanceType;

  @Column()
  technicianName!: string;

  @Column('text', { nullable: true })
  notes!: string | null;

  @Index()
  @Column('timestamptz')
  performedAt!: Date;

  @Column('double precision')
  flightHoursAtMaintenance!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
