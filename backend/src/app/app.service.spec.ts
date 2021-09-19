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

    it('should throw human readable error if API fails', async () => {
      accountsServiceMock.getAllTransactions.mockImplementationOnce(() => {
        throw new Error('mock');
      });

      // rejects does not work, related issue : https://github.com/facebook/jest/issues/4946
      appService.getAnswer().catch((e) => expect(e.response).toMatchSnapshot());
    });

    it('should throw human readable error if calculations fails', async () => {
      metricsServiceMock.getUserMetrics.mockImplementationOnce(() => {
        throw new Error('mock');
      });

      appService.getAnswer().catch((e) => expect(e.response).toMatchSnapshot());
    });
  });
});
