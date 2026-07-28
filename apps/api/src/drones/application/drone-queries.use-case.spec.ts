import { Drone } from '../domain/drone';
import { DroneNotFoundError } from '../domain/drone.errors';
import { SerialNumber } from '../domain/serial-number';
import { DroneRepository } from './ports/drone.repository';
import { DeleteDroneUseCase } from './delete-drone.use-case';
import { GetDroneUseCase } from './get-drone.use-case';
import { ListDronesUseCase } from './list-drones.use-case';
import { UpdateDroneUseCase } from './update-drone.use-case';

describe('drone query and CRUD use cases', () => {
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
    list: jest.fn().mockResolvedValue({ items: found ? [found] : [], total: found ? 1 : 0 }),
    delete: jest.fn(),
  });

  describe('GetDroneUseCase', () => {
    it('returns the drone', async () => {
      const drone = aDrone();
      await expect(new GetDroneUseCase(repo(drone)).execute('d1')).resolves.toBe(drone);
    });

    it('throws when the drone is missing', async () => {
      await expect(new GetDroneUseCase(repo(null)).execute('d1')).rejects.toBeInstanceOf(
        DroneNotFoundError,
      );
    });
  });

  describe('ListDronesUseCase', () => {
    it('applies pagination defaults and omits an absent status filter', async () => {
      const drones = repo(aDrone());
      const page = await new ListDronesUseCase(drones).execute({});

      expect(drones.list).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
      expect(page.total).toBe(1);
      expect(page.page).toBe(1);
    });

    it('passes the status filter and caller paging through', async () => {
      const drones = repo(aDrone());
      await new ListDronesUseCase(drones).execute({ page: 2, pageSize: 5, status: 'RETIRED' });

      expect(drones.list).toHaveBeenCalledWith({ page: 2, pageSize: 5, status: 'RETIRED' });
    });

    it('clamps an out-of-range page size', async () => {
      const drones = repo(aDrone());
      await new ListDronesUseCase(drones).execute({ page: 0, pageSize: 5000 });

      expect(drones.list).toHaveBeenCalledWith({ page: 1, pageSize: 100 });
    });
  });

  describe('UpdateDroneUseCase', () => {
    it('changes the model and saves', async () => {
      const drone = aDrone();
      const drones = repo(drone);

      const result = await new UpdateDroneUseCase(drones).execute('d1', { model: 'MATRICE_300' });

      expect(result.model).toBe('MATRICE_300');
      expect(drones.save).toHaveBeenCalledWith(drone);
    });

    it('throws when the drone is missing', async () => {
      await expect(
        new UpdateDroneUseCase(repo(null)).execute('d1', { model: 'MATRICE_300' }),
      ).rejects.toBeInstanceOf(DroneNotFoundError);
    });
  });

  describe('DeleteDroneUseCase', () => {
    it('deletes an existing drone', async () => {
      const drones = repo(aDrone());
      await new DeleteDroneUseCase(drones).execute('d1');
      expect(drones.delete).toHaveBeenCalledWith('d1');
    });

    it('throws when the drone is missing and does not delete', async () => {
      const drones = repo(null);
      await expect(new DeleteDroneUseCase(drones).execute('d1')).rejects.toBeInstanceOf(
        DroneNotFoundError,
      );
      expect(drones.delete).not.toHaveBeenCalled();
    });
  });
});
