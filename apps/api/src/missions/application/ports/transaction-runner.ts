import { DroneRepository } from '../../../drones/application/ports/drone.repository';
import { MissionRepository } from './mission.repository';

export interface TransactionalRepositories {
  missions: MissionRepository;
  drones: DroneRepository;
}

/*
 * Runs a unit of work in one database transaction, handing the callback repos
 * bound to that transaction so their FOR UPDATE locks and writes are atomic.
 */
export interface TransactionRunner {
  run<T>(work: (repos: TransactionalRepositories) => Promise<T>): Promise<T>;
}

export const TRANSACTION_RUNNER = Symbol('TransactionRunner');
