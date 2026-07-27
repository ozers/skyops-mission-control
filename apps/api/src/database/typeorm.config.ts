import { join } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy';

/*
 * One options factory for both the app and the migration CLI, so they can't
 * diverge. synchronize stays false - schema changes go through migrations only.
 */
export function buildDataSourceOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USER ?? 'skyops',
    password: env.DB_PASSWORD ?? 'skyops',
    database: env.DB_NAME ?? 'skyops',
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    logging: env.DB_LOGGING === 'true',
  };
}
