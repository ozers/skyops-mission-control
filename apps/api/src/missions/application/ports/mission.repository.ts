import { MissionStatus } from '@skyops/contracts';
import { Mission } from '../../domain/mission';

export interface ListMissionsParams {
  page: number;
  pageSize: number;
  status?: MissionStatus;
  droneId?: string;
  from?: Date;
  to?: Date;
}

export interface MissionRepository {
  save(mission: Mission): Promise<void>;
  findById(id: string): Promise<Mission | null>;
  /* Locks the row FOR UPDATE; only valid inside a transaction (ADR-4). */
  findByIdForUpdate(id: string): Promise<Mission | null>;
  list(params: ListMissionsParams): Promise<{ items: Mission[]; total: number }>;
}

export const MISSION_REPOSITORY = Symbol('MissionRepository');
