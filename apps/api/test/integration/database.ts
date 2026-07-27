import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../../src/database/typeorm.config';

/* Connects to the migrated test database; shared by every integration spec. */
export async function createTestDataSource(): Promise<DataSource> {
  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();
  return dataSource;
}

export async function truncateAll(dataSource: DataSource): Promise<void> {
  await dataSource.query('TRUNCATE drones, missions, maintenance_logs CASCADE');
}
