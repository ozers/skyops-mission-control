import { DroneStatus, PaginatedResult } from '@skyops/contracts';
import { normalizePagination, paginate } from '../../shared/pagination/pagination';
import { Drone } from '../domain/drone';
import { DroneRepository, ListDronesParams } from './ports/drone.repository';

export interface ListDronesInput {
  page?: number;
  pageSize?: number;
  status?: DroneStatus;
}

export class ListDronesUseCase {
  constructor(private readonly drones: DroneRepository) {}

  async execute(input: ListDronesInput): Promise<PaginatedResult<Drone>> {
    const { page, pageSize } = normalizePagination(input);
    const params: ListDronesParams = { page, pageSize };
    if (input.status) {
      params.status = input.status;
    }
    const { items, total } = await this.drones.list(params);
    return paginate(items, total, { page, pageSize });
  }
}
