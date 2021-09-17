import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;
  const accountsServiceMock = {
    getUserAccounts: jest.fn(),
    getAllTransactions: jest.fn(),
  };

  const metricsServiceMock = {
    getUserMetrics: jest.fn(() => ({
      '6_month_average_income': 407,
      '3_years_activity': true,
      max_balance: 19540,
      min_balance: -4285,
    })),
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

  describe('getAnswer', () => {
    it('should return the same result', async () => {
      const answer = await appService.getAnswer();
      expect(answer).toMatchSnapshot();
    });
  });
});
