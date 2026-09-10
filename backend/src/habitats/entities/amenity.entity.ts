import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Habitat } from './habitat.entity';

@Entity({ name: 'habitat_amenities' })
export class Amenity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', name: 'habitat_id' })
  habitatId!: string;

  @Column({ type: 'text' })
  name!: string;

  @ManyToOne(() => Habitat, (h) => h.amenities)
  @JoinColumn({ name: 'habitat_id' })
  habitat!: Habitat;
}
