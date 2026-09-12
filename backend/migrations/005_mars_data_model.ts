import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarsDataModel1700000005000 implements MigrationInterface {
  name = 'MarsDataModel1700000005000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE habitats RENAME COLUMN price_egp TO price;
    `);

    await queryRunner.query(`
      ALTER TABLE habitats
        ADD COLUMN ceiling_height_m NUMERIC NOT NULL DEFAULT 2.7;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE habitats DROP COLUMN IF EXISTS ceiling_height_m;
    `);

    await queryRunner.query(`
      ALTER TABLE habitats RENAME COLUMN price TO price_egp;
    `);
  }
}
