import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const frontendEnv = process.env.FRONTEND_URL?.replace(/\/$/, '');
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        frontendEnv,
        frontendEnv ? `https://${frontendEnv.replace(/^https?:\/\//, '')}` : null,
      ].filter(Boolean);

      const isVercelDomain = origin.endsWith('.vercel.app');
      const isAllowed = allowedOrigins.includes(origin) || isVercelDomain;

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in production for client API calls
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Backend running on http://localhost:${port}`);
}

void bootstrap();
