import { TimeWindow } from './time-window';
import { InvalidTimeWindowError } from './mission.errors';

const at = (iso: string): Date => new Date(iso);

describe('TimeWindow', () => {
  it('creates a valid window', () => {
    const w = TimeWindow.create(at('2026-01-01T10:00:00Z'), at('2026-01-01T12:00:00Z'));
    expect(w.start).toEqual(at('2026-01-01T10:00:00Z'));
    expect(w.end).toEqual(at('2026-01-01T12:00:00Z'));
  });

  it('rejects an end at or before the start', () => {
    expect(() => TimeWindow.create(at('2026-01-01T12:00:00Z'), at('2026-01-01T12:00:00Z'))).toThrow(
      InvalidTimeWindowError,
    );
    expect(() => TimeWindow.create(at('2026-01-01T12:00:00Z'), at('2026-01-01T10:00:00Z'))).toThrow(
      InvalidTimeWindowError,
    );
  });

  describe('overlaps', () => {
    const base = TimeWindow.create(at('2026-01-01T10:00:00Z'), at('2026-01-01T12:00:00Z'));

    it('is true when the ranges intersect', () => {
      const other = TimeWindow.create(at('2026-01-01T11:00:00Z'), at('2026-01-01T13:00:00Z'));
      expect(base.overlaps(other)).toBe(true);
    });

    it('is false when the ranges are disjoint', () => {
      const other = TimeWindow.create(at('2026-01-01T13:00:00Z'), at('2026-01-01T14:00:00Z'));
      expect(base.overlaps(other)).toBe(false);
    });

    it('is false when the ranges only touch at the boundary', () => {
      const other = TimeWindow.create(at('2026-01-01T12:00:00Z'), at('2026-01-01T13:00:00Z'));
      expect(base.overlaps(other)).toBe(false);
    });
  });
});
