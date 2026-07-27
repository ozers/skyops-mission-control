import { DroneModel } from '@skyops/contracts';
import { Drone } from '../domain/drone';
import { DroneNotFoundError } from '../domain/drone.errors';
import { DroneRepository } from './ports/drone.repository';

export interface UpdateDroneInput {
  model: DroneModel;
}

export class UpdateDroneUseCase {
  constructor(private readonly drones: DroneRepository) {}

  async execute(id: string, input: UpdateDroneInput): Promise<Drone> {
    const drone = await this.drones.findById(id);
    if (!drone) {
      throw new DroneNotFoundError(id);
    }
    drone.changeModel(input.model);
    await this.drones.save(drone);
    return drone;
  }
}
