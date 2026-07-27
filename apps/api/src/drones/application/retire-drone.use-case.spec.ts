import { Drone } from '../domain/drone';
import { DroneHasScheduledMissionsError, DroneNotFoundError } from '../domain/drone.errors';
import { SerialNumber } from '../domain/serial-number';
import { DroneRepository } from './ports/drone.repository';
import { ScheduledMissionsPort } from './ports/scheduled-missions.port';
import { RetireDroneUseCase } from './retire-drone.use-case';

describe('RetireDroneUseCase', () => {
  const aDrone = (): Drone =>
    Drone.register({
      id: 'd1',
      serialNumber: SerialNumber.create('SKY-1A2B-3C4D'),
      model: 'PHANTOM_4',
      registeredAt: new Date('2026-01-01T00:00:00Z'),
    });

  const repo = (found: Drone | null): jest.Mocked<DroneRepository> => ({
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(found),
    findByIdForUpdate: jest.fn(),
    findBySerialNumber: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
  });

  const scheduled = (ids: string[]): jest.Mocked<ScheduledMissionsPort> => ({
    activeMissionIdsForDrone: jest.fn().mockResolvedValue(ids),
  });

  it('retires a drone with no active missions', async () => {
    const drones = repo(aDrone());
    const useCase = new RetireDroneUseCase(drones, scheduled([]));

    const result = await useCase.execute('d1');

    expect(result.status).toBe('RETIRED');
    expect(drones.save).toHaveBeenCalled();
  });

  it('rejects retiring a drone with active missions and does not save', async () => {
    const drones = repo(aDrone());
    const useCase = new RetireDroneUseCase(drones, scheduled(['m1', 'm2']));

    await expect(useCase.execute('d1')).rejects.toBeInstanceOf(DroneHasScheduledMissionsError);
    expect(drones.save).not.toHaveBeenCalled();
  });

  it('throws when the drone does not exist', async () => {
    const useCase = new RetireDroneUseCase(repo(null), scheduled([]));
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(DroneNotFoundError);
  });
});
