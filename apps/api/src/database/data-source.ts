import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm.config';

/* TypeORM CLI entry for migrations; the app builds its own from the same options. */
export default new DataSource(buildDataSourceOptions());
