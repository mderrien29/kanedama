import { Test, TestingModule } from '@nestjs/testing';

import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let metricsService: MetricsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    metricsService = app.get<MetricsService>(MetricsService);
  });

  describe.skip('getUserMetrics', () => {});
  describe.skip('calculateAccountAmountOverTime', () => {});
  describe.skip('calculateMinMaxBalance', () => {});
  describe.skip('hadRecentActivityLastYears', () => {});
  describe.skip('calculateAverageIncome', () => {});
});
