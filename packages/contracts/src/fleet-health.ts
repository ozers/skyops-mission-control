import { DroneStatus } from './enums';

export interface FleetHealthReport {
  totalDrones: number;
  dronesByStatus: Record<DroneStatus, number>;
  overdueMaintenanceDroneIds: string[];
  missionsNext24h: number;
  averageFlightHours: number;
}
