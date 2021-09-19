import { Test, TestingModule } from '@nestjs/testing';

import { MetricsService } from './metrics.service';
import { AccountDto } from 'src/common/dtos/account.dto';
import * as userTransactions from '../../test/resources/user-transactions.json';
import * as userAccounts from '../../test/resources/user-accounts.json';

jest.useFakeTimers('modern').setSystemTime(new Date('2021-12-01').getTime());

describe('MetricsService', () => {
  let metricsService: MetricsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    metricsService = app.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserMetrics', () => {
    it('should return the expected result', () => {
      const userMetrics = metricsService.getUserMetrics(
        userAccounts as AccountDto[],
        userTransactions,
      );

      expect(userMetrics).toMatchSnapshot();
    });
  });

  describe('calculateAccountAmountOverTime', () => {
    it('should return the expected result', () => {
      const amountOverTime = metricsService.calculateAccountAmountOverTime(
        userTransactions,
        userAccounts as AccountDto[],
      );

      expect(amountOverTime).toMatchSnapshot();
    });
  });

  describe('calculateMinMaxBalance', () => {
    it('should return the expected result for test case 1', () => {
      const { min, max } = metricsService.calculateMinMaxBalance([
        0, 1, 2, 3, 3, 2, 1, 0,
      ]);

      expect(min).toMatchSnapshot();
      expect(max).toMatchSnapshot();
    });

    it('should return the expected result for test case 2', () => {
      const { min, max } = metricsService.calculateMinMaxBalance([0, -1, 100]);

      expect(min).toMatchSnapshot();
      expect(max).toMatchSnapshot();
    });
  });

  describe('hadRecentActivityLastYears', () => {
    it('should return true for last 10 years', () => {
      expect(
        metricsService.hadRecentActivityLastYears(userTransactions, 10),
      ).toBeTruthy();
    });

    it('should return false for last year', () => {
      expect(
        metricsService.hadRecentActivityLastYears(userTransactions, 1),
      ).toBeFalsy();
    });

    it('should return false if no transactions', () => {
      expect(metricsService.hadRecentActivityLastYears([], 10)).toBeFalsy();
    });
  });

  describe('calculateAverageIncomeLastMonths', () => {
    it('should return the average last 6 months', () => {
      const average = metricsService.calculateAverageIncomeLastMonths(
        userTransactions,
        6,
      );

      expect(average).toMatchSnapshot();
    });

    it('should return the average last 2 months', () => {
      const average = metricsService.calculateAverageIncomeLastMonths(
        userTransactions,
        2,
      );

      expect(average).toMatchSnapshot();
    });
  });
});
