import { MissionStatus } from '@skyops/contracts';

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: MissionStatus,
    readonly to: MissionStatus,
  ) {
    super(`Illegal mission transition: ${from} -> ${to}`);
    this.name = 'IllegalTransitionError';
  }
}

export class InvalidTimeWindowError extends Error {
  constructor(start: Date, end: Date) {
    super(`Invalid time window: end ${end.toISOString()} must be after start ${start.toISOString()}`);
    this.name = 'InvalidTimeWindowError';
  }
}

export class MissionInPastError extends Error {
  constructor(start: Date) {
    super(`Mission cannot be scheduled in the past: ${start.toISOString()}`);
    this.name = 'MissionInPastError';
  }
}

export class MissionOverlapError extends Error {
  constructor() {
    super('Mission overlaps an existing mission for this drone');
    this.name = 'MissionOverlapError';
  }
}
