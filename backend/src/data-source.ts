import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Habitat } from './habitats/entities/habitat.entity';
import { Amenity } from './habitats/entities/amenity.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Habitat, Amenity],
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false,
});
