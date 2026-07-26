export class InvalidSerialNumberError extends Error {
  constructor(raw: string) {
    super(`Invalid serial number: "${raw}" (expected SKY-XXXX-XXXX, alphanumeric)`);
    this.name = 'InvalidSerialNumberError';
  }
}
