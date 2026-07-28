import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SkyOps Mission Control API')
    .setDescription('Drone fleet mission control and maintenance tracker')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  const logger = new Logger('Bootstrap');
  const port = Number(process.env.PORT ?? 3000);

  /* A busy port is the most common local failure; say so instead of dumping a stack trace. */
  process.on('uncaughtException', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use. Stop the other process or set PORT.`);
      process.exit(1);
    }
    throw error;
  });

  await app.listen(port);

  /* getUrl() reports the bound socket ([::1] on IPv6); show something clickable. */
  const url = (await app.getUrl()).replace('[::1]', 'localhost').replace('0.0.0.0', 'localhost');
  logger.log(`API ready on ${url}/api/v1`);
  logger.log(`Swagger UI on ${url}/docs`);
}

void bootstrap();
