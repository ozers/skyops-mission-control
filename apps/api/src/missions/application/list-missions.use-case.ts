import { MissionStatus, PaginatedResult } from '@skyops/contracts';
import { normalizePagination, paginate } from '../../shared/pagination/pagination';
import { Mission } from '../domain/mission';
import { ListMissionsParams, MissionRepository } from './ports/mission.repository';

export interface ListMissionsInput {
  page?: number;
  pageSize?: number;
  status?: MissionStatus;
  droneId?: string;
  from?: Date;
  to?: Date;
}

export class ListMissionsUseCase {
  constructor(private readonly missions: MissionRepository) {}

  async execute(input: ListMissionsInput): Promise<PaginatedResult<Mission>> {
    const { page, pageSize } = normalizePagination(input);
    const params: ListMissionsParams = { page, pageSize };
    if (input.status) {
      params.status = input.status;
    }
    if (input.droneId) {
      params.droneId = input.droneId;
    }
    if (input.from) {
      params.from = input.from;
    }
    if (input.to) {
      params.to = input.to;
    }
    const { items, total } = await this.missions.list(params);
    return paginate(items, total, { page, pageSize });
  }
}
