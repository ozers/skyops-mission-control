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
});
