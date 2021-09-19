import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: console, // of course this would not be in production
  });
  await app.listen(process.env.PORT);
}
bootstrap();
