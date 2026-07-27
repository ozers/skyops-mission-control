import { MissionStatus, MissionType } from './enums';

export interface MissionResponse {
  id: string;
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  status: MissionStatus;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  loggedFlightHours: number | null;
  abortReason: string | null;
}
