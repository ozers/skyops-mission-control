import { Mission } from '../../domain/mission';

export interface MissionRepository {
  save(mission: Mission): Promise<void>;
  findById(id: string): Promise<Mission | null>;
}

export const MISSION_REPOSITORY = Symbol('MissionRepository');
