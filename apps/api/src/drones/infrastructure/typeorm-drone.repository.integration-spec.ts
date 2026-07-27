import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { createTestDataSource, truncateAll } from '../../../test/integration/database';
import { Drone } from '../domain/drone';
import { SerialNumber } from '../domain/serial-number';
import { DroneRepository } from '../application/ports/drone.repository';
import { DroneEntity } from './drone.entity';
import { TypeOrmDroneRepository } from './typeorm-drone.repository';

describe('TypeOrmDroneRepository (integration)', () => {
  let dataSource: DataSource;
  let repository: DroneRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repository = new TypeOrmDroneRepository(dataSource.getRepository(DroneEntity));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateAll(dataSource);
  });

  const newDrone = (serial: string): Drone =>
    Drone.register({
      id: randomUUID(),
      serialNumber: SerialNumber.create(serial),
      model: 'PHANTOM_4',
      registeredAt: new Date('2026-01-01T00:00:00Z'),
    });

  it('round-trips a registered drone by id', async () => {
    const drone = newDrone('SKY-1A2B-3C4D');
    await repository.save(drone);

    const found = await repository.findById(drone.id);
    expect(found).not.toBeNull();
    expect(found?.serialNumber.value).toBe('SKY-1A2B-3C4D');
    expect(found?.model).toBe('PHANTOM_4');
    expect(found?.status).toBe('AVAILABLE');
    expect(found?.totalFlightHours).toBe(0);
  });

  it('finds a drone by serial number', async () => {
    const drone = newDrone('SKY-9Z8Y-7X6W');
    await repository.save(drone);

    const found = await repository.findBySerialNumber(SerialNumber.create('sky-9z8y-7x6w'));
    expect(found?.id).toBe(drone.id);
  });

  it('returns null when a drone is not found', async () => {
    expect(await repository.findById(randomUUID())).toBeNull();
  });
});
