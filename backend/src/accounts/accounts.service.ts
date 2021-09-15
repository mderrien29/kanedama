import { Injectable } from '@nestjs/common';

import { ApiService } from './api.service';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { DateInterval, getYearlyIntervalFromDate } from './date-utils';
import { AccountDto } from 'src/common/dtos/account.dto';
import { AnswerDto } from 'src/common/dtos/answer.dto';
import { MetricsService } from './metrics.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly apiService: ApiService,
    private readonly metricsService: MetricsService,
  ) {}

  public async getUserAccounts(): Promise<AccountDto[]> {
    return await this.apiService.getAccounts();
  }

  public async getUserMetrics(accounts: AccountDto[]): Promise<AnswerDto> {
    const transactions = await this.getAllTransactions(accounts);
    return this.metricsService.getUserMetrics(accounts, transactions);
  }

  private async getAllTransactions(
    accounts: AccountDto[],
  ): Promise<TransactionDto[]> {
    const allTransactionsForEachAccount = accounts.map(
      async (account) =>
        await this.getAllTransactionsFromAccount(account.account_id),
    );

    return (await Promise.all(allTransactionsForEachAccount)).flat(1);
  }

  private async getAllTransactionsFromAccount(
    accountId: string,
  ): Promise<TransactionDto[]> {
    const oldestTransaction = await this.apiService.getOldestTransaction(
      accountId,
    );
    const dateIntervals = getYearlyIntervalFromDate(
      new Date(oldestTransaction?.timestamp),
    );

    const transactionsPerDateInterval = dateIntervals.map(
      async (interval: DateInterval) =>
        this.apiService.getTransactions(
          accountId,
          interval.start,
          interval.end,
        ),
    );

    const accountTransactions = (
      await Promise.all(transactionsPerDateInterval)
    ).flat(1);

    return accountTransactions;
  }
}
