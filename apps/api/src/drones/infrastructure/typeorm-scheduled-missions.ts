import { MissionStatus } from '@skyops/contracts';
import { In, Repository } from 'typeorm';
import { MissionEntity } from '../../missions/infrastructure/mission.entity';
import { ScheduledMissionsPort } from '../application/ports/scheduled-missions.port';

const ACTIVE_STATUSES: MissionStatus[] = ['PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS'];

export class TypeOrmScheduledMissions implements ScheduledMissionsPort {
  constructor(private readonly missions: Repository<MissionEntity>) {}

  async activeMissionIdsForDrone(droneId: string): Promise<string[]> {
    const rows = await this.missions.find({
      where: { droneId, status: In(ACTIVE_STATUSES) },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }
}
