import { DataSource } from 'typeorm';
export declare function createTestDataSource(): Promise<DataSource>;
export declare function truncateAll(dataSource: DataSource): Promise<void>;
