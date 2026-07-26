import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';

/**
 * Shared application configuration, applied identically by the real bootstrap
 * (`main.ts`) and by e2e tests, so the two can never drift apart.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
}
