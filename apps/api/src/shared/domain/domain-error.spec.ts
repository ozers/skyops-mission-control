import { DomainError } from './domain-error';
import {
  IllegalTransitionError,
  InvalidTimeWindowError,
  MissionInPastError,
  MissionOverlapError,
} from '../../missions/domain/mission.errors';
import { InvalidSerialNumberError } from '../../drones/domain/drone.errors';

const at = (iso: string): Date => new Date(iso);

describe('DomainError', () => {
  const cases: ReadonlyArray<[DomainError, string]> = [
    [new IllegalTransitionError('COMPLETED', 'IN_PROGRESS'), 'conflict'],
    [new MissionOverlapError(), 'conflict'],
    [new MissionInPastError(at('2026-01-01T00:00:00Z')), 'validation'],
    [new InvalidTimeWindowError(at('2026-01-01T02:00:00Z'), at('2026-01-01T01:00:00Z')), 'validation'],
    [new InvalidSerialNumberError('bad'), 'validation'],
  ];

  it.each(cases)('%s is a DomainError carrying its kind', (error, kind) => {
    expect(error).toBeInstanceOf(DomainError);
    expect(error.kind).toBe(kind);
  });
});
