import { HttpModule, Module } from '@nestjs/common';

import { AccountsService } from './accounts.service';

@Module({
  imports: [HttpModule],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
