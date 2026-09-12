import { Controller, Get, Param, Query } from '@nestjs/common';
import { HabitatsService, EnrichedHabitat } from './habitats.service';
import { ListHabitatsQueryDto } from './dto/list-habitats.query.dto';
import { HabitatResponseDto } from './dto/habitat-response.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

@Controller('habitats')
export class HabitatsController {
  constructor(private readonly service: HabitatsService) {}

  @Get()
  async list(
    @Query() query: ListHabitatsQueryDto,
  ): Promise<PaginatedResponseDto<HabitatResponseDto>> {
    const { habitats, total } = await this.service.list(query.page, query.limit);

    return {
      data: habitats.map((row) => this.toResponse(row)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  @Get('recent')
  async recent(): Promise<HabitatResponseDto[]> {
    const rows = await this.service.listRecent();
    return rows.map((row) => this.toResponse(row));
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<HabitatResponseDto> {
    const row = await this.service.getById(id);
    return this.toResponse(row);
  }

  private toResponse(row: EnrichedHabitat): HabitatResponseDto {
    return {
      id: row.id,
      title: row.title,
      price: Number(row.priceEgp),
      currency: 'EGP',
      address: row.addressLine,
      area: Number(row.areaM2),
      status: row.status,
      description: row.description,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      imageUrl: row.imageUrl,
      o2Pct: row.o2Pct === null ? null : Number(row.o2Pct),
      pressureKpa: row.pressureKpa === null ? null : Number(row.pressureKpa),
      temperatureC: row.temperatureC === null ? null : Number(row.temperatureC),
      radiationShieldingPct:
        row.radiationShieldingPct === null ? null : Number(row.radiationShieldingPct),
      powerReserveHours:
        row.powerReserveHours === null ? null : Number(row.powerReserveHours),
      co2ScrubberState: row.co2ScrubberState,
      listedAt: row.listedAt.toISOString(),
      amenities: row.amenityNames,
    };
  }
}
