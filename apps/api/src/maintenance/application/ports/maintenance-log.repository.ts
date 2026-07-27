import { MaintenanceLog } from '../../domain/maintenance-log';

export interface ListMaintenanceLogsParams {
  droneId: string;
  page: number;
  pageSize: number;
}

export interface MaintenanceLogRepository {
  save(log: MaintenanceLog): Promise<void>;
  listByDrone(
    params: ListMaintenanceLogsParams,
  ): Promise<{ items: MaintenanceLog[]; total: number }>;
}

export const MAINTENANCE_LOG_REPOSITORY = Symbol('MaintenanceLogRepository');
