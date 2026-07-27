import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { DroneEntity } from '../drones/infrastructure/drone.entity';
import { MaintenanceLogEntity } from '../maintenance/infrastructure/maintenance-log.entity';
import { MissionEntity } from '../missions/infrastructure/mission.entity';
import { buildDataSourceOptions } from './typeorm.config';

/*
 * Deterministic seed: fixed ids, values and dates, so every run produces the same
 * fleet. Windows for active missions never overlap per drone, so the exclusion
 * constraint is satisfied.
 */
const DRONE_COUNT = 20;
const MISSION_COUNT = 50;
const LOG_COUNT = 30;

const MODELS = ['PHANTOM_4', 'MATRICE_300', 'MAVIC_3_ENTERPRISE'] as const;
const MISSION_TYPES = ['WIND_TURBINE_INSPECTION', 'SOLAR_PANEL_SURVEY', 'POWER_LINE_PATROL'] as const;
const MAINTENANCE_TYPES = [
  'ROUTINE_CHECK',
  'BATTERY_REPLACEMENT',
  'MOTOR_REPAIR',
  'FIRMWARE_UPDATE',
  'FULL_OVERHAUL',
] as const;

const DAY = 24 * 60 * 60 * 1000;
const PAST = Date.parse('2026-05-01T08:00:00Z');
const FUTURE = Date.parse('2026-09-01T08:00:00Z');

const pad = (n: number, width: number): string => String(n).padStart(width, '0');
const uuid = (prefix: string, i: number): string =>
  `${prefix}-0000-4000-8000-${pad(i, 12)}`;
const at = (ms: number): Date => new Date(ms);

function buildDrones(): DroneEntity[] {
  return Array.from({ length: DRONE_COUNT }, (_, i) => {
    const drone = new DroneEntity();
    drone.id = uuid('00000001', i);
    drone.serialNumber = `SKY-${pad(1000 + i, 4)}-${pad(2000 + i, 4)}`;
    drone.model = MODELS[i % MODELS.length]!;
    drone.status = i % 11 === 0 ? 'RETIRED' : i % 8 === 0 ? 'MAINTENANCE' : 'AVAILABLE';
    drone.totalFlightHours = i * 4;
    /* Every 4th drone is overdue by flight hours (>= 50 since last service). */
    drone.flightHoursAtLastMaintenance = i % 4 === 0 ? Math.max(0, i * 4 - 55) : i * 4;
    /* Every 3rd drone is overdue by date (last service > 90 days before now). */
    const lastMaint = i % 3 === 0 ? PAST - 120 * DAY : PAST + 60 * DAY;
    drone.lastMaintenanceAt = at(lastMaint);
    drone.nextMaintenanceDueAt = at(lastMaint + 90 * DAY);
    drone.registeredAt = at(PAST - (DRONE_COUNT * 3 - i) * DAY);
    return drone;
  });
}

function buildMissions(drones: DroneEntity[]): MissionEntity[] {
  return Array.from({ length: MISSION_COUNT }, (_, m) => {
    const drone = drones[m % DRONE_COUNT]!;
    const completed = m % 5 < 3;
    const mission = new MissionEntity();
    mission.id = uuid('00000002', m);
    mission.name = `Inspection ${m + 1}`;
    mission.type = MISSION_TYPES[m % MISSION_TYPES.length]!;
    mission.droneId = drone.id;
    mission.pilotName = `Pilot ${(m % 7) + 1}`;
    mission.siteLocation = `Site ${(m % 9) + 1}`;
    /* Missions for a drone are DRONE_COUNT apart, so windows never overlap. */
    const start = (completed ? PAST : FUTURE) + m * DAY;
    mission.scheduledStart = at(start);
    mission.scheduledEnd = at(start + 2 * 60 * 60 * 1000);
    if (completed) {
      mission.status = 'COMPLETED';
      mission.actualStart = at(start);
      mission.actualEnd = at(start + 2 * 60 * 60 * 1000);
      mission.loggedFlightHours = 2;
      mission.abortReason = null;
    } else {
      mission.status = 'PLANNED';
      mission.actualStart = null;
      mission.actualEnd = null;
      mission.loggedFlightHours = null;
      mission.abortReason = null;
    }
    return mission;
  });
}

function buildLogs(drones: DroneEntity[]): MaintenanceLogEntity[] {
  return Array.from({ length: LOG_COUNT }, (_, k) => {
    const drone = drones[k % DRONE_COUNT]!;
    const log = new MaintenanceLogEntity();
    log.id = uuid('00000003', k);
    log.droneId = drone.id;
    log.type = MAINTENANCE_TYPES[k % MAINTENANCE_TYPES.length]!;
    log.technicianName = `Tech ${(k % 5) + 1}`;
    log.notes = k % 2 === 0 ? 'Routine service' : null;
    log.performedAt = at(PAST - (LOG_COUNT - k) * DAY);
    log.flightHoursAtMaintenance = drone.flightHoursAtLastMaintenance;
    return log;
  });
}

async function seed(): Promise<void> {
  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();
  try {
    await dataSource.query('TRUNCATE drones, missions, maintenance_logs CASCADE');
    const drones = buildDrones();
    await dataSource.getRepository(DroneEntity).save(drones);
    await dataSource.getRepository(MissionEntity).save(buildMissions(drones));
    await dataSource.getRepository(MaintenanceLogEntity).save(buildLogs(drones));
    console.log(`Seeded ${DRONE_COUNT} drones, ${MISSION_COUNT} missions, ${LOG_COUNT} maintenance logs.`);
  } finally {
    await dataSource.destroy();
  }
}

void seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
