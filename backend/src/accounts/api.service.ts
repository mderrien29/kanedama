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

  public async getOldestTransaction(account: string): Promise<TransactionDto> {
    const url = `${this.accountsBaseUrl}/${account}/transactions`;
    const response = await this.request(url);

    if (!this.isTransactionDto(response)) {
      throw new Error('retrieved payload does not match the expected format');
    }

    return response;
  }

  private isTransactionDto(payload: any): payload is TransactionDto {
    // TODO
    return true;
  }

  public async getTransactions(
    account: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionDto[]> {
    const transactionsUrl = this.formatTransactionUrl(
      account,
      startDate,
      endDate,
    );
    const response = await this.request(transactionsUrl);

    if (!this.isTransactionDtoArray(response)) {
      throw new Error('retrieved payload does not match the expected format');
    }

    return response;
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

  private isTransactionDtoArray(payload: any): payload is TransactionDto[] {
    return payload.every(this.isTransactionDto.bind(this));
  }
}
