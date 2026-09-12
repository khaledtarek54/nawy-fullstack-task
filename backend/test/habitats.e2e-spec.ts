import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app-setup';

describe('Habitats API — Mars-era contract', () => {
  let app: INestApplication;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /habitats', () => {
    it('wraps the page in data and pagination metadata', async () => {
      const res = await http().get('/habitats?page=1&limit=10').expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toEqual({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
      expect(res.body.meta.totalPages).toBe(Math.ceil(res.body.meta.total / 10));
    });

    it('starts page 1 at the first row rather than skipping a page', async () => {
      const firstTen = await http().get('/habitats?page=1&limit=10').expect(200);
      const firstFive = await http().get('/habitats?page=1&limit=5').expect(200);

      expect(firstFive.body.data.map((h: { id: string }) => h.id)).toEqual(
        firstTen.body.data.slice(0, 5).map((h: { id: string }) => h.id),
      );
    });

    it('reaches every habitat across pages with no duplicates', async () => {
      const { body: first } = await http().get('/habitats?page=1&limit=10').expect(200);

      const ids: string[] = [];
      for (let page = 1; page <= first.meta.totalPages; page++) {
        const { body } = await http().get(`/habitats?page=${page}&limit=10`).expect(200);
        ids.push(...body.data.map((h: { id: string }) => h.id));
      }

      expect(ids).toHaveLength(first.meta.total);
      expect(new Set(ids).size).toBe(first.meta.total);
    });

    it('accepts a page size of 100 but rejects anything larger', async () => {
      await http().get('/habitats?limit=100').expect(200);
      await http().get('/habitats?limit=101').expect(400);
      await http().get('/habitats?limit=999999').expect(400);
    });

    it('filters by status and counts only the matching rows', async () => {
      const { body: all } = await http().get('/habitats?limit=1').expect(200);
      const { body: available } = await http()
        .get('/habitats?limit=100&status=available')
        .expect(200);

      expect(available.meta.total).toBeLessThan(all.meta.total);
      expect(available.data.every((h: { status: string }) => h.status === 'available')).toBe(true);
    });

    it('rejects a status outside the known set', async () => {
      await http().get('/habitats?status=AVAILABLE').expect(400);
      await http().get('/habitats?status=bogus').expect(400);
    });
  });

  describe('GET /habitats/:id', () => {
    it('reports the currency stored on the row', async () => {
      const res = await http().get('/habitats/hab_001').expect(200);

      expect(res.body.currency).toBe('MCR');
    });

    it('exposes pressurised volume rather than 2D floor area', async () => {
      const res = await http().get('/habitats/hab_001').expect(200);

      expect(res.body).not.toHaveProperty('area');
      expect(res.body.volumeM3).toBe(210.6);
    });

    it('reports status in the normalised lower-case form', async () => {
      const res = await http().get('/habitats/hab_002').expect(200);

      expect(res.body.status).toBe('available');
    });

    it('returns an empty amenity list for a habitat that has none', async () => {
      const res = await http().get('/habitats/hab_005').expect(200);

      expect(res.body.amenities).toEqual([]);
    });

    it('404s for a habitat that does not exist', async () => {
      await http().get('/habitats/hab_does_not_exist').expect(404);
    });
  });

  describe('GET /habitats/recent', () => {
    it('returns a bounded feed', async () => {
      const res = await http().get('/habitats/recent').expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(20);
    });

    it('reports the same amenities the detail endpoint reports', async () => {
      const { body: feed } = await http().get('/habitats/recent').expect(200);

      if (feed.length === 0) {
        return;
      }

      const [first] = feed;
      const { body: detail } = await http().get(`/habitats/${first.id}`).expect(200);

      expect(first.amenities).toEqual(detail.amenities);
    });
  });

  describe('GET /habitats/:id/safety-check', () => {
    it('breaks the verdict down across every safety metric', async () => {
      const res = await http().get('/habitats/hab_001/safety-check').expect(200);

      expect(res.body.habitatId).toBe('hab_001');
      expect(res.body.checks.map((c: { metric: string }) => c.metric)).toEqual([
        'o2',
        'pressure',
        'co2_scrubber',
        'temperature',
        'radiation',
        'power',
      ]);
      expect(res.body.checks.every((c: { detail: string }) => c.detail.length > 0)).toBe(true);
    });

    it('scores a habitat with every metric in range at 100', async () => {
      const res = await http().get('/habitats/hab_001/safety-check').expect(200);

      expect(res.body.verdict).toBe('safe');
      expect(res.body.score).toBe(100);
      expect(res.body.checks.every((c: { status: string }) => c.status === 'safe')).toBe(true);
    });

    it('treats a failed scrubber as critical however good the rest is', async () => {
      const res = await http().get('/habitats/hab_008/safety-check').expect(200);

      const scrubber = res.body.checks.find(
        (c: { metric: string }) => c.metric === 'co2_scrubber',
      );

      expect(scrubber.status).toBe('critical');
      expect(res.body.verdict).toBe('critical');
      expect(res.body.score).toBeGreaterThan(0);
    });

    it('404s for a habitat that does not exist', async () => {
      await http().get('/habitats/hab_does_not_exist/safety-check').expect(404);
    });
  });

  describe('POST /access/verify', () => {
    it('grants access for the configured passphrase', async () => {
      const res = await http()
        .post('/access/verify')
        .send({ passphrase: process.env.ACCESS_PASSPHRASE })
        .expect(200);

      expect(res.body.granted).toBe(true);
    });

    it('denies anything else', async () => {
      const res = await http()
        .post('/access/verify')
        .send({ passphrase: 'not-the-passphrase' })
        .expect(200);

      expect(res.body.granted).toBe(false);
    });

    it('rejects an empty passphrase', async () => {
      await http().post('/access/verify').send({ passphrase: '' }).expect(400);
    });
  });

  describe('GET /health', () => {
    it('reports the database as reachable', async () => {
      const res = await http().get('/health').expect(200);

      expect(res.body).toEqual({ status: 'ok', database: 'reachable' });
    });
  });
});
