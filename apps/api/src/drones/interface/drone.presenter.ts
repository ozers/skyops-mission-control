import { DroneResponse } from '@skyops/contracts';
import { Drone } from '../domain/drone';

export function toDroneResponse(drone: Drone): DroneResponse {
  return {
    id: drone.id,
    serialNumber: drone.serialNumber.value,
    model: drone.model,
    status: drone.status,
    totalFlightHours: drone.totalFlightHours,
    lastMaintenanceAt: drone.lastMaintenanceAt?.toISOString() ?? null,
    nextMaintenanceDueAt: drone.nextMaintenanceDueAt?.toISOString() ?? null,
    registeredAt: drone.registeredAt.toISOString(),
  };
}
