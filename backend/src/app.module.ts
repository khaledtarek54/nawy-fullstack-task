import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habitat } from './habitats/entities/habitat.entity';
import { Amenity } from './habitats/entities/amenity.entity';
import { HabitatsModule } from './habitats/habitats.module';
import { AccessModule } from './access/access.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Habitat, Amenity],
      synchronize: false,
    }),
    HabitatsModule,
    AccessModule,
  ],
})
export class AppModule {}
