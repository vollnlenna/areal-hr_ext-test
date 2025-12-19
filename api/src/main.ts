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

  const config = app.get<ConfigService>(ConfigService);

  const redisClient = createClient({
    socket: {
      host: config.get<string>('REDIS_HOST'),
      port: Number(config.get<string>('REDIS_PORT')),
    },
  });
  await redisClient.connect();

  const store = new RedisStore({
    client: redisClient,
    disableTouch: false,
  });

  const secret = config.get<string>('SESSION_SECRET');
  if (!secret) {
    throw new Error('SESSION_SECRET is not set');
  }
  app.use(
    session({
      store,
      secret,
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

  const port = Number(config.get<string>('API_PORT'));
  await app.listen(port);
}
void bootstrap();
