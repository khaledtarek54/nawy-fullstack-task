import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnvironmentalMetrics1700000002000 implements MigrationInterface {
  name = 'AddEnvironmentalMetrics1700000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE habitats
        ADD COLUMN IF NOT EXISTS o2_pct                  NUMERIC,
        ADD COLUMN IF NOT EXISTS pressure_kpa            NUMERIC,
        ADD COLUMN IF NOT EXISTS temperature_c           NUMERIC,
        ADD COLUMN IF NOT EXISTS radiation_shielding_pct NUMERIC,
        ADD COLUMN IF NOT EXISTS power_reserve_hours     NUMERIC,
        ADD COLUMN IF NOT EXISTS co2_scrubber_state      TEXT;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE habitats
        DROP COLUMN IF EXISTS o2_pct,
        DROP COLUMN IF EXISTS pressure_kpa,
        DROP COLUMN IF EXISTS temperature_c,
        DROP COLUMN IF EXISTS radiation_shielding_pct,
        DROP COLUMN IF EXISTS power_reserve_hours,
        DROP COLUMN IF EXISTS co2_scrubber_state;
    `);
  }
}
