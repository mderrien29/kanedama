import { Injectable } from '@nestjs/common';
import { AnswerDto } from 'src/common/dtos/answer.dto';
import { AccountsService } from '../accounts/accounts.service';
import { MetricsService } from '../accounts/metrics.service';

@Injectable()
export class AppService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly metricsService: MetricsService,
  ) {}

  public async getAnswer(): Promise<AnswerDto> {
    const accounts = await this.accountsService.getUserAccounts();
    const transactions = await this.accountsService.getAllTransactions(
      accounts,
    );
    return this.metricsService.getUserMetrics(accounts, transactions);
  }
}
