import { Repository } from 'typeorm';
import { Drone } from '../domain/drone';
import { SerialNumber } from '../domain/serial-number';
import { DroneRepository } from '../application/ports/drone.repository';
import { DroneEntity } from './drone.entity';
import { DroneMapper } from './drone.mapper';

export class TypeOrmDroneRepository implements DroneRepository {
  constructor(private readonly repository: Repository<DroneEntity>) {}

  async save(drone: Drone): Promise<void> {
    await this.repository.save(DroneMapper.toEntity(drone));
  }

  async findById(id: string): Promise<Drone | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? DroneMapper.toDomain(entity) : null;
  }

  async findBySerialNumber(serialNumber: SerialNumber): Promise<Drone | null> {
    const entity = await this.repository.findOne({
      where: { serialNumber: serialNumber.value },
    });
    return entity ? DroneMapper.toDomain(entity) : null;
  }
}
