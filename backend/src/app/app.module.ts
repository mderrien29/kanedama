import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    AccountsModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.dev' }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
