import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Amenity } from './amenity.entity';
import { HabitatStatus } from '../habitat-status';

@Entity({ name: 'habitats' })
export class Habitat {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'numeric', name: 'price_egp' })
  priceEgp!: string;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ type: 'text', name: 'address_line' })
  addressLine!: string;

  @Column({ type: 'int', nullable: true })
  bedrooms!: number | null;

  @Column({ type: 'int', nullable: true })
  bathrooms!: number | null;

  @Column({ type: 'numeric', name: 'area_m2' })
  areaM2!: string;

  @Column({ type: 'text', nullable: true, name: 'image_url' })
  imageUrl!: string | null;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  status!: HabitatStatus;

  @Column({ type: 'numeric', nullable: true, name: 'o2_pct' })
  o2Pct!: string | null;

  @Column({ type: 'numeric', nullable: true, name: 'pressure_kpa' })
  pressureKpa!: string | null;

  @Column({ type: 'numeric', nullable: true, name: 'temperature_c' })
  temperatureC!: string | null;

  @Column({ type: 'numeric', nullable: true, name: 'radiation_shielding_pct' })
  radiationShieldingPct!: string | null;

  @Column({ type: 'numeric', nullable: true, name: 'power_reserve_hours' })
  powerReserveHours!: string | null;

  @Column({ type: 'text', nullable: true, name: 'co2_scrubber_state' })
  co2ScrubberState!: string | null;

  @Column({ type: 'timestamptz', name: 'listed_at' })
  listedAt!: Date;

  @OneToMany(() => Amenity, (a) => a.habitat)
  amenities!: Amenity[];
}
