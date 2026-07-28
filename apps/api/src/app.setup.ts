import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DomainExceptionFilter } from './shared/interface/domain-exception.filter';

/* Applied by both main.ts and the e2e tests so the two can't drift apart. */
export function configureApp(app: INestApplication): void {
  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
  app.enableShutdownHooks();
}
