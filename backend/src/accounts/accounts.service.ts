import { Injectable } from '@nestjs/common';

import { ApiService } from './api.service';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { DateInterval } from 'src/common/interfaces';
import { AccountDto } from 'src/common/dtos/account.dto';
import { AnswerDto } from 'src/common/dtos/answer.dto';
import {
  substractMonthToDate,
  substractYearsToDate,
  getYearlyIntervalFromDate,
} from './utils';

@Injectable()
export class AccountsService {
  constructor(private readonly apiService: ApiService) {}

  public async getUserAccounts(): Promise<AccountDto[]> {
    return await this.apiService.getAccounts();
  }

  // maybe too long ?
  public async getUserMetrics(accounts: AccountDto[]): Promise<AnswerDto> {
    const transactions = await this.getAllTransactions(accounts);

    const transactionsOrderedByDate = this.sortTransactionsByDate(transactions);
    const accountsBalanceOverTime = this.calculateAccountAmountOverTime(
      transactionsOrderedByDate,
      accounts,
    );
    const { min, max } = this.calculateMinMaxBalance(accountsBalanceOverTime);

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

  private async getAllTransactions(
    accounts: AccountDto[],
  ): Promise<TransactionDto[]> {
    const allTransactionsForEachAccount = accounts.map(
      async (account) =>
        await this.getAllTransactionsFromAccount(account.account_id),
    );

    return (await Promise.all(allTransactionsForEachAccount)).flat(1);
  }

  // this is valid for amounts in a single currency
  private calculateAccountAmountOverTime(
    transactionsOrderedByDate: TransactionDto[],
    accounts: AccountDto[],
  ): number[] {
    const currentAccountValue = this.sumAccountsCurrentAmount(accounts);
    const amountOverTime = [currentAccountValue];

    for (let i = 0; i < transactionsOrderedByDate.length; i++) {
      amountOverTime[i + 1] =
        amountOverTime[i] -
        transactionsOrderedByDate[transactionsOrderedByDate.length - i - 1]
          .amount;
    }

    return amountOverTime;
  }

  private calculateMinMaxBalance(amountOverTime: number[]): {
    min: number;
    max: number;
  } {
    // faster than using spread operator on large arrays
    const max = Math.max.apply(null, amountOverTime);
    const min = Math.min.apply(null, amountOverTime);
    return { min, max };
  }

  private hadRecentActivityLastYears(
    transactionsOrderedByDate: TransactionDto[],
    numberOfYears: number,
  ): boolean {
    const lastTransaction =
      transactionsOrderedByDate[transactionsOrderedByDate.length - 1]; // how to force ordering the list ?
    const dateRecentTreshold = substractYearsToDate(numberOfYears);

    return this.isTransactionMoreRecentThan(
      lastTransaction,
      dateRecentTreshold,
    );
  }

  private calculateAverageIncome(
    transactionsOrderedByDate: TransactionDto[],
    numberOfMonths: number,
  ): number {
    const dateLastTransaction = new Date(
      transactionsOrderedByDate[transactionsOrderedByDate.length - 1].timestamp,
    );
    const dateRecentTreshold = substractMonthToDate(
      numberOfMonths,
      dateLastTransaction,
    );

    const positiveRecentTransactions = this.filterPositiveRecentTransactions(
      transactionsOrderedByDate,
      dateRecentTreshold,
    );
    const totalIncome = this.sumTransactionsAmounts(positiveRecentTransactions);
    const averageIncome = totalIncome / positiveRecentTransactions.length;
    return averageIncome;
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

  private sumTransactionsAmounts(transactions: TransactionDto[]): number {
    return transactions.reduce(
      (sum, transaction) => (sum += transaction.amount),
      0,
    );
  }

  private sortTransactionsByDate(
    transactions: TransactionDto[],
  ): TransactionDto[] {
    return transactions.sort(this.compareTransactionDate.bind(this));
  }

  private compareTransactionDate(a: TransactionDto, b: TransactionDto): number {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
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
}
