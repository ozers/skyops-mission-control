import { DroneRepository } from '../../../drones/application/ports/drone.repository';
import { MaintenanceLogRepository } from './maintenance-log.repository';

export interface MaintenanceTransactionRepositories {
  drones: DroneRepository;
  maintenanceLogs: MaintenanceLogRepository;
}

/* Runs drone + maintenance-log writes in one transaction. */
export interface MaintenanceTransactionRunner {
  run<T>(work: (repos: MaintenanceTransactionRepositories) => Promise<T>): Promise<T>;
}

export const MAINTENANCE_TRANSACTION_RUNNER = Symbol('MaintenanceTransactionRunner');
