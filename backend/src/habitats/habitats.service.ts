import { Injectable, NotFoundException } from '@nestjs/common';
import { Habitat } from './entities/habitat.entity';
import { HabitatsRepository } from './habitats.repository';

export type EnrichedHabitat = Habitat & { amenityNames: string[] };

@Injectable()
export class HabitatsService {
  constructor(private readonly repo: HabitatsRepository) {}

  async list(page: number, limit: number): Promise<EnrichedHabitat[]> {
    const skip = (page - 1) * limit;
    const habitats = await this.repo.findAll(skip, limit);

    const enriched: EnrichedHabitat[] = [];
    for (const h of habitats) {
      const amenities = await this.repo.findAmenitiesForHabitat(h.id);
      enriched.push({ ...h, amenityNames: amenities.map((a) => a.name) });
    }
    return enriched;
  }

  async getById(id: string): Promise<EnrichedHabitat> {
    const habitat = await this.repo.findById(id);
    if (!habitat) {
      throw new NotFoundException(`Habitat ${id} not found`);
    }
    const amenities = await this.repo.findAmenitiesForHabitat(id);
    return { ...habitat, amenityNames: amenities.map((a) => a.name) };
  }

  async listRecent(): Promise<Habitat[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.repo.findRecent(thirtyDaysAgo);
  }
}
