import { Injectable } from '@nestjs/common';

import { ApiService } from './api.service';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { DateInterval, getYearlyIntervalFromDate } from './date-utils';
import { AccountDto } from 'src/common/dtos/account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly apiService: ApiService) {}

  public async getUserAccounts(): Promise<AccountDto[]> {
    return await this.apiService.getAccounts();
  }

  public async getAllTransactions(
    accounts: AccountDto[],
  ): Promise<TransactionDto[]> {
    const allTransactionsForEachAccount = accounts.map(
      async (account) =>
        await this.getAllTransactionsFromAccount(account.account_id),
    );

    return this.flattenArrayOfPromise(allTransactionsForEachAccount);
  }

  public async getAllTransactionsFromAccount(
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

    return this.flattenArrayOfPromise(transactionsPerDateInterval);
  }

  private async flattenArrayOfPromise<T>(array: Promise<T[]>[]): Promise<T[]> {
    return (await Promise.all(array)).flat(1);
  }
}