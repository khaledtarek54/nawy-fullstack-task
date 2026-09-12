import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app-setup';

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.error(
      '[backend] FATAL: DATABASE_URL is not set. Complete the Mission Control handshake (see README.md → Stage 1) and populate it in .env before starting the backend.',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(4000);
  // eslint-disable-next-line no-console
  console.log('[backend] Mars Habitat Service listening on :4000');
}

bootstrap();
