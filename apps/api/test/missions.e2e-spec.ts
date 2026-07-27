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
});
