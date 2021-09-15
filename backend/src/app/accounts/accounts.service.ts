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

    return (await Promise.all(allTransactionsFromAllAccounts)).flat(1);
  }

  public sortTransactionsByDate(
    transactions: TransactionDto[],
  ): TransactionDto[] {
    return transactions.sort(this.compareTransactionDate.bind(this));
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

  // The api might reject the values due to gap years ? to investigate
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

    return amountOverTime;
  }

  public calculateRoundedMinMax(amountOverTime: number[]): [number, number] {
    // this is faster than a spread operator
    const max = Math.max.apply(null, amountOverTime);
    const min = Math.min.apply(null, amountOverTime);
    return [Math.floor(min), Math.floor(max)];
  }

  public hasRecentActivity(
    transactionsOrderedByDate: TransactionDto[],
    recentTreshold: Date,
  ): boolean {
    const lastTransaction =
      transactionsOrderedByDate[transactionsOrderedByDate.length - 1];
    return this.isTransactionMoreRecentThan(lastTransaction, recentTreshold);
  }

  public calculateRoundedAverageIncome(
    transactionsOrderedByDate: TransactionDto[],
    numberOfMonths: number,
  ): number {
    const recentTreshold = new Date(
      new Date(
        transactionsOrderedByDate[
          transactionsOrderedByDate.length - 1
        ].timestamp,
      ).setMonth(new Date().getMonth() - numberOfMonths),
    ); // TODO hide this

    const positiveRecentTransactions = this.filterPositiveRecentTransactions(
      transactionsOrderedByDate,
      recentTreshold,
    );
    const totalIncome = positiveRecentTransactions.reduce(
      (sum, transaction) => (sum += transaction.amount),
      0,
    );
    const averageIncome = totalIncome / positiveRecentTransactions.length;
    return Math.floor(averageIncome);
  }

  private filterPositiveRecentTransactions(
    transactions: TransactionDto[],
    recentTreshold: Date,
  ): TransactionDto[] {
    return transactions.filter((transaction) => {
      return (
        this.isTransactionMoreRecentThan(transaction, recentTreshold) &&
        this.isTransactionPositive(transaction)
      );
    });
  }

  private isTransactionMoreRecentThan(
    transaction: TransactionDto,
    recentTreshold: Date,
  ): boolean {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate.getTime() > recentTreshold.getTime();
  }

  private isTransactionPositive(transaction: TransactionDto): boolean {
    return transaction.amount > 0;
  }

  public sumAccountsCurrentAmount(accounts: AccountDto[]): number {
    return accounts.reduce((sum, account) => (sum += account.current), 0);
  }
}
