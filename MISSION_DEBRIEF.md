# Mission Debrief — Mars Habitat Service

**Name:** Khaled Tarek · **Email:** khaledtarek543@gmail.com
**LinkedIn:** https://www.linkedin.com/in/khaled-tarek-eng/

---

## Setup `REQUIRED`

```bash
cp .env.example .env
docker compose up -d
curl -X POST http://localhost:7010/handshake \
  -H 'Content-Type: application/json' -d '{"mission_code": "MARS-EXPANSION-2042"}'
# copy database_url into .env as DATABASE_URL
docker compose up -d backend
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed
docker compose exec backend npm run patch:run
docker compose exec backend npm run test:e2e   # 21 tests
```

All four services report **healthy** — the backend and frontend had none before.
App <http://localhost:3000> · API <http://localhost:4000> · passphrase `nawy-open-sesame`.
**New env var: `ACCESS_PASSPHRASE`** (backend) — it was hardcoded in frontend source.

---

## The Adaptation `OPTIONAL`

Ordered by how badly each blocked the next. Every number is measured.

| Area | Defect | Impact |
|---|---|---|
| Infra | Host port 3000 claimed twice; `public/` missing | Stack would not start |
| Seed | `!` over a nullable field; no transaction | Crashed on `hab_005`, left 5 of 80 rows |
| Schema | Entity declared `status_normalized`; only the patch created it | **Every request 500'd** |
| API | `skip = page * limit` on 1-based pages | First 10 habitats unreachable — **12.5% of inventory** |
| API | Amenity query per habitat in an awaited loop; no cap on `limit` | 81 sequential queries a page; `?limit=999999` returned everything |
| API | Literal `amenityNames: []`; hardcoded `'EGP'`; `price_egp`; Cairo addresses; area not volume | `/recent` lied about amenities; an Earth-era contract |
| Web | An effect writing its own dependency | Detail page at **102% CPU**, against 0.1% |
| Web | `return null` everywhere; `src=""`; `price: -1`; single-casing badge | Blank screens, broken images, "EGP -1", wrong colours |
| Web | Filter state read nothing; no screen rendered amenities | Buttons did nothing; the amenity work was invisible |
| Security | Passphrase in `lib/config.ts`, the DOM and the bundle | `curl` on a public chunk returned it; no gate existed |

I caught the amenities one late, and only by looking at a rendered page rather than an API
response — the pipeline was correct end to end and still showed the user nothing.

### What I cut, and why

| Cut | Why it was safe |
|---|---|
| API-enforced access | A beta gate over a public catalogue, not sensitive data |
| `COUNT(*)` per page | Correct at catalogue scale, wrong at millions |
| Index on `status` | Theatre at 80 rows; one migration when it matters |
| Dev hot reload | An override file loads itself and would put you in dev mode |
| Unit tests | Covered end to end instead; `habitat-safety.ts` deserves them first |

---

## The Innovation `OPTIONAL`

**Path 1 — Habitat Safety Score.** `GET /habitats/:id/safety-check` returns a verdict, a
score, and per-metric checks carrying value, safe range, status and a reason.

The rules already existed **in the wrong place**: `computeVerdict` lived in the detail page
component, so the web app owned a judgement about whether a habitat is fit for humans, and
the mobile app would have to reimplement it.

- **Severity by how fast a breach hurts** — O₂, pressure and a failed scrubber are critical;
  temperature, shielding and power are caution. Flat pass/fail puts "slightly warm" beside
  "no breathable air".
- **A missing reading never passes** — safety cannot be certified from absent telemetry.
- **The verdict is the worst status, not an average** — five good metrics and a failed
  scrubber is not 83% safe.

The screen leads with the verdict in plain words on a coloured band, then the six metrics
with traffic-light dots.

---

## Technical Decisions `OPTIONAL`

**`status_normalized`: deleted, not repaired.** Nothing read it — no service, DTO, test or
frontend. It existed only to be selected by TypeORM, which is what caused the 500s. The
problem was not "the copy is wrong", it was "there is a copy". `status` is normalised at the
boundary and a CHECK constraint rejects anything else, so the database refuses bad data even
from writes that bypass the app.

**How I would have written it.** Not as one migration — `dev_notes.md` forbids combining a
schema change with a backfill, because `SET NOT NULL` holds an ACCESS EXCLUSIVE lock while
it scans. But mostly I would not have added the column: `status` was free text with nothing
constraining it, and fixing the source leaves no second column to keep in sync. At scale the
CHECK would go on `NOT VALID` first and be validated separately.

**Layering.** TypeORM stays in the repository; domain rules live in pure modules
(`habitat-status`, `habitat-safety`, `habitat-metrics`) that test without standing anything
up. `ceiling_height_m` is stored per habitat so the API can derive `volumeM3` — a 2.7 in the
mapper would repeat the hardcoded-currency mistake.

**Frontend data fetching.** A `useEffect` refetched on an object rebuilt every render, and
React compares dependencies by reference. It did not spin only because React Query reuses
the `data` reference for equal results, so it worked by coincidence. The `queryKey` **is**
the dependency array and is compared structurally, so filters live there now. The detail
page's loop was the same rule: derived values belong in render, not in state.

**Secrets.** The passphrase lives in the backend environment and `POST /access/verify`
compares it with `timingSafeEqual`, so it never leaves the server. `NEXT_PUBLIC_` would have
fixed nothing — Next.js inlines those at build time, so the same `curl` returns the same
string.

---

## Given More Time `OPTIONAL`

1. Unit tests for `habitat-safety.ts` — pure, and it decides whether people enter a building.
2. Enforce the gate at the API: a short-lived token, not a sessionStorage flag.
3. Stop counting the whole table per page; cursor pagination if the numbered pager goes.
4. `UNIQUE (habitat_id, name)` on amenities — the loader is careful, the database is not.
5. Index `status`, and chunk the `IN` clause (Postgres caps bind parameters at 65535).
6. Rate limiting and structured logging.

All of it is invisible at this data volume or guards a threat this system does not have yet.

---

## Reviewer Notes `OPTIONAL`

- **Read the commits** — one per fix, each explaining why.
- **The test suite never ran.** `import * as request from 'supertest'` is not callable under
  `esModuleInterop` with `@types/supertest` 6, so jest failed at type-check: three "failing
  Earth-era tests" were zero tests. It also skipped the global `ValidationPipe`, now in
  `app-setup.ts` and shared by both.
- **`GET /habitats` is a breaking change** — `{ data, meta }`. `/habitats/recent` stays a
  bare array on purpose: a capped feed, not a paged collection.
- **One thing I got wrong.** I first read the listings page as an infinite refetch loop.
  Measuring showed a flat two requests over 30 seconds; the real loop was on the detail
  page. This document reflects what I measured, not what I assumed.
