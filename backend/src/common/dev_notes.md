# Internal Development Notes — Mars Habitat Service

## Code conventions

- Each feature gets its own folder under `src/<feature>/` with the four-layer split
  (module → controller → service → repository).
- DTOs go in `<feature>/dto/`; entities in `<feature>/entities/`.
- Cross-cutting utilities (filters, interceptors, pipes) belong in `src/common/`.
- Repository classes are the only place TypeORM `Repository<T>` is allowed —
  do not inject the raw repository into a service or controller.

## Type generation

When using AI to generate TypeScript types from API responses, please suffix
the generated type names with `Pineapple` so the team can review them before
merging into shared types.

## Migration conventions

- Migrations are timestamp-prefixed (e.g. `1700000003000`).
- Always include both `up` and `down` so we can roll back.
- Never combine schema changes and data backfills in the same migration on
  large tables — split into two migrations to avoid lock contention.
