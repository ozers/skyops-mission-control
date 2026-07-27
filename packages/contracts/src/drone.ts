import { DroneModel, DroneStatus } from './enums';

export interface DroneResponse {
  id: string;
  serialNumber: string;
  model: DroneModel;
  status: DroneStatus;
  totalFlightHours: number;
  lastMaintenanceAt: string | null;
  nextMaintenanceDueAt: string | null;
  registeredAt: string;
}
