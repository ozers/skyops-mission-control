import { Repository } from 'typeorm';
import { MaintenanceLog } from '../domain/maintenance-log';
import {
  ListMaintenanceLogsParams,
  MaintenanceLogRepository,
} from '../application/ports/maintenance-log.repository';
import { MaintenanceLogEntity } from './maintenance-log.entity';
import { MaintenanceLogMapper } from './maintenance-log.mapper';

export class TypeOrmMaintenanceLogRepository implements MaintenanceLogRepository {
  constructor(private readonly repository: Repository<MaintenanceLogEntity>) {}

  async save(log: MaintenanceLog): Promise<void> {
    await this.repository.save(MaintenanceLogMapper.toEntity(log));
  }

  async listByDrone(
    params: ListMaintenanceLogsParams,
  ): Promise<{ items: MaintenanceLog[]; total: number }> {
    const [rows, total] = await this.repository.findAndCount({
      where: { droneId: params.droneId },
      order: { performedAt: 'DESC' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    });
    return { items: rows.map(MaintenanceLogMapper.toDomain), total };
  }
}
