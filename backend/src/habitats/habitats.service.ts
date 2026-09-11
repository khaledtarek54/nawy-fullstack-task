import { Injectable, NotFoundException } from '@nestjs/common';
import { Habitat } from './entities/habitat.entity';
import { HabitatsRepository } from './habitats.repository';

export type EnrichedHabitat = Habitat & { amenityNames: string[] };

const RECENT_WINDOW_DAYS = 30;
const RECENT_LIMIT = 20;

@Injectable()
export class HabitatsService {
  constructor(private readonly repo: HabitatsRepository) {}

  async list(page: number, limit: number): Promise<EnrichedHabitat[]> {
    const skip = (page - 1) * limit;
    const habitats = await this.repo.findAll(skip, limit);

    return this.toEnriched(habitats);
  }

  async getById(id: string): Promise<EnrichedHabitat> {
    const habitat = await this.repo.findById(id);
    if (!habitat) {
      throw new NotFoundException(`Habitat ${id} not found`);
    }
    const amenities = await this.repo.findAmenitiesForHabitat(id);
    return { ...habitat, amenityNames: amenities.map((a) => a.name) };
  }

  async listRecent(): Promise<EnrichedHabitat[]> {
    const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const habitats = await this.repo.findRecent(since, RECENT_LIMIT);

    return this.toEnriched(habitats);
  }

  private toEnriched(habitats: Habitat[]): EnrichedHabitat[] {
    return habitats.map((h) => ({
      ...h,
      amenityNames: h.amenities.map((a) => a.name),
    }));
  }
}
