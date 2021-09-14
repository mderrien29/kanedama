import { HttpModule, Module } from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { ApiService } from './api.service';

@Module({
  imports: [HttpModule],
  providers: [AccountsService, ApiService],
  exports: [AccountsService, ApiService],
})
export class AccountsModule {}
