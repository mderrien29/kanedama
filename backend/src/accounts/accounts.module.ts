import { HttpModule, Module } from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { ApiService } from './api.service';
import { MetricsService } from './metrics.service';

@Module({
  imports: [HttpModule],
  providers: [AccountsService, ApiService, MetricsService],
  exports: [AccountsService, MetricsService],
})
export class AccountsModule {}
