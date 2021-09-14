import { Injectable } from '@nestjs/common';
import * as chunkDateRange from 'chunk-date-range';

import { ApiService } from './api.service';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { DateInterval } from 'src/common/interfaces';
import { AccountDto } from 'src/common/dtos/account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly apiService: ApiService) {}

  public async getUserAccounts(): Promise<AccountDto[]> {
    return await this.apiService.getAccounts();
  }

  public async getUserFullHistory(
    accounts: AccountDto[],
  ): Promise<TransactionDto[]> {
    const allTransactionsFromAllAccounts = accounts.map(
      async (account) =>
        await this.getAllTransactionsFromAccount(account.account_id),
    );

    const transactionsOrderedByDate = (
      await Promise.all(allTransactionsFromAllAccounts)
    )
      .flat(1)
      .sort(this.compareTransactionDate);

    return transactionsOrderedByDate;
  }

  private compareTransactionDate(a: TransactionDto, b: TransactionDto): number {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  }

  private async getAllTransactionsFromAccount(
    accountId: string,
  ): Promise<TransactionDto[]> {
    const oldestTransaction = await this.apiService.getOldestTransaction(
      accountId,
    );
    const dateIntervals = this.getYearlyIntervalFromDate(
      new Date(oldestTransaction?.timestamp),
    );

    const transactionsPerDateInterval: Promise<TransactionDto[]>[] =
      dateIntervals.map(async (interval: DateInterval) =>
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

  // The api may reject the values due to gap years ? to investigate
  private getYearlyIntervalFromDate(
    startDate: Date,
    endDate = new Date(),
  ): DateInterval[] {
    const numberOfChunks = endDate.getFullYear() - startDate.getFullYear();
    const dateIntervals = chunkDateRange(startDate, endDate, numberOfChunks);
    return dateIntervals;
  }

  // Note: this is valid for amounts in a single currency
  public calculateAccountAmountOverTimeFromCurrent(
    transactions: TransactionDto[],
    currentAccountValue = 0,
  ): number[] {
    const amountOverTime = [currentAccountValue];

    for (let i = 0; i < transactions.length; i++) {
      amountOverTime[i + 1] =
        amountOverTime[i] - transactions[transactions.length - i - 1].amount;
    }

    // TODO could optimise, and move to separate function ofc
    console.dir(Math.floor(Math.max(...amountOverTime)));
    console.dir(Math.floor(Math.min(...amountOverTime)));

    return amountOverTime;
  }

  public sumAccountsCurrentAmount(accounts: AccountDto[]): number {
    return accounts.reduce((sum, account) => (sum += account.current), 0);
  }
}
