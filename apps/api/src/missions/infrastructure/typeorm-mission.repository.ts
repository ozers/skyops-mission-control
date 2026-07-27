import { QueryFailedError, Repository } from 'typeorm';
import { Mission } from '../domain/mission';
import { MissionOverlapError } from '../domain/mission.errors';
import { MissionRepository } from '../application/ports/mission.repository';
import { MissionEntity } from './mission.entity';
import { MissionMapper } from './mission.mapper';

/* Postgres SQLSTATE for an exclusion-constraint violation. */
const EXCLUSION_VIOLATION = '23P01';

export class TypeOrmMissionRepository implements MissionRepository {
  constructor(private readonly repository: Repository<MissionEntity>) {}

  async save(mission: Mission): Promise<void> {
    try {
      await this.repository.save(MissionMapper.toEntity(mission));
    } catch (error) {
      /* The missions_no_overlap constraint is the source of truth; surface it as a clean 409. */
      if (this.isExclusionViolation(error)) {
        throw new MissionOverlapError();
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Mission | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? MissionMapper.toDomain(entity) : null;
  }

  private isExclusionViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === EXCLUSION_VIOLATION
    );
  }
}
