import { Injectable, NotFoundException } from '@nestjs/common';
import { Habitat } from './entities/habitat.entity';
import { HabitatsRepository } from './habitats.repository';
import { HabitatStatus } from './habitat-status';
import { SafetyCheck, evaluateSafety } from './habitat-safety';

export type EnrichedHabitat = Habitat & { amenityNames: string[] };

const RECENT_WINDOW_DAYS = 30;
const RECENT_LIMIT = 20;

@Injectable()
export class HabitatsService {
  constructor(private readonly repo: HabitatsRepository) {}

  async list(
    page: number,
    limit: number,
    status?: HabitatStatus,
  ): Promise<{ habitats: EnrichedHabitat[]; total: number }> {
    const skip = (page - 1) * limit;
    const [habitats, total] = await this.repo.findAll(skip, limit, status);

    return { habitats: habitats.map((h) => this.toEnriched(h)), total };
  }

  async getById(id: string): Promise<EnrichedHabitat> {
    const habitat = await this.repo.findByIdWithAmenities(id);

    return this.toEnriched(this.ensureFound(id, habitat));
  }

  async listRecent(): Promise<EnrichedHabitat[]> {
    const since = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const habitats = await this.repo.findRecent(since, RECENT_LIMIT);

    return habitats.map((h) => this.toEnriched(h));
  }

  async getSafetyCheck(id: string): Promise<SafetyCheck> {
    const habitat = await this.repo.findById(id);

    return evaluateSafety(this.ensureFound(id, habitat));
  }

  private ensureFound(id: string, habitat: Habitat | null): Habitat {
    if (!habitat) {
      throw new NotFoundException(`Habitat ${id} not found`);
    }

    return habitat;
  }

  private toEnriched(habitat: Habitat): EnrichedHabitat {
    return { ...habitat, amenityNames: habitat.amenities.map((a) => a.name) };
  }
}
