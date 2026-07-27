import { Module } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DRONE_REPOSITORY, DroneRepository } from '../drones/application/ports/drone.repository';
import { DronesModule } from '../drones/drones.module';
import { CLOCK } from '../shared/application/clock';
import { ID_GENERATOR } from '../shared/application/id-generator';
import { SystemClock } from '../shared/infrastructure/system-clock';
import { UuidIdGenerator } from '../shared/infrastructure/uuid-id-generator';
import { CreateMissionUseCase } from './application/create-mission.use-case';
import { MISSION_REPOSITORY, MissionRepository } from './application/ports/mission.repository';
import { MissionEntity } from './infrastructure/mission.entity';
import { TypeOrmMissionRepository } from './infrastructure/typeorm-mission.repository';
import { MissionsController } from './interface/missions.controller';

@Module({
  imports: [DronesModule],
  controllers: [MissionsController],
  providers: [
    { provide: CLOCK, useClass: SystemClock },
    { provide: ID_GENERATOR, useClass: UuidIdGenerator },
    {
      provide: MISSION_REPOSITORY,
      useFactory: (dataSource: DataSource) =>
        new TypeOrmMissionRepository(dataSource.getRepository(MissionEntity)),
      inject: [getDataSourceToken()],
    },
    {
      provide: CreateMissionUseCase,
      useFactory: (
        missions: MissionRepository,
        drones: DroneRepository,
        ids: UuidIdGenerator,
        clock: SystemClock,
      ) => new CreateMissionUseCase(missions, drones, ids, clock),
      inject: [MISSION_REPOSITORY, DRONE_REPOSITORY, ID_GENERATOR, CLOCK],
    },
  ],
})
export class MissionsModule {}
