import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Habitat } from './entities/habitat.entity';
import { Amenity } from './entities/amenity.entity';

@Injectable()
export class HabitatsRepository {
  constructor(
    @InjectRepository(Habitat)
    private readonly habitats: Repository<Habitat>,
    @InjectRepository(Amenity)
    private readonly amenities: Repository<Amenity>,
  ) {}

  async findAll(skip: number, take: number): Promise<[Habitat[], number]> {
    return this.habitats.findAndCount({
      relations: { amenities: true },
      relationLoadStrategy: 'query',
      order: { listedAt: 'DESC' },
      skip,
      take,
    });
  }

  async findById(id: string): Promise<Habitat | null> {
    return this.habitats.findOne({ where: { id } });
  }

  async findRecent(since: Date, take: number): Promise<Habitat[]> {
    return this.habitats.find({
      relations: { amenities: true },
      relationLoadStrategy: 'query',
      where: { listedAt: MoreThanOrEqual(since) },
      order: { listedAt: 'DESC' },
      take,
    });
  }

  async findAmenitiesForHabitat(habitatId: string): Promise<Amenity[]> {
    return this.amenities.find({ where: { habitatId } });
  }
}
