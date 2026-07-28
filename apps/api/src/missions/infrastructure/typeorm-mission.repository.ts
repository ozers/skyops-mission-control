import { QueryFailedError, Repository } from 'typeorm';
import { Mission } from '../domain/mission';
import { MissionOverlapError } from '../domain/mission.errors';
import { ListMissionsParams, MissionRepository } from '../application/ports/mission.repository';
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

  async findByIdForUpdate(id: string): Promise<Mission | null> {
    const entity = await this.repository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
    return entity ? MissionMapper.toDomain(entity) : null;
  }

  async list(params: ListMissionsParams): Promise<{ items: Mission[]; total: number }> {
    const query = this.repository.createQueryBuilder('mission');
    if (params.status) {
      query.andWhere('mission.status = :status', { status: params.status });
    }
    if (params.droneId) {
      query.andWhere('mission.droneId = :droneId', { droneId: params.droneId });
    }
    if (params.from) {
      query.andWhere('mission.scheduledStart >= :from', { from: params.from });
    }
    if (params.to) {
      query.andWhere('mission.scheduledStart <= :to', { to: params.to });
    }
    query
      /* Most recently scheduled first, so newly booked work is on the first page. */
      .orderBy('mission.scheduledStart', 'DESC')
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize);

    const [rows, total] = await query.getManyAndCount();
    return { items: rows.map(MissionMapper.toDomain), total };
  }

  private isExclusionViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === EXCLUSION_VIOLATION
    );
  }
}
