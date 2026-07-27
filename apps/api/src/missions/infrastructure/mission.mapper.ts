import { Mission } from '../domain/mission';
import { TimeWindow } from '../domain/time-window';
import { MissionEntity } from './mission.entity';

export const MissionMapper = {
  toEntity(mission: Mission): MissionEntity {
    const entity = new MissionEntity();
    entity.id = mission.id;
    entity.name = mission.name;
    entity.type = mission.type;
    entity.droneId = mission.droneId;
    entity.pilotName = mission.pilotName;
    entity.siteLocation = mission.siteLocation;
    entity.status = mission.status;
    entity.scheduledStart = mission.scheduledStart;
    entity.scheduledEnd = mission.scheduledEnd;
    entity.actualStart = mission.actualStart;
    entity.actualEnd = mission.actualEnd;
    entity.loggedFlightHours = mission.loggedFlightHours;
    entity.abortReason = mission.abortReason;
    return entity;
  },

  toDomain(entity: MissionEntity): Mission {
    return Mission.fromPersistence({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      droneId: entity.droneId,
      pilotName: entity.pilotName,
      siteLocation: entity.siteLocation,
      status: entity.status,
      window: TimeWindow.create(entity.scheduledStart, entity.scheduledEnd),
      actualStart: entity.actualStart,
      actualEnd: entity.actualEnd,
      loggedFlightHours: entity.loggedFlightHours,
      abortReason: entity.abortReason,
    });
  },
};
