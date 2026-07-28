import type {
  DroneModel,
  DroneResponse,
  FleetHealthReport,
  MaintenanceLogResponse,
  MissionResponse,
  MissionStatus,
  MissionType,
  PaginatedResult,
} from '@skyops/contracts';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message ?? res.statusText);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export interface CreateMissionBody {
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  scheduledStart: string;
  scheduledEnd: string;
}

export const api = {
  fleetHealth: () => req<FleetHealthReport>('/fleet/health'),
  listDrones: () => req<PaginatedResult<DroneResponse>>('/drones?pageSize=100'),
  getDrone: (id: string) => req<DroneResponse>(`/drones/${id}`),
  createDrone: (body: { serialNumber: string; model: DroneModel }) =>
    req<DroneResponse>('/drones', { method: 'POST', body: JSON.stringify(body) }),
  retireDrone: (id: string) => req<DroneResponse>(`/drones/${id}/retire`, { method: 'POST' }),
  listMaintenanceLogs: (droneId: string) =>
    req<PaginatedResult<MaintenanceLogResponse>>(`/drones/${droneId}/maintenance-logs`),
  listMissions: () => req<PaginatedResult<MissionResponse>>('/missions?pageSize=100'),
  missionsForDrone: (droneId: string) =>
    req<PaginatedResult<MissionResponse>>(`/missions?droneId=${droneId}&pageSize=100`),
  createMission: (body: CreateMissionBody) =>
    req<MissionResponse>('/missions', { method: 'POST', body: JSON.stringify(body) }),
  transitionMission: (
    id: string,
    body: { to: MissionStatus; flightHoursLogged?: number; abortReason?: string },
  ) =>
    req<MissionResponse>(`/missions/${id}/transitions`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
