import { SerialNumber } from './serial-number';
import { InvalidSerialNumberError } from './drone.errors';

describe('SerialNumber', () => {
  it('accepts a valid SKY-XXXX-XXXX serial', () => {
    expect(SerialNumber.create('SKY-1A2B-3C4D').value).toBe('SKY-1A2B-3C4D');
  });

  it('normalizes lowercase input to uppercase', () => {
    expect(SerialNumber.create('sky-1a2b-3c4d').value).toBe('SKY-1A2B-3C4D');
  });

  it('trims surrounding whitespace', () => {
    expect(SerialNumber.create('  SKY-1A2B-3C4D  ').value).toBe('SKY-1A2B-3C4D');
  });

  it('compares by value', () => {
    expect(SerialNumber.create('SKY-1A2B-3C4D').equals(SerialNumber.create('sky-1a2b-3c4d'))).toBe(
      true,
    );
  });

  it.each([
    'ABC-1A2B-3C4D',
    'SKY-1A2-3C4D',
    'SKY-1A2B-3C4',
    'SKY-1A2B3C4D',
    'SKY-1A2B-3C4!',
    'SKY_1A2B_3C4D',
    '',
  ])('rejects invalid serial %p', (raw) => {
    expect(() => SerialNumber.create(raw)).toThrow(InvalidSerialNumberError);
  });
});
