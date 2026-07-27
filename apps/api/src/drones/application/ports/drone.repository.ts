import { DroneStatus } from '@skyops/contracts';
import { Drone } from '../../domain/drone';
import { SerialNumber } from '../../domain/serial-number';

export interface ListDronesParams {
  page: number;
  pageSize: number;
  status?: DroneStatus;
}

/*
 * Port the application depends on. The TypeORM adapter lives in infrastructure,
 * so use cases never see the database.
 */
export interface DroneRepository {
  save(drone: Drone): Promise<void>;
  findById(id: string): Promise<Drone | null>;
  findByIdForUpdate(id: string): Promise<Drone | null>;
  findBySerialNumber(serialNumber: SerialNumber): Promise<Drone | null>;
  list(params: ListDronesParams): Promise<{ items: Drone[]; total: number }>;
  delete(id: string): Promise<void>;
}

export const DRONE_REPOSITORY = Symbol('DroneRepository');
