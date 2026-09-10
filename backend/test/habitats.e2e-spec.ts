import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * These tests reflect the Earth-era contract that shipped with the demo.
 * They are expected to start failing once the API has been adapted for Mars
 * (currency, area→volume_m3, status normalisation, etc.). Updating them is
 * part of the job — see README.md → Stage 3.
 */
describe('Habitats — Earth-era contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns "EGP" as the currency for hab_001', async () => {
    const res = await request(app.getHttpServer()).get('/habitats/hab_001').expect(200);
    expect(res.body.currency).toBe('EGP');
  });

  it('exposes 2D floor area as `area` (not volume_m3)', async () => {
    const res = await request(app.getHttpServer()).get('/habitats/hab_001').expect(200);
    expect(res.body).toHaveProperty('area');
    expect(res.body).not.toHaveProperty('volume_m3');
  });

  it('returns hab_002 status as the exact string "Available"', async () => {
    const res = await request(app.getHttpServer()).get('/habitats/hab_002').expect(200);
    expect(res.body.status).toBe('Available');
  });
});
