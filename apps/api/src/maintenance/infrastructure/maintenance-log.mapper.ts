import { MaintenanceLog } from '../domain/maintenance-log';
import { MaintenanceLogEntity } from './maintenance-log.entity';

export const MaintenanceLogMapper = {
  toEntity(log: MaintenanceLog): MaintenanceLogEntity {
    const entity = new MaintenanceLogEntity();
    entity.id = log.id;
    entity.droneId = log.droneId;
    entity.type = log.type;
    entity.technicianName = log.technicianName;
    entity.notes = log.notes;
    entity.performedAt = log.performedAt;
    entity.flightHoursAtMaintenance = log.flightHoursAtMaintenance;
    return entity;
  },

  toDomain(entity: MaintenanceLogEntity): MaintenanceLog {
    return MaintenanceLog.fromPersistence({
      id: entity.id,
      droneId: entity.droneId,
      type: entity.type,
      technicianName: entity.technicianName,
      notes: entity.notes,
      performedAt: entity.performedAt,
      flightHoursAtMaintenance: entity.flightHoursAtMaintenance,
    });
  },
};
