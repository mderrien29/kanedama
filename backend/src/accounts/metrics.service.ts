import { Injectable } from '@nestjs/common';

import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { AccountDto } from 'src/common/dtos/account.dto';
import { AnswerDto } from 'src/common/dtos/answer.dto';
import { substractMonthToDate, substractYearsToDate } from './date-utils';

@Injectable()
export class MetricsService {
  public getUserMetrics(
    accounts: AccountDto[],
    transactions: TransactionDto[],
  ): AnswerDto {
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
    const averageRecentIncome = this.calculateAverageIncomeLastMonths(
      transactionsOrderedByDate,
      6,
    );

    return this.formatUserMetrics(
      min,
      max,
      averageRecentIncome,
      hadRecentActivity,
    );
  }

  public calculateAccountAmountOverTime(
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

  public calculateMinMaxBalance(amountOverTime: number[]): {
    min: number;
    max: number;
  } {
    // this is faster than using Math.min/Math.max
    let min = amountOverTime[0];
    let max = amountOverTime[0];

    amountOverTime.forEach((amount) => {
      if (amount < min) {
        min = amount;
      }
      if (amount > max) {
        max = amount;
      }
    });

    return { min, max };
  }

  public hadRecentActivityLastYears(
    transactionsOrderedByDate: TransactionDto[],
    numberOfYears: number,
  ): boolean {
    const lastTransaction =
      transactionsOrderedByDate[transactionsOrderedByDate.length - 1];
    const dateRecentTreshold = substractYearsToDate(numberOfYears);

    return this.isTransactionMoreRecentThan(
      lastTransaction,
      dateRecentTreshold,
    );
  }

  public calculateAverageIncomeLastMonths(
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

    const positiveRecentTransactions = this.getPositiveRecentTransactions(
      transactionsOrderedByDate,
      dateRecentTreshold,
    );
    const totalIncome = this.sumTransactionsAmounts(positiveRecentTransactions);
    const averageIncome = totalIncome / positiveRecentTransactions.length;
    return averageIncome;
  }

  private getPositiveRecentTransactions(
    transactions: TransactionDto[],
    recentTreshold: Date,
  ): TransactionDto[] {
    return transactions.filter(
      (transaction) =>
        this.isTransactionMoreRecentThan(transaction, recentTreshold) &&
        this.isTransactionPositive(transaction),
    );
  }

  private formatUserMetrics(
    minBalance: number,
    maxBalance: number,
    averageIncomeLast6Month: number,
    activeLast3Years: boolean,
  ): AnswerDto {
    return {
      '6_month_average_income': Math.floor(averageIncomeLast6Month),
      '3_years_activity': activeLast3Years,
      max_balance: Math.floor(maxBalance),
      min_balance: Math.floor(minBalance),
    };
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
    const transactionDate = new Date(transaction?.timestamp);
    return transactionDate.getTime() > recentTreshold.getTime();
  }

  private isTransactionPositive(transaction: TransactionDto): boolean {
    return transaction.amount > 0;
  }

  private sumTransactionsAmounts(transactions: TransactionDto[]): number {
    return transactions.reduce(
      (sum, transaction) => (sum += transaction.amount),
      0,
    );
  }

  private sumAccountsCurrentAmount(accounts: AccountDto[]): number {
    return accounts.reduce((sum, account) => (sum += account.current), 0);
  }
}
