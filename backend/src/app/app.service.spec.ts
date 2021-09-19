import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';
import * as userAccounts from '../../test/resources/user-accounts.json';
import * as userTransactions from '../../test/resources/user-transactions.json';
import * as userMetrics from '../../test/resources/user-metrics.json';

describe('AppService', () => {
  let appService: AppService;
  const accountsServiceMock = {
    getUserAccounts: jest.fn(() => userAccounts),
    getAllTransactions: jest.fn(() => userTransactions),
  };

  const metricsServiceMock = {
    getUserMetrics: jest.fn(() => userMetrics),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: 'AccountsService', useFactory: () => accountsServiceMock },
        { provide: 'MetricsService', useFactory: () => metricsServiceMock },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAnswer', () => {
    it('should call AppService with the expected parameters', async () => {
      await appService.getAnswer();

      expect(accountsServiceMock.getUserAccounts).toHaveBeenCalled();
      expect(accountsServiceMock.getAllTransactions).toHaveBeenCalled();
      expect(
        accountsServiceMock.getAllTransactions.mock.calls,
      ).toMatchSnapshot();
    });

    it('should call MetricsService with the expected parameters', async () => {
      await appService.getAnswer();
      expect(metricsServiceMock.getUserMetrics).toHaveBeenCalled();
      expect(metricsServiceMock.getUserMetrics.mock.calls).toMatchSnapshot();
    });

    it('should return the result from MetricsService', async () => {
      const answer = await appService.getAnswer();
      expect(answer).toMatchSnapshot();
    });
  });
});
