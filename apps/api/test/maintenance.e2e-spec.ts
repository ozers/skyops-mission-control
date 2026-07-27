import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/* Needs the Docker stack up and migrated. */
describe('Maintenance (e2e)', () => {
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

  const registerDrone = async (): Promise<string> => {
    const res = await request(server())
      .post('/api/v1/drones')
      .send({ serialNumber: 'SKY-1A2B-3C4D', model: 'PHANTOM_4' })
      .expect(201);
    return res.body.id;
  };

  it('starts maintenance, logs it, and returns the drone to service', async () => {
    const droneId = await registerDrone();

    await request(server())
      .post(`/api/v1/drones/${droneId}/maintenance`)
      .expect(200)
      .expect((res) => expect(res.body.status).toBe('MAINTENANCE'));

    await request(server())
      .post(`/api/v1/drones/${droneId}/maintenance-logs`)
      .send({
        type: 'ROUTINE_CHECK',
        technicianName: 'Sam Fox',
        performedAt: '2026-07-01T09:00:00Z',
        flightHoursAtMaintenance: 0,
      })
      .expect(201)
      .expect((res) => expect(res.body.type).toBe('ROUTINE_CHECK'));

    await request(server())
      .get(`/api/v1/drones/${droneId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('AVAILABLE');
        expect(res.body.lastMaintenanceAt).toBe('2026-07-01T09:00:00.000Z');
        expect(res.body.nextMaintenanceDueAt).toBe('2026-09-29T09:00:00.000Z');
      });

    await request(server())
      .get(`/api/v1/drones/${droneId}/maintenance-logs`)
      .expect(200)
      .expect((res) => expect(res.body.total).toBe(1));
  });

  it('rejects a flight-hours mismatch with 400', async () => {
    const droneId = await registerDrone();
    await request(server())
      .post(`/api/v1/drones/${droneId}/maintenance-logs`)
      .send({
        type: 'ROUTINE_CHECK',
        technicianName: 'Sam Fox',
        performedAt: '2026-07-01T09:00:00Z',
        flightHoursAtMaintenance: 999,
      })
      .expect(400);
  });

  it('rejects a maintenance log dated in the future with 400', async () => {
    const droneId = await registerDrone();
    await request(server())
      .post(`/api/v1/drones/${droneId}/maintenance-logs`)
      .send({
        type: 'ROUTINE_CHECK',
        technicianName: 'Sam Fox',
        performedAt: '2999-01-01T00:00:00Z',
        flightHoursAtMaintenance: 0,
      })
      .expect(400);
  });

  it('refuses to start maintenance on a drone that is not available', async () => {
    const droneId = await registerDrone();
    await request(server()).post(`/api/v1/drones/${droneId}/maintenance`).expect(200);
    await request(server()).post(`/api/v1/drones/${droneId}/maintenance`).expect(409);
  });
});
