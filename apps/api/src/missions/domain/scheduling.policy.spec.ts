import { TimeWindow } from './time-window';
import { SchedulingPolicy } from './scheduling.policy';
import { MissionInPastError, MissionOverlapError } from './mission.errors';

const at = (iso: string): Date => new Date(iso);

describe('SchedulingPolicy', () => {
  const now = at('2026-01-01T09:00:00Z');
  const window = TimeWindow.create(at('2026-01-01T10:00:00Z'), at('2026-01-01T12:00:00Z'));

  describe('assertSchedulable', () => {
    it('allows a window starting now or later', () => {
      expect(() => SchedulingPolicy.assertSchedulable(window, now)).not.toThrow();
    });

    it('rejects a window starting in the past', () => {
      const past = TimeWindow.create(at('2026-01-01T08:00:00Z'), at('2026-01-01T08:30:00Z'));
      expect(() => SchedulingPolicy.assertSchedulable(past, now)).toThrow(MissionInPastError);
    });
  });

  describe('assertNoOverlap', () => {
    const existing = [TimeWindow.create(at('2026-01-01T13:00:00Z'), at('2026-01-01T14:00:00Z'))];

    it('allows a non-overlapping window', () => {
      expect(() => SchedulingPolicy.assertNoOverlap(window, existing)).not.toThrow();
    });

    it('rejects a window overlapping an existing mission', () => {
      const clash = TimeWindow.create(at('2026-01-01T13:30:00Z'), at('2026-01-01T15:00:00Z'));
      expect(() => SchedulingPolicy.assertNoOverlap(clash, existing)).toThrow(MissionOverlapError);
    });
  });
});
