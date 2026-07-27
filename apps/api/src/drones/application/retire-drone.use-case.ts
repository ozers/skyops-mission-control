import { Drone } from '../domain/drone';
import { DroneHasScheduledMissionsError, DroneNotFoundError } from '../domain/drone.errors';
import { DroneRepository } from './ports/drone.repository';
import { ScheduledMissionsPort } from './ports/scheduled-missions.port';

export class RetireDroneUseCase {
  constructor(
    private readonly drones: DroneRepository,
    private readonly scheduledMissions: ScheduledMissionsPort,
  ) {}

  async execute(id: string): Promise<Drone> {
    const drone = await this.drones.findById(id);
    if (!drone) {
      throw new DroneNotFoundError(id);
    }

    const activeMissionIds = await this.scheduledMissions.activeMissionIdsForDrone(id);
    if (activeMissionIds.length > 0) {
      throw new DroneHasScheduledMissionsError(id, activeMissionIds);
    }

    drone.retire();
    await this.drones.save(drone);
    return drone;
  }
}
