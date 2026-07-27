import { DomainError } from '../../shared/domain/domain-error';

export class InvalidSerialNumberError extends DomainError {
  readonly kind = 'validation';

  constructor(raw: string) {
    super(`Invalid serial number: "${raw}" (expected SKY-XXXX-XXXX, alphanumeric)`);
    this.name = 'InvalidSerialNumberError';
  }
}

export class DroneNotFoundError extends DomainError {
  readonly kind = 'not-found';

  constructor(id: string) {
    super(`Drone not found: ${id}`);
    this.name = 'DroneNotFoundError';
  }
}

export class DuplicateSerialNumberError extends DomainError {
  readonly kind = 'conflict';

  constructor(serialNumber: string) {
    super(`A drone with serial number ${serialNumber} already exists`);
    this.name = 'DuplicateSerialNumberError';
  }
}

export class DroneAlreadyRetiredError extends DomainError {
  readonly kind = 'conflict';

  constructor(id: string) {
    super(`Drone ${id} is already retired`);
    this.name = 'DroneAlreadyRetiredError';
  }
}

export class DroneHasScheduledMissionsError extends DomainError {
  readonly kind = 'conflict';

  constructor(
    id: string,
    readonly missionIds: string[],
  ) {
    super(`Drone ${id} cannot be retired: it has scheduled missions ${missionIds.join(', ')}`);
    this.name = 'DroneHasScheduledMissionsError';
  }
}
