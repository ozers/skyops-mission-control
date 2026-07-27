import { MaintenanceType } from './enums';

export interface MaintenanceLogResponse {
  id: string;
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes: string | null;
  performedAt: string;
  flightHoursAtMaintenance: number;
}
