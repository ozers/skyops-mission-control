import { DataSource } from 'typeorm';
import { DroneEntity } from '../../drones/infrastructure/drone.entity';
import { TypeOrmDroneRepository } from '../../drones/infrastructure/typeorm-drone.repository';
import {
  MaintenanceTransactionRepositories,
  MaintenanceTransactionRunner,
} from '../application/ports/transaction-runner';
import { MaintenanceLogEntity } from './maintenance-log.entity';
import { TypeOrmMaintenanceLogRepository } from './typeorm-maintenance-log.repository';

export class TypeOrmMaintenanceTransactionRunner implements MaintenanceTransactionRunner {
  constructor(private readonly dataSource: DataSource) {}

  run<T>(work: (repos: MaintenanceTransactionRepositories) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) =>
      work({
        drones: new TypeOrmDroneRepository(manager.getRepository(DroneEntity)),
        maintenanceLogs: new TypeOrmMaintenanceLogRepository(
          manager.getRepository(MaintenanceLogEntity),
        ),
      }),
    );
  }
}
