import { HttpStatus, HttpException, Injectable, Logger } from '@nestjs/common';

import { AnswerDto } from 'src/common/dtos/answer.dto';
import { AccountDto } from 'src/common/dtos/account.dto';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { AccountsService } from '../accounts/accounts.service';
import { MetricsService } from '../accounts/metrics.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly accountsService: AccountsService,
    private readonly metricsService: MetricsService,
  ) {}

  public async getAnswer(): Promise<AnswerDto> {
    const { accounts, transactions } = await this.retrieveData();
    return this.calculateMetrics(accounts, transactions);
  }

  private async retrieveData(): Promise<{
    transactions: TransactionDto[];
    accounts: AccountDto[];
  }> {
    try {
      const accounts = await this.accountsService.getUserAccounts();
      const transactions = await this.accountsService.getAllTransactions(
        accounts,
      );

      return { accounts, transactions };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Application failed to retrieve data from API, due to ${e.toString()}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private calculateMetrics(
    accounts: AccountDto[],
    transactions: TransactionDto[],
  ): AnswerDto {
    try {
      return this.metricsService.getUserMetrics(accounts, transactions);
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Application failed to calculate metrics, due to ${e.toString()}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
