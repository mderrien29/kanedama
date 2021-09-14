import { Injectable } from '@nestjs/common';
import * as chunkDateRange from 'chunk-date-range';

import { ApiService } from './api.service';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { DateInterval } from 'src/common/interfaces';

@Injectable()
export class AccountsService {
  constructor(private readonly apiService: ApiService) {}

  public async getAllUserHistory(): Promise<TransactionDto[]> {
    const accounts = await this.apiService.getAccounts();

    const allUserData = accounts.map(
      async (account) =>
        await this.getAllTransactionsFromAccount(account.account_id),
    );

    // WE CAN NOT DO A FLAT HERE, WE HAVE TO ORDER BY DATE
    return (await Promise.all(allUserData)).flat(1);
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
  public calculateAccountAmountOverTime(
    transactions: TransactionDto[],
    initialAccountValue = 0,
  ): number[] {
    const amountOverTime = [initialAccountValue];

    for (let i = 0; i < transactions.length; i++) {
      amountOverTime[i + 1] = amountOverTime[i] + transactions[i].amount;
    }

    return amountOverTime;
  }
}
