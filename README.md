# Nawy's Mars Expansion — Full-Stack Engineering Assignment

> **Estimated effort:** 14–18 hours — you are not expected to complete every task. How you prioritise is part of the evaluation.

---

## Mission Briefing

After building one of Earth's leading real estate platforms, Nawy set its sights on the first Martian settlements. The mobile app is stable. The **backend** is not.

The previous engineering team launched a thin Habitat Listings service to demonstrate the concept to leadership. It got the green light — and the team rotated to other priorities. We've since lost contact with their backend deployment, and the code that's left isn't ready for production: structural shortcuts, Earth-era data, broken migrations, and at least one feature that "shipped" with a hardcoded passphrase in source.

You are joining the **Backend Strike Team** to restore service before the next colonist intake.

---

## 1 — What You're Given

| Resource | Description |
|---|---|
| **Starter Codebase** | This `docker-compose` project — built quickly and **not production-ready**. Expect structural issues, shortcuts, and decisions that do not scale. Refactoring is part of the job. |
| **`command-relay` Service** | A small Node service that holds the habitat database credentials. You must complete a handshake to retrieve them — see Stage 1 below. |
| **Mock Data** | `backend/seeds/habitats.seed.ts` — a TypeScript file simulating the habitat feed. Earth-era field choices and at least one corrupted/incomplete row. |
| **UI Reference** | There is no separate design file. The existing app **is** the design reference. Run it to see the current state. You are free to evolve or completely redesign it. |

### Stack

- **Backend:** NestJS · TypeORM · Postgres
- **Frontend:** Next.js (App Router) · React Query
- **Infra:** docker-compose (single laptop — no cloud setup required)
- **Language:** TypeScript everywhere

### Repository Layout

```
backend/                         NestJS API
├── src/
│   ├── main.ts · app.module.ts
│   ├── data-source.ts           ← baseline migrations data source
│   ├── data-source.patch.ts     ← patch migrations data source
│   ├── common/                  ← shared utilities (filters, interceptors, dev_notes.md)
│   └── habitats/                ← feature module — see "Backend conventions" below
│       ├── habitats.module.ts
│       ├── habitats.controller.ts
│       ├── habitats.service.ts
│       ├── habitats.repository.ts
│       ├── dto/
│       └── entities/
├── migrations/                  ← baseline schema (001, 002)
├── patches/                     ← patches applied AFTER seeding (003+)
├── seeds/
└── test/
frontend/                        Next.js (App Router)
├── src/
│   ├── app/                     ← routes (pages)
│   ├── components/              ← reusable UI
│   ├── hooks/                   ← React Query hooks
│   ├── lib/                     ← API client, config, types
│   ├── providers/               ← React providers (QueryClient)
│   └── styles/
└── public/
command-relay/                   Mission Control handshake service
docker-compose.yml
.env.example
```

---

## Martian Habitat — Quick Reference

These are the environmental specs that matter when evaluating a Martian habitat. Use them to inform your data model decisions.

| Metric | Safe Range | Why It Matters |
|---|---|---|
| O₂ Level | 19.5 – 23.5 % | Below 19.5 % causes hypoxia; above 23.5 % is a fire risk |
| Cabin Pressure | 70 – 102 kPa | Below 70 kPa risks decompression sickness |
| Temperature | 18 – 24 °C | Deviation signals HVAC failure |
| Radiation Shielding | ≥ 90 % | Below 90 % exposes residents to unsafe cosmic radiation |
| Power Reserve | ≥ 4 hrs | Minimum battery backup to survive a dust storm blackout |
| CO₂ Scrubber | Active / Degraded / Failed | Life-critical — failure means evacuation |

---

## 2 — Stages

You will move through five stages. Each unblocks the next.

### Stage 1 — Establish Contact

The backend will not boot until you populate `DATABASE_URL`. Mission Control holds the credentials.

```bash
cp .env.example .env
docker compose up -d
```

You'll see `mars-backend` in a restart loop with the log:

```
[backend] FATAL: DATABASE_URL is not set. Complete the Mission Control handshake (see README.md → Stage 1)
```

**Retrieve credentials from Mission Control:**

```bash
# Verify the relay is online
curl http://localhost:7010/status

# Submit your mission code to retrieve the database URL
curl -X POST http://localhost:7010/handshake \
  -H 'Content-Type: application/json' \
  -d '{"mission_code": "MARS-EXPANSION-2042"}'
```

> ⚠️ Earlier draft mission codes (`MARS-DEMO-A1`, `MARS-LEGACY-2039`) are deprecated and will be rejected. Do not use them.

The handshake returns a JSON body containing `database_url`. Copy that value into your `.env`:

```env
DATABASE_URL=postgres://mars:...@postgres:5432/habitats
```

Then restart the backend:

```bash
docker compose restart backend
```

The backend should now boot. The frontend at `http://localhost:3000` will load — though every API call will fail until Stage 2.

### Stage 2 — Run Diagnostics

The database has a schema, but no data — and one migration was written by the engineer who left for Mars and was never validated.

```bash
# Apply baseline schema (migrations 001 + 002)
docker compose exec backend npm run migration:run

# Populate mock data
docker compose exec backend npm run seed

# Apply the pending patch — this is the migration we never tested against real data
docker compose exec backend npm run patch:run
```

You will hit problems at every step. Read the error output carefully. Each failure is a real issue you'll need to fix.

> Tip: when a step fails, fix it in code, then re-run the same command. Migrations and patches are transactional — a failed run rolls back cleanly, so you can retry after edits.

Once all three commands succeed and the API returns data, **survey the listings endpoint and detail endpoint**. The data displayed will not match the spec. Make a list of every discrepancy you find — this list drives Stage 3.

### Stage 3 — Restore Service

The system has multiple defects across the **infrastructure**, **data model**, **API layer**, and **UI**. Some are visible the moment you run the app and use it as a Mars Command operator would. Some only show up under load. Some only show up in the network tab or in `docker compose logs`. Some live in plain sight in source files but only matter once you understand what production on Mars demands.

**Your job is to find them, decide which matter most, and fix them. We will not give you a list — that's the point.**

What we evaluate:
- Which defects you found
- How you ranked them
- What you fixed and what you intentionally cut
- Why — your reasoning, not your output volume

The debrief (Stage 5) is where you defend your priorities.

> Quick orientation, not a checklist:
> - Run the app. Click around. Open the network tab and React DevTools.
> - Read `docker compose logs` when a service is unhealthy.
> - Run the tests in `backend/test/` and read what fails — failing tests carry information.
> - Skim the seed data, the migrations, and the patches folder. The previous team left fingerprints.
> - The current backend has a clear layering convention (module → controller → service → repository). Bugs that cross boundaries are usually the worst ones.

### Stage 4 — Forward Operations

Build **one new feature** end-to-end (backend endpoint + frontend screen). See Deliverable B below.

### Stage 5 — Mission Debrief

Fill in `MISSION_DEBRIEF.md`. See Deliverable C below.

---

## 3 — Your Deliverables

You must submit **three deliverables**. All three are required.

### Deliverable A — Restore Habitat Listings Service `REQUIRED`

**Ticket MARS-101**

> *As a Mars Command operator, when I open the Habitat Listings dashboard, I need accurate, current information about every habitat — including its environmental safety status — so I can decide which habitats to allocate to incoming colonists.*

**You may modify:** entities, DTOs, services, controllers, repositories, migrations, the seed file, the schema, the frontend pages and components, hooks, lib utilities, and `properties.json` data shape. Anything in `backend/` and `frontend/`.

**Minimum expectations:**

- [ ] `docker compose up` brings all four services healthy
- [ ] After the handshake + migrate + seed + patch workflow, `GET /habitats` returns all habitats
- [ ] Pagination behaves correctly (page 1 returns the first page)
- [ ] Status colour-coding works for all variants the API can return
- [ ] Recent-listings endpoint (`/habitats/recent`) returns a sensible window
- [ ] No N+1 queries on the listings endpoint
- [ ] The seed loader does not crash on missing fields
- [ ] The frontend handles null images, null prices, and varied status casing
- [ ] The access passphrase is not hardcoded in source code
- [ ] Tapping a habitat card redirects to a passphrase entry screen before the detail page is shown
- [ ] `backend/test/habitats.e2e-spec.ts` is updated to assert the Mars-era contract and passes

You decide which improvements are most impactful. Not everything needs to change — but every choice should be intentional and defensible.

### Deliverable B — Innovation Feature `REQUIRED`

The Executive Board wants to see **one forward-looking feature** that could differentiate Nawy on Mars. Pick one path. Each path requires both a backend endpoint and a frontend screen.

#### Path 1 — Habitat Safety Score
- **Backend:** `GET /habitats/:id/safety-check` returns a score and per-metric breakdown based on the safe ranges in the reference table (O₂, pressure, temperature, radiation shielding, power reserve, CO₂ scrubber state).
- **Frontend:** A new screen showing the breakdown with traffic-light colour coding. A resident should know in under 3 seconds whether the habitat is safe.

#### Path 2 — Active Alerts Feed
- **Backend:** `GET /alerts?habitat_id=...` returns prioritised alerts derived from environmental thresholds — e.g. *"Airlock seal pressure dropped 4% — inspect door gasket"*, *"Battery at 12% — sunset in 2 hours"*. Each has a severity (info / warning / critical) and a suggested action.
- **Frontend:** A sortable feed with severity icons and a way to dismiss/snooze.

#### Path 3 — Resource Forecast
- **Backend:** `GET /habitats/:id/forecast?metric=power|o2|water` returns projected values over the next N sols.
- **Frontend:** A simple chart and a "below threshold by" indicator.

#### Path 4 — Habitat Reservation System
- **Backend:** `POST /habitats/:id/reservations` accepts `{ colonist_name, start_sol, end_sol }` and creates a reservation. Two confirmed reservations cannot occupy the same sol range for the same habitat. Decide where the overlap check lives (service layer, DB constraint, or both) and what happens under concurrent writes.
- **Frontend:** A reservation form on (or linked from) the detail page. Show overlap conflicts inline. List existing reservations.
- **Debrief requirement:** Describe two approaches you considered (validation layer + locking strategy) and justify your choice. There is no single correct answer here — we want to see how you reason about consistency, concurrency, and trade-offs.

#### Path 5 — Your Own Idea
Propose an alternative feature relevant to the Martian market. Must include both a backend endpoint and a frontend screen.

**Deliver:** A working prototype in code. It can be minimal — a rough but functional endpoint and screen are enough.

> Clear reasoning and product thinking matter more than feature completeness. Follow the same backend module pattern (module → controller → service → repository) and frontend layering (page → hook → component) you inherited.

### Deliverable C — Mission Debrief `REQUIRED`

Fill in `MISSION_DEBRIEF.md` (or present your debrief in any format you prefer — a document, slides, or a structured write-up).

---

## 4 — Technical Guidelines

| | |
|---|---|
| **Backend** | NestJS + TypeORM (required — keep the existing layering) |
| **Frontend** | Next.js + React Query (required — keep the existing folder structure) |
| **Database** | Postgres (required — schema is yours to evolve) |
| **Containerisation** | docker-compose (required — everything must run on a candidate laptop with no cloud setup) |
| **External Packages** | Allowed where justified |
| **Mock Data** | You are free to modify `seeds/habitats.seed.ts` — add, remove, or reshape fields |

### Backend conventions

- Each feature is a self-contained folder under `src/<feature>/` with the module → controller → service → repository split.
- **Controllers** never call `Repository<T>` directly — they go through the service.
- **Services** never call `Repository<T>` directly — they go through the repository class.
- **Repositories** are the only place ORM-specific code lives (queryBuilder, joins, transactions).
- **DTOs** are validated at the controller boundary via `ValidationPipe` (already wired in `main.ts`).

Cross-cutting concerns (filters, interceptors, pipes, guards, dev notes) live under `src/common/`.

### Frontend conventions

- **Pages** (`src/app/*`) are thin: they call hooks, render components, handle navigation.
- **Components** are presentational where possible — data comes in as props.
- **Hooks** (`src/hooks/`) are the only place `useQuery`/`useMutation` is allowed; pages and components never call `fetch` directly.
- **`lib/api.ts`** is the single fetch wrapper — never `fetch(...)` inline.

### What We Value

- Thoughtful engineering judgment over brute-force implementation
- Clean, readable code over clever code
- Handling edge cases and imperfect data gracefully
- Product awareness — understanding *why*, not just *how*
- Awareness of the four-layer separation in the backend and the page/hook/component separation on the frontend

---

## 5 — Submission

1. Create a new **private** GitHub repository named `nawy-fullstack-task`
2. Push this starter project as the **initial commit on `main`** — do not alter it
3. Create a branch named **`mars`** and do all your work there
4. When ready, invite the GitHub reviewers listed at [this link](https://gist.github.com/TODO) <!-- TODO: HR to replace with actual gist URL --> as collaborators with **read access**
5. Open a **pull request from `mars` into `main`**

---

*Good luck, and welcome to Mars.*
