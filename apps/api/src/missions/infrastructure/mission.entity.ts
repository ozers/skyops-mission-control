import { MissionStatus, MissionType } from '@skyops/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('missions')
export class MissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: MissionType;

  @Index()
  @Column('uuid')
  droneId!: string;

  @Column()
  pilotName!: string;

  @Column()
  siteLocation!: string;

  @Index()
  @Column()
  status!: MissionStatus;

  @Column('timestamptz')
  scheduledStart!: Date;

  @Column('timestamptz')
  scheduledEnd!: Date;

  @Column('timestamptz', { nullable: true })
  actualStart!: Date | null;

  @Column('timestamptz', { nullable: true })
  actualEnd!: Date | null;

  @Column('double precision', { nullable: true })
  loggedFlightHours!: number | null;

  @Column('text', { nullable: true })
  abortReason!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
