import { Module } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CLOCK } from '../shared/application/clock';
import { SystemClock } from '../shared/infrastructure/system-clock';
import { GetFleetHealthReportUseCase } from './application/get-fleet-health-report.use-case';
import {
  FLEET_HEALTH_READ_MODEL,
  FleetHealthReadModel,
} from './application/ports/fleet-health.read-model';
import { TypeOrmFleetHealthReadModel } from './infrastructure/typeorm-fleet-health.read-model';
import { FleetHealthController } from './interface/fleet-health.controller';

@Module({
  controllers: [FleetHealthController],
  providers: [
    { provide: CLOCK, useClass: SystemClock },
    {
      provide: FLEET_HEALTH_READ_MODEL,
      useFactory: (dataSource: DataSource) => new TypeOrmFleetHealthReadModel(dataSource),
      inject: [getDataSourceToken()],
    },
    {
      provide: GetFleetHealthReportUseCase,
      useFactory: (readModel: FleetHealthReadModel, clock: SystemClock) =>
        new GetFleetHealthReportUseCase(readModel, clock),
      inject: [FLEET_HEALTH_READ_MODEL, CLOCK],
    },
  ],
})
export class FleetHealthModule {}
