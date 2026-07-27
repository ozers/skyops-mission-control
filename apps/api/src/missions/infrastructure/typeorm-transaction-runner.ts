import { DataSource } from 'typeorm';
import { DroneEntity } from '../../drones/infrastructure/drone.entity';
import { TypeOrmDroneRepository } from '../../drones/infrastructure/typeorm-drone.repository';
import {
  TransactionRunner,
  TransactionalRepositories,
} from '../application/ports/transaction-runner';
import { MissionEntity } from './mission.entity';
import { TypeOrmMissionRepository } from './typeorm-mission.repository';

export class TypeOrmTransactionRunner implements TransactionRunner {
  constructor(private readonly dataSource: DataSource) {}

  run<T>(work: (repos: TransactionalRepositories) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      work({
        missions: new TypeOrmMissionRepository(manager.getRepository(MissionEntity)),
        drones: new TypeOrmDroneRepository(manager.getRepository(DroneEntity)),
      }),
    );
  }
}
