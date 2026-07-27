import { Drone } from '../domain/drone';
import { DuplicateSerialNumberError } from '../domain/drone.errors';
import { SerialNumber } from '../domain/serial-number';
import { DroneRepository } from './ports/drone.repository';
import { RegisterDroneUseCase } from './register-drone.use-case';

describe('RegisterDroneUseCase', () => {
  const ids = { generate: () => 'fixed-id' };
  const clock = { now: () => new Date('2026-01-01T00:00:00Z') };

  const fakeRepo = (): jest.Mocked<DroneRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findByIdForUpdate: jest.fn(),
    findBySerialNumber: jest.fn().mockResolvedValue(null),
    list: jest.fn(),
  });

  it('registers a new drone as AVAILABLE with zero flight hours', async () => {
    const drones = fakeRepo();
    const useCase = new RegisterDroneUseCase(drones, ids, clock);

    const drone = await useCase.execute({ serialNumber: 'sky-1a2b-3c4d', model: 'PHANTOM_4' });

    expect(drone.serialNumber.value).toBe('SKY-1A2B-3C4D');
    expect(drone.status).toBe('AVAILABLE');
    expect(drone.totalFlightHours).toBe(0);
    expect(drones.save).toHaveBeenCalledWith(expect.any(Drone));
  });

  it('rejects a duplicate serial number and does not save', async () => {
    const drones = fakeRepo();
    drones.findBySerialNumber.mockResolvedValue(
      Drone.register({
        id: 'existing',
        serialNumber: SerialNumber.create('SKY-1A2B-3C4D'),
        model: 'PHANTOM_4',
        registeredAt: new Date(),
      }),
    );
    const useCase = new RegisterDroneUseCase(drones, ids, clock);

    await expect(
      useCase.execute({ serialNumber: 'SKY-1A2B-3C4D', model: 'PHANTOM_4' }),
    ).rejects.toBeInstanceOf(DuplicateSerialNumberError);
    expect(drones.save).not.toHaveBeenCalled();
  });
});
