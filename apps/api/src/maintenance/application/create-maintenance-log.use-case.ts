import { MaintenanceType } from '@skyops/contracts';
import { DroneNotFoundError } from '../../drones/domain/drone.errors';
import { Clock } from '../../shared/application/clock';
import { IdGenerator } from '../../shared/application/id-generator';
import { MaintenanceLog } from '../domain/maintenance-log';
import {
  MaintenanceFlightHoursMismatchError,
  MaintenanceInFutureError,
} from '../domain/maintenance.errors';
import { MaintenanceTransactionRunner } from './ports/transaction-runner';

export interface CreateMaintenanceLogInput {
  type: MaintenanceType;
  technicianName: string;
  notes?: string;
  performedAt: Date;
  flightHoursAtMaintenance: number;
}

/* Recorded hours may differ from the drone's total by at most this many hours. */
const HOURS_TOLERANCE = 1;

export class CreateMaintenanceLogUseCase {
  constructor(
    private readonly tx: MaintenanceTransactionRunner,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(droneId: string, input: CreateMaintenanceLogInput): Promise<MaintenanceLog> {
    if (input.performedAt.getTime() > this.clock.now().getTime()) {
      throw new MaintenanceInFutureError(input.performedAt);
    }

    return this.tx.run(async ({ drones, maintenanceLogs }) => {
      const drone = await drones.findByIdForUpdate(droneId);
      if (!drone) {
        throw new DroneNotFoundError(droneId);
      }

      if (Math.abs(input.flightHoursAtMaintenance - drone.totalFlightHours) > HOURS_TOLERANCE) {
        throw new MaintenanceFlightHoursMismatchError(
          input.flightHoursAtMaintenance,
          drone.totalFlightHours,
        );
      }

      const log = MaintenanceLog.record({
        id: this.ids.generate(),
        droneId,
        type: input.type,
        technicianName: input.technicianName,
        notes: input.notes ?? null,
        performedAt: input.performedAt,
        flightHoursAtMaintenance: input.flightHoursAtMaintenance,
      });
      await maintenanceLogs.save(log);

      drone.completeMaintenance(input.performedAt);
      await drones.save(drone);
      return log;
    });
  }
}
