import { DroneRepository } from '../../drones/application/ports/drone.repository';
import { Drone } from '../../drones/domain/drone';
import { DroneNotFoundError } from '../../drones/domain/drone.errors';

export class StartMaintenanceUseCase {
  constructor(private readonly drones: DroneRepository) {}

  async execute(droneId: string): Promise<Drone> {
    const drone = await this.drones.findById(droneId);
    if (!drone) {
      throw new DroneNotFoundError(droneId);
    }
    drone.startMaintenance();
    await this.drones.save(drone);
    return drone;
  }
}
