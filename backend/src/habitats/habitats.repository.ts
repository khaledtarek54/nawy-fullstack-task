import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Habitat } from './entities/habitat.entity';
import { HabitatStatus } from './habitat-status';

@Injectable()
export class HabitatsRepository {
  constructor(
    @InjectRepository(Habitat)
    private readonly habitats: Repository<Habitat>,
  ) {}

  async findAll(
    skip: number,
    take: number,
    status?: HabitatStatus,
  ): Promise<[Habitat[], number]> {
    return this.habitats.findAndCount({
      relations: { amenities: true },
      relationLoadStrategy: 'query',
      where: status ? { status } : {},
      order: { listedAt: 'DESC' },
      skip,
      take,
    });
  }

  async findById(id: string): Promise<Habitat | null> {
    return this.habitats.findOne({ where: { id } });
  }

  async findByIdWithAmenities(id: string): Promise<Habitat | null> {
    return this.habitats.findOne({
      relations: { amenities: true },
      relationLoadStrategy: 'query',
      where: { id },
    });
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
}
