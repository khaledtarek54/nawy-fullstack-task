import { Habitat } from './entities/habitat.entity';

export function pressurisedVolumeM3(habitat: Habitat): number {
  const volume = Number(habitat.areaM2) * Number(habitat.ceilingHeightM);

  return Math.round(volume * 10) / 10;
}
