import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('liveness reports ok without touching dependencies', () => {
    const controller = new HealthController({} as unknown as DataSource);
    expect(controller.live()).toEqual({ status: 'ok' });
  });

  it('readiness pings the database', async () => {
    const dataSource = { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const controller = new HealthController(dataSource as unknown as DataSource);

    await expect(controller.ready()).resolves.toEqual({ status: 'ok', db: 'up' });
    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
  });
});
