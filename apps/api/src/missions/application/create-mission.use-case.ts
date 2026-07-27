import { MissionType } from '@skyops/contracts';
import { DroneRepository } from '../../drones/application/ports/drone.repository';
import { DroneNotFoundError } from '../../drones/domain/drone.errors';
import { Clock } from '../../shared/application/clock';
import { IdGenerator } from '../../shared/application/id-generator';
import { Mission } from '../domain/mission';
import { MissionDroneNotAvailableError } from '../domain/mission.errors';
import { SchedulingPolicy } from '../domain/scheduling.policy';
import { TimeWindow } from '../domain/time-window';
import { MissionRepository } from './ports/mission.repository';

export interface CreateMissionInput {
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}

export class CreateMissionUseCase {
  constructor(
    private readonly missions: MissionRepository,
    private readonly drones: DroneRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: CreateMissionInput): Promise<Mission> {
    const window = TimeWindow.create(input.scheduledStart, input.scheduledEnd);
    SchedulingPolicy.assertSchedulable(window, this.clock.now());

    const drone = await this.drones.findById(input.droneId);
    if (!drone) {
      throw new DroneNotFoundError(input.droneId);
    }
    if (drone.status !== 'AVAILABLE') {
      throw new MissionDroneNotAvailableError(input.droneId, drone.status);
    }

    const mission = Mission.schedule({
      id: this.ids.generate(),
      name: input.name,
      type: input.type,
      droneId: input.droneId,
      pilotName: input.pilotName,
      siteLocation: input.siteLocation,
      window,
    });
    /* The DB exclusion constraint is the final overlap guard; the repo maps it to a 409. */
    await this.missions.save(mission);
    return mission;
  }
}
