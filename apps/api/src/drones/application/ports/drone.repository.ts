import { Drone } from '../../domain/drone';
import { SerialNumber } from '../../domain/serial-number';

/*
 * Port the application depends on. The TypeORM adapter lives in infrastructure,
 * so use cases never see the database.
 */
export interface DroneRepository {
  save(drone: Drone): Promise<void>;
  findById(id: string): Promise<Drone | null>;
  findBySerialNumber(serialNumber: SerialNumber): Promise<Drone | null>;
}

export const DRONE_REPOSITORY = Symbol('DroneRepository');
