import { MissionStatus } from '@skyops/contracts';
import { DroneNotFoundError } from '../../drones/domain/drone.errors';
import { Clock } from '../../shared/application/clock';
import { Mission } from '../domain/mission';
import { IllegalTransitionError, MissionNotFoundError } from '../domain/mission.errors';
import { TransactionRunner } from './ports/transaction-runner';

export interface TransitionMissionInput {
  to: MissionStatus;
  flightHoursLogged?: number;
  abortReason?: string;
}

/*
 * Drives a mission through the state machine and applies the drone side effects
 * in one transaction, with both rows locked FOR UPDATE so concurrent
 * transitions can't race (ADR-4).
 */
export class TransitionMissionUseCase {
  constructor(
    private readonly tx: TransactionRunner,
    private readonly clock: Clock,
  ) {}

  async execute(missionId: string, input: TransitionMissionInput): Promise<Mission> {
    return this.tx.run(async ({ missions, drones }) => {
      const mission = await missions.findByIdForUpdate(missionId);
      if (!mission) {
        throw new MissionNotFoundError(missionId);
      }
      const now = this.clock.now();

      switch (input.to) {
        case 'PRE_FLIGHT_CHECK':
          mission.beginPreFlight();
          break;

        case 'IN_PROGRESS': {
          mission.start(now);
          const drone = await drones.findByIdForUpdate(mission.droneId);
          if (!drone) {
            throw new DroneNotFoundError(mission.droneId);
          }
          drone.assignToMission();
          await drones.save(drone);
          break;
        }

        case 'COMPLETED': {
          mission.complete(now, input.flightHoursLogged);
          const drone = await drones.findByIdForUpdate(mission.droneId);
          if (!drone) {
            throw new DroneNotFoundError(mission.droneId);
          }
          drone.logCompletedMission(mission.loggedFlightHours ?? 0);
          await drones.save(drone);
          break;
        }

        case 'ABORTED': {
          mission.abort(now, input.abortReason);
          const drone = await drones.findByIdForUpdate(mission.droneId);
          if (drone && drone.status === 'IN_MISSION') {
            drone.returnFromMission();
            await drones.save(drone);
          }
          break;
        }

        default:
          throw new IllegalTransitionError(mission.status, input.to);
      }

      await missions.save(mission);
      return mission;
    });
  }
}
