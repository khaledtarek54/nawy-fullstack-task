import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitatsController } from './habitats.controller';
import { HabitatsService } from './habitats.service';
import { HabitatsRepository } from './habitats.repository';
import { Habitat } from './entities/habitat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Habitat])],
  controllers: [HabitatsController],
  providers: [HabitatsService, HabitatsRepository],
  exports: [HabitatsService],
})
export class HabitatsModule {}
