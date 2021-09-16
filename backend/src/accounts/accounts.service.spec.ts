import { Test, TestingModule } from '@nestjs/testing';

import { AccountsService } from './accounts.service';

describe('MetricsService', () => {
  let accountsService: AccountsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AccountsService],
    }).compile();

    accountsService = app.get<AccountsService>(AccountsService);
  });

  describe.skip('getUserAccounts', () => {});
  describe.skip('getUserMetrics', () => {});
  describe.skip('getAllTransactions', () => {});
  describe.skip('getAllTransactionsFromAccount', () => {});
});
