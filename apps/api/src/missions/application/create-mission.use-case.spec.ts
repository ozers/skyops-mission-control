import { DroneRepository } from '../../drones/application/ports/drone.repository';
import { Drone } from '../../drones/domain/drone';
import { DroneNotFoundError } from '../../drones/domain/drone.errors';
import { SerialNumber } from '../../drones/domain/serial-number';
import { MissionDroneNotAvailableError, MissionInPastError } from '../domain/mission.errors';
import { MissionRepository } from './ports/mission.repository';
import { CreateMissionUseCase } from './create-mission.use-case';

describe('CreateMissionUseCase', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  const clock = { now: () => now };
  const ids = { generate: () => 'm1' };

  const availableDrone = (): Drone =>
    Drone.register({
      id: 'd1',
      serialNumber: SerialNumber.create('SKY-1A2B-3C4D'),
      model: 'PHANTOM_4',
      registeredAt: now,
    });

  const missionRepo = (): jest.Mocked<MissionRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findByIdForUpdate: jest.fn(),
    list: jest.fn(),
  });

  const droneRepo = (found: Drone | null): jest.Mocked<DroneRepository> => ({
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(found),
    findByIdForUpdate: jest.fn(),
    findBySerialNumber: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
  });

  const input = {
    name: 'Turbine A',
    type: 'WIND_TURBINE_INSPECTION' as const,
    droneId: 'd1',
    pilotName: 'Jane',
    siteLocation: 'North-3',
    scheduledStart: new Date('2026-05-01T10:00:00Z'),
    scheduledEnd: new Date('2026-05-01T12:00:00Z'),
  };

  it('schedules a PLANNED mission for an available drone', async () => {
    const missions = missionRepo();
    const useCase = new CreateMissionUseCase(missions, droneRepo(availableDrone()), ids, clock);

    const mission = await useCase.execute(input);

    expect(mission.status).toBe('PLANNED');
    expect(mission.droneId).toBe('d1');
    expect(missions.save).toHaveBeenCalled();
  });

  it('rejects a window in the past', async () => {
    const missions = missionRepo();
    const useCase = new CreateMissionUseCase(missions, droneRepo(availableDrone()), ids, clock);

    await expect(
      useCase.execute({
        ...input,
        scheduledStart: new Date('2025-01-01T10:00:00Z'),
        scheduledEnd: new Date('2025-01-01T12:00:00Z'),
      }),
    ).rejects.toBeInstanceOf(MissionInPastError);
    expect(missions.save).not.toHaveBeenCalled();
  });

  it('rejects when the drone does not exist', async () => {
    const useCase = new CreateMissionUseCase(missionRepo(), droneRepo(null), ids, clock);
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(DroneNotFoundError);
  });

  it('rejects when the drone is not AVAILABLE', async () => {
    const drone = availableDrone();
    drone.retire();
    const missions = missionRepo();
    const useCase = new CreateMissionUseCase(missions, droneRepo(drone), ids, clock);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(MissionDroneNotAvailableError);
    expect(missions.save).not.toHaveBeenCalled();
  });
});
