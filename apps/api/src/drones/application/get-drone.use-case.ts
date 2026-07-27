import { Drone } from '../domain/drone';
import { DroneNotFoundError } from '../domain/drone.errors';
import { DroneRepository } from './ports/drone.repository';

export class GetDroneUseCase {
  constructor(private readonly drones: DroneRepository) {}

  async execute(id: string): Promise<Drone> {
    const drone = await this.drones.findById(id);
    if (!drone) {
      throw new DroneNotFoundError(id);
    }
    return drone;
  }
}
