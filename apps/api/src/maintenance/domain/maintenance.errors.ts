import { DomainError } from '../../shared/domain/domain-error';

export class MaintenanceFlightHoursMismatchError extends DomainError {
  readonly kind = 'validation';

  constructor(recorded: number, actual: number) {
    super(
      `Recorded flight hours ${recorded} are inconsistent with the drone's total ${actual}`,
    );
    this.name = 'MaintenanceFlightHoursMismatchError';
  }
}

export class MaintenanceInFutureError extends DomainError {
  readonly kind = 'validation';

  constructor(performedAt: Date) {
    super(`Maintenance cannot be performed in the future: ${performedAt.toISOString()}`);
    this.name = 'MaintenanceInFutureError';
  }
}
