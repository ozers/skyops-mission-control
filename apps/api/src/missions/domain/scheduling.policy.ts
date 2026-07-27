import { MissionInPastError, MissionOverlapError } from './mission.errors';
import { TimeWindow } from './time-window';

/*
 * Scheduling rules checked before a mission is created. The overlap check is
 * also enforced by a DB exclusion constraint (see ADR-3); this layer gives a
 * clean domain error instead of a raw constraint violation.
 */
export const SchedulingPolicy = {
  assertSchedulable(window: TimeWindow, now: Date): void {
    if (window.start.getTime() < now.getTime()) {
      throw new MissionInPastError(window.start);
    }
  },

  assertNoOverlap(candidate: TimeWindow, existing: readonly TimeWindow[]): void {
    if (existing.some((w) => candidate.overlaps(w))) {
      throw new MissionOverlapError();
    }
  },
};
