import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Habitat } from '../src/habitats/entities/habitat.entity';
import { Amenity } from '../src/habitats/entities/amenity.entity';
import { HABITATS_SEED } from './habitats.seed';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Habitat, Amenity],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    await dataSource.transaction(async (manager) => {
      for (const seed of HABITATS_SEED) {
        await manager.query(
          `INSERT INTO habitats
            (id, title, price_egp, currency, address_line, bedrooms, bathrooms,
             area_m2, image_url, description, status,
             o2_pct, pressure_kpa, temperature_c, radiation_shielding_pct,
             power_reserve_hours, co2_scrubber_state, listed_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (id) DO UPDATE SET
             title                   = EXCLUDED.title,
             price_egp               = EXCLUDED.price_egp,
             currency                = EXCLUDED.currency,
             address_line            = EXCLUDED.address_line,
             bedrooms                = EXCLUDED.bedrooms,
             bathrooms               = EXCLUDED.bathrooms,
             area_m2                 = EXCLUDED.area_m2,
             image_url               = EXCLUDED.image_url,
             description             = EXCLUDED.description,
             status                  = EXCLUDED.status,
             o2_pct                  = EXCLUDED.o2_pct,
             pressure_kpa            = EXCLUDED.pressure_kpa,
             temperature_c           = EXCLUDED.temperature_c,
             radiation_shielding_pct = EXCLUDED.radiation_shielding_pct,
             power_reserve_hours     = EXCLUDED.power_reserve_hours,
             co2_scrubber_state      = EXCLUDED.co2_scrubber_state,
             listed_at               = EXCLUDED.listed_at`,
          [
            seed.id, seed.title, seed.price_egp, seed.currency, seed.address_line,
            seed.bedrooms, seed.bathrooms, seed.area_m2, seed.image_url,
            seed.description, seed.status,
            seed.o2_pct, seed.pressure_kpa, seed.temperature_c,
            seed.radiation_shielding_pct, seed.power_reserve_hours,
            seed.co2_scrubber_state, seed.listed_at,
          ],
        );

        await manager.query(
          `DELETE FROM habitat_amenities WHERE habitat_id = $1`,
          [seed.id],
        );

        for (const amenityName of seed.amenities ?? []) {
          await manager.query(
            `INSERT INTO habitat_amenities (habitat_id, name) VALUES ($1, $2)`,
            [seed.id, amenityName],
          );
        }
      }
    });

    // eslint-disable-next-line no-console
    console.log(`[seed] synced ${HABITATS_SEED.length} habitats`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] failed:', err);
  process.exit(1);
});
