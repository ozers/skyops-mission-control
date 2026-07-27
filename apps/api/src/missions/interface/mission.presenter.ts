import { MissionResponse } from '@skyops/contracts';
import { Mission } from '../domain/mission';

export function toMissionResponse(mission: Mission): MissionResponse {
  return {
    id: mission.id,
    name: mission.name,
    type: mission.type,
    droneId: mission.droneId,
    pilotName: mission.pilotName,
    siteLocation: mission.siteLocation,
    status: mission.status,
    scheduledStart: mission.scheduledStart.toISOString(),
    scheduledEnd: mission.scheduledEnd.toISOString(),
    actualStart: mission.actualStart?.toISOString() ?? null,
    actualEnd: mission.actualEnd?.toISOString() ?? null,
    loggedFlightHours: mission.loggedFlightHours,
    abortReason: mission.abortReason,
  };
}
