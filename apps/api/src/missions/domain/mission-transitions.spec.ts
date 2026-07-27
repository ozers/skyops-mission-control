import { Mission } from './mission';
import {
  IllegalTransitionError,
  MissionAbortReasonRequiredError,
  MissionFlightHoursRequiredError,
} from './mission.errors';
import { TimeWindow } from './time-window';

const scheduled = (): Mission =>
  Mission.schedule({
    id: 'm1',
    name: 'Turbine A',
    type: 'WIND_TURBINE_INSPECTION',
    droneId: 'd1',
    pilotName: 'Jane',
    siteLocation: 'North-3',
    window: TimeWindow.create(new Date('2030-01-01T10:00:00Z'), new Date('2030-01-01T12:00:00Z')),
  });

describe('Mission transitions', () => {
  it('walks the full lifecycle', () => {
    const mission = scheduled();
    mission.beginPreFlight();
    expect(mission.status).toBe('PRE_FLIGHT_CHECK');

    mission.start(new Date('2030-01-01T10:00:00Z'));
    expect(mission.status).toBe('IN_PROGRESS');
    expect(mission.actualStart).toEqual(new Date('2030-01-01T10:00:00Z'));

    mission.complete(new Date('2030-01-01T12:00:00Z'), 2);
    expect(mission.status).toBe('COMPLETED');
    expect(mission.loggedFlightHours).toBe(2);
    expect(mission.actualEnd).toEqual(new Date('2030-01-01T12:00:00Z'));
  });

  it('rejects an illegal transition (start straight from PLANNED)', () => {
    expect(() => scheduled().start(new Date())).toThrow(IllegalTransitionError);
  });

  it('requires positive flight hours to complete', () => {
    const mission = scheduled();
    mission.beginPreFlight();
    mission.start(new Date());
    expect(() => mission.complete(new Date(), 0)).toThrow(MissionFlightHoursRequiredError);
  });

  it('requires a reason to abort', () => {
    expect(() => scheduled().abort(new Date(), '')).toThrow(MissionAbortReasonRequiredError);
  });

  it('aborts from PLANNED with a reason', () => {
    const mission = scheduled();
    mission.abort(new Date('2030-01-01T09:00:00Z'), 'weather');
    expect(mission.status).toBe('ABORTED');
    expect(mission.abortReason).toBe('weather');
  });
});
