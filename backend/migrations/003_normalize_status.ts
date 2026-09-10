// The status_normalization migration has been moved to ../patches/003_normalize_status.ts.
// It is intentionally NOT applied during the baseline `npm run migration:run` —
// the canonicalisation logic must be validated against real (seeded) data first.
// See README.md → Stage 2 for the correct workflow:
//   1. npm run migration:run   ← applies 001 and 002 only
//   2. npm run seed             ← populates mock habitats
//   3. npm run patch:run        ← applies the patch in ../patches/
export {};
