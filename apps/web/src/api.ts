import type {
  DroneModel,
  DroneResponse,
  DroneStatus,
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

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export interface ListParams {
  page?: number;
  pageSize?: number;
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

  listDrones: (params: ListParams & { status?: DroneStatus } = {}) =>
    req<PaginatedResult<DroneResponse>>(`/drones${query({ ...params })}`),
  getDrone: (id: string) => req<DroneResponse>(`/drones/${id}`),
  createDrone: (body: { serialNumber: string; model: DroneModel }) =>
    req<DroneResponse>('/drones', { method: 'POST', body: JSON.stringify(body) }),
  retireDrone: (id: string) => req<DroneResponse>(`/drones/${id}/retire`, { method: 'POST' }),

  listMaintenanceLogs: (droneId: string) =>
    req<PaginatedResult<MaintenanceLogResponse>>(`/drones/${droneId}/maintenance-logs`),

  listMissions: (params: ListParams & { status?: MissionStatus; droneId?: string } = {}) =>
    req<PaginatedResult<MissionResponse>>(`/missions${query({ ...params })}`),
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
