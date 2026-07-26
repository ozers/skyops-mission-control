import { MissionStatus } from '@skyops/contracts';
import { IllegalTransitionError } from './mission.errors';

/*
 * The mission lifecycle as an explicit table. Anything not listed here is
 * illegal by default, so an invalid transition can't slip through unnoticed.
 */
const TRANSITIONS: Record<MissionStatus, readonly MissionStatus[]> = {
  PLANNED: ['PRE_FLIGHT_CHECK', 'ABORTED'],
  PRE_FLIGHT_CHECK: ['IN_PROGRESS', 'ABORTED'],
  IN_PROGRESS: ['COMPLETED', 'ABORTED'],
  COMPLETED: [],
  ABORTED: [],
};

export function canTransition(from: MissionStatus, to: MissionStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertCanTransition(from: MissionStatus, to: MissionStatus): void {
  if (!canTransition(from, to)) {
    throw new IllegalTransitionError(from, to);
  }
}
