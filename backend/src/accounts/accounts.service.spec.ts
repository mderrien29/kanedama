import { Test, TestingModule } from '@nestjs/testing';

import { AccountsService } from './accounts.service';
import { AccountDto } from 'src/common/dtos/account.dto';
import * as userAccounts from '../../test/resources/user-accounts.json';
import * as userTransactions from '../../test/resources/user-transactions.json';

jest.useFakeTimers('modern').setSystemTime(new Date('2021-12-01').getTime());

describe('AccountsService', () => {
  let accountsService: AccountsService;
  const apiServiceMock = {
    getAccounts: jest.fn(() => userAccounts),
    getOldestTransaction: jest.fn(() => userTransactions[0]),
    getTransactions: jest.fn(() => userTransactions),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: 'ApiService', useFactory: () => apiServiceMock },
      ],
    }).compile();

    accountsService = app.get<AccountsService>(AccountsService);
  });

  describe('getUserAccounts', () => {
    it('should return the expected result', async () => {
      const accounts = await accountsService.getUserAccounts();
      expect(accounts).toMatchSnapshot();
    });
  });

  describe('getAllTransactionsFromAccount', () => {
    it('should call ApiService.getOldestTransaction with the expected parameters', async () => {
      await accountsService.getAllTransactionsFromAccount('accountId');
      expect(apiServiceMock.getOldestTransaction).toHaveBeenCalled();
      expect(apiServiceMock.getOldestTransaction.mock.calls).toMatchSnapshot();
    });

    it('should throw if there is no transaction on the account', async () => {
      apiServiceMock.getOldestTransaction.mockImplementationOnce(
        () => undefined,
      );

      expect(
        accountsService.getAllTransactionsFromAccount('accountId'),
      ).rejects.toThrowError();
    });

    it('should call ApiService.getTransactions with the expected parameters', async () => {
      await accountsService.getAllTransactionsFromAccount('accountId');
      expect(apiServiceMock.getTransactions).toHaveBeenCalled();
      expect(apiServiceMock.getTransactions.mock.calls).toMatchSnapshot();
    });

    it('should return the expected result', async () => {
      const transactions = await accountsService.getAllTransactionsFromAccount(
        'accountId',
      );
      expect(transactions).toMatchSnapshot();
    });
  });

  describe('getAllTransactions', () => {
    it('should return the expected result', async () => {
      const accounts = await accountsService.getAllTransactions(
        userAccounts as AccountDto[],
      );
      expect(accounts).toMatchSnapshot();
    });
  });
});
