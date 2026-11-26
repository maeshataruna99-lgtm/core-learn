import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';

// Shared by main.ts and the e2e test so both run with the same rules.
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1', { exclude: ['health'] }); // /health stays at the root for probes
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields (stops mass assignment)
      forbidNonWhitelisted: true, // and reject them with 400
      transform: true, // turn query strings into numbers
    }),
  );
}
