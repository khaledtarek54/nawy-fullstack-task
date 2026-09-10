import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHabitats1700000001000 implements MigrationInterface {
  public name = 'CreateHabitats1700000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS habitats (
        id              TEXT        PRIMARY KEY,
        title           TEXT        NOT NULL,
        price_egp       NUMERIC     NOT NULL,
        currency        TEXT        NOT NULL,
        address_line    TEXT        NOT NULL,
        bedrooms        INTEGER,
        bathrooms       INTEGER,
        area_m2         NUMERIC     NOT NULL,
        image_url       TEXT,
        description     TEXT        NOT NULL,
        status          TEXT        NOT NULL,
        listed_at       TIMESTAMPTZ NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS habitat_amenities (
        id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
        habitat_id   TEXT         NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
        name         TEXT         NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS habitat_amenities_habitat_id_idx
        ON habitat_amenities(habitat_id);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS habitat_amenities;`);
    await queryRunner.query(`DROP TABLE IF EXISTS habitats;`);
  }
}
