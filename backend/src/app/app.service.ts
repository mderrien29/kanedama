import { Injectable } from '@nestjs/common';
import { AccountsService } from './accounts/accounts.service';

@Injectable()
export class AppService {
  constructor(private readonly accountsService: AccountsService) {}

  getHello(): string {
    return 'Hello World!';
  }

  public async getAnswer(): Promise<string> {
    // TODO getApiData ?
    const accounts = await this.accountsService.getUserAccounts();
    const currentAccountValue =
      this.accountsService.sumAccountsCurrentAmount(accounts);
    const transactions = await this.accountsService.getUserFullHistory(
      accounts,
    );
    const transactionsOrderedByDate =
      this.accountsService.sortTransactionsByDate(transactions);

    // TODO calculateMetrics ?
    const amountOverTime =
      this.accountsService.calculateAccountAmountOverTimeFromCurrent(
        transactionsOrderedByDate,
        currentAccountValue,
      );
    const [min, max] =
      this.accountsService.calculateRoundedMinMax(amountOverTime);
    const hasRecentActivity = this.accountsService.hasRecentActivity(
      transactionsOrderedByDate,
      new Date(new Date().setFullYear(new Date().getFullYear() - 3)), // TODO hide this
    );
    const averageRecentIncome =
      this.accountsService.calculateRoundedAverageIncome(transactions, 6);

    // TODO formatResults. maybe round there ?
    return JSON.stringify(
      this.formatResults(min, max, averageRecentIncome, hasRecentActivity),
    );
  }

  // TODO any
  private formatResults(
    min: number,
    max: number,
    averageIncome: number,
    activeLast3Years: boolean,
  ): any {
    return {
      '6_month_average_income': averageIncome,
      '3_years_activity': activeLast3Years,
      max_balance: max,
      min_balance: min,
    };
  }
}
