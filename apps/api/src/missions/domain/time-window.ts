import { InvalidTimeWindowError } from './mission.errors';

/*
 * A half-open time interval [start, end). Touching windows (one ends exactly
 * when the next starts) do not overlap.
 */
export class TimeWindow {
  private constructor(
    readonly start: Date,
    readonly end: Date,
  ) {}

  static create(start: Date, end: Date): TimeWindow {
    if (end.getTime() <= start.getTime()) {
      throw new InvalidTimeWindowError(start, end);
    }
    return new TimeWindow(start, end);
  }

  overlaps(other: TimeWindow): boolean {
    return this.start.getTime() < other.end.getTime() && other.start.getTime() < this.end.getTime();
  }
}
