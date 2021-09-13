import { Injectable, HttpService } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { TransactionDto } from 'src/common/dtos/transaction.dto';

import { AccountDto } from '../../common/dtos/account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly httpService: HttpService) {}

  private get accountsBaseUrl() {
    return `https://kata.getmansa.com/accounts`;
  }

  private async request<T>(url: string): Promise<T> {
    return await this.httpService
      .get(url)
      .pipe(map((response) => response.data))
      .toPromise();
  }

  public async getAccounts(): Promise<AccountDto[]> {
    const url = this.accountsBaseUrl;
    const response = await this.request(url);

    if (!this.isAccountsDto(response)) {
      throw new Error('retrieved payload does not match the expected format');
    }

    return response;
  }

  private isAccountsDto(payload: any): payload is AccountDto[] {
    // TODO
    return true;
  }

  public async getTransactions(
    account: string,
    startDate: Date,
    endDate: Date = new Date(),
  ): Promise<TransactionDto[]> {
    const url = `${
      this.accountsBaseUrl
    }/${account}/transactions?from=${startDate.toISOString()}&to=${endDate.toISOString()}`;
    console.dir(url);
    const response = await this.request(url);

    if (!this.isTransactionDto(response)) {
      throw new Error('retrieved payload does not match the expected format');
    }

    return response;
  }

  private isTransactionDto(payload: any): payload is TransactionDto[] {
    // TODO
    return true;
  }
}
