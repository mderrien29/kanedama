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
    const allUserData = accounts.map(
      async (account) =>
        await this.getAllTransactionsFromAccount(account.account_id),
    );

    return (await Promise.all(allUserData))
      .flat(1)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }

  private async getAllTransactionsFromAccount(
    accountId: string,
  ): Promise<TransactionDto[]> {
    const oldestTransaction = await this.apiService.getOldestTransaction(
      accountId,
    );
    const oldestTransactionDate = new Date(oldestTransaction?.timestamp);
    const dateIntervals = chunkDateRange(oldestTransactionDate, new Date(), 10); // todo year size

    const transactionsPerAccountsPerDateInterval: Promise<TransactionDto[]>[] =
      dateIntervals.map(async (interval: DateInterval) =>
        this.apiService.getTransactions(
          accountId,
          interval.start,
          interval.end,
        ),
      );

    // cleanup this line ?
    return (await Promise.all(transactionsPerAccountsPerDateInterval)).flat(1);
  }

  // Note: this is valid for amounts in a single currency
  public calculateAccountAmountOverTimeFromCurrent(
    transactions: TransactionDto[],
    currentAccountValue = 6357,
  ): number[] {
    const amountOverTime = [currentAccountValue];

    for (let i = 0; i < transactions.length; i++) {
      amountOverTime[i + 1] =
        amountOverTime[i] - transactions[transactions.length - i - 1].amount;
    }

    // could optimise
    console.dir(Math.floor(Math.max(...amountOverTime)));
    console.dir(Math.floor(Math.min(...amountOverTime)));

    return amountOverTime;
  }

  public sumAccountsCurrentAmount(accounts: AccountDto[]): number {
    return accounts.reduce((sum, account) => (sum += account.current), 0);
  }
}
