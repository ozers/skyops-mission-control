import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/* Needs the Docker stack up and migrated. Future dates are used so scheduling passes. */
describe('Missions (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE drones, missions, maintenance_logs CASCADE');
  });

  const server = (): ReturnType<INestApplication['getHttpServer']> => app.getHttpServer();

  const registerDrone = async (serial = 'SKY-1A2B-3C4D'): Promise<string> => {
    const res = await request(server())
      .post('/api/v1/drones')
      .send({ serialNumber: serial, model: 'PHANTOM_4' })
      .expect(201);
    return res.body.id;
  };

  const missionBody = (droneId: string, start: string, end: string) => ({
    name: 'Turbine A',
    type: 'WIND_TURBINE_INSPECTION',
    droneId,
    pilotName: 'Jane',
    siteLocation: 'North-3',
    scheduledStart: start,
    scheduledEnd: end,
  });

  it('schedules a mission for an available drone', async () => {
    const droneId = await registerDrone();
    const res = await request(server())
      .post('/api/v1/missions')
      .send(missionBody(droneId, '2030-05-01T10:00:00Z', '2030-05-01T12:00:00Z'))
      .expect(201);
    expect(res.body.status).toBe('PLANNED');
    expect(res.body.droneId).toBe(droneId);
  });

  it('rejects an overlapping mission with 409', async () => {
    const droneId = await registerDrone();
    await request(server())
      .post('/api/v1/missions')
      .send(missionBody(droneId, '2030-05-01T10:00:00Z', '2030-05-01T12:00:00Z'))
      .expect(201);
    await request(server())
      .post('/api/v1/missions')
      .send(missionBody(droneId, '2030-05-01T11:00:00Z', '2030-05-01T13:00:00Z'))
      .expect(409);
  });

  it('rejects a window in the past with 400', async () => {
    const droneId = await registerDrone();
    await request(server())
      .post('/api/v1/missions')
      .send(missionBody(droneId, '2020-01-01T10:00:00Z', '2020-01-01T12:00:00Z'))
      .expect(400);
  });

  it('rejects an unavailable (retired) drone with 409', async () => {
    const droneId = await registerDrone();
    await request(server()).post(`/api/v1/drones/${droneId}/retire`).expect(200);
    await request(server())
      .post('/api/v1/missions')
      .send(missionBody(droneId, '2030-05-01T10:00:00Z', '2030-05-01T12:00:00Z'))
      .expect(409);
  });

  it('returns 404 for an unknown drone', async () => {
    await request(server())
      .post('/api/v1/missions')
      .send(missionBody('00000000-0000-0000-0000-000000000000', '2030-05-01T10:00:00Z', '2030-05-01T12:00:00Z'))
      .expect(404);
  });

  it('lists missions filtered by status', async () => {
    const droneId = await registerDrone();
    await request(server())
      .post('/api/v1/missions')
      .send(missionBody(droneId, '2030-05-01T10:00:00Z', '2030-05-01T12:00:00Z'))
      .expect(201);

    const planned = await request(server())
      .get('/api/v1/missions')
      .query({ status: 'PLANNED' })
      .expect(200);
    expect(planned.body.total).toBe(1);
    expect(planned.body.items[0].droneId).toBe(droneId);

    const completed = await request(server())
      .get('/api/v1/missions')
      .query({ status: 'COMPLETED' })
      .expect(200);
    expect(completed.body.total).toBe(0);
  });

  const scheduleMission = async (droneId: string): Promise<string> => {
    const res = await request(server())
      .post('/api/v1/missions')
      .send(missionBody(droneId, '2030-05-01T10:00:00Z', '2030-05-01T12:00:00Z'))
      .expect(201);
    return res.body.id;
  };

  it('drives a mission through its full lifecycle and updates the drone', async () => {
    const droneId = await registerDrone();
    const missionId = await scheduleMission(droneId);
    const transition = (body: object) =>
      request(server()).post(`/api/v1/missions/${missionId}/transitions`).send(body).expect(200);

    await transition({ to: 'PRE_FLIGHT_CHECK' });
    await transition({ to: 'IN_PROGRESS' });
    await request(server())
      .get(`/api/v1/drones/${droneId}`)
      .expect(200)
      .expect((res) => expect(res.body.status).toBe('IN_MISSION'));

    const completed = await transition({ to: 'COMPLETED', flightHoursLogged: 2.5 });
    expect(completed.body.status).toBe('COMPLETED');
    expect(completed.body.loggedFlightHours).toBe(2.5);

    await request(server())
      .get(`/api/v1/drones/${droneId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('AVAILABLE');
        expect(res.body.totalFlightHours).toBe(2.5);
      });
  });

  it('flags the drone as maintenance-due when logged hours cross the threshold', async () => {
    const droneId = await registerDrone();
    const missionId = await scheduleMission(droneId);

    await request(server())
      .get(`/api/v1/drones/${droneId}`)
      .expect(200)
      .expect((res) => expect(res.body.maintenanceDue).toBe(false));

    await request(server())
      .post(`/api/v1/missions/${missionId}/transitions`)
      .send({ to: 'PRE_FLIGHT_CHECK' })
      .expect(200);
    await request(server())
      .post(`/api/v1/missions/${missionId}/transitions`)
      .send({ to: 'IN_PROGRESS' })
      .expect(200);
    await request(server())
      .post(`/api/v1/missions/${missionId}/transitions`)
      .send({ to: 'COMPLETED', flightHoursLogged: 55 })
      .expect(200);

    await request(server())
      .get(`/api/v1/drones/${droneId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.totalFlightHours).toBe(55);
        expect(res.body.maintenanceDue).toBe(true);
      });
  });

  it('rejects an illegal transition with 409', async () => {
    const droneId = await registerDrone();
    const missionId = await scheduleMission(droneId);
    await request(server())
      .post(`/api/v1/missions/${missionId}/transitions`)
      .send({ to: 'COMPLETED', flightHoursLogged: 1 })
      .expect(409);
  });

  it('requires flight hours to complete (400)', async () => {
    const droneId = await registerDrone();
    const missionId = await scheduleMission(droneId);
    await request(server())
      .post(`/api/v1/missions/${missionId}/transitions`)
      .send({ to: 'PRE_FLIGHT_CHECK' })
      .expect(200);
    await request(server())
      .post(`/api/v1/missions/${missionId}/transitions`)
      .send({ to: 'IN_PROGRESS' })
      .expect(200);
    await request(server())
      .post(`/api/v1/missions/${missionId}/transitions`)
      .send({ to: 'COMPLETED' })
      .expect(400);
  });

  describe('concurrency', () => {
    it('lets only one of two concurrent overlapping creates win (exclusion constraint)', async () => {
      const droneId = await registerDrone();
      const body = missionBody(droneId, '2030-05-01T10:00:00Z', '2030-05-01T12:00:00Z');

      const [a, b] = await Promise.all([
        request(server()).post('/api/v1/missions').send(body),
        request(server()).post('/api/v1/missions').send(body),
      ]);

      expect([a.status, b.status].sort()).toEqual([201, 409]);
    });

    it('lets only one of two concurrent completes win, hours counted once (FOR UPDATE)', async () => {
      const droneId = await registerDrone();
      const missionId = await scheduleMission(droneId);
      await request(server())
        .post(`/api/v1/missions/${missionId}/transitions`)
        .send({ to: 'PRE_FLIGHT_CHECK' })
        .expect(200);
      await request(server())
        .post(`/api/v1/missions/${missionId}/transitions`)
        .send({ to: 'IN_PROGRESS' })
        .expect(200);

      const complete = () =>
        request(server())
          .post(`/api/v1/missions/${missionId}/transitions`)
          .send({ to: 'COMPLETED', flightHoursLogged: 3 });
      const [a, b] = await Promise.all([complete(), complete()]);

      expect([a.status, b.status].sort()).toEqual([200, 409]);
      await request(server())
        .get(`/api/v1/drones/${droneId}`)
        .expect(200)
        .expect((res) => expect(res.body.totalFlightHours).toBe(3));
    });
  });
});
