"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestDataSource = createTestDataSource;
exports.truncateAll = truncateAll;
const typeorm_1 = require("typeorm");
const typeorm_config_1 = require("../../src/database/typeorm.config");
/* Connects to the migrated test database; shared by every integration spec. */
async function createTestDataSource() {
    const dataSource = new typeorm_1.DataSource((0, typeorm_config_1.buildDataSourceOptions)());
    await dataSource.initialize();
    return dataSource;
}
async function truncateAll(dataSource) {
    await dataSource.query('TRUNCATE drones, missions, maintenance_logs CASCADE');
}
//# sourceMappingURL=database.js.map