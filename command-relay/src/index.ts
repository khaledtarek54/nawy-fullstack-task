import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

const MISSION_CODE = process.env.MISSION_CODE ?? 'MARS-EXPANSION-2042';
const POSTGRES_USER = process.env.POSTGRES_USER ?? 'mars';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'change-me';
const POSTGRES_DB = process.env.POSTGRES_DB ?? 'habitats';
const POSTGRES_HOST = process.env.POSTGRES_HOST ?? 'postgres';
const POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5432';
const PORT = Number(process.env.PORT ?? 7010);

const MARS_SOL_SECONDS = 88_775.244;
const MARS_EPOCH = Date.parse('2000-01-06T00:00:00Z');

function marsSolNow(): number {
  return Math.floor((Date.now() - MARS_EPOCH) / 1000 / MARS_SOL_SECONDS);
}

app.get('/status', (_req: Request, res: Response) => {
  res.json({
    contact: 'established',
    service: 'mars-command-relay',
    sol: marsSolNow(),
    message:
      'Mission Control is online. Submit your mission code via POST /handshake to retrieve habitat database credentials.',
  });
});

app.post('/handshake', (req: Request, res: Response) => {
  const missionCode: unknown = req.body?.mission_code;

  if (typeof missionCode !== 'string' || missionCode.length === 0) {
    return res.status(400).json({
      error: 'missing_mission_code',
      hint: 'POST a JSON body of the form { "mission_code": "..." }. See README.md → Stage 1.',
    });
  }

  if (missionCode !== MISSION_CODE) {
    return res.status(401).json({
      error: 'invalid_mission_code',
      hint:
        'The mission code you supplied is not recognised. Re-read your operational briefing — earlier draft codes have been deprecated.',
    });
  }

  const databaseUrl = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

  return res.json({
    database_url: databaseUrl,
    issued_at: new Date().toISOString(),
    sol: marsSolNow(),
    ttl_sols: 30,
    command_notes: [
      `Database is reachable from inside the docker network at host '${POSTGRES_HOST}' on port ${POSTGRES_PORT}.`,
      `Copy the database_url above into your .env file as DATABASE_URL, then restart the backend container.`,
    ].join(' '),
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[command-relay] Mission Control listening on :${PORT}`);
});
