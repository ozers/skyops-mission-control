import { DroneModel, DroneStatus } from './enums';

export interface DroneResponse {
  id: string;
  serialNumber: string;
  model: DroneModel;
  status: DroneStatus;
  totalFlightHours: number;
  lastMaintenanceAt: string | null;
  nextMaintenanceDueAt: string | null;
  /* True when the drone has passed 50 flight hours or 90 days since its last service. */
  maintenanceDue: boolean;
  registeredAt: string;
}
