import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/* Needs the Docker stack up and migrated. */
describe('Fleet health (e2e)', () => {
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

  const registerDrone = async (serial: string): Promise<string> => {
    const res = await request(server())
      .post('/api/v1/drones')
      .send({ serialNumber: serial, model: 'PHANTOM_4' })
      .expect(201);
    return res.body.id;
  };

  it('reports totals, status breakdown, and average flight hours', async () => {
    await registerDrone('SKY-1A2B-3C4D');
    await registerDrone('SKY-9Z8Y-7X6W');

    const res = await request(server()).get('/api/v1/fleet/health').expect(200);
    expect(res.body.totalDrones).toBe(2);
    expect(res.body.dronesByStatus.AVAILABLE).toBe(2);
    expect(res.body.averageFlightHours).toBe(0);
    expect(res.body.missionsNext24h).toBe(0);
    expect(res.body.overdueMaintenanceDroneIds).toEqual([]);
  });

  it('flags a drone overdue by flight hours', async () => {
    const droneId = await registerDrone('SKY-1A2B-3C4D');
    await dataSource.query('UPDATE drones SET total_flight_hours = 60 WHERE id = $1', [droneId]);

    const res = await request(server()).get('/api/v1/fleet/health').expect(200);
    expect(res.body.overdueMaintenanceDroneIds).toContain(droneId);
  });

  it('counts missions scheduled in the next 24 hours', async () => {
    const droneId = await registerDrone('SKY-1A2B-3C4D');
    const start = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    await dataSource.query(
      `INSERT INTO missions (name, type, drone_id, pilot_name, site_location, status, scheduled_start, scheduled_end)
       VALUES ('m', 'WIND_TURBINE_INSPECTION', $1, 'p', 's', 'PLANNED', $2, $3)`,
      [droneId, start, end],
    );

    const res = await request(server()).get('/api/v1/fleet/health').expect(200);
    expect(res.body.missionsNext24h).toBe(1);
  });
});
