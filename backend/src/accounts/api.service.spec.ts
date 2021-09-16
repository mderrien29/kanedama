import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { of } from 'rxjs';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let apiService: ApiService;
  const getMock = jest.fn(() => of({}));
  const httpServiceMock = { get: getMock };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: '.env.test' })],
      providers: [
        ApiService,
        { provide: 'HttpService', useFactory: () => httpServiceMock },
      ],
    }).compile();

    apiService = app.get<ApiService>(ApiService);
  });

  describe('getAccounts', () => {
    it('should use the HttpService to call the expected url', async () => {
      await apiService.getAccounts();
      expect(getMock).toHaveBeenCalled();
      expect(getMock.mock.calls).toMatchSnapshot();
    });

    it('should return the result from the Api in a promise', async () => {
      const answer = await apiService.getAccounts();
      expect(answer).toMatchSnapshot();
    });
  });

  describe('getTransactions', () => {
    it('should use the HttpService to call the expected url', async () => {
      await apiService.getTransactions(
        'accountId',
        new Date('2020-08-30'),
        new Date('2020-01-01'),
      );
      expect(getMock).toHaveBeenCalled();
      expect(getMock.mock.calls).toMatchSnapshot();
    });

    it('should return the result from the Api in a promise', async () => {
      const answer = await apiService.getTransactions(
        'accountId',
        new Date('2020-08-30'),
        new Date('2020-01-01'),
      );
      expect(answer).toMatchSnapshot();
    });
  });

  describe('getOldestTransaction', () => {
    it('should use the HttpService to call the expected url', async () => {
      await apiService.getOldestTransaction('accountId');
      expect(getMock).toHaveBeenCalled();
      expect(getMock.mock.calls).toMatchSnapshot();
    });

    it('should return the result from the Api in a promise', async () => {
      const answer = await apiService.getOldestTransaction('accountId');
      expect(answer).toMatchSnapshot();
    });
  });
});
