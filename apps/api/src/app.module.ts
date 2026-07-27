import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { DronesModule } from './drones/drones.module';
import { FleetHealthModule } from './fleet-health/fleet-health.module';
import { HealthModule } from './health/health.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { MissionsModule } from './missions/missions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    DronesModule,
    MissionsModule,
    MaintenanceModule,
    FleetHealthModule,
  ],
})
export class AppModule {}
