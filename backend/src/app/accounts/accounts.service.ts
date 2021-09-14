import { Injectable } from '@nestjs/common';
import * as chunkDateRange from 'chunk-date-range';

import { ApiService } from './api.service';
import { TransactionDto } from 'src/common/dtos/transaction.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly apiService: ApiService) {}

  public async getAllUserHistory(): Promise<TransactionDto[][]> {
    const accounts = await this.apiService.getAccounts();

    const allUserData = accounts.map((account) =>
      this.getAllTransactionsFromAccount(account.account_id),
    );

    return await Promise.all(allUserData);
  }

  public async getAllTransactionsFromAccount(
    accountId: string,
  ): Promise<TransactionDto[]> {
    let oldestTransactions = await this.apiService.getOldestTransaction(
      accountId,
    );
    const oldestTransactionDate = new Date(oldestTransactions?.timestamp);
    const dateIntervals = chunkDateRange(oldestTransactionDate, new Date(), 10); // todo year size

    // TODO any.
    const transactionsPerAccounts = dateIntervals.map(async (interval: any) =>
      this.apiService.getTransactions(accountId, interval.start, interval.end),
    );

    return await Promise.all(transactionsPerAccounts);
  }
}
