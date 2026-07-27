import { Drone } from './drone';
import { DroneAlreadyRetiredError, DroneUnavailableError } from './drone.errors';
import { SerialNumber } from './serial-number';

const register = (): Drone =>
  Drone.register({
    id: 'd1',
    serialNumber: SerialNumber.create('SKY-1A2B-3C4D'),
    model: 'PHANTOM_4',
    registeredAt: new Date('2026-01-01T00:00:00Z'),
  });

describe('Drone', () => {
  it('registers as AVAILABLE with zero hours and a next-maintenance date 90 days out', () => {
    const drone = register();
    expect(drone.status).toBe('AVAILABLE');
    expect(drone.totalFlightHours).toBe(0);
    expect(drone.nextMaintenanceDueAt).toEqual(new Date('2026-04-01T00:00:00Z'));
  });

  it('retires an available drone', () => {
    const drone = register();
    drone.retire();
    expect(drone.status).toBe('RETIRED');
  });

  it('rejects retiring an already retired drone', () => {
    const drone = register();
    drone.retire();
    expect(() => drone.retire()).toThrow(DroneAlreadyRetiredError);
  });

  it('assigns an available drone to a mission', () => {
    const drone = register();
    drone.assignToMission();
    expect(drone.status).toBe('IN_MISSION');
  });

  it('rejects assigning a non-available drone', () => {
    const drone = register();
    drone.retire();
    expect(() => drone.assignToMission()).toThrow(DroneUnavailableError);
  });

  it('banks flight hours and frees the drone when a mission completes', () => {
    const drone = register();
    drone.assignToMission();
    drone.logCompletedMission(5);
    expect(drone.status).toBe('AVAILABLE');
    expect(drone.totalFlightHours).toBe(5);
  });

  it('starts maintenance from AVAILABLE', () => {
    const drone = register();
    drone.startMaintenance();
    expect(drone.status).toBe('MAINTENANCE');
  });

  it('completing maintenance resets tracking dates and frees the drone', () => {
    const drone = register();
    drone.startMaintenance();
    drone.completeMaintenance(new Date('2026-07-01T00:00:00Z'));
    expect(drone.status).toBe('AVAILABLE');
    expect(drone.lastMaintenanceAt).toEqual(new Date('2026-07-01T00:00:00Z'));
    expect(drone.nextMaintenanceDueAt).toEqual(new Date('2026-09-29T00:00:00Z'));
  });

  describe('isMaintenanceDue', () => {
    it('is not due for a fresh drone within 90 days and under 50 hours', () => {
      const drone = register();
      expect(drone.isMaintenanceDue(new Date('2026-01-02T00:00:00Z'))).toBe(false);
    });

    it('is due after 50 flight hours since the last service', () => {
      const drone = register();
      drone.assignToMission();
      drone.logCompletedMission(50);
      expect(drone.isMaintenanceDue(new Date('2026-01-02T00:00:00Z'))).toBe(true);
    });

    it('is due after 90 days', () => {
      const drone = register();
      expect(drone.isMaintenanceDue(new Date('2026-05-01T00:00:00Z'))).toBe(true);
    });
  });
});
