import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;
  const appServiceMock = {
    getAnswer: jest.fn(() => ({
      '6_month_average_income': 407,
      '3_years_activity': true,
      max_balance: 19540,
      min_balance: -4285,
    })),
  }; // TODO better mock ?

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: 'AppService', useFactory: () => appServiceMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /answer', () => {
    it('should return the same service result', async () => {
      const answer = await appController.answer();
      expect(answer).toMatchSnapshot();
    });
  });
});
