import { DroneNotFoundError } from '../domain/drone.errors';
import { DroneRepository } from './ports/drone.repository';

export class DeleteDroneUseCase {
  constructor(private readonly drones: DroneRepository) {}

  async execute(id: string): Promise<void> {
    const drone = await this.drones.findById(id);
    if (!drone) {
      throw new DroneNotFoundError(id);
    }
    await this.drones.delete(id);
  }
}
