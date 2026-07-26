import { MissionStatus } from '@skyops/contracts';
import { canTransition, assertCanTransition } from './mission-state-machine';
import { IllegalTransitionError } from './mission.errors';

describe('mission state machine', () => {
  const legal: ReadonlyArray<[MissionStatus, MissionStatus]> = [
    ['PLANNED', 'PRE_FLIGHT_CHECK'],
    ['PRE_FLIGHT_CHECK', 'IN_PROGRESS'],
    ['IN_PROGRESS', 'COMPLETED'],
    ['PLANNED', 'ABORTED'],
    ['PRE_FLIGHT_CHECK', 'ABORTED'],
    ['IN_PROGRESS', 'ABORTED'],
  ];

  const illegal: ReadonlyArray<[MissionStatus, MissionStatus]> = [
    ['PLANNED', 'IN_PROGRESS'],
    ['PLANNED', 'COMPLETED'],
    ['COMPLETED', 'IN_PROGRESS'],
    ['COMPLETED', 'ABORTED'],
    ['ABORTED', 'PLANNED'],
    ['IN_PROGRESS', 'PLANNED'],
  ];

  it.each(legal)('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(() => assertCanTransition(from, to)).not.toThrow();
  });

  it.each(illegal)('rejects %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
    expect(() => assertCanTransition(from, to)).toThrow(IllegalTransitionError);
  });
});
