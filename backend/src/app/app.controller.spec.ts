import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import * as userMetrics from '../../test/resources/user-metrics.json';

describe('AppController', () => {
  let appController: AppController;
  const appServiceMock = {
    getAnswer: jest.fn(() => userMetrics),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: 'AppService', useFactory: () => appServiceMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /answer', () => {
    it('should return the same service result', async () => {
      const answer = await appController.answer();
      expect(answer).toMatchSnapshot();
    });
  });
});
