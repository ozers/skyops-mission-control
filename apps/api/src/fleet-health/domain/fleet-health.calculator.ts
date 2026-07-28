import { DRONE_STATUSES, DroneStatus, FleetHealthReport } from '@skyops/contracts';

export interface FleetHealthInput {
  statusCounts: ReadonlyArray<{ status: DroneStatus; count: number }>;
  overdueDroneIds: readonly string[];
  missionsNext24h: number;
  averageFlightHours: number | null;
}

/*
 * Shapes raw aggregate rows into the report. Kept pure so the reporting rules
 * (every status key present, zeros instead of nulls) are unit-testable without
 * a database.
 */
export function buildFleetHealthReport(input: FleetHealthInput): FleetHealthReport {
  const dronesByStatus = Object.fromEntries(DRONE_STATUSES.map((s) => [s, 0])) as Record<
    DroneStatus,
    number
  >;

  let totalDrones = 0;
  for (const row of input.statusCounts) {
    dronesByStatus[row.status] = row.count;
    totalDrones += row.count;
  }

  return {
    totalDrones,
    dronesByStatus,
    overdueMaintenanceDroneIds: [...input.overdueDroneIds],
    missionsNext24h: input.missionsNext24h,
    averageFlightHours: input.averageFlightHours ?? 0,
  };
}
