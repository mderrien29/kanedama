import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';

import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { AccountDto } from 'src/common/dtos/account.dto';

@Injectable()
export class ApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get accountsBaseUrl() {
    return this.configService.get('ACCOUNT_URI');
  }

  private async request<T>(url: string): Promise<T> {
    return await this.httpService
      .get(url)
      .pipe(map((response) => response.data))
      .toPromise();
  }

  public getAccounts(): Promise<AccountDto[]> {
    const url = this.accountsBaseUrl;
    return this.request(url);
  }

  public getOldestTransaction(account: string): Promise<TransactionDto> {
    const url = `${this.accountsBaseUrl}/${account}/transactions`; // TODO move
    return this.request(url);
  }

  public getTransactions(
    account: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionDto[]> {
    const transactionsUrl = this.formatTransactionUrl(
      account,
      startDate,
      endDate,
    );
    return this.request(transactionsUrl);
  }

  // TODO use package to add params
  private formatTransactionUrl(
    account: string,
    startDate: Date,
    endDate: Date,
  ): string {
    return `${
      this.accountsBaseUrl
    }/${account}/transactions?from=${startDate.toISOString()}&to=${endDate.toISOString()}`;
  }
}
