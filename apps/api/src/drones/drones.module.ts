import { Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CLOCK } from '../shared/application/clock';
import { ID_GENERATOR } from '../shared/application/id-generator';
import { SystemClock } from '../shared/infrastructure/system-clock';
import { UuidIdGenerator } from '../shared/infrastructure/uuid-id-generator';
import { GetDroneUseCase } from './application/get-drone.use-case';
import { ListDronesUseCase } from './application/list-drones.use-case';
import { RegisterDroneUseCase } from './application/register-drone.use-case';
import { DRONE_REPOSITORY, DroneRepository } from './application/ports/drone.repository';
import { DroneEntity } from './infrastructure/drone.entity';
import { TypeOrmDroneRepository } from './infrastructure/typeorm-drone.repository';
import { DronesController } from './interface/drones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DroneEntity])],
  controllers: [DronesController],
  providers: [
    { provide: CLOCK, useClass: SystemClock },
    { provide: ID_GENERATOR, useClass: UuidIdGenerator },
    {
      provide: DRONE_REPOSITORY,
      useFactory: (dataSource: DataSource) =>
        new TypeOrmDroneRepository(dataSource.getRepository(DroneEntity)),
      inject: [getDataSourceToken()],
    },
    {
      provide: RegisterDroneUseCase,
      useFactory: (drones: DroneRepository, ids: UuidIdGenerator, clock: SystemClock) =>
        new RegisterDroneUseCase(drones, ids, clock),
      inject: [DRONE_REPOSITORY, ID_GENERATOR, CLOCK],
    },
    {
      provide: GetDroneUseCase,
      useFactory: (drones: DroneRepository) => new GetDroneUseCase(drones),
      inject: [DRONE_REPOSITORY],
    },
    {
      provide: ListDronesUseCase,
      useFactory: (drones: DroneRepository) => new ListDronesUseCase(drones),
      inject: [DRONE_REPOSITORY],
    },
  ],
})
export class DronesModule {}
