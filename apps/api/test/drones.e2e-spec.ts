import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/* Needs the Docker stack up and migrated (docker compose up -d + migration:run). */
describe('Drones (e2e)', () => {
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
  const validBody = { serialNumber: 'SKY-1A2B-3C4D', model: 'PHANTOM_4' };

  it('registers a drone and reads it back', async () => {
    const created = await request(server()).post('/api/v1/drones').send(validBody).expect(201);
    expect(created.body.status).toBe('AVAILABLE');
    expect(created.body.totalFlightHours).toBe(0);

    await request(server())
      .get(`/api/v1/drones/${created.body.id}`)
      .expect(200)
      .expect((res) => expect(res.body.serialNumber).toBe('SKY-1A2B-3C4D'));
  });

  it('lists drones in a pagination envelope', async () => {
    await request(server()).post('/api/v1/drones').send(validBody).expect(201);
    const res = await request(server()).get('/api/v1/drones').expect(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.page).toBe(1);
  });

  it('returns 409 on a duplicate serial number', async () => {
    await request(server()).post('/api/v1/drones').send(validBody).expect(201);
    await request(server()).post('/api/v1/drones').send(validBody).expect(409);
  });

  it('returns 400 on an invalid model', async () => {
    await request(server())
      .post('/api/v1/drones')
      .send({ serialNumber: 'SKY-1A2B-3C4D', model: 'NOPE' })
      .expect(400);
  });

  it('returns 404 for a missing drone', async () => {
    await request(server())
      .get('/api/v1/drones/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
