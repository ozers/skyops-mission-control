import { Mission } from '../../domain/mission';

export interface MissionRepository {
  save(mission: Mission): Promise<void>;
  findById(id: string): Promise<Mission | null>;
  /* Locks the row FOR UPDATE; only valid inside a transaction (ADR-4). */
  findByIdForUpdate(id: string): Promise<Mission | null>;
}

export const MISSION_REPOSITORY = Symbol('MissionRepository');
