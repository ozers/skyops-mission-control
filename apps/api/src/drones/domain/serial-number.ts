import { InvalidSerialNumberError } from './drone.errors';

const SERIAL_PATTERN = /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/*
 * Value object for a drone serial. Validates and normalizes on creation, so an
 * invalid serial can't exist in the domain; equality is by value, not identity.
 */
export class SerialNumber {
  private constructor(readonly value: string) {}

  static create(raw: string): SerialNumber {
    const normalized = raw.trim().toUpperCase();
    if (!SERIAL_PATTERN.test(normalized)) {
      throw new InvalidSerialNumberError(raw);
    }
    return new SerialNumber(normalized);
  }

  equals(other: SerialNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
