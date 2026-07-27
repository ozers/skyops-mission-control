import { Drone } from '../domain/drone';
import { SerialNumber } from '../domain/serial-number';
import { DroneEntity } from './drone.entity';

/* Translates between the persistence row and the domain aggregate. */
export const DroneMapper = {
  toEntity(drone: Drone): DroneEntity {
    const entity = new DroneEntity();
    entity.id = drone.id;
    entity.serialNumber = drone.serialNumber.value;
    entity.model = drone.model;
    entity.status = drone.status;
    entity.totalFlightHours = drone.totalFlightHours;
    entity.flightHoursAtLastMaintenance = drone.flightHoursAtLastMaintenance;
    entity.lastMaintenanceAt = drone.lastMaintenanceAt;
    entity.nextMaintenanceDueAt = drone.nextMaintenanceDueAt;
    entity.registeredAt = drone.registeredAt;
    return entity;
  },

  toDomain(entity: DroneEntity): Drone {
    return Drone.fromPersistence({
      id: entity.id,
      serialNumber: SerialNumber.create(entity.serialNumber),
      model: entity.model,
      status: entity.status,
      totalFlightHours: entity.totalFlightHours,
      flightHoursAtLastMaintenance: entity.flightHoursAtLastMaintenance,
      lastMaintenanceAt: entity.lastMaintenanceAt,
      nextMaintenanceDueAt: entity.nextMaintenanceDueAt,
      registeredAt: entity.registeredAt,
    });
  },
};
