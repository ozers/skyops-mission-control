import { DomainError } from '../../shared/domain/domain-error';

export class InvalidSerialNumberError extends DomainError {
  readonly kind = 'validation';

  constructor(raw: string) {
    super(`Invalid serial number: "${raw}" (expected SKY-XXXX-XXXX, alphanumeric)`);
    this.name = 'InvalidSerialNumberError';
  }
}
