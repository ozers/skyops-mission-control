import { DRONE_STATUSES, DroneStatus, FleetHealthReport } from '@skyops/contracts';
import { DataSource } from 'typeorm';
import { FleetHealthReadModel } from '../application/ports/fleet-health.read-model';

const MAINTENANCE_HOURS_INTERVAL = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

export class TypeOrmFleetHealthReadModel implements FleetHealthReadModel {
  constructor(private readonly dataSource: DataSource) {}

  async report(now: Date): Promise<FleetHealthReport> {
    const next24h = new Date(now.getTime() + DAY_MS);

    const statusRows: Array<{ status: DroneStatus; count: number }> = await this.dataSource.query(
      'SELECT status, COUNT(*)::int AS count FROM drones GROUP BY status',
    );
    const dronesByStatus = Object.fromEntries(DRONE_STATUSES.map((s) => [s, 0])) as Record<
      DroneStatus,
      number
    >;
    let totalDrones = 0;
    for (const row of statusRows) {
      dronesByStatus[row.status] = row.count;
      totalDrones += row.count;
    }

    /* Overdue = past the 90-day due date, or 50+ flight hours since the last service. */
    const overdueRows: Array<{ id: string }> = await this.dataSource.query(
      `SELECT id FROM drones
       WHERE status <> 'RETIRED'
         AND (next_maintenance_due_at < $1
              OR (total_flight_hours - flight_hours_at_last_maintenance) >= $2)`,
      [now, MAINTENANCE_HOURS_INTERVAL],
    );

    const next24Rows: Array<{ count: number }> = await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM missions WHERE scheduled_start >= $1 AND scheduled_start < $2',
      [now, next24h],
    );

    const avgRows: Array<{ avg: string | null }> = await this.dataSource.query(
      'SELECT AVG(total_flight_hours) AS avg FROM drones',
    );

    return {
      totalDrones,
      dronesByStatus,
      overdueMaintenanceDroneIds: overdueRows.map((row) => row.id),
      missionsNext24h: next24Rows[0]?.count ?? 0,
      averageFlightHours: avgRows[0]?.avg ? Number(avgRows[0].avg) : 0,
    };
  }
}
