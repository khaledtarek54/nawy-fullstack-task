import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(skip: number, take: number): Promise<Habitat[]> {
    return this.habitats.find({
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

  async findRecent(since: Date): Promise<Habitat[]> {
    return this.habitats
      .createQueryBuilder('h')
      .where('h.listed_at >= :since', { since })
      .orderBy('h.listed_at', 'DESC')
      .getMany();
  }

  async findAmenitiesForHabitat(habitatId: string): Promise<Amenity[]> {
    return this.amenities.find({ where: { habitatId } });
  }
}
