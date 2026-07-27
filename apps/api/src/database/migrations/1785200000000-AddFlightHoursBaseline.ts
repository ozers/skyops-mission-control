import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlightHoursBaseline1785200000000 implements MigrationInterface {
  name = 'AddFlightHoursBaseline1785200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drones" ADD COLUMN "flight_hours_at_last_maintenance" double precision NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "drones" DROP COLUMN "flight_hours_at_last_maintenance"`,
    );
  }
}
