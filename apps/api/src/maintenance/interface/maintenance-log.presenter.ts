import { MaintenanceLogResponse } from '@skyops/contracts';
import { MaintenanceLog } from '../domain/maintenance-log';

export function toMaintenanceLogResponse(log: MaintenanceLog): MaintenanceLogResponse {
  return {
    id: log.id,
    droneId: log.droneId,
    type: log.type,
    technicianName: log.technicianName,
    notes: log.notes,
    performedAt: log.performedAt.toISOString(),
    flightHoursAtMaintenance: log.flightHoursAtMaintenance,
  };
}
