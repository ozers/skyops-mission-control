import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785149977937 implements MigrationInterface {
    name = 'InitialSchema1785149977937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);
        await queryRunner.query(`CREATE TABLE "drones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "serial_number" character varying NOT NULL, "model" character varying NOT NULL, "status" character varying NOT NULL, "total_flight_hours" double precision NOT NULL DEFAULT '0', "last_maintenance_at" TIMESTAMP WITH TIME ZONE, "next_maintenance_due_at" TIMESTAMP WITH TIME ZONE, "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3137fc855d37186eeccd193569f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c58fb0d50272dda6c64e7ee3ac" ON "drones"  ("serial_number") `);
        await queryRunner.query(`CREATE INDEX "IDX_e98f851ed2140771d18682f52d" ON "drones"  ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_5e29269f5d18d06e79f3a50b9d" ON "drones"  ("next_maintenance_due_at") `);
        await queryRunner.query(`CREATE TABLE "maintenance_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "drone_id" uuid NOT NULL, "type" character varying NOT NULL, "technician_name" character varying NOT NULL, "notes" text, "performed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "flight_hours_at_maintenance" double precision NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_096e4b6bb7c9fe74d960e7523e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fba8bd6c2957f15780d933c357" ON "maintenance_logs"  ("drone_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0c9cfd10fcc9a7fa79984ee839" ON "maintenance_logs"  ("performed_at") `);
        await queryRunner.query(`CREATE TABLE "missions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying NOT NULL, "drone_id" uuid NOT NULL, "pilot_name" character varying NOT NULL, "site_location" character varying NOT NULL, "status" character varying NOT NULL, "scheduled_start" TIMESTAMP WITH TIME ZONE NOT NULL, "scheduled_end" TIMESTAMP WITH TIME ZONE NOT NULL, "actual_start" TIMESTAMP WITH TIME ZONE, "actual_end" TIMESTAMP WITH TIME ZONE, "logged_flight_hours" double precision, "abort_reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_787aebb1ac5923c9904043c6309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fc7a9819a46e269520e441a6a4" ON "missions"  ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_53856f35b717bcff42f6927c01" ON "missions"  ("scheduled_start") `);
        await queryRunner.query(`CREATE INDEX "idx_missions_drone_scheduled" ON "missions"  ("drone_id", "scheduled_start") `);

        await queryRunner.query(`ALTER TABLE "missions" ADD CONSTRAINT "fk_missions_drone" FOREIGN KEY ("drone_id") REFERENCES "drones"("id") ON DELETE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "maintenance_logs" ADD CONSTRAINT "fk_maintenance_logs_drone" FOREIGN KEY ("drone_id") REFERENCES "drones"("id") ON DELETE RESTRICT`);

        // A drone can't have two active missions whose time windows overlap. Enforced in
        // the database so no application-level race can create a double-booking (ADR-3).
        await queryRunner.query(`ALTER TABLE "missions" ADD CONSTRAINT "missions_no_overlap" EXCLUDE USING gist ("drone_id" WITH =, tstzrange("scheduled_start", "scheduled_end") WITH &&) WHERE (status IN ('PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "missions" DROP CONSTRAINT "missions_no_overlap"`);
        await queryRunner.query(`ALTER TABLE "maintenance_logs" DROP CONSTRAINT "fk_maintenance_logs_drone"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP CONSTRAINT "fk_missions_drone"`);
        await queryRunner.query(`DROP INDEX "public"."idx_missions_drone_scheduled"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_53856f35b717bcff42f6927c01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fc7a9819a46e269520e441a6a4"`);
        await queryRunner.query(`DROP TABLE "missions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c9cfd10fcc9a7fa79984ee839"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fba8bd6c2957f15780d933c357"`);
        await queryRunner.query(`DROP TABLE "maintenance_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5e29269f5d18d06e79f3a50b9d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e98f851ed2140771d18682f52d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c58fb0d50272dda6c64e7ee3ac"`);
        await queryRunner.query(`DROP TABLE "drones"`);
    }

}
