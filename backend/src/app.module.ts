import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habitat } from './habitats/entities/habitat.entity';
import { Amenity } from './habitats/entities/amenity.entity';
import { HabitatsModule } from './habitats/habitats.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Habitat, Amenity],
      synchronize: false,
    }),
    HabitatsModule,
  ],
})
export class AppModule {}
