import { Module } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DRONE_REPOSITORY, DroneRepository } from '../drones/application/ports/drone.repository';
import { DronesModule } from '../drones/drones.module';
import { CLOCK } from '../shared/application/clock';
import { ID_GENERATOR } from '../shared/application/id-generator';
import { SystemClock } from '../shared/infrastructure/system-clock';
import { UuidIdGenerator } from '../shared/infrastructure/uuid-id-generator';
import { CreateMaintenanceLogUseCase } from './application/create-maintenance-log.use-case';
import { ListMaintenanceLogsUseCase } from './application/list-maintenance-logs.use-case';
import { StartMaintenanceUseCase } from './application/start-maintenance.use-case';
import {
  MAINTENANCE_LOG_REPOSITORY,
  MaintenanceLogRepository,
} from './application/ports/maintenance-log.repository';
import {
  MAINTENANCE_TRANSACTION_RUNNER,
  MaintenanceTransactionRunner,
} from './application/ports/transaction-runner';
import { MaintenanceLogEntity } from './infrastructure/maintenance-log.entity';
import { TypeOrmMaintenanceLogRepository } from './infrastructure/typeorm-maintenance-log.repository';
import { TypeOrmMaintenanceTransactionRunner } from './infrastructure/typeorm-maintenance-transaction-runner';
import { MaintenanceController } from './interface/maintenance.controller';

@Module({
  imports: [DronesModule],
  controllers: [MaintenanceController],
  providers: [
    { provide: ID_GENERATOR, useClass: UuidIdGenerator },
    { provide: CLOCK, useClass: SystemClock },
    {
      provide: MAINTENANCE_LOG_REPOSITORY,
      useFactory: (dataSource: DataSource) =>
        new TypeOrmMaintenanceLogRepository(dataSource.getRepository(MaintenanceLogEntity)),
      inject: [getDataSourceToken()],
    },
    {
      provide: MAINTENANCE_TRANSACTION_RUNNER,
      useFactory: (dataSource: DataSource) =>
        new TypeOrmMaintenanceTransactionRunner(dataSource),
      inject: [getDataSourceToken()],
    },
    {
      provide: StartMaintenanceUseCase,
      useFactory: (drones: DroneRepository) => new StartMaintenanceUseCase(drones),
      inject: [DRONE_REPOSITORY],
    },
    {
      provide: CreateMaintenanceLogUseCase,
      useFactory: (tx: MaintenanceTransactionRunner, ids: UuidIdGenerator, clock: SystemClock) =>
        new CreateMaintenanceLogUseCase(tx, ids, clock),
      inject: [MAINTENANCE_TRANSACTION_RUNNER, ID_GENERATOR, CLOCK],
    },
    {
      provide: ListMaintenanceLogsUseCase,
      useFactory: (logs: MaintenanceLogRepository) => new ListMaintenanceLogsUseCase(logs),
      inject: [MAINTENANCE_LOG_REPOSITORY],
    },
  ],
})
export class MaintenanceModule {}
