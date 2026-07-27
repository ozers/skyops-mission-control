import { MissionStatus } from '@skyops/contracts';
import { DomainError } from '../../shared/domain/domain-error';

export class IllegalTransitionError extends DomainError {
  readonly kind = 'conflict';

  constructor(
    readonly from: MissionStatus,
    readonly to: MissionStatus,
  ) {
    super(`Illegal mission transition: ${from} -> ${to}`);
    this.name = 'IllegalTransitionError';
  }
}

export class InvalidTimeWindowError extends DomainError {
  readonly kind = 'validation';

  constructor(start: Date, end: Date) {
    super(`Invalid time window: end ${end.toISOString()} must be after start ${start.toISOString()}`);
    this.name = 'InvalidTimeWindowError';
  }
}

export class MissionInPastError extends DomainError {
  readonly kind = 'validation';

  constructor(start: Date) {
    super(`Mission cannot be scheduled in the past: ${start.toISOString()}`);
    this.name = 'MissionInPastError';
  }
}

export class MissionOverlapError extends DomainError {
  readonly kind = 'conflict';

  constructor() {
    super('Mission overlaps an existing mission for this drone');
    this.name = 'MissionOverlapError';
  }
}

export class MissionDroneNotAvailableError extends DomainError {
  readonly kind = 'conflict';

  constructor(droneId: string, status: string) {
    super(`Drone ${droneId} is not available for a mission (status: ${status})`);
    this.name = 'MissionDroneNotAvailableError';
  }
}
