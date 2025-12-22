import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import passport from 'passport';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  const config = app.get(ConfigService);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const redisClient = createClient({
    socket: {
      host: config.get<string>('REDIS_HOST'),
      port: Number(config.get<string>('REDIS_PORT')),
    },
  });
  await redisClient.connect();

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: config.get<string>('SESSION_SECRET')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax',
        secure: false,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(Number(config.get('API_PORT')));
}
void bootstrap();
