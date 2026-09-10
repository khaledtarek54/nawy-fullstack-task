import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.error(
      '[backend] FATAL: DATABASE_URL is not set. Complete the Mission Control handshake (see README.md → Stage 1) and populate it in .env before starting the backend.',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }),
  );
  await app.listen(4000);
  // eslint-disable-next-line no-console
  console.log('[backend] Mars Habitat Service listening on :4000');
}

bootstrap();
