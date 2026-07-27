import { PaginatedResult } from '@skyops/contracts';
import { normalizePagination, paginate } from '../../shared/pagination/pagination';
import { MaintenanceLog } from '../domain/maintenance-log';
import { MaintenanceLogRepository } from './ports/maintenance-log.repository';

export interface ListMaintenanceLogsInput {
  droneId: string;
  page?: number;
  pageSize?: number;
}

export class ListMaintenanceLogsUseCase {
  constructor(private readonly maintenanceLogs: MaintenanceLogRepository) {}

  async execute(input: ListMaintenanceLogsInput): Promise<PaginatedResult<MaintenanceLog>> {
    const { page, pageSize } = normalizePagination(input);
    const { items, total } = await this.maintenanceLogs.listByDrone({
      droneId: input.droneId,
      page,
      pageSize,
    });
    return paginate(items, total, { page, pageSize });
  }
}
