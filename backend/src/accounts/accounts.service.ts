import { Injectable } from '@nestjs/common';
import * as chunkDateRange from 'chunk-date-range';

import { ApiService } from './api.service';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { DateInterval } from 'src/common/interfaces';
import { AccountDto } from 'src/common/dtos/account.dto';
import { AnswerDto } from 'src/common/dtos/answer.dto';
import { getDateMonthBefore, getDateYearsBefore } from './utils';

@Injectable()
export class AccountsService {
  constructor(private readonly apiService: ApiService) {}

  public async getUserAccounts(): Promise<AccountDto[]> {
    return await this.apiService.getAccounts();
  }

  public async getUserMetrics(accounts: AccountDto[]): Promise<AnswerDto> {
    const transactions = await this.getUserFullHistory(accounts);
    const transactionsOrderedByDate = this.sortTransactionsByDate(transactions);

    const currentAccountValue = this.sumAccountsCurrentAmount(accounts);
    const amountOverTime = this.calculateAccountAmountOverTimeFromCurrent(
      transactionsOrderedByDate,
      currentAccountValue,
    );

    const { min, max } = this.calculateMinMaxBalance(amountOverTime);
    const hadRecentActivity = this.hadRecentActivityLastYears(
      transactionsOrderedByDate,
      3,
    );
    const averageRecentIncome = this.calculateAverageIncome(transactions, 6);

    return this.formatUserMetrics(
      min,
      max,
      averageRecentIncome,
      hadRecentActivity,
    );
  }

  private async getUserFullHistory(
    accounts: AccountDto[],
  ): Promise<TransactionDto[]> {
    const allTransactionsFromAllAccounts = accounts.map(
      async (account) =>
        await this.getAllTransactionsFromAccount(account.account_id),
    );

    return (await Promise.all(allTransactionsFromAllAccounts)).flat(1);
  }

  private sortTransactionsByDate(
    transactions: TransactionDto[],
  ): TransactionDto[] {
    return transactions.sort(this.compareTransactionDate.bind(this));
  }

  // Note: this is valid for amounts in a single currency
  private calculateAccountAmountOverTimeFromCurrent(
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

  private calculateMinMaxBalance(amountOverTime: number[]): {
    min: number;
    max: number;
  } {
    const max = Math.max.apply(null, amountOverTime);
    const min = Math.min.apply(null, amountOverTime);
    return { min, max };
  }

  private hadRecentActivityLastYears(
    transactionsOrderedByDate: TransactionDto[],
    numberOfYears: number,
  ): boolean {
    const lastTransaction =
      transactionsOrderedByDate[transactionsOrderedByDate.length - 1];
    const recentTreshold = getDateYearsBefore(numberOfYears);

    return this.isTransactionMoreRecentThan(lastTransaction, recentTreshold);
  }

  private calculateAverageIncome(
    transactionsOrderedByDate: TransactionDto[],
    numberOfMonths: number,
  ): number {
    const recentTreshold = getDateMonthBefore(
      numberOfMonths,
      new Date(
        transactionsOrderedByDate[
          transactionsOrderedByDate.length - 1
        ].timestamp,
      ),
    );

    const positiveRecentTransactions = this.filterPositiveRecentTransactions(
      transactionsOrderedByDate,
      recentTreshold,
    );
    const totalIncome = positiveRecentTransactions.reduce(
      (sum, transaction) => (sum += transaction.amount),
      0,
    );
    const averageIncome = totalIncome / positiveRecentTransactions.length;
    return averageIncome;
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

  private sumAccountsCurrentAmount(accounts: AccountDto[]): number {
    return accounts.reduce((sum, account) => (sum += account.current), 0);
  }

  private formatUserMetrics(
    minBalance: number,
    maxBalance: number,
    averageIncomeLast6Month: number,
    activeLast3Years: boolean,
  ): AnswerDto {
    return {
      min_balance: Math.floor(minBalance),
      max_balance: Math.floor(maxBalance),
      '6_month_average_income': Math.floor(averageIncomeLast6Month),
      '3_years_activity': activeLast3Years,
    };
  }
}
