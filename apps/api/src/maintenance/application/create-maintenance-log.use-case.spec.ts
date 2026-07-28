import { DroneRepository } from '../../drones/application/ports/drone.repository';
import { Drone } from '../../drones/domain/drone';
import { DroneNotFoundError } from '../../drones/domain/drone.errors';
import { SerialNumber } from '../../drones/domain/serial-number';
import {
  MaintenanceFlightHoursMismatchError,
  MaintenanceInFutureError,
} from '../domain/maintenance.errors';
import { MaintenanceLogRepository } from './ports/maintenance-log.repository';
import { MaintenanceTransactionRunner } from './ports/transaction-runner';
import { CreateMaintenanceLogUseCase } from './create-maintenance-log.use-case';

describe('CreateMaintenanceLogUseCase', () => {
  const now = new Date('2026-07-01T12:00:00Z');
  const clock = { now: () => now };
  const ids = { generate: () => 'log-1' };

  const aDrone = (hours: number): Drone => {
    const drone = Drone.register({
      id: 'd1',
      serialNumber: SerialNumber.create('SKY-1A2B-3C4D'),
      model: 'PHANTOM_4',
      registeredAt: new Date('2026-01-01T00:00:00Z'),
    });
    if (hours > 0) {
      drone.assignToMission();
      drone.logCompletedMission(hours);
    }
    return drone;
  };

  const harness = (drone: Drone | null) => {
    const drones: jest.Mocked<DroneRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIdForUpdate: jest.fn().mockResolvedValue(drone),
      findBySerialNumber: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
    };
    const maintenanceLogs: jest.Mocked<MaintenanceLogRepository> = {
      save: jest.fn(),
      listByDrone: jest.fn(),
    };
    const tx: MaintenanceTransactionRunner = {
      run: (work) => work({ drones, maintenanceLogs }),
    };
    return { drones, maintenanceLogs, useCase: new CreateMaintenanceLogUseCase(tx, ids, clock) };
  };

  const input = {
    type: 'ROUTINE_CHECK' as const,
    technicianName: 'Sam Fox',
    performedAt: new Date('2026-06-30T09:00:00Z'),
    flightHoursAtMaintenance: 20,
  };

  it('records the log and resets the drone maintenance baselines', async () => {
    const drone = aDrone(20);
    const { drones, maintenanceLogs, useCase } = harness(drone);

    const log = await useCase.execute('d1', input);

    expect(log.type).toBe('ROUTINE_CHECK');
    expect(maintenanceLogs.save).toHaveBeenCalled();
    expect(drones.save).toHaveBeenCalled();
    expect(drone.lastMaintenanceAt).toEqual(input.performedAt);
    expect(drone.flightHoursAtLastMaintenance).toBe(20);
    expect(drone.status).toBe('AVAILABLE');
    expect(drone.isMaintenanceDue(now)).toBe(false);
  });

  it('accepts hours within the tolerance', async () => {
    const { useCase } = harness(aDrone(20));
    await expect(
      useCase.execute('d1', { ...input, flightHoursAtMaintenance: 20.5 }),
    ).resolves.toBeDefined();
  });

  it('rejects hours that disagree with the drone total beyond the tolerance', async () => {
    const { maintenanceLogs, useCase } = harness(aDrone(20));

    await expect(
      useCase.execute('d1', { ...input, flightHoursAtMaintenance: 99 }),
    ).rejects.toBeInstanceOf(MaintenanceFlightHoursMismatchError);
    expect(maintenanceLogs.save).not.toHaveBeenCalled();
  });

  it('rejects maintenance dated in the future', async () => {
    const { maintenanceLogs, useCase } = harness(aDrone(20));

    await expect(
      useCase.execute('d1', { ...input, performedAt: new Date('2026-08-01T09:00:00Z') }),
    ).rejects.toBeInstanceOf(MaintenanceInFutureError);
    expect(maintenanceLogs.save).not.toHaveBeenCalled();
  });

  it('rejects an unknown drone', async () => {
    const { useCase } = harness(null);
    await expect(useCase.execute('missing', input)).rejects.toBeInstanceOf(DroneNotFoundError);
  });
});
