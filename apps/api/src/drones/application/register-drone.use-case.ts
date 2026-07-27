import { DroneModel } from '@skyops/contracts';
import { Clock } from '../../shared/application/clock';
import { IdGenerator } from '../../shared/application/id-generator';
import { Drone } from '../domain/drone';
import { DuplicateSerialNumberError } from '../domain/drone.errors';
import { SerialNumber } from '../domain/serial-number';
import { DroneRepository } from './ports/drone.repository';

export interface RegisterDroneInput {
  serialNumber: string;
  model: DroneModel;
}

export class RegisterDroneUseCase {
  constructor(
    private readonly drones: DroneRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(input: RegisterDroneInput): Promise<Drone> {
    const serialNumber = SerialNumber.create(input.serialNumber);

    if (await this.drones.findBySerialNumber(serialNumber)) {
      throw new DuplicateSerialNumberError(serialNumber.value);
    }

    const drone = Drone.register({
      id: this.ids.generate(),
      serialNumber,
      model: input.model,
      registeredAt: this.clock.now(),
    });
    await this.drones.save(drone);
    return drone;
  }
}
