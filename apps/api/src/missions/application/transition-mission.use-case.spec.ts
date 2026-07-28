import { DroneRepository } from '../../drones/application/ports/drone.repository';
import { Drone } from '../../drones/domain/drone';
import { SerialNumber } from '../../drones/domain/serial-number';
import { Mission } from '../domain/mission';
import { IllegalTransitionError, MissionNotFoundError } from '../domain/mission.errors';
import { TimeWindow } from '../domain/time-window';
import { MissionRepository } from './ports/mission.repository';
import { TransactionRunner } from './ports/transaction-runner';
import { TransitionMissionUseCase } from './transition-mission.use-case';

describe('TransitionMissionUseCase', () => {
  const now = new Date('2026-07-01T10:00:00Z');
  const clock = { now: () => now };

  const aMission = (): Mission =>
    Mission.schedule({
      id: 'm1',
      name: 'Turbine A',
      type: 'WIND_TURBINE_INSPECTION',
      droneId: 'd1',
      pilotName: 'Jane',
      siteLocation: 'North-3',
      window: TimeWindow.create(new Date('2030-01-01T10:00:00Z'), new Date('2030-01-01T12:00:00Z')),
    });

  const aDrone = (): Drone =>
    Drone.register({
      id: 'd1',
      serialNumber: SerialNumber.create('SKY-1A2B-3C4D'),
      model: 'PHANTOM_4',
      registeredAt: new Date('2026-01-01T00:00:00Z'),
    });

  const harness = (mission: Mission | null, drone: Drone | null) => {
    const missions: jest.Mocked<MissionRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIdForUpdate: jest.fn().mockResolvedValue(mission),
      list: jest.fn(),
    };
    const drones: jest.Mocked<DroneRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByIdForUpdate: jest.fn().mockResolvedValue(drone),
      findBySerialNumber: jest.fn(),
      list: jest.fn(),
      delete: jest.fn(),
    };
    const tx: TransactionRunner = { run: (work) => work({ missions, drones }) };
    return { missions, drones, useCase: new TransitionMissionUseCase(tx, clock) };
  };

  it('starting a mission puts the drone in the air and stamps the actual start', async () => {
    const mission = aMission();
    mission.beginPreFlight();
    const drone = aDrone();
    const { drones, useCase } = harness(mission, drone);

    const result = await useCase.execute('m1', { to: 'IN_PROGRESS' });

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.actualStart).toEqual(now);
    expect(drone.status).toBe('IN_MISSION');
    expect(drones.save).toHaveBeenCalled();
  });

  it('completing a mission banks the flight hours and frees the drone', async () => {
    const mission = aMission();
    mission.beginPreFlight();
    mission.start(now);
    const drone = aDrone();
    drone.assignToMission();
    const { useCase } = harness(mission, drone);

    const result = await useCase.execute('m1', { to: 'COMPLETED', flightHoursLogged: 3 });

    expect(result.status).toBe('COMPLETED');
    expect(result.loggedFlightHours).toBe(3);
    expect(drone.totalFlightHours).toBe(3);
    expect(drone.status).toBe('AVAILABLE');
  });

  it('aborting an in-flight mission releases the drone and records the reason', async () => {
    const mission = aMission();
    mission.beginPreFlight();
    mission.start(now);
    const drone = aDrone();
    drone.assignToMission();
    const { useCase } = harness(mission, drone);

    const result = await useCase.execute('m1', { to: 'ABORTED', abortReason: 'weather' });

    expect(result.status).toBe('ABORTED');
    expect(result.abortReason).toBe('weather');
    expect(drone.status).toBe('AVAILABLE');
  });

  it('rejects an illegal transition and leaves the mission untouched', async () => {
    const mission = aMission();
    const { missions, useCase } = harness(mission, aDrone());

    await expect(
      useCase.execute('m1', { to: 'COMPLETED', flightHoursLogged: 1 }),
    ).rejects.toBeInstanceOf(IllegalTransitionError);
    expect(missions.save).not.toHaveBeenCalled();
    expect(mission.status).toBe('PLANNED');
  });

  it('throws when the mission does not exist', async () => {
    const { useCase } = harness(null, aDrone());
    await expect(useCase.execute('missing', { to: 'PRE_FLIGHT_CHECK' })).rejects.toBeInstanceOf(
      MissionNotFoundError,
    );
  });
});
