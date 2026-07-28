import { DroneRepository } from '../../drones/application/ports/drone.repository';
import { Drone } from '../../drones/domain/drone';
import { DroneNotFoundError, DroneUnavailableError } from '../../drones/domain/drone.errors';
import { SerialNumber } from '../../drones/domain/serial-number';
import { MaintenanceLogRepository } from './ports/maintenance-log.repository';
import { ListMaintenanceLogsUseCase } from './list-maintenance-logs.use-case';
import { StartMaintenanceUseCase } from './start-maintenance.use-case';

describe('maintenance query use cases', () => {
  const aDrone = (): Drone =>
    Drone.register({
      id: 'd1',
      serialNumber: SerialNumber.create('SKY-1A2B-3C4D'),
      model: 'PHANTOM_4',
      registeredAt: new Date('2026-01-01T00:00:00Z'),
    });

  const droneRepo = (found: Drone | null): jest.Mocked<DroneRepository> => ({
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(found),
    findByIdForUpdate: jest.fn(),
    findBySerialNumber: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
  });

  describe('StartMaintenanceUseCase', () => {
    it('moves an available drone into maintenance', async () => {
      const drone = aDrone();
      const drones = droneRepo(drone);

      const result = await new StartMaintenanceUseCase(drones).execute('d1');

      expect(result.status).toBe('MAINTENANCE');
      expect(drones.save).toHaveBeenCalledWith(drone);
    });

    it('rejects a drone that is not available', async () => {
      const drone = aDrone();
      drone.assignToMission();
      const drones = droneRepo(drone);

      await expect(new StartMaintenanceUseCase(drones).execute('d1')).rejects.toBeInstanceOf(
        DroneUnavailableError,
      );
      expect(drones.save).not.toHaveBeenCalled();
    });

    it('throws when the drone is missing', async () => {
      await expect(
        new StartMaintenanceUseCase(droneRepo(null)).execute('d1'),
      ).rejects.toBeInstanceOf(DroneNotFoundError);
    });
  });

  describe('ListMaintenanceLogsUseCase', () => {
    it('applies pagination defaults for a drone', async () => {
      const logs: jest.Mocked<MaintenanceLogRepository> = {
        save: jest.fn(),
        listByDrone: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      };

      const page = await new ListMaintenanceLogsUseCase(logs).execute({ droneId: 'd1' });

      expect(logs.listByDrone).toHaveBeenCalledWith({ droneId: 'd1', page: 1, pageSize: 20 });
      expect(page.total).toBe(0);
    });
  });
});
